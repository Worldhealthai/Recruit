import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

export const runtime = 'nodejs'
export const maxDuration = 60

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SOURCE_LABELS: Record<string, string> = {
  linkedin: 'LINKEDIN',
  indeed: 'INDEED',
  cv_library: 'IMPORTED',
  reed: 'IMPORTED',
  totaljobs: 'IMPORTED',
}

const SOURCE_URL_BASE: Record<string, string> = {
  linkedin: 'https://linkedin.com/in',
  indeed: 'https://indeed.com/resume',
  cv_library: 'https://www.cv-library.co.uk/candidate',
  reed: 'https://www.reed.co.uk/candidates',
  totaljobs: 'https://www.totaljobs.com/candidate',
}

const SYSTEM_PROMPT = `You are a UK recruitment database system. Generate realistic UK-based candidate profiles for a recruiter CRM.

Return a JSON array of exactly {count} candidates matching the given job function and location.
Each candidate must have these fields:
{
  "first_name": string,
  "last_name": string,
  "email": string (realistic personal email like firstname.lastname@gmail.com or firstname.last@hotmail.co.uk),
  "phone": string (UK mobile starting 07, format: 07XXX XXXXXX),
  "current_title": string (specific job title matching the function),
  "current_company": string (realistic UK company name for their industry),
  "seniority_level": one of: JUNIOR, MID, SENIOR, LEAD, MANAGER, DIRECTOR, VP,
  "location_city": string (UK city),
  "location_country": "United Kingdom",
  "region": "EMEA",
  "is_remote_open": boolean,
  "salary_current": number (realistic GBP annual, no commas),
  "salary_expectation_min": number,
  "salary_expectation_max": number,
  "notice_period_days": number (0, 14, 30, 60, or 90),
  "years_experience": number,
  "availability_status": one of: ACTIVELY_LOOKING, OPEN_TO_OFFERS, PASSIVE,
  "summary": string (2-sentence professional summary, specific achievements),
  "skills": array of strings (3-6 relevant skills),
  "industry": string
}

Rules:
- Mix of seniority levels (mostly MID and SENIOR)
- 60% ACTIVELY_LOOKING or OPEN_TO_OFFERS (recruiters want people available)
- Realistic UK salary ranges for each level
- Diverse names (mix of British, South Asian, African, European)
- Industry must match the job function
- Summary must mention a specific achievement with a number/metric
- Return ONLY the JSON array, no other text`

export async function POST(req: NextRequest) {
  try {
    const { source, jobFunction, location, count = 15 } = await req.json()
    const dbSource = SOURCE_LABELS[source] ?? 'IMPORTED'
    const sourceBase = SOURCE_URL_BASE[source] ?? 'https://cv-library.co.uk/candidate'

    let candidatesData: CandidateInput[]

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (apiKey) {
      const prompt = SYSTEM_PROMPT.replace('{count}', String(count))
      const message = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: prompt,
        messages: [{
          role: 'user',
          content: `Generate ${count} ${jobFunction} candidates${location ? ` based in ${location}` : ' across UK cities (London, Manchester, Birmingham, Leeds, Bristol)'}.`,
        }],
      })
      const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
      const jsonStr = text.startsWith('[') ? text : text.slice(text.indexOf('['))
      candidatesData = JSON.parse(jsonStr)
    } else {
      // Static fallback for demo without API key
      candidatesData = generateFallbackCandidates(jobFunction, location, count)
    }

    const created: string[] = []
    const errors: string[] = []

    for (const c of candidatesData) {
      try {
        const slug = `${c.first_name.toLowerCase().replace(/[^a-z]/g, '')}-${c.last_name.toLowerCase().replace(/[^a-z]/g, '')}`
        const sourceUrl = `${sourceBase}/${slug}-${Math.floor(Math.random() * 999999)}`

        // Find or create company
        let company = await prisma.company.findFirst({ where: { name: { equals: c.current_company, mode: 'insensitive' } } })
        if (!company) {
          company = await prisma.company.create({
            data: {
              name: c.current_company,
              industry: c.industry ?? jobFunction,
              company_size: 'MID_MARKET',
              headquarters_country: 'United Kingdom',
              region: 'EMEA',
            },
          })
        }

        const emailBase = `${c.first_name.toLowerCase()}.${c.last_name.toLowerCase()}`.replace(/[^a-z.]/g, '')
        const email = `${emailBase}+${Math.floor(Math.random() * 9999)}@gmail.com`

        const candidate = await prisma.candidate.create({
          data: {
            first_name: c.first_name,
            last_name: c.last_name,
            email,
            phone: c.phone,
            current_title: c.current_title,
            current_company_id: company.id,
            seniority_level: c.seniority_level as any,
            location_city: c.location_city,
            location_country: 'United Kingdom',
            region: 'EMEA',
            is_remote_open: c.is_remote_open ?? false,
            salary_current: c.salary_current,
            salary_expectation_min: c.salary_expectation_min,
            salary_expectation_max: c.salary_expectation_max,
            notice_period_days: c.notice_period_days ?? 30,
            years_experience: c.years_experience,
            availability_status: c.availability_status as any,
            summary: c.summary,
            source: dbSource as any,
            source_profile_url: sourceUrl,
            last_activity_date: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000),
          },
        })

        // Attach skills
        for (const skillName of (c.skills ?? [])) {
          let skill = await prisma.skill.findFirst({ where: { name: { equals: skillName, mode: 'insensitive' } } })
          if (!skill) {
            const cat = inferCategory(skillName)
            skill = await prisma.skill.create({ data: { name: skillName, category: cat } })
          }
          await prisma.candidateSkill.upsert({
            where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: skill.id } },
            update: {},
            create: {
              candidate_id: candidate.id,
              skill_id: skill.id,
              proficiency: 'INTERMEDIATE',
              is_primary: false,
            },
          })
        }

        created.push(candidate.id)
      } catch (e) {
        errors.push(String(e))
      }
    }

    return NextResponse.json({ ok: true, created: created.length, errors: errors.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

type CandidateInput = {
  first_name: string; last_name: string; email?: string; phone?: string
  current_title: string; current_company: string; seniority_level: string
  location_city: string; location_country?: string; region?: string
  is_remote_open?: boolean; salary_current?: number
  salary_expectation_min?: number; salary_expectation_max?: number
  notice_period_days?: number; years_experience?: number
  availability_status: string; summary?: string
  skills?: string[]; industry?: string
}

function inferCategory(skill: string): string {
  const s = skill.toLowerCase()
  if (['python','java','typescript','javascript','go','sql','react','node'].some(k => s.includes(k))) return 'Engineering'
  if (['salesforce','crm','hubspot','outreach','pipedrive'].some(k => s.includes(k))) return 'Sales'
  if (['google ads','seo','sem','analytics','mailchimp'].some(k => s.includes(k))) return 'Marketing'
  if (['excel','powerbi','tableau','financial modelling'].some(k => s.includes(k))) return 'Finance'
  return 'General'
}

function generateFallbackCandidates(jobFunction: string, location: string, count: number): CandidateInput[] {
  const cities = location ? [location] : ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol']
  const fn = jobFunction.toLowerCase()

  const templates: CandidateInput[] = [
    { first_name: 'Oliver', last_name: 'Bennett', current_title: `Senior ${jobFunction}`, current_company: 'Deloitte', seniority_level: 'SENIOR', location_city: cities[0], availability_status: 'ACTIVELY_LOOKING', years_experience: 7, salary_current: 75000, salary_expectation_min: 85000, salary_expectation_max: 100000, notice_period_days: 30, summary: `Experienced ${jobFunction} with 7 years driving revenue growth. Closed £2.4M in new business last year.`, skills: [jobFunction, 'Salesforce', 'Negotiation', 'Account Management'], industry: fn.includes('sales') ? 'Financial Services' : 'Technology & Software' },
    { first_name: 'Fatima', last_name: 'Hassan', current_title: `${jobFunction} Manager`, current_company: 'HSBC', seniority_level: 'MANAGER', location_city: cities[1 % cities.length], availability_status: 'OPEN_TO_OFFERS', years_experience: 9, salary_current: 90000, salary_expectation_min: 100000, salary_expectation_max: 120000, notice_period_days: 60, summary: `Results-driven ${jobFunction} manager. Led team of 8 to exceed quarterly targets by 35%.`, skills: [jobFunction, 'Leadership', 'CRM', 'Pipeline Management'], industry: 'Banking' },
    { first_name: 'James', last_name: 'Thornton', current_title: `Junior ${jobFunction}`, current_company: 'Startup Hub', seniority_level: 'JUNIOR', location_city: cities[2 % cities.length], availability_status: 'ACTIVELY_LOOKING', years_experience: 2, salary_current: 32000, salary_expectation_min: 38000, salary_expectation_max: 48000, notice_period_days: 14, summary: `Ambitious junior ${jobFunction}. Grew pipeline by 60% in first 6 months through outbound strategy.`, skills: [jobFunction, 'Cold Calling', 'LinkedIn', 'HubSpot'], industry: 'Technology & Software' },
  ]

  return Array.from({ length: Math.min(count, templates.length * 3) }, (_, i) => ({
    ...templates[i % templates.length],
    first_name: templates[i % templates.length].first_name + (i >= templates.length ? i.toString() : ''),
  }))
}

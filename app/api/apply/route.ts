import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const ALLOWED_SOURCES    = ['LINKEDIN','INDEED','IMPORTED','REFERRAL','WEBSITE','MANUAL','GLASSDOOR','OTHER'] as const
const ALLOWED_SENIORITY  = ['INTERN','JUNIOR','MID','SENIOR','MANAGER','SENIOR_MANAGER','DIRECTOR','VP','C_SUITE'] as const
const ALLOWED_AVAIL      = ['ACTIVELY_LOOKING','OPEN_TO_OFFERS','PASSIVE','NOT_LOOKING','UNAVAILABLE'] as const

// Map values the extension may send that don't exist in the DB enum
const SENIORITY_MAP: Record<string, string> = { LEAD: 'SENIOR' }

function slugDomain(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '.com'
}

function authorized(req: NextRequest): boolean {
  const key = process.env.SCRAPE_API_KEY
  if (!key) return true // no key set → open (dev mode or public form)
  const header = req.headers.get('authorization')
  return header === `Bearer ${key}`
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    const {
      first_name, last_name, email, phone,
      linkedin_url, github_url, portfolio_url,
      current_title, current_company_name, current_department,
      seniority_level, location_city, location_country, region,
      is_remote_open, is_relocation_open,
      salary_current, salary_expectation_min, salary_expectation_max,
      notice_period_days, years_experience,
      availability_status, summary,
      skills,
      experiences,
      education,
      source: rawSource,
    } = body

    const source         = ALLOWED_SOURCES.includes(rawSource)   ? rawSource   : 'WEBSITE'
    const rawSeniority   = (SENIORITY_MAP[seniority_level] ?? seniority_level) as string
    const safeSeniority  = (ALLOWED_SENIORITY as readonly string[]).includes(rawSeniority) ? rawSeniority : 'MID'
    const safeAvail      = (ALLOWED_AVAIL as readonly string[]).includes(availability_status) ? availability_status : 'OPEN_TO_OFFERS'

    // ── Required field validation ─────────────────────────────────────────────
    const missing: string[] = []
    if (!first_name?.trim())       missing.push('first_name')
    if (!last_name?.trim())        missing.push('last_name')
    if (!email?.trim())            missing.push('email')
    if (!current_title?.trim())    missing.push('current_title')
    if (!location_city?.trim())    missing.push('location_city')
    if (!location_country?.trim()) missing.push('location_country')
    if (!region?.trim())           missing.push('region')
    if (!seniority_level)          missing.push('seniority_level')
    if (!availability_status)      missing.push('availability_status')

    if (missing.length) {
      return NextResponse.json({ error: 'Missing required fields', fields: missing }, { status: 400 })
    }

    // ── Duplicate email check ─────────────────────────────────────────────────
    const existing = await prisma.candidate.findUnique({ where: { email: email.trim().toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: 'A profile with this email already exists.' }, { status: 409 })
    }

    // ── Find or create current company ────────────────────────────────────────
    let current_company_id: string | null = null
    if (current_company_name?.trim()) {
      const companyName = current_company_name.trim()
      let company = await prisma.company.findFirst({ where: { name: companyName } })
      if (!company) {
        const domain = slugDomain(companyName)
        // domain must be unique — append suffix if taken
        const domainExists = await prisma.company.findFirst({ where: { domain } })
        company = await prisma.company.create({
          data: {
            name:                companyName,
            domain:              domainExists ? `${domain.replace('.com', '')}-${Date.now()}.com` : domain,
            industry:            location_country === 'United Kingdom' ? 'Other' : 'Other',
            sector:              'Other',
            company_size:        'SME',
            headquarters_city:   location_city?.trim() || 'Unknown',
            headquarters_country: location_country?.trim() || 'Unknown',
            region:              region?.trim() || 'Other',
          },
        })
      }
      current_company_id = company.id
    }

    // ── Resolve skills ────────────────────────────────────────────────────────
    const skillNames: string[] = Array.isArray(skills) ? skills.filter(Boolean) : []
    const skillRecords = await Promise.all(
      skillNames.map(name =>
        prisma.skill.upsert({
          where: { name },
          create: { name, category: 'General', is_verified: false },
          update: {},
        })
      )
    )

    // ── Create candidate ──────────────────────────────────────────────────────
    const candidate = await prisma.candidate.create({
      data: {
        first_name:             first_name.trim(),
        last_name:              last_name.trim(),
        email:                  email.trim().toLowerCase(),
        phone:                  phone?.trim() || null,
        linkedin_url:           linkedin_url?.trim() || null,
        github_url:             github_url?.trim() || null,
        portfolio_url:          portfolio_url?.trim() || null,
        current_title:          current_title.trim(),
        current_company_id,
        current_department:     current_department?.trim() || null,
        seniority_level:        safeSeniority as 'INTERN'|'JUNIOR'|'MID'|'SENIOR'|'MANAGER'|'SENIOR_MANAGER'|'DIRECTOR'|'VP'|'C_SUITE',
        location_city:          location_city.trim(),
        location_country:       location_country.trim(),
        region:                 region.trim(),
        is_remote_open:         Boolean(is_remote_open),
        is_relocation_open:     Boolean(is_relocation_open),
        salary_current:         salary_current         ? parseFloat(salary_current)         : null,
        salary_expectation_min: salary_expectation_min ? parseFloat(salary_expectation_min) : null,
        salary_expectation_max: salary_expectation_max ? parseFloat(salary_expectation_max) : null,
        notice_period_days:     notice_period_days     ? parseInt(notice_period_days)        : null,
        years_experience:       years_experience       ? parseInt(years_experience)          : null,
        availability_status:    safeAvail as 'ACTIVELY_LOOKING'|'OPEN_TO_OFFERS'|'PASSIVE'|'NOT_LOOKING'|'UNAVAILABLE',
        summary:                summary?.trim() || null,
        source:                 source as typeof ALLOWED_SOURCES[number],
        source_profile_url:     body.source_profile_url?.trim() || null,
        last_activity_date:     new Date(),

        skills: skillRecords.length ? {
          create: skillRecords.map((s, i) => ({
            skill_id:    s.id,
            proficiency: 'INTERMEDIATE' as const,
            is_primary:  i < 5,
          })),
        } : undefined,

        experiences: experiences?.length ? {
          create: (experiences as Array<{
            company_name: string; title: string; department?: string
            start_date: string; end_date?: string; is_current?: boolean; description?: string
          }>).map(exp => ({
            company_name: exp.company_name?.trim() || companyFallback(current_company_name, current_title),
            title:        exp.title?.trim() || current_title.trim(),
            department:   exp.department?.trim() || null,
            start_date:   new Date(exp.start_date),
            end_date:     exp.is_current ? null : (exp.end_date ? new Date(exp.end_date) : null),
            is_current:   Boolean(exp.is_current),
            description:  exp.description?.trim() || null,
            achievements: [],
          })),
        } : undefined,

        education: education?.length ? {
          create: (education as Array<{
            institution: string; degree: string; field_of_study: string
            grade?: string; start_year: number; end_year?: number
          }>).map(edu => ({
            institution:    edu.institution?.trim(),
            degree:         edu.degree?.trim(),
            field_of_study: edu.field_of_study?.trim(),
            grade:          edu.grade?.trim() || null,
            start_year:     parseInt(String(edu.start_year)),
            end_year:       edu.end_year ? parseInt(String(edu.end_year)) : null,
          })),
        } : undefined,
      },
    })

    return NextResponse.json({ success: true, id: candidate.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/apply]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function companyFallback(name?: string, title?: string): string {
  return name?.trim() || title?.trim() || 'Unknown'
}

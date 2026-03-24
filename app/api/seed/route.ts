import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const maxDuration = 60

// Protect with a secret token — set SEED_SECRET env var in Vercel
// Call: POST /api/seed  with header  Authorization: Bearer <SEED_SECRET>
export async function POST(req: NextRequest) {
  const secret = process.env.SEED_SECRET
  if (secret) {
    const auth = req.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    // ─── Skills ──────────────────────────────────────────────────────────────
    const skills = await Promise.all([
      prisma.skill.upsert({ where: { name: 'TypeScript' },    update: {}, create: { name: 'TypeScript',    category: 'Engineering', subcategory: 'Languages',   aliases: ['TS'] } }),
      prisma.skill.upsert({ where: { name: 'Python' },        update: {}, create: { name: 'Python',        category: 'Engineering', subcategory: 'Languages',   aliases: ['py'] } }),
      prisma.skill.upsert({ where: { name: 'React' },         update: {}, create: { name: 'React',         category: 'Engineering', subcategory: 'Frontend',    aliases: ['ReactJS', 'React.js'] } }),
      prisma.skill.upsert({ where: { name: 'Node.js' },       update: {}, create: { name: 'Node.js',       category: 'Engineering', subcategory: 'Backend',     aliases: ['NodeJS', 'Node'] } }),
      prisma.skill.upsert({ where: { name: 'PostgreSQL' },    update: {}, create: { name: 'PostgreSQL',    category: 'Engineering', subcategory: 'Databases',   aliases: ['Postgres', 'psql'] } }),
      prisma.skill.upsert({ where: { name: 'AWS' },           update: {}, create: { name: 'AWS',           category: 'Engineering', subcategory: 'Cloud',       aliases: ['Amazon Web Services'] } }),
      prisma.skill.upsert({ where: { name: 'Docker' },        update: {}, create: { name: 'Docker',        category: 'Engineering', subcategory: 'DevOps',      aliases: ['containerisation'] } }),
      prisma.skill.upsert({ where: { name: 'Kubernetes' },    update: {}, create: { name: 'Kubernetes',    category: 'Engineering', subcategory: 'DevOps',      aliases: ['K8s'] } }),
      prisma.skill.upsert({ where: { name: 'Product Management' }, update: {}, create: { name: 'Product Management', category: 'Product', subcategory: 'Strategy', aliases: ['PM'] } }),
      prisma.skill.upsert({ where: { name: 'Data Analysis' }, update: {}, create: { name: 'Data Analysis', category: 'Data',        subcategory: 'Analytics',   aliases: ['Analytics'] } }),
      prisma.skill.upsert({ where: { name: 'Machine Learning' }, update: {}, create: { name: 'Machine Learning', category: 'Data', subcategory: 'AI/ML',    aliases: ['ML'] } }),
      prisma.skill.upsert({ where: { name: 'SQL' },           update: {}, create: { name: 'SQL',           category: 'Engineering', subcategory: 'Databases',   aliases: [] } }),
      prisma.skill.upsert({ where: { name: 'Java' },          update: {}, create: { name: 'Java',          category: 'Engineering', subcategory: 'Languages',   aliases: [] } }),
      prisma.skill.upsert({ where: { name: 'Go' },            update: {}, create: { name: 'Go',            category: 'Engineering', subcategory: 'Languages',   aliases: ['Golang'] } }),
      prisma.skill.upsert({ where: { name: 'Figma' },         update: {}, create: { name: 'Figma',         category: 'Design',      subcategory: 'UI/UX',       aliases: [] } }),
    ])

    const skillMap: Record<string, string> = {}
    skills.forEach(s => { skillMap[s.name] = s.id })

    // ─── Companies ───────────────────────────────────────────────────────────
    const companiesData = [
      { name: 'Monzo Bank', domain: 'monzo.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Digital Banking', company_size: 'MID_MARKET' as const, employee_count: 3000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Kubernetes', 'Go', 'PostgreSQL', 'Kafka'], culture_tags: ['remote-friendly', 'mission-driven', 'inclusive'], glassdoor_rating: 4.3, founded_year: 2015 },
      { name: 'Revolut', domain: 'revolut.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Payments', company_size: 'ENTERPRISE' as const, employee_count: 8000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Java', 'Kotlin', 'AWS', 'PostgreSQL'], culture_tags: ['fast-paced', 'high-performance', 'global'], glassdoor_rating: 3.8, founded_year: 2015 },
      { name: 'Deliveroo', domain: 'deliveroo.com', industry: 'Food Tech', sector: 'Technology', sub_sector: 'On-Demand Delivery', company_size: 'ENTERPRISE' as const, employee_count: 5000, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Ruby', 'React', 'AWS', 'PostgreSQL', 'Python'], culture_tags: ['collaborative', 'data-driven', 'customer-first'], glassdoor_rating: 3.6, founded_year: 2013 },
      { name: 'Wise', domain: 'wise.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Remittances', company_size: 'MID_MARKET' as const, employee_count: 4500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Java', 'React', 'AWS', 'PostgreSQL'], culture_tags: ['transparent', 'customer-obsessed', 'global'], glassdoor_rating: 4.5, founded_year: 2011 },
      { name: 'Checkout.com', domain: 'checkout.com', industry: 'Fintech', sector: 'Financial Services', sub_sector: 'Payments Infrastructure', company_size: 'ENTERPRISE' as const, employee_count: 2500, headquarters_city: 'London', headquarters_country: 'United Kingdom', region: 'EMEA', tech_stack: ['Go', 'Kubernetes', 'AWS', 'React'], culture_tags: ['engineering-led', 'global', 'scale-up'], glassdoor_rating: 4.0, founded_year: 2012 },
    ]

    const companies = await Promise.all(
      companiesData.map(c => prisma.company.upsert({
        where: { domain: c.domain },
        update: {},
        create: c,
      }))
    )
    const companyMap: Record<string, string> = {}
    companies.forEach(c => { companyMap[c.domain] = c.id })

    // ─── Candidates ──────────────────────────────────────────────────────────
    const candidatesData = [
      { email: 'alex.chen@example.com', first_name: 'Alex', last_name: 'Chen', current_title: 'Senior Software Engineer', current_company_domain: 'monzo.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 6, salary_currency: 'GBP', salary_expectation_min: 90000, salary_expectation_max: 120000, is_remote_open: true, skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'] },
      { email: 'priya.sharma@example.com', first_name: 'Priya', last_name: 'Sharma', current_title: 'Staff Engineer', current_company_domain: 'revolut.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'LINKEDIN' as const, years_experience: 9, salary_currency: 'GBP', salary_expectation_min: 130000, salary_expectation_max: 160000, is_remote_open: true, skills: ['Java', 'AWS', 'Kubernetes', 'PostgreSQL'] },
      { email: 'james.okonkwo@example.com', first_name: 'James', last_name: 'Okonkwo', current_title: 'Engineering Manager', current_company_domain: 'deliveroo.com', seniority_level: 'MANAGER' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'PASSIVE' as const, source: 'REFERRAL' as const, years_experience: 11, salary_currency: 'GBP', salary_expectation_min: 140000, salary_expectation_max: 170000, is_remote_open: false, skills: ['Python', 'AWS', 'Docker', 'Machine Learning'] },
      { email: 'sofia.martinez@example.com', first_name: 'Sofia', last_name: 'Martinez', current_title: 'Product Manager', current_company_domain: 'wise.com', seniority_level: 'SENIOR' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'OPEN_TO_OFFERS' as const, source: 'LINKEDIN' as const, years_experience: 7, salary_currency: 'GBP', salary_expectation_min: 95000, salary_expectation_max: 125000, is_remote_open: true, skills: ['Product Management', 'Data Analysis', 'SQL'] },
      { email: 'tom.wright@example.com', first_name: 'Tom', last_name: 'Wright', current_title: 'Data Engineer', current_company_domain: 'checkout.com', seniority_level: 'MID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', availability_status: 'ACTIVELY_LOOKING' as const, source: 'INDEED' as const, years_experience: 4, salary_currency: 'GBP', salary_expectation_min: 70000, salary_expectation_max: 90000, is_remote_open: true, skills: ['Python', 'SQL', 'Data Analysis', 'AWS'] },
    ]

    const candidates = await Promise.all(
      candidatesData.map(async ({ current_company_domain, skills: candidateSkills, salary_expectation_min, salary_expectation_max, ...rest }) => {
        const candidate = await prisma.candidate.upsert({
          where: { email: rest.email },
          update: {},
          create: {
            ...rest,
            current_company_id: companyMap[current_company_domain] ?? null,
            salary_expectation_min: salary_expectation_min ? salary_expectation_min : null,
            salary_expectation_max: salary_expectation_max ? salary_expectation_max : null,
          },
        })
        await Promise.all(
          candidateSkills.map(skillName =>
            skillMap[skillName]
              ? prisma.candidateSkill.upsert({
                  where: { candidate_id_skill_id: { candidate_id: candidate.id, skill_id: skillMap[skillName] } },
                  update: {},
                  create: { candidate_id: candidate.id, skill_id: skillMap[skillName], proficiency: 'ADVANCED' },
                })
              : Promise.resolve()
          )
        )
        return candidate
      })
    )

    // ─── Jobs ────────────────────────────────────────────────────────────────
    const jobsData = [
      { title: 'Senior TypeScript Engineer', company_domain: 'monzo.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 90000, salary_max: 120000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'HIGH' as const, posted_date: new Date('2026-02-01'), description: 'Build and maintain Monzo\'s core banking platform using TypeScript and Node.js.', skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'AWS'] },
      { title: 'Staff Backend Engineer (Go)', company_domain: 'revolut.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 130000, salary_max: 160000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'IMMEDIATE' as const, posted_date: new Date('2026-02-15'), description: 'Lead backend architecture for Revolut\'s payments infrastructure using Go and Kubernetes.', skills: ['Go', 'Kubernetes', 'PostgreSQL', 'AWS'] },
      { title: 'Senior Product Manager', company_domain: 'deliveroo.com', seniority_level: 'SENIOR' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 95000, salary_max: 130000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-02-20'), description: 'Drive product strategy for Deliveroo\'s consumer app experience.', skills: ['Product Management', 'Data Analysis', 'SQL'] },
      { title: 'ML Engineer', company_domain: 'wise.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'REMOTE' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 80000, salary_max: 110000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'COMPANY_WEBSITE' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-01'), description: 'Build machine learning models for fraud detection and risk scoring at Wise.', skills: ['Python', 'Machine Learning', 'SQL', 'AWS'] },
      { title: 'Data Engineer', company_domain: 'checkout.com', seniority_level: 'MID' as const, employment_type: 'FULL_TIME' as const, work_mode: 'HYBRID' as const, location_city: 'London', location_country: 'United Kingdom', region: 'EMEA', salary_min: 70000, salary_max: 95000, salary_currency: 'GBP', status: 'ACTIVE' as const, source: 'LINKEDIN' as const, urgency: 'NORMAL' as const, posted_date: new Date('2026-03-05'), description: 'Build and maintain Checkout.com\'s data pipelines and analytics infrastructure.', skills: ['Python', 'SQL', 'Data Analysis', 'Docker'] },
    ]

    const jobs = await Promise.all(
      jobsData.map(async ({ company_domain, skills: jobSkills, ...rest }) => {
        const job = await prisma.job.create({
          data: { ...rest, company_id: companyMap[company_domain] },
        }).catch(() => prisma.job.findFirst({ where: { title: rest.title, company_id: companyMap[company_domain] } }).then(j => j!))
        if (job) {
          await Promise.all(
            jobSkills.map(skillName =>
              skillMap[skillName]
                ? prisma.jobSkill.upsert({
                    where: { job_id_skill_id: { job_id: job.id, skill_id: skillMap[skillName] } },
                    update: {},
                    create: { job_id: job.id, skill_id: skillMap[skillName], importance: 'REQUIRED' },
                  })
                : Promise.resolve()
            )
          )
        }
        return job
      })
    )

    // ─── Matches ─────────────────────────────────────────────────────────────
    const matchPairs = [
      { candidateIdx: 0, jobIdx: 0, overall_score: 0.92, skill_match_score: 0.95, experience_match_score: 0.90, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.85, status: 'SHORTLISTED' as const },
      { candidateIdx: 1, jobIdx: 1, overall_score: 0.88, skill_match_score: 0.80, experience_match_score: 0.95, location_match_score: 1.0, seniority_match_score: 0.90, salary_match_score: 0.85, status: 'SUGGESTED' as const },
      { candidateIdx: 3, jobIdx: 2, overall_score: 0.85, skill_match_score: 0.90, experience_match_score: 0.82, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.80, status: 'CONTACTED' as const },
      { candidateIdx: 4, jobIdx: 4, overall_score: 0.78, skill_match_score: 0.85, experience_match_score: 0.75, location_match_score: 1.0, seniority_match_score: 1.0, salary_match_score: 0.70, status: 'SUGGESTED' as const },
    ]

    await Promise.all(
      matchPairs.map(({ candidateIdx, jobIdx, ...scores }) => {
        const c = candidates[candidateIdx]
        const j = jobs[jobIdx]
        if (!c || !j) return Promise.resolve()
        return prisma.match.upsert({
          where: { candidate_id_job_id: { candidate_id: c.id, job_id: j.id } },
          update: {},
          create: { candidate_id: c.id, job_id: j.id, ...scores },
        })
      })
    )

    // ─── Recruiter ───────────────────────────────────────────────────────────
    await prisma.recruiter.upsert({
      where: { email: 'admin@recruitai.com' },
      update: {},
      create: {
        email: 'admin@recruitai.com',
        first_name: 'Sarah',
        last_name: 'Thompson',
        company_name: 'RecruitAI',
        role: 'ADMIN',
        subscription_tier: 'PROFESSIONAL',
        subscription_status: 'ACTIVE',
        max_searches_per_month: 500,
        max_screening_calls_per_month: 100,
        max_candidates_saved: 2000,
      },
    })

    // ─── Market Insights ─────────────────────────────────────────────────────
    await prisma.marketInsight.createMany({
      skipDuplicates: true,
      data: [
        {
          insight_type: 'SALARY_BENCHMARK',
          title: 'Senior TypeScript Engineer — London 2026',
          description: 'Median base salary for Senior TypeScript Engineers in London is £105,000, up 8% YoY.',
          data_json: { median: 105000, p25: 90000, p75: 125000, currency: 'GBP' },
          industry: 'Fintech',
          region: 'EMEA',
          seniority_level: 'SENIOR',
          valid_from: new Date('2026-01-01'),
          source: 'Job posting analysis',
        },
        {
          insight_type: 'SKILL_DEMAND',
          title: 'Go Engineers in High Demand — UK Fintech',
          description: 'Demand for Go engineers in UK fintech has grown 34% in 12 months, driven by microservices migration at challenger banks.',
          data_json: { growth_rate_yoy: 0.34, top_hirers: ['Monzo', 'Starling', 'Revolut'] },
          industry: 'Fintech',
          region: 'EMEA',
          valid_from: new Date('2026-01-01'),
          source: 'Job posting analysis — 8,200 postings',
        },
        {
          insight_type: 'HIRING_TREND',
          title: 'Fintech ML Hiring Accelerating Q1 2026',
          description: 'Machine learning and AI engineering roles in UK fintech increased 52% YoY in Q1 2026, with fraud detection as the primary use case.',
          data_json: { growth_rate_yoy: 0.52, top_use_cases: ['fraud_detection', 'credit_risk'] },
          industry: 'Fintech',
          region: 'EMEA',
          valid_from: new Date('2026-01-01'),
          source: 'Recruiter survey — 340 respondents',
        },
      ],
    })

    return NextResponse.json({
      ok: true,
      counts: {
        skills: skills.length,
        companies: companies.length,
        candidates: candidates.length,
        jobs: jobs.filter(Boolean).length,
      },
    })
  } catch (err) {
    console.error('Seed error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

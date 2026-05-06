import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function authorized(req: NextRequest): boolean {
  const key = process.env.SCRAPE_API_KEY
  if (!key) return true // no key configured = open (dev mode)
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${key}`
}

interface JobPayload {
  external_id?: string
  source: string
  source_url?: string
  title: string
  company_name: string
  company_industry?: string
  company_url?: string
  description: string
  employment_type: string
  work_mode: string
  seniority_level: string
  location_city: string
  location_country: string
  region: string
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string
  salary_period?: string
  posted_date: string
  visa_sponsorship?: boolean
  equity_offered?: boolean
}

function slugDomain(name: string, suffix = ''): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return suffix ? `${base}-${suffix}.com` : `${base}.com`
}

const VALID_EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']
const VALID_WORK_MODES        = ['ONSITE', 'HYBRID', 'REMOTE']
const VALID_SENIORITY         = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'VP', 'C_SUITE']
const VALID_SALARY_PERIODS    = ['ANNUAL', 'MONTHLY', 'DAILY', 'HOURLY']
const VALID_SOURCES           = ['LINKEDIN', 'INDEED', 'GLASSDOOR', 'COMPANY_WEBSITE', 'RECRUITER_POSTED', 'IMPORTED', 'OTHER']

function safe<T>(val: string, allowed: T[], fallback: T): T {
  return (allowed as string[]).includes(val) ? val as T : fallback
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { jobs }: { jobs: JobPayload[] } = await req.json()

    if (!Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: 'No jobs provided' }, { status: 400 })
    }

    let created = 0
    let skipped = 0
    const errors: string[] = []

    for (const job of jobs) {
      try {
        // ── Skip if already imported ────────────────────────────────────────
        if (job.external_id && job.source) {
          const exists = await prisma.job.findFirst({
            where: { external_id: job.external_id, source: job.source as never },
          })
          if (exists) { skipped++; continue }
        }

        // ── Find or create company ──────────────────────────────────────────
        const companyName = (job.company_name || 'Unknown Company').trim()
        let company = await prisma.company.findFirst({ where: { name: companyName } })

        if (!company) {
          let domain = slugDomain(companyName)
          const domainExists = await prisma.company.findFirst({ where: { domain } })
          if (domainExists) domain = slugDomain(companyName, Date.now().toString().slice(-6))

          company = await prisma.company.create({
            data: {
              name:                 companyName,
              domain,
              industry:             (job.company_industry || 'Other').substring(0, 100),
              sector:               'Other',
              company_size:         'SME',
              headquarters_city:    (job.location_city || 'Unknown').substring(0, 100),
              headquarters_country: (job.location_country || 'United Kingdom').substring(0, 100),
              region:               (job.region || 'Other').substring(0, 100),
              website:              job.company_url || null,
            },
          })
        }

        // ── Create job ──────────────────────────────────────────────────────
        await prisma.job.create({
          data: {
            title:            job.title.substring(0, 200),
            company_id:       company.id,
            description:      job.description || 'No description provided.',
            seniority_level:  safe(job.seniority_level, VALID_SENIORITY, 'MID') as never,
            employment_type:  safe(job.employment_type, VALID_EMPLOYMENT_TYPES, 'FULL_TIME') as never,
            work_mode:        safe(job.work_mode, VALID_WORK_MODES, 'HYBRID') as never,
            location_city:    job.location_city || null,
            location_country: job.location_country || null,
            region:           job.region || null,
            salary_min:       job.salary_min ?? null,
            salary_max:       job.salary_max ?? null,
            salary_currency:  job.salary_currency || 'GBP',
            salary_period:    safe(job.salary_period || 'ANNUAL', VALID_SALARY_PERIODS, 'ANNUAL') as never,
            source:           safe(job.source, VALID_SOURCES, 'IMPORTED') as never,
            source_url:       job.source_url || null,
            external_id:      job.external_id || null,
            posted_date:      new Date(job.posted_date),
            visa_sponsorship: Boolean(job.visa_sponsorship),
            equity_offered:   Boolean(job.equity_offered),
            status:           'ACTIVE',
            urgency:          'NORMAL',
          },
        })

        created++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`${job.title} @ ${job.company_name}: ${msg}`)
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      errors: errors.length ? errors : undefined,
    })
  } catch (err) {
    console.error('[POST /api/jobs/import]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60

// ── Python resolver (lazy, called only on first request) ─────────────────────
let _python: string | null = null

function getPython(): string {
  if (_python) return _python
  const candidates = [
    '/usr/local/bin/python3',
    '/usr/bin/python3',
    '/usr/local/bin/python',
    '/usr/bin/python',
  ]
  for (const bin of candidates) {
    if (existsSync(bin)) {
      _python = bin
      return bin
    }
  }
  throw new Error('Python 3 not found. Checked: ' + candidates.join(', '))
}

// ── Field maps (mirrored from scrape_jobs.py) ────────────────────────────────
const VALID_EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP']
const VALID_WORK_MODES        = ['ONSITE', 'HYBRID', 'REMOTE']
const VALID_SENIORITY         = ['INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'MANAGER', 'SENIOR_MANAGER', 'DIRECTOR', 'VP', 'C_SUITE']
const VALID_SALARY_PERIODS    = ['ANNUAL', 'MONTHLY', 'DAILY', 'HOURLY']
const VALID_SOURCES           = ['LINKEDIN', 'INDEED', 'GLASSDOOR', 'COMPANY_WEBSITE', 'RECRUITER_POSTED', 'IMPORTED', 'OTHER']

function safe<T>(val: string | undefined, allowed: T[], fallback: T): T {
  return (allowed as string[]).includes(val ?? '') ? val as T : fallback
}

function slugDomain(name: string, suffix = ''): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  return suffix ? `${base}-${suffix}.com` : `${base}.com`
}

// ── Import logic (inline — no internal HTTP round-trip) ──────────────────────
interface JobPayload {
  external_id?: string; source?: string; source_url?: string
  title: string; company_name: string; company_industry?: string; company_url?: string
  description?: string; employment_type?: string; work_mode?: string; seniority_level?: string
  location_city?: string; location_country?: string; region?: string
  salary_min?: number | null; salary_max?: number | null; salary_currency?: string; salary_period?: string
  posted_date?: string; visa_sponsorship?: boolean; equity_offered?: boolean
}

async function importJobs(jobs: JobPayload[]) {
  let created = 0, skipped = 0
  const errors: string[] = []

  for (const job of jobs) {
    try {
      if (job.external_id && job.source) {
        const exists = await prisma.job.findFirst({
          where: { external_id: job.external_id, source: job.source as never },
        })
        if (exists) { skipped++; continue }
      }

      const companyName = (job.company_name || 'Unknown Company').trim()
      let company = await prisma.company.findFirst({ where: { name: companyName } })
      if (!company) {
        let domain = slugDomain(companyName)
        if (await prisma.company.findFirst({ where: { domain } })) {
          domain = slugDomain(companyName, Date.now().toString().slice(-6))
        }
        company = await prisma.company.create({
          data: {
            name: companyName, domain,
            industry: (job.company_industry || 'Other').substring(0, 100),
            sector: 'Other', company_size: 'SME',
            headquarters_city:    (job.location_city    || 'Unknown').substring(0, 100),
            headquarters_country: (job.location_country || 'United Kingdom').substring(0, 100),
            region: (job.region || 'Other').substring(0, 100),
            website: job.company_url || null,
          },
        })
      }

      await prisma.job.create({
        data: {
          title:            (job.title || 'Untitled').substring(0, 200),
          company_id:       company.id,
          description:      job.description || 'No description provided.',
          seniority_level:  safe(job.seniority_level,  VALID_SENIORITY,          'MID')      as never,
          employment_type:  safe(job.employment_type,   VALID_EMPLOYMENT_TYPES,   'FULL_TIME') as never,
          work_mode:        safe(job.work_mode,          VALID_WORK_MODES,         'HYBRID')   as never,
          location_city:    job.location_city    || null,
          location_country: job.location_country || null,
          region:           job.region           || null,
          salary_min:       job.salary_min       ?? null,
          salary_max:       job.salary_max       ?? null,
          salary_currency:  job.salary_currency  || 'GBP',
          salary_period:    safe(job.salary_period, VALID_SALARY_PERIODS, 'ANNUAL') as never,
          source:           safe(job.source,         VALID_SOURCES,        'IMPORTED') as never,
          source_url:       job.source_url  || null,
          external_id:      job.external_id || null,
          posted_date:      job.posted_date ? new Date(job.posted_date) : new Date(),
          visa_sponsorship: Boolean(job.visa_sponsorship),
          equity_offered:   Boolean(job.equity_offered),
          status: 'ACTIVE', urgency: 'NORMAL',
        },
      })
      created++
    } catch (err) {
      errors.push(`${job.title} @ ${job.company_name}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return { created, skipped, errors: errors.length ? errors : undefined }
}

// ── Scraper subprocess ────────────────────────────────────────────────────────
interface ScrapeRequest {
  query: string; location?: string; sites?: string[]; results?: number; hours?: number
}

function runScraper(args: ScrapeRequest): Promise<{ jobs: JobPayload[] }> {
  return new Promise((resolve, reject) => {
    const python = getPython()
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_jobs.py')
    const argv = [
      scriptPath,
      '--query', args.query,
      '--location', args.location || 'London, UK',
      '--results', String(args.results || 50),
      '--hours',   String(args.hours   || 168),
    ]
    if (args.sites?.length) argv.push('--sites', ...args.sites)

    const proc = spawn(python, argv)
    let stdout = '', stderr = ''
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })
    proc.on('close', code => {
      if (code !== 0) return reject(new Error(`Scraper failed: ${stderr.slice(-400)}`))
      try { resolve(JSON.parse(stdout)) }
      catch { reject(new Error(`Invalid JSON from scraper. stderr: ${stderr.slice(-200)}`)) }
    })
    proc.on('error', err => reject(new Error(`Could not start Python: ${err.message}`)))
  })
}

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body: ScrapeRequest = await req.json()
    if (!body.query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    const scraped = await runScraper(body)
    if (!scraped.jobs?.length) {
      return NextResponse.json({ created: 0, skipped: 0, message: 'No jobs returned by scraper' })
    }

    const result = await importJobs(scraped.jobs)
    return NextResponse.json({ ...result, total: scraped.jobs.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/jobs/scrape]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

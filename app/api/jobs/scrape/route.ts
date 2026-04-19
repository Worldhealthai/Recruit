import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export const maxDuration = 60

interface ScrapeRequest {
  query: string
  location?: string
  sites?: string[]
  results?: number
  hours?: number
}

function runScraper(args: ScrapeRequest): Promise<{ jobs: unknown[] }> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), 'scripts', 'scrape_jobs.py')

    const argv = [
      scriptPath,
      '--query', args.query,
      '--location', args.location || 'London, UK',
      '--results', String(args.results || 50),
      '--hours', String(args.hours || 168),
    ]

    if (args.sites?.length) {
      argv.push('--sites', ...args.sites)
    }

    const proc = spawn('python3', argv)

    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString() })
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString() })

    proc.on('close', code => {
      if (code !== 0) {
        console.error('[scrape] stderr:', stderr)
        return reject(new Error(`Scraper exited with code ${code}: ${stderr.slice(-300)}`))
      }
      try {
        const parsed = JSON.parse(stdout)
        resolve(parsed)
      } catch {
        reject(new Error('Scraper returned invalid JSON'))
      }
    })

    proc.on('error', err => reject(err))
  })
}

export async function POST(req: NextRequest) {
  try {
    const body: ScrapeRequest = await req.json()

    if (!body.query?.trim()) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 })
    }

    // Run Python scraper
    const scraped = await runScraper(body)
    if (!scraped.jobs?.length) {
      return NextResponse.json({ created: 0, skipped: 0, message: 'No jobs found for this query' })
    }

    // Forward to import endpoint (same server)
    const importRes = await fetch(new URL('/api/jobs/import', req.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs: scraped.jobs }),
    })

    const importResult = await importRes.json()
    return NextResponse.json(importResult)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[POST /api/jobs/scrape]', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

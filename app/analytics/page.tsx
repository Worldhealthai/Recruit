export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Nav from '../components/Nav'

export const maxDuration = 30

async function getData() {
  try {
    const [matches, placements, screeningCalls, candidates] = await Promise.all([
      prisma.match.findMany({
        select: { status: true, overall_score: true, created_at: true, updated_at: true },
      }),
      prisma.placement.findMany({
        select: { fee_total: true, recruiter_earnings: true, invoice_status: true, created_at: true, start_date: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.screeningCall.findMany({
        select: { recommendation: true, created_at: true },
        where: { status: 'COMPLETED' },
      }),
      prisma.candidate.findMany({
        select: { source: true, availability_status: true, created_at: true },
      }),
    ])
    return { matches, placements, screeningCalls, candidates }
  } catch {
    return { matches: [], placements: [], screeningCalls: [], candidates: [] }
  }
}

function Bar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: `${height}px`, height: `${height}px`, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', background: color, borderRadius: `${height}px`, transition: 'width 0.6s ease' }} />
    </div>
  )
}

export default async function AnalyticsPage() {
  const { matches, placements, screeningCalls, candidates } = await getData()

  // Pipeline funnel
  const stages = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'PLACED']
  const stageColors: Record<string, string> = {
    SUGGESTED: '#64748b', CONTACTED: '#3b82f6', SHORTLISTED: '#8b5cf6',
    INTERVIEWING: '#f59e0b', OFFERED: '#f97316', PLACED: '#22c55e',
  }
  const stageCounts = stages.map(s => ({ stage: s, count: matches.filter(m => m.status === s).length }))
  const maxCount = Math.max(...stageCounts.map(s => s.count), 1)

  // Conversion rates
  const contacted = matches.filter(m => !['SUGGESTED'].includes(m.status)).length
  const shortlisted = matches.filter(m => ['SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'PLACED'].includes(m.status)).length
  const placed = matches.filter(m => m.status === 'PLACED').length
  const convToContact = matches.length ? Math.round((contacted / matches.length) * 100) : 0
  const convToShortlist = contacted ? Math.round((shortlisted / contacted) * 100) : 0
  const convToPlace = shortlisted ? Math.round((placed / shortlisted) * 100) : 0

  // Earnings
  const totalBilled = placements.reduce((s, p) => s + Number(p.fee_total), 0)
  const totalEarnings = placements.reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const paidEarnings = placements.filter(p => p.invoice_status === 'PAID').reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const pendingEarnings = totalEarnings - paidEarnings

  // Screening recommendations
  const recCounts: Record<string, number> = {}
  screeningCalls.forEach(c => { const r = c.recommendation ?? 'UNKNOWN'; recCounts[r] = (recCounts[r] ?? 0) + 1 })
  const recColors: Record<string, string> = { STRONG_YES: '#22c55e', YES: '#4ade80', MAYBE: '#f59e0b', NO: '#f87171', STRONG_NO: '#ef4444' }

  // Candidate sources
  const sourceCounts: Record<string, number> = {}
  candidates.forEach(c => { sourceCounts[c.source] = (sourceCounts[c.source] ?? 0) + 1 })
  const topSources = Object.entries(sourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxSource = Math.max(...topSources.map(s => s[1]), 1)

  // Availability breakdown
  const availColors: Record<string, string> = { ACTIVELY_LOOKING: '#22c55e', OPEN_TO_OFFERS: '#f59e0b', PASSIVE: '#64748b' }
  const availCounts: Record<string, number> = {}
  candidates.forEach(c => { availCounts[c.availability_status] = (availCounts[c.availability_status] ?? 0) + 1 })

  const fmt = (n: number) => n >= 1000 ? `£${(n / 1000).toFixed(0)}K` : `£${n.toFixed(0)}`

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.5rem', ...style }}>
      {children}
    </div>
  )

  const sectionTitle = (t: string) => (
    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '1.25rem' }}>{t}</div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Nav active="/analytics" />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '999px', padding: '0.2rem 0.8rem', fontSize: '0.72rem', color: '#a5b4fc', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block', marginBottom: '0.5rem' }}>Analytics</div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.3rem' }}>Pipeline Analytics</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Performance metrics across your full recruitment operation</p>
        </div>

        {/* Top KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Candidates', value: candidates.length.toString(), color: '#94a3b8' },
            { label: 'Total Matches', value: matches.length.toString(), color: '#a5b4fc' },
            { label: 'Screenings Done', value: screeningCalls.length.toString(), color: '#818cf8' },
            { label: 'Total Placements', value: placed.toString(), color: '#22c55e' },
            { label: 'Total Billed', value: totalBilled > 0 ? fmt(totalBilled) : '—', color: '#a5b4fc' },
            { label: 'Net Earnings', value: totalEarnings > 0 ? fmt(totalEarnings) : '—', color: '#4ade80' },
            { label: 'Cash Collected', value: paidEarnings > 0 ? fmt(paidEarnings) : '—', color: '#34d399' },
            { label: 'Pending Payment', value: pendingEarnings > 0 ? fmt(pendingEarnings) : '—', color: '#fbbf24' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color, letterSpacing: '-0.03em' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Pipeline funnel */}
          {card(
            <>
              {sectionTitle('Pipeline Funnel')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stageCounts.map(({ stage, count }) => (
                  <div key={stage} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.72rem', color: stageColors[stage], fontWeight: 700, minWidth: '90px' }}>{stage.replace(/_/g, ' ')}</span>
                    <Bar pct={(count / maxCount) * 100} color={stageColors[stage]} height={10} />
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 700, minWidth: '24px', textAlign: 'right' }}>{count}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Conversion rates */}
          {card(
            <>
              {sectionTitle('Conversion Rates')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {[
                  { label: 'Suggested → Contacted', pct: convToContact, color: '#3b82f6' },
                  { label: 'Contacted → Shortlisted', pct: convToShortlist, color: '#8b5cf6' },
                  { label: 'Shortlisted → Placed', pct: convToPlace, color: '#22c55e' },
                ].map(({ label, pct, color }) => (
                  <div key={label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{label}</span>
                      <span style={{ fontSize: '0.82rem', color, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <Bar pct={pct} color={color} height={6} />
                  </div>
                ))}
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '0.4rem' }}>
                  <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, marginBottom: '0.2rem' }}>Overall placement rate</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4ade80' }}>
                    {matches.length ? Math.round((placed / matches.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>

          {/* Screening recommendations */}
          {card(
            <>
              {sectionTitle('Screening Outcomes')}
              {screeningCalls.length === 0 ? (
                <div style={{ color: '#334155', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No screenings yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {Object.entries(recCounts).map(([rec, count]) => (
                    <div key={rec} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.72rem', color: recColors[rec] ?? '#64748b', fontWeight: 700, minWidth: '80px' }}>{rec.replace(/_/g, ' ')}</span>
                      <Bar pct={(count / screeningCalls.length) * 100} color={recColors[rec] ?? '#64748b'} height={8} />
                      <span style={{ fontSize: '0.75rem', color: '#64748b', minWidth: '20px', textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Candidate sources */}
          {card(
            <>
              {sectionTitle('Candidate Sources')}
              {topSources.length === 0 ? (
                <div style={{ color: '#334155', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>No data</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {topSources.map(([source, count]) => (
                    <div key={source} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', minWidth: '80px', textTransform: 'capitalize' }}>{source.replace(/_/g, ' ').toLowerCase()}</span>
                      <Bar pct={(count / maxSource) * 100} color='#6366f1' height={8} />
                      <span style={{ fontSize: '0.72rem', color: '#64748b', minWidth: '20px', textAlign: 'right' }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Availability breakdown */}
          {card(
            <>
              {sectionTitle('Candidate Availability')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(availCounts).slice(0, 5).map(([status, count]) => (
                  <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: availColors[status] ?? '#64748b', flexShrink: 0, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.72rem', color: '#94a3b8', flex: 1 }}>{status.replace(/_/g, ' ')}</span>
                    <span style={{ fontSize: '0.78rem', color: availColors[status] ?? '#64748b', fontWeight: 700 }}>{count}</span>
                    <span style={{ fontSize: '0.68rem', color: '#334155' }}>({Math.round((count / candidates.length) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Earnings breakdown */}
        {placements.length > 0 && card(
          <>
            {sectionTitle('Earnings Breakdown')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Total Invoiced', value: fmt(totalBilled), sub: 'gross fees raised', color: '#a5b4fc' },
                { label: 'Net Earnings', value: fmt(totalEarnings), sub: 'after platform cut', color: '#4ade80' },
                { label: 'Cash Collected', value: fmt(paidEarnings), sub: `${placements.filter(p => p.invoice_status === 'PAID').length} invoices paid`, color: '#34d399' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.6rem', padding: '1rem 1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.72rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>{label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, color, letterSpacing: '-0.03em', marginBottom: '0.25rem' }}>{value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#334155' }}>{sub}</div>
                </div>
              ))}
            </div>
          </>
        )}

      </main>
    </div>
  )
}

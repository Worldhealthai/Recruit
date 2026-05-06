import { prisma } from '@/lib/prisma'
import AppShell from '../components/AppShell'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function getData() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      candidateCount,
      activeJobCount,
      screeningCount,
      placementsMtd,
      recentMatches,
      sourceCounts,
    ] = await Promise.all([
      prisma.candidate.count().catch(() => 0),
      prisma.job.count({ where: { status: 'ACTIVE' } }).catch(() => 0),
      prisma.screeningCall.count().catch(() => 0),
      prisma.placement.findMany({
        where: { created_at: { gte: startOfMonth } },
        select: { fee_total: true, recruiter_earnings: true },
      }).catch(() => []),
      prisma.match.findMany({
        take: 6,
        orderBy: { updated_at: 'desc' },
        include: {
          candidate: { select: { id: true, first_name: true, last_name: true, current_title: true } },
          job: { select: { id: true, title: true, company: { select: { name: true } } } },
        },
      }).catch(() => []),
      prisma.candidate.groupBy({ by: ['source'], _count: true }).catch(() => []),
    ])

    const mtdRevenue = placementsMtd.reduce((s, p) => s + Number(p.recruiter_earnings), 0)

    return { candidateCount, activeJobCount, screeningCount, mtdRevenue, placementsMtd: placementsMtd.length, recentMatches, sourceCounts }
  } catch {
    return { candidateCount: 0, activeJobCount: 0, screeningCount: 0, mtdRevenue: 0, placementsMtd: 0, recentMatches: [], sourceCounts: [] }
  }
}

const STATUS_META: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  SUGGESTED:    { bg: 'rgba(100,116,139,0.12)', text: '#94a3b8', dot: '#64748b',  label: 'Suggested' },
  CONTACTED:    { bg: 'rgba(59,130,246,0.1)',   text: '#60a5fa', dot: '#3b82f6',  label: 'Contacted' },
  SHORTLISTED:  { bg: 'rgba(139,92,246,0.1)',   text: '#a78bfa', dot: '#8b5cf6',  label: 'Shortlisted' },
  INTERVIEWING: { bg: 'rgba(245,158,11,0.1)',   text: '#fbbf24', dot: '#f59e0b',  label: 'Interviewing' },
  OFFERED:      { bg: 'rgba(249,115,22,0.1)',   text: '#fb923c', dot: '#f97316',  label: 'Offer Made' },
  PLACED:       { bg: 'rgba(34,197,94,0.1)',    text: '#4ade80', dot: '#22c55e',  label: 'Placed' },
  REJECTED:     { bg: 'rgba(239,68,68,0.1)',    text: '#f87171', dot: '#ef4444',  label: 'Rejected' },
}

const SOURCE_COLORS: Record<string, string> = {
  LINKEDIN: '#0a66c2',
  INDEED: '#003A9B',
  CV_LIBRARY: '#e05a00',
  DIRECT: '#6366f1',
  REFERRAL: '#22c55e',
  REED: '#cc0000',
  TOTALJOBS: '#f59e0b',
  OTHER: '#64748b',
}

export default async function DashboardPage() {
  const { candidateCount, activeJobCount, screeningCount, mtdRevenue, placementsMtd, recentMatches, sourceCounts } = await getData()

  const totalSources = sourceCounts.reduce((s, r) => s + r._count, 0)

  const stats = [
    { label: 'Active Candidates', value: candidateCount.toLocaleString(), color: '#818cf8', sub: 'in database', href: '/candidates' },
    { label: 'Open Roles',        value: activeJobCount.toLocaleString(), color: '#38bdf8', sub: 'active postings', href: '/jobs' },
    { label: 'AI Screens Run',    value: screeningCount.toLocaleString(), color: '#a78bfa', sub: 'all time', href: '/screening' },
    { label: 'Revenue MTD',       value: mtdRevenue >= 1000 ? `£${(mtdRevenue / 1000).toFixed(0)}k` : `£${Math.round(mtdRevenue)}`, color: '#4ade80', sub: `${placementsMtd} placement${placementsMtd !== 1 ? 's' : ''}`, href: '/placements' },
  ]

  return (
    <AppShell>
      <div style={{ padding: '1.5rem 2rem 3rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', margin: '0 0 0.25rem' }}>
            Dashboard
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
            Overview of your recruiting pipeline
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {stats.map(s => (
            <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.75rem', padding: '1.1rem',
                transition: 'border-color 0.15s ease',
              }}>
                <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '0.2rem' }}>{s.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Row 2: Source mix + Recent pipeline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Source mix */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>Candidate Sources</div>
            {sourceCounts.length === 0 ? (
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>No data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {sourceCounts.slice(0, 6).map(row => {
                  const pct = totalSources > 0 ? Math.round((row._count / totalSources) * 100) : 0
                  const color = SOURCE_COLORS[row.source] ?? '#64748b'
                  return (
                    <div key={row.source}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{row.source.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{pct}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent pipeline activity */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>Recent Pipeline Activity</div>
              <Link href="/pipeline" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none' }}>View all →</Link>
            </div>
            {recentMatches.length === 0 ? (
              <div style={{ color: '#475569', fontSize: '0.8rem' }}>No pipeline activity yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {recentMatches.map((m, i) => {
                  const meta = STATUS_META[m.status] ?? STATUS_META.SUGGESTED
                  const score = Math.round((m.overall_score ?? 0) * 100)
                  const hue = score >= 85 ? 142 : score >= 70 ? 38 : 0
                  return (
                    <div key={m.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.65rem 0',
                      borderBottom: i < recentMatches.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    }}>
                      {/* Score ring */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: `conic-gradient(hsl(${hue} 71% 55%) ${score * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#f8fafc' }}>{score}</span>
                        </div>
                      </div>
                      {/* Name + role */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.candidate.first_name} {m.candidate.last_name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.job.title} · {m.job.company?.name}
                        </div>
                      </div>
                      {/* Status badge */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: meta.bg, color: meta.text,
                        borderRadius: '999px', padding: '0.15rem 0.55rem',
                        fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot, flexShrink: 0 }} />
                        {meta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {[
            { label: '+ Add Candidate', href: '/candidates', color: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', text: '#a5b4fc' },
            { label: '+ Post Job',      href: '/jobs',       color: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.25)',  text: '#60a5fa' },
            { label: 'Run AI Screen',   href: '/pipeline',   color: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.25)', text: '#a78bfa' },
            { label: 'View Placements', href: '/placements', color: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   text: '#4ade80' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{
              display: 'inline-flex', alignItems: 'center',
              background: a.color, border: `1px solid ${a.border}`,
              color: a.text, borderRadius: '0.5rem',
              padding: '0.55rem 1rem', fontSize: '0.82rem', fontWeight: 600,
              textDecoration: 'none',
            }}>
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

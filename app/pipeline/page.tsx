import { prisma } from '@/lib/prisma'
import Nav from '../components/Nav'
import { Suspense } from 'react'
import PipelineTable from './PipelineTable'

async function getData() {
  const recruiter = await prisma.recruiter.findFirst()

  const matches = await prisma.match.findMany({
    include: {
      candidate: { include: { current_company: true, skills: { include: { skill: true }, take: 3 } } },
      job: { include: { company: true } },
      placement: true,
      screening_calls: { orderBy: { created_at: 'desc' }, take: 1 },
    },
    orderBy: { overall_score: 'desc' },
  })

  const placements = await prisma.placement.findMany({
    where: recruiter ? { recruiter_id: recruiter.id } : {},
  })

  const totalBilled      = placements.reduce((s, p) => s + Number(p.fee_total), 0)
  const netEarnings      = placements.reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const paidEarnings     = placements.filter(p => p.invoice_status === 'PAID').reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const pendingPipeline  = matches
    .filter(m => m.status !== 'PLACED' && m.status !== 'REJECTED')
    .reduce((s, m) => s + (Number(m.job?.salary_max ?? 0) * 0.18), 0)
  const readyForScreen   = matches.filter(m => ['SUGGESTED', 'CONTACTED'].includes(m.status) && m.screening_calls.length === 0).length
  const awaitingAction   = matches.filter(m => m.screening_calls.length > 0 && !m.placement && m.status !== 'PLACED').length

  return {
    recruiter,
    matches,
    stats: { totalBilled, netEarnings, paidEarnings, pendingPipeline, readyForScreen, awaitingAction, totalPlaced: placements.length },
  }
}

const fmt = (n: number) =>
  n >= 1000 ? `£${(n / 1000).toFixed(0)}K` : `£${n.toFixed(0)}`

export default async function PipelinePage() {
  const { recruiter, matches, stats } = await getData()

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    color: '#f8fafc',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  }

  return (
    <div style={pageStyle}>
      <Nav active="/pipeline" />
      <main style={{ maxWidth: '1300px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '999px', padding: '0.2rem 0.8rem', fontSize: '0.72rem', color: '#a5b4fc', letterSpacing: '0.06em', textTransform: 'uppercase' as const }}>
                Recruiter View
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.3rem' }}>
              My Pipeline
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>
              {recruiter ? `${recruiter.first_name} ${recruiter.last_name} · ${recruiter.company_name}` : 'RecruitAI Platform'}
            </p>
          </div>

          {/* Quick action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <a href="/screening" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)',
              color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.5rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}>
              🎙 All Screenings
            </a>
            <a href="/placements" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', borderRadius: '0.5rem', padding: '0.5rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}>
              💰 Earnings & Invoices
            </a>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Total Billed', value: fmt(stats.totalBilled), color: '#a5b4fc', sub: 'gross fees raised' },
            { label: 'Net Earnings', value: fmt(stats.netEarnings), color: '#4ade80', sub: 'after platform cut' },
            { label: 'Cash Collected', value: fmt(stats.paidEarnings), color: '#34d399', sub: 'invoices paid' },
            { label: 'Pipeline Value', value: fmt(stats.pendingPipeline), color: '#fbbf24', sub: 'est. from active' },
            { label: 'Ready to Screen', value: stats.readyForScreen.toString(), color: '#f87171', sub: 'awaiting AI call' },
            { label: 'Awaiting Decision', value: stats.awaitingAction.toString(), color: '#fb923c', sub: 'screened, not placed' },
            { label: 'Total Placed', value: stats.totalPlaced.toString(), color: '#60a5fa', sub: 'successful placements' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem', padding: '1rem 1.1rem',
            }}>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#334155', marginTop: '0.2rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline stages legend */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: '#475569', marginRight: '0.25rem' }}>Stages:</span>
          {[
            { label: 'Suggested', color: '#64748b' },
            { label: 'Contacted', color: '#3b82f6' },
            { label: 'Shortlisted', color: '#8b5cf6' },
            { label: 'Interviewing', color: '#f59e0b' },
            { label: 'Offered', color: '#f97316' },
            { label: 'Placed', color: '#22c55e' },
          ].map((s, i, arr) => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <span style={{ color: '#94a3b8' }}>{s.label}</span>
              {i < arr.length - 1 && <span style={{ color: '#1e293b', margin: '0 0.1rem' }}>›</span>}
            </span>
          ))}
        </div>

        {/* Pipeline table */}
        <Suspense fallback={<div style={{ color: '#475569', padding: '2rem', textAlign: 'center' }}>Loading pipeline…</div>}>
          <PipelineTable matches={matches as Parameters<typeof PipelineTable>[0]['matches']} />
        </Suspense>
      </main>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import Nav from '../components/Nav'
import { Suspense } from 'react'
import PipelineTable from './PipelineTable'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function getData() {
  const [recruiter, matches] = await Promise.all([
    prisma.recruiter.findFirst(),
    prisma.match.findMany({
      include: {
        candidate: {
          select: {
            id: true, first_name: true, last_name: true, current_title: true,
            salary_expectation_min: true, salary_expectation_max: true,
            current_company: { select: { name: true } },
            skills: { include: { skill: { select: { name: true } } }, take: 3 },
          },
        },
        job: {
          select: {
            id: true, title: true, salary_max: true,
            company: { select: { name: true, industry: true } },
          },
        },
        placement: {
          select: { id: true, fee_total: true, recruiter_earnings: true, invoice_status: true },
        },
        screening_calls: {
          select: { id: true, recommendation: true, status: true },
          orderBy: { created_at: 'desc' }, take: 1,
        },
      },
      orderBy: { overall_score: 'desc' },
    }),
  ])

  const placements = await prisma.placement.findMany({
    where: recruiter ? { recruiter_id: recruiter.id } : {},
    select: { fee_total: true, recruiter_earnings: true, invoice_status: true },
  })

  const totalBilled     = placements.reduce((s, p) => s + Number(p.fee_total), 0)
  const netEarnings     = placements.reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const paidEarnings    = placements.filter(p => p.invoice_status === 'PAID').reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const pendingPipeline = matches
    .filter(m => m.status !== 'PLACED' && m.status !== 'REJECTED')
    .reduce((s, m) => s + (Number(m.job?.salary_max ?? 0) * 0.18), 0)
  const readyForScreen  = matches.filter(m => ['SUGGESTED', 'CONTACTED'].includes(m.status) && m.screening_calls.length === 0).length
  const awaitingAction  = matches.filter(m => m.screening_calls.length > 0 && !m.placement && m.status !== 'PLACED').length

  return {
    recruiter,
    matches,
    stats: { totalBilled, netEarnings, paidEarnings, pendingPipeline, readyForScreen, awaitingAction, totalPlaced: placements.length },
  }
}

const fmt = (n: number) =>
  n >= 1000 ? `£${(n / 1000).toFixed(0)}k` : `£${n.toFixed(0)}`

export default async function PipelinePage() {
  const { recruiter, matches, stats } = await getData()

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#111111', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav active="/pipeline" />

      <main className="page-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#111111', margin: '0 0 0.25rem' }}>
              My Pipeline
            </h1>
            <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.83rem' }}>
              {recruiter ? `${recruiter.first_name} ${recruiter.last_name} · ${recruiter.company_name}` : 'Manage your active candidates'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <a href="/screening" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.1)',
              color: '#374151', borderRadius: '8px', padding: '0.45rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              All Screenings
            </a>
            <a href="/placements" style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#111111', color: '#ffffff',
              borderRadius: '8px', padding: '0.45rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
            }}>
              Earnings & Invoices
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Billed',       value: fmt(stats.totalBilled),     sub: 'gross fees',         accent: '#6366f1' },
            { label: 'Net Earnings',        value: fmt(stats.netEarnings),     sub: 'after platform cut', accent: '#16a34a' },
            { label: 'Cash Collected',      value: fmt(stats.paidEarnings),    sub: 'invoices paid',      accent: '#0ea5e9' },
            { label: 'Pipeline Value',      value: fmt(stats.pendingPipeline), sub: 'est. from active',   accent: '#f59e0b' },
            { label: 'Ready to Screen',     value: stats.readyForScreen.toString(), sub: 'awaiting AI call', accent: '#ef4444' },
            { label: 'Total Placed',        value: stats.totalPlaced.toString(), sub: 'placements',       accent: '#6366f1' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.75)',
              border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '12px', padding: '1rem 1.1rem',
              boxShadow: '0 2px 10px rgba(99,102,241,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}>
              <div style={{ fontSize: '0.68rem', color: '#9ca3af', marginBottom: '0.3rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111111', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#c0c8d4', marginTop: '0.15rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline stages legend */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginRight: '0.1rem', fontWeight: 600 }}>Stage flow:</span>
          {[
            { label: 'Contacted',    color: '#3b82f6' },
            { label: 'Interviewing', color: '#f59e0b' },
            { label: 'Offer Made',   color: '#f97316' },
            { label: 'Placed',       color: '#22c55e' },
          ].map((s, i, arr) => (
            <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <span style={{ color: '#6b7280' }}>{s.label}</span>
              {i < arr.length - 1 && <span style={{ color: '#d1d5db', margin: '0 0.05rem' }}>›</span>}
            </span>
          ))}
        </div>

        {/* Pipeline cards */}
        <Suspense fallback={
          <div style={{ color: '#9ca3af', padding: '2rem', textAlign: 'center', fontSize: '0.88rem' }}>
            Loading pipeline…
          </div>
        }>
          <PipelineTable matches={matches as Parameters<typeof PipelineTable>[0]['matches']} />
        </Suspense>
      </main>
    </div>
  )
}

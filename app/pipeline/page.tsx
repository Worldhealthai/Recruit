import { prisma } from '@/lib/prisma'
import AppShell from '../components/AppShell'
import { Suspense } from 'react'
import PipelineTable from './PipelineTable'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

async function getData() {
  try {
  const [recruiter, matches] = await Promise.all([
    prisma.recruiter.findFirst().catch(() => null),
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
  }).catch(() => [])

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
  } catch {
    return {
      recruiter: null,
      matches: [],
      stats: { totalBilled: 0, netEarnings: 0, paidEarnings: 0, pendingPipeline: 0, readyForScreen: 0, awaitingAction: 0, totalPlaced: 0 },
    }
  }
}

const fmt = (n: number) =>
  n >= 1000 ? `£${(n / 1000).toFixed(0)}k` : `£${n.toFixed(0)}`

export default async function PipelinePage() {
  const { recruiter, matches, stats } = await getData()

  return (
    <AppShell>
      <div className="page-content" style={{ padding: '1.5rem 2rem 3rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', margin: '0 0 0.25rem' }}>
              Pipeline
            </h1>
            <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>
              {recruiter ? `${recruiter.first_name} ${recruiter.last_name} · ${recruiter.company_name}` : 'Track candidates through every stage'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a href="/screening" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#cbd5e1', borderRadius: '0.5rem', padding: '0.55rem 1rem',
              fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}>
              All Screenings
            </a>
            <a href="/placements" style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff',
              borderRadius: '0.5rem', padding: '0.55rem 1rem',
              fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}>
              Earnings & Invoices
            </a>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))', gap: '0.85rem', marginBottom: '1.75rem' }}>
          {[
            { label: 'Total Billed',   value: fmt(stats.totalBilled),        sub: 'gross fees',         color: '#818cf8' },
            { label: 'Net Earnings',   value: fmt(stats.netEarnings),        sub: 'after platform cut', color: '#4ade80' },
            { label: 'Cash Collected', value: fmt(stats.paidEarnings),       sub: 'invoices paid',      color: '#38bdf8' },
            { label: 'Pipeline Value', value: fmt(stats.pendingPipeline),    sub: 'est. from active',   color: '#fbbf24' },
            { label: 'Ready to Screen', value: stats.readyForScreen.toString(), sub: 'awaiting AI call', color: '#f87171' },
            { label: 'Total Placed',   value: stats.totalPlaced.toString(),  sub: 'placements',         color: '#4ade80' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem', padding: '1rem 1.1rem',
            }}>
              <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '0.4rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.15rem' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Pipeline cards */}
        <Suspense fallback={
          <div style={{ color: '#64748b', padding: '2rem', textAlign: 'center', fontSize: '0.88rem' }}>
            Loading pipeline…
          </div>
        }>
          <PipelineTable matches={matches as Parameters<typeof PipelineTable>[0]['matches']} />
        </Suspense>
      </div>
    </AppShell>
  )
}

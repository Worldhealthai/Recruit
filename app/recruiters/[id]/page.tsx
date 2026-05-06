export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const tierColors: Record<string, string> = {
  FREE: '#64748b', STARTER: '#3b82f6', PROFESSIONAL: '#8b5cf6', PLATINUM: '#f59e0b',
}
const invoiceColors: Record<string, string> = {
  PENDING: '#64748b', INVOICED: '#3b82f6', PART_PAID: '#f59e0b',
  PAID: '#22c55e', OVERDUE: '#ef4444', DISPUTED: '#dc2626', WRITTEN_OFF: '#475569',
}
const statusColors: Record<string, string> = {
  SUGGESTED: '#64748b', SHORTLISTED: '#8b5cf6', CONTACTED: '#3b82f6',
  SCREENING: '#f59e0b', SUBMITTED: '#06b6d4', INTERVIEW: '#22c55e',
  OFFER: '#10b981', PLACED: '#059669', REJECTED: '#ef4444', WITHDRAWN: '#475569',
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
      </div>
      <span style={{ color, fontSize: '0.75rem', fontWeight: 700, minWidth: '2.2rem', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default async function RecruiterPortfolioPage({ params }: { params: { id: string } }) {
  const recruiter = await prisma.recruiter.findUnique({
    where: { id: params.id },
    include: {
      placements: {
        include: {
          candidate: true,
          job: { include: { company: true } },
        },
        orderBy: { created_at: 'desc' },
      },
      activities: {
        orderBy: { created_at: 'desc' },
        take: 10,
      },
    },
  }).catch(() => null)

  if (!recruiter) notFound()

  // Also get active pipeline (non-placed matches to give the pipeline value)
  const activePipeline = await prisma.match.findMany({
    where: {
      status: { in: ['SHORTLISTED', 'CONTACTED', 'SCREENING', 'SUBMITTED', 'INTERVIEW', 'OFFER'] },
    },
    include: {
      candidate: true,
      job: { include: { company: true } },
    },
    orderBy: { overall_score: 'desc' },
    take: 10,
  }).catch(() => [])

  const placements = recruiter.placements

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalFees = placements.reduce((s, p) => s + Number(p.fee_total), 0)
  const totalEarnings = placements.reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const paidFees = placements.filter(p => p.invoice_status === 'PAID').reduce((s, p) => s + Number(p.recruiter_earnings), 0)
  const pendingFees = totalEarnings - paidFees

  // Pipeline value: estimated fee if all active matches convert
  const CONVERSION_RATE = 0.30
  const pipelineValue = activePipeline.reduce((s, m) => {
    const estimatedSalary = Number(m.job.salary_max ?? m.job.salary_min ?? 100000)
    return s + estimatedSalary * 0.20 * CONVERSION_RATE
  }, 0)

  const avgFee = placements.length > 0 ? totalFees / placements.length : 0
  const avgSalary = placements.length > 0 ? placements.reduce((s, p) => s + Number(p.agreed_salary), 0) / placements.length : 0

  const tier = recruiter.subscription_tier
  const tierColor = tierColors[tier] ?? '#64748b'

  return (
    <PageShell
      active="/recruiters"
      title={`${recruiter.first_name} ${recruiter.last_name}`}
      subtitle={recruiter.company_name ?? recruiter.email}
      badge="Recruiter Portfolio"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/recruiters" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Recruiters
        </Link>
      </div>

      {/* Profile header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)', borderRadius: '1rem',
        padding: '1.75rem 2rem', marginBottom: '2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <span style={{
              background: `${tierColor}22`, color: tierColor, border: `1px solid ${tierColor}44`,
              borderRadius: '0.3rem', padding: '0.2rem 0.7rem', fontSize: '0.78rem', fontWeight: 700,
            }}>{tier}</span>
            <span style={{ color: '#64748b', fontSize: '0.82rem', alignSelf: 'center' }}>{recruiter.role}</span>
            <span style={{
              color: recruiter.subscription_status === 'ACTIVE' ? '#22c55e' : '#f59e0b',
              fontSize: '0.82rem', alignSelf: 'center', fontWeight: 600,
            }}>● {recruiter.subscription_status}</span>
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{recruiter.email}</div>
          {recruiter.phone && <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{recruiter.phone}</div>}
        </div>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Searches / mo</div>
            <div style={{ fontWeight: 700 }}>{recruiter.max_searches_per_month}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Screens / mo</div>
            <div style={{ fontWeight: 700 }}>{recruiter.max_screening_calls_per_month}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Saved limit</div>
            <div style={{ fontWeight: 700 }}>{recruiter.max_candidates_saved.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Billings', value: `£${totalFees.toLocaleString()}`, sub: 'gross fees billed', color: '#f8fafc' },
          { label: 'Net Earnings', value: `£${totalEarnings.toLocaleString()}`, sub: 'after platform 10%', color: '#22c55e' },
          { label: 'Cash Received', value: `£${paidFees.toLocaleString()}`, sub: 'invoices settled', color: '#a5b4fc' },
          { label: 'Outstanding', value: `£${pendingFees.toLocaleString()}`, sub: 'awaiting payment', color: pendingFees > 0 ? '#f59e0b' : '#22c55e' },
          { label: 'Placements', value: placements.length.toString(), sub: 'total confirmed', color: '#f8fafc' },
          { label: 'Avg Fee', value: avgFee > 0 ? `£${Math.round(avgFee).toLocaleString()}` : '—', sub: 'per placement', color: '#f8fafc' },
          { label: 'Avg Salary', value: avgSalary > 0 ? `£${Math.round(avgSalary).toLocaleString()}` : '—', sub: 'placed candidates', color: '#f8fafc' },
          { label: 'Pipeline Value', value: `£${Math.round(pipelineValue).toLocaleString()}`, sub: '~30% close rate est.', color: '#f59e0b' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', padding: '1.1rem',
          }}>
            <div style={{ color: '#475569', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.25rem', color }}>{value}</div>
            <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.15rem' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Placements portfolio */}
      {placements.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>
            Placement Portfolio <span style={{ color: '#475569', fontWeight: 400 }}>({placements.length})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {placements.map((p, i) => (
              <Link key={p.id} href={`/placements/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 100px 110px 110px',
                  padding: '1rem', gap: '1rem', alignItems: 'center',
                  borderBottom: i < placements.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{p.candidate.first_name} {p.candidate.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.candidate.current_title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem' }}>{p.job.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{p.job.company?.name}</div>
                  </div>
                  <div>
                    <div style={{ color: '#22c55e', fontWeight: 700, fontSize: '0.9rem' }}>£{Number(p.recruiter_earnings).toLocaleString()}</div>
                    <div style={{ color: '#475569', fontSize: '0.72rem' }}>net earned</div>
                  </div>
                  <div>
                    <div style={{ color: '#f8fafc', fontSize: '0.82rem' }}>£{Number(p.agreed_salary).toLocaleString()}</div>
                    <div style={{ color: '#475569', fontSize: '0.72rem' }}>agreed salary</div>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    background: `${invoiceColors[p.invoice_status] ?? '#64748b'}22`,
                    color: invoiceColors[p.invoice_status] ?? '#64748b',
                    border: `1px solid ${invoiceColors[p.invoice_status] ?? '#64748b'}33`,
                    borderRadius: '0.3rem', padding: '0.15rem 0.45rem', fontSize: '0.7rem', fontWeight: 600,
                  }}>{p.invoice_status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Active pipeline */}
      {activePipeline.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', alignItems: 'baseline' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
              Active Pipeline <span style={{ color: '#475569', fontWeight: 400 }}>({activePipeline.length})</span>
            </h2>
            <span style={{ color: '#f59e0b', fontSize: '0.82rem' }}>
              ~£{Math.round(pipelineValue).toLocaleString()} estimated value
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {activePipeline.map((m) => (
              <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 140px auto',
                  padding: '0.75rem 1rem', gap: '1rem', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{m.candidate.first_name} {m.candidate.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.candidate.current_title}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem' }}>{m.job.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{m.job.company?.name}</div>
                  </div>
                  <ScoreBar score={m.overall_score} />
                  <span style={{
                    background: `${statusColors[m.status] ?? '#64748b'}22`,
                    color: statusColors[m.status] ?? '#64748b',
                    border: `1px solid ${statusColors[m.status] ?? '#64748b'}44`,
                    borderRadius: '0.3rem', padding: '0.15rem 0.45rem', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{m.status}</span>
                </div>
              </Link>
            ))}
          </div>
          <div style={{ marginTop: '0.75rem', color: '#475569', fontSize: '0.78rem' }}>
            Pipeline value based on 30% close rate × 20% avg fee. Actual outcomes will vary.
          </div>
        </div>
      )}

      {/* How earnings work explanation */}
      <div style={{
        background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: '0.75rem', padding: '1.5rem',
      }}>
        <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>💡 How Recruiter Earnings Work</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.7 }}>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.4rem' }}>Contingency Fee (Permanent)</div>
            <div>Client pays a % of the candidate&apos;s agreed first-year salary on their start date.
            Typical UK fintech rate: 15–25%. Example: £115K salary × 20% = <strong style={{ color: '#22c55e' }}>£23,000 fee</strong>.</div>
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.4rem' }}>Platform Model</div>
            <div>RecruitAI charges 10% of each gross fee as a platform transaction fee.
            Recruiter retains 90%. Example: £23,000 × 90% = <strong style={{ color: '#22c55e' }}>£20,700 net</strong>.</div>
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.4rem' }}>90-Day Guarantee</div>
            <div>If a placed candidate leaves within 90 days, a free replacement must be provided or a pro-rata refund issued. After day 90, the full fee is retained.</div>
          </div>
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '0.4rem' }}>Pipeline Value</div>
            <div>Estimated future earnings from active matches, applying a conservative 30% conversion rate to all SHORTLISTED → OFFER stage candidates.</div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}

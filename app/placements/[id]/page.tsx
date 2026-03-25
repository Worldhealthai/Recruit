import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const invoiceColors: Record<string, string> = {
  PENDING: '#64748b', INVOICED: '#3b82f6', PART_PAID: '#f59e0b',
  PAID: '#22c55e', OVERDUE: '#ef4444', DISPUTED: '#dc2626', WRITTEN_OFF: '#475569',
}


function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{label}</span>
      <span style={{ fontWeight: highlight ? 700 : 500, color: highlight ? '#f8fafc' : '#cbd5e1', fontSize: '0.9rem' }}>{value}</span>
    </div>
  )
}

export default async function PlacementDetailPage({ params }: { params: { id: string } }) {
  const placement = await prisma.placement.findUnique({
    where: { id: params.id },
    include: {
      candidate: { include: { current_company: true } },
      job: { include: { company: true } },
      recruiter: true,
      match: { include: { screening_calls: { include: { questions: { orderBy: { order: 'asc' } } } } } },
    },
  }).catch(() => null)

  if (!placement) notFound()

  const { candidate, job, recruiter, match } = placement
  const screeningCall = match.screening_calls[0]

  const feeTotal = Number(placement.fee_total)
  const recruiterEarnings = Number(placement.recruiter_earnings)
  const platformCut = feeTotal - recruiterEarnings
  const agreedSalary = Number(placement.agreed_salary)

  // Guarantee status
  const today = new Date()
  const guaranteeExpires = placement.guarantee_expires
  const guaranteeActive = guaranteeExpires ? guaranteeExpires > today : false
  const guaranteeDaysLeft = guaranteeExpires ? Math.max(0, Math.ceil((guaranteeExpires.getTime() - today.getTime()) / 86400000)) : 0

  return (
    <PageShell
      active="/placements"
      title={`${candidate.first_name} ${candidate.last_name} → ${job.title}`}
      subtitle={`Placed at ${job.company?.name} · ${new Date(placement.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`}
      badge="Placement Detail"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/placements" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Placements
        </Link>
      </div>

      {/* Hero: fee breakdown */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {[
          { label: 'Agreed Salary', value: `£${agreedSalary.toLocaleString()}`, sub: 'candidate first-year base', color: '#f8fafc' },
          { label: 'Fee %', value: placement.fee_percentage ? `${Math.round(placement.fee_percentage * 100)}%` : '—', sub: 'contingency rate', color: '#a5b4fc' },
          { label: 'Gross Fee', value: `£${feeTotal.toLocaleString()}`, sub: 'billed to client', color: '#f8fafc' },
          { label: 'Platform Cut', value: `£${platformCut.toLocaleString()}`, sub: `${Math.round(placement.platform_fee_pct * 100)}% of gross`, color: '#f59e0b' },
          { label: 'Your Earnings', value: `£${recruiterEarnings.toLocaleString()}`, sub: 'net to recruiter', color: '#22c55e' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.75rem', padding: '1.25rem',
          }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontWeight: 800, fontSize: '1.35rem', color }}>{value}</div>
            <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Placement details */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Placement Details</h2>
          <InfoRow label="Start Date" value={new Date(placement.start_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} highlight />
          <InfoRow label="Employment Type" value={job.employment_type?.replace(/_/g, ' ') ?? '—'} />
          <InfoRow label="Work Mode" value={job.work_mode?.replace(/_/g, ' ') ?? '—'} />
          <InfoRow label="Fee Type" value={placement.fee_type.replace(/_/g, ' ')} />
          <InfoRow label="Placement Status" value={placement.status.replace(/_/g, ' ')} />
          {placement.notes && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.4rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notes</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.6 }}>{placement.notes}</div>
            </div>
          )}
        </div>

        {/* Invoice tracker */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Invoice</h2>
            <span style={{
              background: `${invoiceColors[placement.invoice_status] ?? '#64748b'}22`,
              color: invoiceColors[placement.invoice_status] ?? '#64748b',
              border: `1px solid ${invoiceColors[placement.invoice_status] ?? '#64748b'}44`,
              borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 700,
            }}>{placement.invoice_status}</span>
          </div>
          {placement.invoice_number && <InfoRow label="Invoice #" value={placement.invoice_number} highlight />}
          {placement.invoice_date && <InfoRow label="Invoice Date" value={new Date(placement.invoice_date).toLocaleDateString('en-GB')} />}
          {placement.payment_due_date && <InfoRow label="Payment Due" value={new Date(placement.payment_due_date).toLocaleDateString('en-GB')} />}
          {placement.payment_date && (
            <InfoRow label="Paid On" value={new Date(placement.payment_date).toLocaleDateString('en-GB')} />
          )}

          {/* Fee calculation breakdown */}
          <div style={{ marginTop: '1.25rem', background: 'rgba(34,197,94,0.06)', borderRadius: '0.5rem', padding: '0.9rem 1rem', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Fee Calculation</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>£{agreedSalary.toLocaleString()} × {Math.round((placement.fee_percentage ?? 0) * 100)}%</span>
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>£{feeTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
              <span style={{ color: '#94a3b8' }}>Platform fee ({Math.round(placement.platform_fee_pct * 100)}%)</span>
              <span style={{ color: '#f59e0b' }}>− £{platformCut.toLocaleString()}</span>
            </div>
            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800 }}>
              <span style={{ color: '#f8fafc' }}>Net to recruiter</span>
              <span style={{ color: '#22c55e' }}>£{recruiterEarnings.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantee period */}
      <div style={{
        marginBottom: '1.5rem',
        background: guaranteeActive ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${guaranteeActive ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '0.75rem', padding: '1.25rem 1.5rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}>
              {guaranteeActive ? '🛡 Guarantee Period Active' : '✅ Guarantee Period Expired'}
            </h2>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
              {placement.guarantee_days}-day replacement guarantee.
              {guaranteeActive
                ? ` If the candidate leaves before ${guaranteeExpires ? new Date(guaranteeExpires).toLocaleDateString('en-GB') : '—'}, a free replacement must be provided or a pro-rata fee refund issued.`
                : ' The guarantee has passed — no rebate obligation remaining.'}
            </p>
          </div>
          {guaranteeActive && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.5rem' }}>{guaranteeDaysLeft}d</div>
              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>days remaining</div>
            </div>
          )}
          {!guaranteeActive && (
            <div style={{ color: '#22c55e', fontWeight: 700 }}>Expired {guaranteeExpires ? new Date(guaranteeExpires).toLocaleDateString('en-GB') : ''}</div>
          )}
        </div>
        {guaranteeActive && placement.status !== 'EARLY_DEPARTURE' && (
          <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.round((1 - guaranteeDaysLeft / placement.guarantee_days) * 100)}%`, height: '100%', background: '#22c55e', borderRadius: '999px' }} />
            </div>
            <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{Math.round((1 - guaranteeDaysLeft / placement.guarantee_days) * 100)}% through</span>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Candidate card */}
        <Link href={`/candidates/${candidate.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer' }}>
            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Placed Candidate</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{candidate.first_name} {candidate.last_name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0.5rem' }}>{candidate.current_title}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
              {candidate.years_experience}y experience · {candidate.location_city}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: '0.78rem', marginTop: '0.75rem' }}>View full profile →</div>
          </div>
        </Link>

        {/* Job card */}
        <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer' }}>
            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Filled Role</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{job.title}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.25rem 0 0.5rem' }}>{job.company?.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
              {job.work_mode?.replace(/_/g, ' ')} · {job.location_city}, {job.location_country}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: '0.78rem', marginTop: '0.75rem' }}>View job posting →</div>
          </div>
        </Link>
      </div>

      {/* Screening call summary */}
      {screeningCall && (
        <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>📞 AI Screening Call Summary</h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {screeningCall.duration_seconds && (
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>⏱ {Math.round(screeningCall.duration_seconds / 60)} min</span>
              )}
              {screeningCall.recommendation && (
                <span style={{
                  background: screeningCall.recommendation.includes('YES') ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
                  color: screeningCall.recommendation.includes('YES') ? '#4ade80' : '#f87171',
                  border: `1px solid ${screeningCall.recommendation.includes('YES') ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 700,
                }}>{screeningCall.recommendation.replace(/_/g, ' ')}</span>
              )}
            </div>
          </div>
          {screeningCall.ai_summary && (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, margin: '0 0 1rem' }}>{screeningCall.ai_summary}</p>
          )}
          {screeningCall.questions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {screeningCall.questions.map((q) => (
                <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.9rem 1rem' }}>
                  <div style={{ color: '#a5b4fc', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>Q: {q.question_text}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5 }}>A: {q.answer_text}</div>
                  {q.ai_score != null && (
                    <div style={{ marginTop: '0.4rem', color: '#22c55e', fontSize: '0.75rem' }}>AI score: {Math.round(q.ai_score * 100)}%</div>
                  )}
                </div>
              ))}
            </div>
          )}
          {screeningCall.key_concerns && screeningCall.key_concerns.length > 0 && (
            <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(245,158,11,0.08)', borderRadius: '0.5rem', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ color: '#f59e0b', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.4rem' }}>⚠ Key Concerns Flagged</div>
              {screeningCall.key_concerns.map((c) => (
                <div key={c} style={{ color: '#fcd34d', fontSize: '0.82rem', marginBottom: '0.2rem' }}>• {c}</div>
              ))}
            </div>
          )}
          <Link href={`/matches/${placement.match_id}`} style={{ display: 'inline-block', marginTop: '1rem', color: '#a5b4fc', fontSize: '0.82rem', textDecoration: 'none' }}>
            View full AI match analysis →
          </Link>
        </div>
      )}

      {/* Recruiter */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
        <h2 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Recruiter</h2>
        <Link href={`/recruiters/${recruiter.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-card" style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
          }}>
            <div>
              <div style={{ fontWeight: 700 }}>{recruiter.first_name} {recruiter.last_name}</div>
              <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{recruiter.email} · {recruiter.company_name}</div>
            </div>
            <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>View portfolio →</span>
          </div>
        </Link>
      </div>
    </PageShell>
  )
}

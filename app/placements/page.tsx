export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getPlacements() {
  try {
    return await prisma.placement.findMany({
      include: {
        candidate: true,
        job: { include: { company: true } },
        recruiter: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    })
  } catch {
    return []
  }
}

const invoiceColors: Record<string, string> = {
  PENDING: '#64748b',
  INVOICED: '#3b82f6',
  PART_PAID: '#f59e0b',
  PAID: '#22c55e',
  OVERDUE: '#ef4444',
  DISPUTED: '#dc2626',
  WRITTEN_OFF: '#475569',
}

const placementStatusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  COMPLETED: '#3b82f6',
  EARLY_DEPARTURE: '#ef4444',
  GUARANTEE_CLAIMED: '#dc2626',
  REPLACED: '#f59e0b',
}

export default async function PlacementsPage() {
  const placements = await getPlacements()

  const totalFees = placements.reduce((sum, p) => sum + Number(p.fee_total), 0)
  const totalEarnings = placements.reduce((sum, p) => sum + Number(p.recruiter_earnings), 0)
  const totalPaid = placements.filter(p => p.invoice_status === 'PAID').reduce((sum, p) => sum + Number(p.fee_total), 0)
  const outstanding = totalFees - totalPaid

  return (
    <PageShell
      active="/placements"
      title="Placements"
      subtitle="Confirmed hires, fee invoices and recruiter earnings"
      badge="Revenue Tracker"
    >
      {placements.length === 0 ? (
        <EmptyState icon="💰" message="No placements yet" hint="Placements are created when a match reaches PLACED status and terms are agreed." />
      ) : (
        <>
          {/* Earnings summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Fees Billed', value: `£${totalFees.toLocaleString()}`, color: '#f8fafc', sub: 'gross to clients' },
              { label: 'Recruiter Earnings', value: `£${totalEarnings.toLocaleString()}`, color: '#22c55e', sub: 'after platform cut' },
              { label: 'Collected', value: `£${totalPaid.toLocaleString()}`, color: '#a5b4fc', sub: 'invoices paid' },
              { label: 'Outstanding', value: `£${outstanding.toLocaleString()}`, color: outstanding > 0 ? '#f59e0b' : '#22c55e', sub: 'awaiting payment' },
              { label: 'Placements', value: placements.length.toString(), color: '#f8fafc', sub: 'total confirmed' },
            ].map(({ label, value, color, sub }) => (
              <div key={label} style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem', padding: '1.25rem',
              }}>
                <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>{label}</div>
                <div style={{ fontWeight: 800, fontSize: '1.4rem', color }}>{value}</div>
                <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.2rem' }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Placements table */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem', overflow: 'hidden',
          }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 110px 100px',
              padding: '0.75rem 1.25rem',
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
              gap: '1rem',
            }}>
              {['Candidate', 'Role & Company', 'Agreed Salary', 'Gross Fee', 'Invoice', 'Status'].map(h => (
                <div key={h} style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{h}</div>
              ))}
            </div>

            {placements.map((p, i) => (
              <Link key={p.id} href={`/placements/${p.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 110px 100px',
                  padding: '1rem 1.25rem', gap: '1rem', alignItems: 'center',
                  borderBottom: i < placements.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.candidate.first_name} {p.candidate.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{p.candidate.current_title}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.job.title}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{p.job.company?.name}</div>
                  </div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>£{Number(p.agreed_salary).toLocaleString()}</div>
                  <div>
                    <div style={{ color: '#22c55e', fontWeight: 700 }}>£{Number(p.fee_total).toLocaleString()}</div>
                    {p.fee_percentage && (
                      <div style={{ color: '#475569', fontSize: '0.72rem' }}>{Math.round(p.fee_percentage * 100)}% contingency</div>
                    )}
                  </div>
                  <span style={{
                    display: 'inline-block',
                    background: `${invoiceColors[p.invoice_status] ?? '#64748b'}22`,
                    color: invoiceColors[p.invoice_status] ?? '#64748b',
                    border: `1px solid ${invoiceColors[p.invoice_status] ?? '#64748b'}44`,
                    borderRadius: '0.3rem', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: 600,
                  }}>{p.invoice_status}</span>
                  <span style={{
                    display: 'inline-block',
                    color: placementStatusColors[p.status] ?? '#64748b',
                    fontSize: '0.78rem', fontWeight: 600,
                  }}>● {p.status}</span>
                </div>
              </Link>
            ))}
          </div>

          {/* Recruiter earnings footnote */}
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem',
            background: 'rgba(99,102,241,0.06)', borderRadius: '0.5rem',
            border: '1px solid rgba(99,102,241,0.15)', color: '#94a3b8', fontSize: '0.82rem',
          }}>
            💡 <strong style={{ color: '#a5b4fc' }}>How fees work:</strong> Contingency fee = agreed % of first-year salary, billed to client on candidate start date.
            Platform retains 10% of gross fee; recruiter receives the remaining 90%. All fees subject to 90-day replacement guarantee.
          </div>
        </>
      )}
    </PageShell>
  )
}

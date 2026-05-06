export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getRecruiters() {
  try {
    return await prisma.recruiter.findMany({
      take: 20,
      orderBy: { created_at: 'desc' },
    })
  } catch {
    return []
  }
}

const planColors: Record<string, string> = {
  FREE: '#64748b',
  STARTER: '#3b82f6',
  PROFESSIONAL: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
}

export default async function RecruitersPage() {
  const recruiters = await getRecruiters()

  return (
    <PageShell
      active="/recruiters"
      title="Recruiters"
      subtitle="Recruiter accounts and subscription plans"
      badge="Team"
    >
      {recruiters.length === 0 ? (
        <EmptyState
          icon="🧑‍💼"
          message="No recruiters yet"
          hint="Recruiter accounts will appear here once users have signed up."
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {recruiters.map((r) => {
            const tier = r.subscription_tier
            const status = r.subscription_status

            return (
              <Link key={r.id} href={`/recruiters/${r.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hover-card" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{`${r.first_name} ${r.last_name}`}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{r.email}</div>
                  </div>
                  <span style={{
                    background: `${planColors[tier] ?? '#64748b'}22`,
                    color: planColors[tier] ?? '#64748b',
                    border: `1px solid ${planColors[tier] ?? '#64748b'}44`,
                    borderRadius: '0.3rem',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                  }}>
                    {tier}
                  </span>
                </div>

                {r.company_name && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    🏢 {r.company_name}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  {r.max_searches_per_month != null && (
                    <div style={{ fontSize: '0.78rem' }}>
                      <div style={{ color: '#475569' }}>Search quota</div>
                      <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{r.max_searches_per_month.toLocaleString()}/mo</div>
                    </div>
                  )}
                  {r.max_screening_calls_per_month != null && (
                    <div style={{ fontSize: '0.78rem' }}>
                      <div style={{ color: '#475569' }}>Screening quota</div>
                      <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{r.max_screening_calls_per_month.toLocaleString()}/mo</div>
                    </div>
                  )}
                </div>

                {status && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.78rem' }}>
                    <span style={{ color: status === 'ACTIVE' || status === 'TRIAL' ? '#22c55e' : '#ef4444' }}>
                      ● {status}
                    </span>
                  </div>
                )}
              </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

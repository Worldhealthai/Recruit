import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'

async function getRecruiters() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/recruiters?limit=20`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const planColors: Record<string, string> = {
  FREE: '#64748b',
  STARTER: '#3b82f6',
  PROFESSIONAL: '#8b5cf6',
  ENTERPRISE: '#f59e0b',
}

export default async function RecruitersPage() {
  const result = await getRecruiters()
  const recruiters: Record<string, unknown>[] = result?.data ?? []

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
            const tier = r.subscription_tier as string
            const status = r.subscription_status as string

            return (
              <div key={r.id as string} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{`${r.first_name as string} ${r.last_name as string}`}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{r.email as string}</div>
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

                {(r.company_name as string | null) && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    🏢 {r.company_name as string}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  {r.max_searches_per_month != null && (
                    <div style={{ fontSize: '0.78rem' }}>
                      <div style={{ color: '#475569' }}>Search quota</div>
                      <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{(r.max_searches_per_month as number).toLocaleString()}/mo</div>
                    </div>
                  )}
                  {r.max_screening_calls_per_month != null && (
                    <div style={{ fontSize: '0.78rem' }}>
                      <div style={{ color: '#475569' }}>Screening quota</div>
                      <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{(r.max_screening_calls_per_month as number).toLocaleString()}/mo</div>
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
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

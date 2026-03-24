import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'

async function getScreening() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/screening?limit=20`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const outcomeColors: Record<string, string> = {
  STRONG_YES: '#22c55e',
  YES: '#86efac',
  MAYBE: '#f59e0b',
  NO: '#ef4444',
  STRONG_NO: '#b91c1c',
}

const statusColors: Record<string, string> = {
  SCHEDULED: '#3b82f6',
  IN_PROGRESS: '#f59e0b',
  COMPLETED: '#22c55e',
  CANCELLED: '#64748b',
}

export default async function ScreeningPage() {
  const result = await getScreening()
  const calls: Record<string, unknown>[] = result?.data ?? []

  return (
    <PageShell
      active="/screening"
      title="Screening Calls"
      subtitle="AI-conducted call transcripts and hiring recommendations"
      badge="AI Screening"
    >
      {calls.length === 0 ? (
        <EmptyState
          icon="📞"
          message="No screening calls yet"
          hint="Scheduled AI screening calls with candidates will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {calls.map((call) => {
            const candidate = call.candidate as { first_name: string; last_name: string } | null
            const job = call.job as { title: string } | null
            const outcome = call.recommendation as string | null
            const status = call.status as string
            const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : null

            return (
              <div key={call.id as string} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{candidateName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>for {job?.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{
                      background: `${statusColors[status] ?? '#64748b'}22`,
                      color: statusColors[status] ?? '#64748b',
                      border: `1px solid ${statusColors[status] ?? '#64748b'}44`,
                      borderRadius: '0.3rem',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}>
                      {status}
                    </span>
                    {outcome && (
                      <span style={{
                        background: `${outcomeColors[outcome] ?? '#64748b'}22`,
                        color: outcomeColors[outcome] ?? '#64748b',
                        border: `1px solid ${outcomeColors[outcome] ?? '#64748b'}44`,
                        borderRadius: '0.3rem',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                      }}>
                        {outcome.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                </div>

                {(call.ai_summary as string | null) && (
                  <p style={{
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    margin: '0 0 0.5rem',
                    borderLeft: '3px solid rgba(99,102,241,0.4)',
                    paddingLeft: '0.75rem',
                  }}>
                    {call.ai_summary as string}
                  </p>
                )}

                {(call.scheduled_at as string | null) && (
                  <div style={{ color: '#475569', fontSize: '0.78rem' }}>
                    🕐 {new Date(call.scheduled_at as string).toLocaleString()}
                    {(call.duration_seconds as number | null) && ` · ${Math.round((call.duration_seconds as number) / 60)} min`}
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

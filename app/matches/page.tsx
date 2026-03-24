import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'

async function getMatches() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/matches?limit=20`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  REVIEWED: '#3b82f6',
  SHORTLISTED: '#8b5cf6',
  REJECTED: '#ef4444',
  HIRED: '#22c55e',
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{
        flex: 1,
        height: '6px',
        background: 'rgba(255,255,255,0.08)',
        borderRadius: '999px',
        overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
      </div>
      <span style={{ color, fontSize: '0.8rem', fontWeight: 700, minWidth: '2.5rem', textAlign: 'right' }}>
        {pct}%
      </span>
    </div>
  )
}

export default async function MatchesPage() {
  const result = await getMatches()
  const matches: Record<string, unknown>[] = result?.data ?? []

  return (
    <PageShell
      active="/matches"
      title="AI Matches"
      subtitle="AI-scored candidate ↔ job pairings"
      badge="Matching Engine"
    >
      {matches.length === 0 ? (
        <EmptyState
          icon="🤝"
          message="No matches generated yet"
          hint="AI matches are created when candidates and jobs share overlapping skill sets."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map((m) => {
            const candidate = m.candidate as { first_name: string; last_name: string; current_title: string } | null
            const job = m.job as { title: string; company?: { name: string } } | null
            const status = m.status as string
            const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : null

            return (
              <div key={m.id as string} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{candidateName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{candidate?.current_title}</div>
                  </div>
                  <div style={{ fontSize: '1.25rem' }}>→</div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700 }}>{job?.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{job?.company?.name}</div>
                  </div>
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
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ color: '#64748b', fontSize: '0.78rem', width: '90px' }}>Overall</span>
                    <ScoreBar score={m.overall_score as number} />
                  </div>
                  {m.skill_match_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', width: '90px' }}>Skills</span>
                      <ScoreBar score={m.skill_match_score as number} />
                    </div>
                  )}
                  {m.experience_match_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', width: '90px' }}>Experience</span>
                      <ScoreBar score={m.experience_match_score as number} />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getMatches() {
  try {
    return await prisma.match.findMany({
      include: {
        candidate: true,
        job: { include: { company: true } },
      },
      take: 20,
      orderBy: { overall_score: 'desc' },
    })
  } catch {
    return []
  }
}

const statusColors: Record<string, string> = {
  SUGGESTED: '#64748b',
  SHORTLISTED: '#8b5cf6',
  CONTACTED: '#3b82f6',
  SCREENING: '#f59e0b',
  SUBMITTED: '#06b6d4',
  INTERVIEW: '#22c55e',
  OFFER: '#10b981',
  PLACED: '#059669',
  REJECTED: '#ef4444',
  WITHDRAWN: '#475569',
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
      </div>
      <span style={{ color, fontSize: '0.8rem', fontWeight: 700, minWidth: '2.5rem', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default async function MatchesPage() {
  const matches = await getMatches()

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
            const candidate = m.candidate
            const job = m.job
            const status = m.status
            const candidateName = candidate ? `${candidate.first_name} ${candidate.last_name}` : null

            return (
              <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hover-card" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{candidateName}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{candidate?.current_title}</div>
                  </div>
                  <div style={{ fontSize: '1.25rem', color: '#475569' }}>→</div>
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
                    <ScoreBar score={m.overall_score} />
                  </div>
                  {m.skill_match_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', width: '90px' }}>Skills</span>
                      <ScoreBar score={m.skill_match_score} />
                    </div>
                  )}
                  {m.experience_match_score != null && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ color: '#64748b', fontSize: '0.78rem', width: '90px' }}>Experience</span>
                      <ScoreBar score={m.experience_match_score} />
                    </div>
                  )}
                </div>
              </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

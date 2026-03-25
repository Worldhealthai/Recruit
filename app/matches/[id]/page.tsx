import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const statusColors: Record<string, string> = {
  SUGGESTED: '#64748b', SHORTLISTED: '#8b5cf6', CONTACTED: '#3b82f6',
  SCREENING: '#f59e0b', SUBMITTED: '#06b6d4', INTERVIEW: '#22c55e',
  OFFER: '#10b981', PLACED: '#059669', REJECTED: '#ef4444', WITHDRAWN: '#475569',
}

const pipeline = ['SUGGESTED', 'SHORTLISTED', 'CONTACTED', 'SCREENING', 'SUBMITTED', 'INTERVIEW', 'OFFER', 'PLACED']

function ScoreBar({ score, label }: { score: number; label: string }) {
  const pct = Math.round(score * 100)
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <span style={{ color: '#64748b', fontSize: '0.82rem', width: '130px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
      </div>
      <span style={{ color, fontSize: '0.92rem', fontWeight: 800, minWidth: '3rem', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await prisma.match.findUnique({
    where: { id: params.id },
    include: {
      candidate: {
        include: {
          current_company: true,
          skills: { include: { skill: true }, orderBy: { proficiency: 'desc' }, take: 8 },
        },
      },
      job: {
        include: {
          company: true,
          skills: { include: { skill: true } },
        },
      },
    },
  }).catch(() => null)

  if (!match) notFound()

  const { candidate, job } = match
  const statusIdx = pipeline.indexOf(match.status)
  const overallPct = Math.round(match.overall_score * 100)
  const overallColor = overallPct >= 80 ? '#22c55e' : overallPct >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <PageShell
      active="/matches"
      title="AI Match Analysis"
      subtitle={`${candidate.first_name} ${candidate.last_name} → ${job.title}`}
      badge="Match Detail"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/matches" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Matches
        </Link>
      </div>

      {/* Overall score hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '1rem', padding: '2rem', marginBottom: '1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <div>
          <div style={{ color: '#a5b4fc', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
            Overall Match Score
          </div>
          <div style={{ fontSize: '4rem', fontWeight: 900, color: overallColor, lineHeight: 1 }}>
            {overallPct}%
          </div>
          <div style={{ marginTop: '0.75rem' }}>
            <span style={{
              background: `${statusColors[match.status] ?? '#64748b'}22`,
              color: statusColors[match.status] ?? '#64748b',
              border: `1px solid ${statusColors[match.status] ?? '#64748b'}44`,
              borderRadius: '0.4rem', padding: '0.3rem 0.8rem', fontSize: '0.82rem', fontWeight: 700,
            }}>{match.status}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.25rem' }}>Matched on</div>
          <div style={{ color: '#f8fafc', fontWeight: 600 }}>{new Date(match.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Pipeline tracker */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: '0', minWidth: 'max-content' }}>
          {pipeline.map((stage, i) => {
            const isPast = i < statusIdx
            const isCurrent = i === statusIdx
            const color = isCurrent ? statusColors[stage] ?? '#64748b' : isPast ? '#22c55e' : '#1e293b'
            return (
              <div key={stage} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  padding: '0.4rem 0.8rem', borderRadius: '0.3rem', fontSize: '0.72rem', fontWeight: isCurrent ? 700 : 500,
                  background: isCurrent ? `${color}22` : isPast ? 'rgba(34,197,94,0.08)' : 'transparent',
                  color: isCurrent ? color : isPast ? '#4ade80' : '#334155',
                  border: `1px solid ${isCurrent ? `${color}44` : isPast ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
                }}>{stage}</div>
                {i < pipeline.length - 1 && (
                  <div style={{ color: isPast ? '#22c55e' : '#1e293b', padding: '0 0.2rem', fontSize: '0.8rem' }}>›</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Candidate card */}
        <Link href={`/candidates/${candidate.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-card" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', height: '100%',
          }}
          >
            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Candidate</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{candidate.first_name} {candidate.last_name}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{candidate.current_title}</div>
            {candidate.current_company && (
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>@ {candidate.current_company.name}</div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {candidate.skills.slice(0, 5).map(cs => (
                <span key={cs.skill.id} style={{
                  background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                  borderRadius: '0.25rem', padding: '0.15rem 0.45rem', fontSize: '0.72rem',
                }}>{cs.skill.name}</span>
              ))}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: '0.78rem', marginTop: '1rem' }}>View full profile →</div>
          </div>
        </Link>

        {/* Job card */}
        <Link href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="hover-card" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem', padding: '1.5rem', cursor: 'pointer', height: '100%',
          }}
          >
            <div style={{ color: '#64748b', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Job</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem' }}>{job.title}</div>
            <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{job.company?.name}</div>
            {job.salary_min && job.salary_max && (
              <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                💰 £{Number(job.salary_min).toLocaleString()} – £{Number(job.salary_max).toLocaleString()}
              </div>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {job.skills.slice(0, 5).map(js => (
                <span key={js.skill.id} style={{
                  background: 'rgba(239,68,68,0.08)', color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.25rem', padding: '0.15rem 0.45rem', fontSize: '0.72rem',
                }}>{js.skill.name}</span>
              ))}
            </div>
            <div style={{ color: '#a5b4fc', fontSize: '0.78rem', marginTop: '1rem' }}>View job posting →</div>
          </div>
        </Link>
      </div>

      {/* Score breakdown */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontWeight: 700 }}>Score Breakdown</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ScoreBar score={match.overall_score} label="Overall Match" />
          <ScoreBar score={match.skill_match_score} label="Skills" />
          <ScoreBar score={match.experience_match_score} label="Experience" />
          <ScoreBar score={match.seniority_match_score} label="Seniority" />
          <ScoreBar score={match.location_match_score} label="Location" />
          <ScoreBar score={match.salary_match_score} label="Salary" />
          {match.culture_fit_score != null && (
            <ScoreBar score={match.culture_fit_score} label="Culture Fit" />
          )}
        </div>
      </div>

      {/* AI Reasoning */}
      {match.ai_reasoning && (
        <div style={{
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700, color: '#a5b4fc' }}>
            🤖 AI Reasoning
          </h2>
          <p style={{ color: '#94a3b8', lineHeight: 1.8, margin: 0, fontSize: '0.9rem' }}>
            {match.ai_reasoning}
          </p>
        </div>
      )}
    </PageShell>
  )
}

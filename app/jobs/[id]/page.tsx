import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const workModeColors: Record<string, string> = {
  REMOTE: '#22c55e', HYBRID: '#3b82f6', ONSITE: '#f59e0b',
}
const urgencyColors: Record<string, string> = {
  IMMEDIATE: '#ef4444', HIGH: '#f59e0b', NORMAL: '#64748b', LOW: '#475569',
}
const importanceColors: Record<string, string> = {
  REQUIRED: '#ef4444', PREFERRED: '#f59e0b', NICE_TO_HAVE: '#64748b',
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
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
      </div>
      <span style={{ color, fontSize: '0.82rem', fontWeight: 700, minWidth: '2.5rem', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      skills: { include: { skill: true }, orderBy: { importance: 'asc' } },
      matches: {
        include: { candidate: true },
        orderBy: { overall_score: 'desc' },
        take: 5,
      },
    },
  }).catch(() => null)

  if (!job) notFound()

  const required = job.skills.filter(s => s.importance === 'REQUIRED')
  const preferred = job.skills.filter(s => s.importance !== 'REQUIRED')

  return (
    <PageShell
      active="/jobs"
      title={job.title}
      subtitle={job.company ? `${job.company.name} · ${job.location_city}, ${job.location_country}` : job.title}
      badge="Job Posting"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/jobs" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Jobs
        </Link>
      </div>

      {/* Badges & meta */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span style={{
          background: `${workModeColors[job.work_mode] ?? '#64748b'}22`,
          color: workModeColors[job.work_mode] ?? '#64748b',
          border: `1px solid ${workModeColors[job.work_mode] ?? '#64748b'}44`,
          borderRadius: '0.3rem', padding: '0.25rem 0.7rem', fontSize: '0.8rem', fontWeight: 600,
        }}>{job.work_mode.replace(/_/g, ' ')}</span>
        <span style={{
          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.3rem', padding: '0.25rem 0.7rem', fontSize: '0.8rem',
        }}>{job.employment_type.replace(/_/g, ' ')}</span>
        <span style={{
          background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.3rem', padding: '0.25rem 0.7rem', fontSize: '0.8rem',
        }}>{job.seniority_level.replace(/_/g, ' ')}</span>
        {job.urgency !== 'NORMAL' && (
          <span style={{ color: urgencyColors[job.urgency], fontSize: '0.8rem', fontWeight: 700, alignSelf: 'center' }}>
            ● {job.urgency} URGENCY
          </span>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {job.salary_min && job.salary_max && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.6rem', padding: '1rem' }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Salary</div>
            <div style={{ fontWeight: 700 }}>£{Number(job.salary_min).toLocaleString()} – £{Number(job.salary_max).toLocaleString()}</div>
          </div>
        )}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.6rem', padding: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Posted</div>
          <div style={{ fontWeight: 700 }}>{new Date(job.posted_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.6rem', padding: '1rem' }}>
          <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Source</div>
          <div style={{ fontWeight: 700 }}>{job.source.replace(/_/g, ' ')}</div>
        </div>
        {job.visa_sponsorship && (
          <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.6rem', padding: '1rem' }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Visa</div>
            <div style={{ fontWeight: 700, color: '#22c55e' }}>Sponsorship ✓</div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Description */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>About the Role</h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.75, margin: 0, fontSize: '0.9rem' }}>{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Requirements</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.requirements}</div>
            </div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Responsibilities</h2>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{job.responsibilities}</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Company */}
          {job.company && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Company</h2>
              <Link href={`/companies/${job.company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{ cursor: 'pointer' }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{job.company.name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '0.5rem' }}>{job.company.industry}</div>
                  <div style={{ color: '#475569', fontSize: '0.8rem' }}>📍 {job.company.headquarters_city}</div>
                  {job.company.glassdoor_rating && (
                    <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.25rem' }}>★ {job.company.glassdoor_rating} Glassdoor</div>
                  )}
                  <div style={{ color: '#a5b4fc', fontSize: '0.78rem', marginTop: '0.5rem' }}>View company profile →</div>
                </div>
              </Link>
            </div>
          )}

          {/* Skills */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Skills</h2>
            {required.length > 0 && (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Required</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {required.map(s => (
                    <span key={s.skill.id} style={{
                      background: 'rgba(239,68,68,0.1)', color: '#fca5a5',
                      border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.3rem',
                      padding: '0.2rem 0.5rem', fontSize: '0.78rem',
                    }}>{s.skill.name}</span>
                  ))}
                </div>
              </div>
            )}
            {preferred.length > 0 && (
              <div>
                <div style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Preferred</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {preferred.map(s => (
                    <span key={s.skill.id} style={{
                      background: `${importanceColors[s.importance] ?? '#64748b'}12`,
                      color: importanceColors[s.importance] ?? '#94a3b8',
                      border: `1px solid ${importanceColors[s.importance] ?? '#64748b'}25`,
                      borderRadius: '0.3rem', padding: '0.2rem 0.5rem', fontSize: '0.78rem',
                    }}>{s.skill.name}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Matches */}
      {job.matches.length > 0 && (
        <div style={{
          marginTop: '1.5rem',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Top AI-Matched Candidates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {job.matches.map((m, i) => (
              <Link key={m.id} href={`/matches/${m.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'grid', gridTemplateColumns: 'auto 1fr 200px auto',
                  gap: '1rem', alignItems: 'center',
                  padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                }}
                >
                  <span style={{ color: '#475569', fontWeight: 700, fontSize: '0.85rem', minWidth: '1.5rem' }}>#{i + 1}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{m.candidate.first_name} {m.candidate.last_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.78rem' }}>{m.candidate.current_title}</div>
                  </div>
                  <ScoreBar score={m.overall_score} />
                  <span style={{
                    background: `${statusColors[m.status] ?? '#64748b'}22`,
                    color: statusColors[m.status] ?? '#64748b',
                    border: `1px solid ${statusColors[m.status] ?? '#64748b'}44`,
                    borderRadius: '0.3rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap',
                  }}>{m.status}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}

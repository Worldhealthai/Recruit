import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'
import CandidateActions from './CandidateActions'

const availabilityColor: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e',
  OPEN_TO_OFFERS: '#f59e0b',
  PASSIVE: '#64748b',
  NOT_LOOKING: '#475569',
  UNAVAILABLE: '#ef4444',
}

const proficiencyColor: Record<string, string> = {
  BEGINNER: '#64748b',
  INTERMEDIATE: '#3b82f6',
  ADVANCED: '#8b5cf6',
  EXPERT: '#f59e0b',
}

const seniorityColor: Record<string, string> = {
  INTERN: '#64748b', JUNIOR: '#22c55e', MID: '#3b82f6', SENIOR: '#8b5cf6',
  LEAD: '#f59e0b', MANAGER: '#f59e0b', DIRECTOR: '#ef4444', VP: '#ef4444',
  C_SUITE: '#ef4444', EXECUTIVE: '#ef4444',
}


export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const candidate = await prisma.candidate.findUnique({
    where: { id: params.id },
    include: {
      current_company: true,
      skills: { include: { skill: true }, orderBy: { proficiency: 'desc' } },
      matches: {
        include: {
          job: { include: { company: true } },
          screening_calls: {
            select: { id: true, recommendation: true, status: true },
            orderBy: { created_at: 'desc' },
            take: 1,
          },
          placement: {
            select: { id: true, fee_total: true, recruiter_earnings: true },
          },
        },
        orderBy: { overall_score: 'desc' },
        take: 10,
      },
    },
  }).catch(() => null)

  if (!candidate) notFound()

  const seniority = candidate.seniority_level
  const availability = candidate.availability_status
  const skillsByCategory = candidate.skills.reduce<Record<string, typeof candidate.skills>>((acc, cs) => {
    const cat = cs.skill.category
    acc[cat] = acc[cat] ?? []
    acc[cat].push(cs)
    return acc
  }, {})

  return (
    <PageShell
      active="/candidates"
      title={`${candidate.first_name} ${candidate.last_name}`}
      subtitle={candidate.current_title}
      badge="Candidate Profile"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/candidates" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Candidates
        </Link>
      </div>

      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', marginBottom: '2rem', alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <span style={{
              background: `${seniorityColor[seniority] ?? '#64748b'}22`,
              color: seniorityColor[seniority] ?? '#64748b',
              border: `1px solid ${seniorityColor[seniority] ?? '#64748b'}44`,
              borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 600,
            }}>{seniority.replace(/_/g, ' ')}</span>
            <span style={{
              color: availabilityColor[availability] ?? '#64748b', fontSize: '0.75rem', fontWeight: 700,
            }}>● {availability.replace(/_/g, ' ')}</span>
          </div>
          {candidate.summary && (
            <p style={{ color: '#94a3b8', lineHeight: 1.7, margin: 0, fontSize: '0.92rem', maxWidth: '680px' }}>
              {candidate.summary}
            </p>
          )}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          minWidth: '220px',
        }}>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Stats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div><span style={{ color: '#475569', fontSize: '0.8rem' }}>Experience </span><span style={{ color: '#f8fafc', fontWeight: 600 }}>{candidate.years_experience}y</span></div>
            {candidate.notice_period_days && <div><span style={{ color: '#475569', fontSize: '0.8rem' }}>Notice </span><span style={{ color: '#f8fafc', fontWeight: 600 }}>{candidate.notice_period_days}d</span></div>}
            <div><span style={{ color: '#475569', fontSize: '0.8rem' }}>Location </span><span style={{ color: '#f8fafc', fontWeight: 600 }}>{candidate.location_city}</span></div>
            <div><span style={{ color: '#475569', fontSize: '0.8rem' }}>Remote </span><span style={{ color: candidate.is_remote_open ? '#22c55e' : '#ef4444', fontWeight: 600 }}>{candidate.is_remote_open ? 'Open' : 'No'}</span></div>
            {candidate.salary_expectation_min && candidate.salary_expectation_max && (
              <div><span style={{ color: '#475569', fontSize: '0.8rem' }}>Salary </span><span style={{ color: '#f8fafc', fontWeight: 600 }}>£{Number(candidate.salary_expectation_min).toLocaleString()} – £{Number(candidate.salary_expectation_max).toLocaleString()}</span></div>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      {(candidate.linkedin_url || candidate.github_url || candidate.portfolio_url) && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {candidate.linkedin_url && (
            <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" style={{
              background: 'rgba(10,102,194,0.15)', border: '1px solid rgba(10,102,194,0.3)',
              color: '#60a5fa', borderRadius: '0.4rem', padding: '0.3rem 0.8rem', fontSize: '0.82rem', textDecoration: 'none',
            }}>LinkedIn ↗</a>
          )}
          {candidate.github_url && (
            <a href={candidate.github_url} target="_blank" rel="noreferrer" style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8', borderRadius: '0.4rem', padding: '0.3rem 0.8rem', fontSize: '0.82rem', textDecoration: 'none',
            }}>GitHub ↗</a>
          )}
        </div>
      )}

      {/* Pipeline Actions — prominent, before detail sections */}
      <div style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Pipeline &amp; Actions</h2>
          <a href="/pipeline" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none' }}>
            View full pipeline →
          </a>
        </div>
        <CandidateActions initialMatches={candidate.matches as Parameters<typeof CandidateActions>[0]['initialMatches']} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Skills */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Skills</h2>
          {Object.entries(skillsByCategory).map(([category, skills]) => (
            <div key={category} style={{ marginBottom: '1.25rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {skills.map((cs) => (
                  <span key={cs.skill.id} style={{
                    background: `${proficiencyColor[cs.proficiency] ?? '#64748b'}18`,
                    color: proficiencyColor[cs.proficiency] ?? '#64748b',
                    border: `1px solid ${proficiencyColor[cs.proficiency] ?? '#64748b'}33`,
                    borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.78rem',
                  }}>
                    {cs.skill.name}
                    <span style={{ opacity: 0.6, marginLeft: '0.3rem', fontSize: '0.68rem' }}>{cs.proficiency}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current Company */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {candidate.current_company && (
            <div style={{
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem', padding: '1.5rem',
            }}>
              <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Current Employer</h2>
              <Link href={`/companies/${candidate.current_company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.5rem',
                  border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{candidate.current_company.name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{candidate.current_company.industry}</div>
                  </div>
                  <span style={{ color: '#a5b4fc', fontSize: '0.8rem' }}>View →</span>
                </div>
              </Link>
            </div>
          )}

          {/* Contact */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '0.75rem', padding: '1.5rem',
          }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Contact</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {candidate.email && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{candidate.email}</div>}
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{candidate.location_city}, {candidate.location_country}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Source: {candidate.source.replace(/_/g, ' ')}</div>
            </div>
          </div>
        </div>
      </div>

    </PageShell>
  )
}

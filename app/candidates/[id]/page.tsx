import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Nav from '../../components/Nav'
import CandidateActions from './CandidateActions'
import CandidateNotes from './CandidateNotes'

const availabilityMeta: Record<string, { color: string; label: string }> = {
  ACTIVELY_LOOKING: { color: '#22c55e', label: 'Actively Looking' },
  OPEN_TO_OFFERS:   { color: '#f59e0b', label: 'Open to Offers' },
  PASSIVE:          { color: '#9ca3af', label: 'Passive' },
  NOT_LOOKING:      { color: '#d1d5db', label: 'Not Looking' },
  UNAVAILABLE:      { color: '#ef4444', label: 'Unavailable' },
}

const proficiencyColor: Record<string, string> = {
  BEGINNER:     '#9ca3af',
  INTERMEDIATE: '#3b82f6',
  ADVANCED:     '#6366f1',
  EXPERT:       '#f59e0b',
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316']
function nameColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export default async function CandidateDetailPage({ params }: { params: { id: string } }) {
  const [candidate, fallbackJob] = await Promise.all([
    prisma.candidate.findUnique({
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
    }).catch(() => null),
    prisma.job.findFirst({ where: { status: 'ACTIVE' }, select: { id: true } }).catch(() => null),
  ])

  if (!candidate) notFound()

  const avail = availabilityMeta[candidate.availability_status] ?? { color: '#9ca3af', label: candidate.availability_status.replace(/_/g, ' ') }
  const color = nameColor(candidate.first_name + candidate.last_name)
  const initials = `${candidate.first_name[0]}${candidate.last_name[0]}`.toUpperCase()

  const skillsByCategory = candidate.skills.reduce<Record<string, typeof candidate.skills>>((acc, cs) => {
    const cat = cs.skill.category
    acc[cat] = acc[cat] ?? []
    acc[cat].push(cs)
    return acc
  }, {})

  const card: React.CSSProperties = {
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid rgba(255,255,255,0.65)',
    borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(99,102,241,0.07), 0 1px 3px rgba(0,0,0,0.04)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', color: '#111111', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav active="/candidates" />

      <main className="page-content" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 2.5rem' }}>

        <div style={{ marginBottom: '1.25rem' }}>
          <Link href="/candidates" style={{ color: '#9ca3af', fontSize: '0.83rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
            ← Talent Pool
          </Link>
        </div>

        {/* Hero */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>

            {/* Avatar */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
              background: `${color}15`, border: `2.5px solid ${color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.15rem', color, letterSpacing: '-0.03em',
            }}>
              {initials}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.25rem', color: '#111111' }}>
                    {candidate.first_name} {candidate.last_name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {candidate.current_title && (
                      <span style={{ fontSize: '0.9rem', color: '#374151', fontWeight: 500 }}>
                        {candidate.current_title}
                      </span>
                    )}
                    {candidate.current_company && (
                      <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                        @ {candidate.current_company.name}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: avail.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: '#6b7280', fontWeight: 500 }}>{avail.label}</span>
                    <span style={{ color: '#e5e7eb' }}>·</span>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '4px', padding: '0.05rem 0.4rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {candidate.seniority_level.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Quick stats */}
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Experience', value: candidate.years_experience ? `${candidate.years_experience}y` : '—' },
                    { label: 'Notice', value: candidate.notice_period_days ? `${candidate.notice_period_days}d` : '—' },
                    { label: 'Location', value: candidate.location_city ?? '—' },
                    { label: 'Remote', value: candidate.is_remote_open ? 'Open' : 'No' },
                    ...(candidate.salary_expectation_min && candidate.salary_expectation_max ? [{
                      label: 'Salary',
                      value: `£${Math.round(Number(candidate.salary_expectation_min)/1000)}k–£${Math.round(Number(candidate.salary_expectation_max)/1000)}k`
                    }] : []),
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{s.label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {candidate.summary && (
                <p style={{ color: '#6b7280', lineHeight: 1.7, margin: '1rem 0 0', fontSize: '0.88rem', maxWidth: '700px' }}>
                  {candidate.summary}
                </p>
              )}
            </div>
          </div>

          {/* External links */}
          {(candidate.linkedin_url || candidate.github_url || candidate.resume_url) && (
            <div style={{ display: 'flex', gap: '0.65rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(0,0,0,0.06)', flexWrap: 'wrap' }}>
              {candidate.linkedin_url && (
                <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '6px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                  LinkedIn ↗
                </a>
              )}
              {candidate.github_url && (
                <a href={candidate.github_url} target="_blank" rel="noreferrer" style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)', color: '#374151', borderRadius: '6px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                  GitHub ↗
                </a>
              )}
              {candidate.resume_url && (
                <>
                  <a href={candidate.resume_url} target="_blank" rel="noreferrer" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', borderRadius: '6px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                    View CV ↗
                  </a>
                  <a href={candidate.resume_url} download style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.1)', color: '#374151', borderRadius: '6px', padding: '0.3rem 0.85rem', fontSize: '0.8rem', fontWeight: 500, textDecoration: 'none' }}>
                    Download CV ↓
                  </a>
                </>
              )}
            </div>
          )}
        </div>

        {/* Pipeline Actions */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>Pipeline</h2>
            <a href="/pipeline" style={{ fontSize: '0.78rem', color: '#6366f1', textDecoration: 'none', fontWeight: 500 }}>
              View full pipeline →
            </a>
          </div>
          <CandidateActions
            candidateId={candidate.id}
            candidateName={`${candidate.first_name} ${candidate.last_name}`}
            fallbackJobId={fallbackJob?.id ?? null}
            initialMatches={candidate.matches as Parameters<typeof CandidateActions>[0]['initialMatches']}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

          {/* Skills */}
          <div style={card}>
            <h2 style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>Skills</h2>
            {Object.entries(skillsByCategory).map(([category, skills]) => (
              <div key={category} style={{ marginBottom: '1.1rem' }}>
                <div style={{ color: '#9ca3af', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                  {category}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {skills.map((cs) => (
                    <span key={cs.skill.id} style={{
                      background: `${proficiencyColor[cs.proficiency] ?? '#9ca3af'}12`,
                      color: proficiencyColor[cs.proficiency] ?? '#6b7280',
                      border: `1px solid ${proficiencyColor[cs.proficiency] ?? '#9ca3af'}25`,
                      borderRadius: '5px', padding: '0.18rem 0.55rem', fontSize: '0.78rem',
                    }}>
                      {cs.skill.name}
                      <span style={{ opacity: 0.5, marginLeft: '0.3rem', fontSize: '0.65rem' }}>{cs.proficiency}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <CandidateNotes candidateId={candidate.id} />

            {candidate.current_company && (
              <div style={card}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>Current Employer</h2>
                <Link href={`/companies/${candidate.current_company.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className="hover-card" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem', background: '#f9fafb', borderRadius: '8px',
                    border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer',
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111111', fontSize: '0.88rem' }}>{candidate.current_company.name}</div>
                      <div style={{ color: '#9ca3af', fontSize: '0.78rem', marginTop: '0.1rem' }}>{candidate.current_company.industry}</div>
                    </div>
                    <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>→</span>
                  </div>
                </Link>
              </div>
            )}

            <div style={card}>
              <h2 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', fontWeight: 700, color: '#111111' }}>Contact</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {candidate.email && (
                  <div style={{ fontSize: '0.84rem', color: '#374151' }}>{candidate.email}</div>
                )}
                <div style={{ fontSize: '0.84rem', color: '#6b7280' }}>
                  {candidate.location_city}{candidate.location_country ? `, ${candidate.location_country}` : ''}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Source: {candidate.source.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

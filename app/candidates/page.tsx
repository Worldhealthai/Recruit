import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getCandidates() {
  try {
    return await prisma.candidate.findMany({
      include: { skills: { include: { skill: true } }, current_company: true },
      take: 20,
      orderBy: { created_at: 'desc' },
    })
  } catch {
    return []
  }
}

const seniorityColor: Record<string, string> = {
  INTERN: '#64748b',
  JUNIOR: '#22c55e',
  MID: '#3b82f6',
  SENIOR: '#8b5cf6',
  LEAD: '#f59e0b',
  EXECUTIVE: '#ef4444',
}

const availabilityColor: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e',
  OPEN_TO_OFFERS: '#f59e0b',
  NOT_LOOKING: '#64748b',
}

export default async function CandidatesPage() {
  const candidates = await getCandidates()

  return (
    <PageShell
      active="/candidates"
      title="Candidates"
      subtitle="Browse and filter talent profiles"
      badge="Talent Pool"
    >
      {candidates.length === 0 ? (
        <EmptyState
          icon="👤"
          message="No candidates yet"
          hint="Candidates will appear here once the database is connected and seeded."
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {candidates.map((c) => {
            const seniority = c.seniority_level
            const availability = c.availability_status
            const skills = c.skills ?? []
            const company = c.current_company

            return (
              <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{`${c.first_name} ${c.last_name}`}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{c.current_title}</div>
                  </div>
                  <span style={{
                    background: `${seniorityColor[seniority] ?? '#64748b'}22`,
                    color: seniorityColor[seniority] ?? '#64748b',
                    border: `1px solid ${seniorityColor[seniority] ?? '#64748b'}44`,
                    borderRadius: '0.3rem',
                    padding: '0.15rem 0.5rem',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}>
                    {seniority}
                  </span>
                </div>

                {company && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    @ {company.name}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {skills.slice(0, 4).map((s) => (
                    <span key={s.skill.name} style={{
                      background: 'rgba(99,102,241,0.12)',
                      color: '#a5b4fc',
                      borderRadius: '0.25rem',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.72rem',
                    }}>
                      {s.skill.name}
                    </span>
                  ))}
                  {skills.length > 4 && (
                    <span style={{ color: '#475569', fontSize: '0.72rem', alignSelf: 'center' }}>
                      +{skills.length - 4} more
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    📍 {c.location_city}, {c.location_country}
                  </span>
                  <span style={{
                    color: availabilityColor[availability] ?? '#64748b',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}>
                    ● {availability?.replace(/_/g, ' ')}
                  </span>
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

import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getJobs() {
  try {
    return await prisma.job.findMany({
      include: { company: true, skills: { include: { skill: true } } },
      take: 20,
      orderBy: { posted_date: 'desc' },
    })
  } catch {
    return []
  }
}

const workModeColors: Record<string, string> = {
  REMOTE: '#22c55e',
  HYBRID: '#3b82f6',
  ON_SITE: '#f59e0b',
}

const statusColors: Record<string, string> = {
  OPEN: '#22c55e',
  CLOSED: '#ef4444',
  ON_HOLD: '#f59e0b',
  DRAFT: '#64748b',
}

export default async function JobsPage() {
  const jobs = await getJobs()

  return (
    <PageShell
      active="/jobs"
      title="Open Jobs"
      subtitle="Active job listings with skill requirements"
      badge="Job Board"
    >
      {jobs.length === 0 ? (
        <EmptyState
          icon="💼"
          message="No jobs listed yet"
          hint="Job postings will appear here once the database is connected and seeded."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {jobs.map((job) => {
            const company = job.company
            const skills = job.skills ?? []
            const workMode = job.work_mode
            const status = job.status

            return (
              <div key={job.id} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1.5rem',
                alignItems: 'flex-start',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem' }}>{job.title}</span>
                    <span style={{
                      color: statusColors[status] ?? '#64748b',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                    }}>● {status}</span>
                  </div>
                  {company && (
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      {company.name} · {company.industry}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {skills.slice(0, 5).map((s) => (
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
                    {skills.length > 5 && (
                      <span style={{ color: '#475569', fontSize: '0.72rem', alignSelf: 'center' }}>
                        +{skills.length - 5}
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{
                    background: `${workModeColors[workMode] ?? '#64748b'}22`,
                    color: workModeColors[workMode] ?? '#64748b',
                    border: `1px solid ${workModeColors[workMode] ?? '#64748b'}44`,
                    borderRadius: '0.3rem',
                    padding: '0.2rem 0.6rem',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                  }}>
                    {workMode?.replace(/_/g, ' ')}
                  </span>
                  {(job.salary_min && job.salary_max) && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      £{job.salary_min.toLocaleString()} – £{job.salary_max.toLocaleString()}
                    </span>
                  )}
                  {job.location_country && (
                    <span style={{ color: '#475569', fontSize: '0.75rem' }}>
                      📍 {job.location_city}, {job.location_country}
                    </span>
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

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const sizeLabel: Record<string, string> = {
  STARTUP: 'Startup (1–50)', SME: 'SME (51–200)', MID_MARKET: 'Mid-Market (201–1,000)',
  ENTERPRISE: 'Enterprise (1,001–5,000)', MEGA_CORP: 'Mega Corp (5,000+)',
}

const urgencyColors: Record<string, string> = {
  IMMEDIATE: '#ef4444', HIGH: '#f59e0b', NORMAL: '#64748b', LOW: '#475569',
}

const workModeColors: Record<string, string> = {
  REMOTE: '#22c55e', HYBRID: '#3b82f6', ONSITE: '#f59e0b',
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({
    where: { id: params.id },
    include: {
      jobs: {
        where: { status: 'ACTIVE' },
        include: { skills: { include: { skill: true } } },
        orderBy: { posted_date: 'desc' },
        take: 10,
      },
      candidates: {
        take: 8,
        orderBy: { created_at: 'desc' },
      },
    },
  }).catch(() => null)

  if (!company) notFound()

  return (
    <PageShell
      active="/companies"
      title={company.name}
      subtitle={`${company.industry} · ${company.headquarters_city}, ${company.headquarters_country}`}
      badge="Company Profile"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/companies" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Companies
        </Link>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem', marginBottom: '2rem',
      }}>
        {[
          { label: 'Size', value: sizeLabel[company.company_size] ?? company.company_size },
          { label: 'Employees', value: company.employee_count?.toLocaleString() ?? '—' },
          { label: 'Founded', value: company.founded_year?.toString() ?? '—' },
          { label: 'Glassdoor', value: company.glassdoor_rating ? `★ ${company.glassdoor_rating}` : '—' },
          { label: 'Sector', value: company.sector },
          { label: 'Region', value: company.region },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '0.6rem', padding: '1rem',
          }}>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Tech Stack */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Tech Stack</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {company.tech_stack.map((tech) => (
              <span key={tech} style={{
                background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.3rem',
                padding: '0.25rem 0.6rem', fontSize: '0.82rem',
              }}>{tech}</span>
            ))}
          </div>
        </div>

        {/* Culture */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 700 }}>Culture</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {company.culture_tags.map((tag) => (
              <span key={tag} style={{
                background: 'rgba(34,197,94,0.1)', color: '#86efac',
                border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.3rem',
                padding: '0.25rem 0.6rem', fontSize: '0.82rem',
              }}>{tag}</span>
            ))}
          </div>
          {company.website && (
            <a href={`https://${company.domain}`} target="_blank" rel="noreferrer" style={{
              display: 'inline-block', marginTop: '1rem',
              color: '#60a5fa', fontSize: '0.82rem', textDecoration: 'none',
            }}>🌐 {company.domain} ↗</a>
          )}
        </div>
      </div>

      {/* Open Jobs */}
      {company.jobs.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>
            Open Roles <span style={{ color: '#475569', fontWeight: 400 }}>({company.jobs.length})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {company.jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem',
                  padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)',
                  borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{job.title}</div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      {job.skills.slice(0, 4).map(s => (
                        <span key={s.skill.name} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', borderRadius: '0.2rem', padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                          {s.skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                    <span style={{
                      background: `${workModeColors[job.work_mode] ?? '#64748b'}22`,
                      color: workModeColors[job.work_mode] ?? '#64748b',
                      border: `1px solid ${workModeColors[job.work_mode] ?? '#64748b'}44`,
                      borderRadius: '0.3rem', padding: '0.15rem 0.45rem', fontSize: '0.7rem', fontWeight: 600,
                    }}>{job.work_mode.replace(/_/g, ' ')}</span>
                    {job.urgency !== 'NORMAL' && (
                      <span style={{ color: urgencyColors[job.urgency], fontSize: '0.7rem', fontWeight: 700 }}>● {job.urgency}</span>
                    )}
                    {job.salary_min && job.salary_max && (
                      <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        £{Number(job.salary_min).toLocaleString()}–£{Number(job.salary_max).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Current Candidates */}
      {company.candidates.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '0.75rem', padding: '1.5rem',
        }}>
          <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>
            Known Employees in Pipeline <span style={{ color: '#475569', fontWeight: 400 }}>({company.candidates.length})</span>
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {company.candidates.map((c) => (
              <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="hover-card" style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '0.5rem', padding: '0.6rem 1rem', cursor: 'pointer',
                }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{c.first_name} {c.last_name}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.current_title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  )
}

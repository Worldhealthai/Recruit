export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import JobFilters from '../components/JobFilters'
import { prisma } from '@/lib/prisma'

const workModeColors: Record<string, string> = {
  REMOTE: '#22c55e', HYBRID: '#3b82f6', ONSITE: '#f59e0b',
}
const urgencyColors: Record<string, string> = {
  IMMEDIATE: '#ef4444', HIGH: '#f59e0b', NORMAL: '#64748b', LOW: '#475569',
}

// Maps job functions (from the filter) to title keywords for server-side matching
const FUNCTION_KEYWORDS: Record<string, string[]> = {
  'IT & Technology':              ['Engineer', 'Developer', 'DevOps', 'Platform', 'Software', 'Backend', 'Frontend', 'Full-Stack', 'Infrastructure', 'Cloud', 'Architect', 'QA', 'Cybersecurity'],
  'Data & Analytics':             ['Data', 'Analyst', 'Analytics', 'BI', 'Machine Learning', 'AI', 'Scientist'],
  'Product & UX':                 ['Product Manager', 'UX', 'Product Owner', 'Product Designer', 'CX'],
  'Marketing & Communications':   ['Marketing', 'Brand', 'SEO', 'Social Media', 'Content', 'Communications', 'PR', 'Advertising', 'Paid', 'CRM'],
  'Finance & Accounting':         ['Finance', 'Accountant', 'Financial', 'CFO', 'Controller', 'Auditor', 'Treasurer'],
  'HR & People':                  ['HR', 'Human Resources', 'People', 'Talent', 'Recruiter', 'L&D', 'Payroll'],
  'Events & Hospitality':         ['Event', 'Hospitality', 'Hotel', 'Catering', 'Chef', 'F&B', 'Conference', 'Venue', 'Front Office', 'Concierge'],
  'Trades & Construction':        ['Site Manager', 'Surveyor', 'Architect', 'Construction', 'Civil', 'HVAC', 'Electrician', 'Plumber', 'Quantity', 'Project Engineer'],
  'Legal & Compliance':           ['Solicitor', 'Legal', 'Compliance', 'Paralegal', 'Counsel', 'Associate', 'Partner'],
  'Management & Leadership':      ['Manager', 'Director', 'Head of', 'VP', 'Chief', 'Lead', 'Senior Manager'],
  'Sales & Account Management':   ['Sales', 'Account Manager', 'BDM', 'Business Development', 'Account Director', 'Revenue'],
  'Healthcare & Medical':         ['Nurse', 'Doctor', 'Pharmacist', 'Clinical', 'Medical', 'Healthcare', 'Physiotherapist', 'Ward', 'Radiographer'],
  'Teaching & Training':          ['Teacher', 'Trainer', 'Lecturer', 'Tutor', 'Coach', 'Instructor', 'Professor'],
  'Logistics & Operations':       ['Logistics', 'Operations', 'Warehouse', 'Supply Chain', 'Procurement', 'Fleet', 'Coordinator'],
  'Research & Development':       ['Research', 'R&D', 'Scientist', 'Innovation', 'Laboratory'],
  'Buying & Merchandising':       ['Buying', 'Buyer', 'Merchandis', 'Planner', 'Category'],
  'Administration & Secretarial': ['Administrator', 'PA', 'Secretary', 'Office Manager', 'Executive Assistant'],
  'Security':                     ['Security', 'CISO', 'Cyber', 'Penetration', 'InfoSec'],
  'Social Care & Charity':        ['Social Worker', 'Care Manager', 'Charity', 'Fundraising', 'NGO', 'Third Sector'],
}

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : (v ?? '')
}
function lst(v: string | string[] | undefined): string[] {
  const s = str(v)
  return s ? s.split(',').filter(Boolean) : []
}

async function getJobs(sp: Record<string, string | string[] | undefined>) {
  const q          = str(sp.q)
  const industries = lst(sp.industry)
  const workModes  = lst(sp.work_mode)
  const empTypes   = lst(sp.employment_type)
  const seniority  = lst(sp.seniority)
  const urgency    = lst(sp.urgency)
  const functions  = lst(sp.function)
  const location   = str(sp.location)
  const salaryMin  = str(sp.salary_min)
  const salaryMax  = str(sp.salary_max)
  const visa       = str(sp.visa)
  const equity     = str(sp.equity)
  const recent     = str(sp.recent)

  const where: Prisma.JobWhereInput = { status: 'ACTIVE' }
  const and: Prisma.JobWhereInput[] = []

  if (q) {
    and.push({ OR: [
      { title:   { contains: q, mode: 'insensitive' } },
      { company: { name: { contains: q, mode: 'insensitive' } } },
      { description: { contains: q, mode: 'insensitive' } },
    ]})
  }
  if (functions.length) {
    const kws = functions.flatMap(fn => FUNCTION_KEYWORDS[fn] ?? [fn.split(' ')[0]])
    and.push({ OR: kws.map(kw => ({ title: { contains: kw, mode: 'insensitive' as const } })) })
  }
  if (industries.length)  where.company          = { industry: { in: industries } }
  if (workModes.length)   where.work_mode         = { in: workModes  as Prisma.EnumWorkModeFilter['in'] }
  if (empTypes.length)    where.employment_type   = { in: empTypes   as Prisma.EnumEmploymentTypeFilter['in'] }
  if (seniority.length)   where.seniority_level   = { in: seniority  as Prisma.EnumSeniorityLevelFilter['in'] }
  if (urgency.length)     where.urgency           = { in: urgency    as Prisma.EnumJobUrgencyFilter['in'] }
  if (visa === '1')       where.visa_sponsorship  = true
  if (equity === '1')     where.equity_offered    = true
  if (location)           where.location_city     = { contains: location, mode: 'insensitive' }
  if (recent === '1')     where.posted_date       = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
  if (salaryMin)          where.salary_max        = { gte: parseInt(salaryMin) }
  if (salaryMax)          where.salary_min        = { lte: parseInt(salaryMax) }
  if (and.length)         where.AND               = and

  try {
    return await prisma.job.findMany({
      where,
      include: { company: true, skills: { include: { skill: true } } },
      take: 60,
      orderBy: { posted_date: 'desc' },
    })
  } catch { return [] }
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const jobs = await getJobs(searchParams)

  const activeFilters: string[] = []
  if (str(searchParams.q))                       activeFilters.push(`"${str(searchParams.q)}"`)
  if (lst(searchParams.industry).length)         activeFilters.push(`Industry (${lst(searchParams.industry).length})`)
  if (lst(searchParams.function).length)         activeFilters.push(`Function (${lst(searchParams.function).length})`)
  if (lst(searchParams.work_mode).length)        activeFilters.push(`Work mode (${lst(searchParams.work_mode).length})`)
  if (lst(searchParams.employment_type).length)  activeFilters.push(`Type (${lst(searchParams.employment_type).length})`)
  if (lst(searchParams.seniority).length)        activeFilters.push(`Seniority (${lst(searchParams.seniority).length})`)
  if (str(searchParams.salary_min))              activeFilters.push(`£${parseInt(str(searchParams.salary_min)).toLocaleString()}+`)
  if (str(searchParams.salary_max))              activeFilters.push(`Up to £${parseInt(str(searchParams.salary_max)).toLocaleString()}`)
  if (str(searchParams.location))                activeFilters.push(str(searchParams.location))
  if (str(searchParams.visa) === '1')            activeFilters.push('Visa sponsorship')
  if (str(searchParams.equity) === '1')          activeFilters.push('Equity')
  if (str(searchParams.recent) === '1')          activeFilters.push('Last 7 days')

  return (
    <PageShell
      active="/jobs"
      title="Jobs"
      subtitle="Search across every sector in the UK — tech, hospitality, events, healthcare and more"
      badge="Job Board"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Filter sidebar */}
        <Suspense fallback={
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', height: '600px' }}>
            <div style={{ color: '#475569', fontSize: '0.82rem' }}>Loading filters...</div>
          </div>
        }>
          <JobFilters totalResults={jobs.length} />
        </Suspense>

        {/* Results */}
        <div>
          {/* Active filter pills */}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {activeFilters.map(f => (
                <span key={f} style={{
                  background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px',
                  padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
                }}>{f}</span>
              ))}
              <span style={{ color: '#475569', fontSize: '0.78rem', alignSelf: 'center' }}>
                — {jobs.length} job{jobs.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {jobs.length === 0 ? (
            <EmptyState icon="💼" message="No jobs match your filters" hint="Try adjusting filters or seed the database." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {jobs.map((job) => {
                const company = job.company
                const skills = job.skills ?? []
                const workMode = job.work_mode
                const urgency = job.urgency

                return (
                  <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="hover-card" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.75rem',
                      padding: '1rem 1.25rem',
                      display: 'flex', gap: '1.25rem', alignItems: 'flex-start', cursor: 'pointer',
                    }}>
                      {/* Industry dot */}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{job.title}</span>
                          {urgency !== 'NORMAL' && (
                            <span style={{ color: urgencyColors[urgency] ?? '#64748b', fontSize: '0.68rem', fontWeight: 700 }}>
                              ● {urgency}
                            </span>
                          )}
                        </div>
                        {company && (
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            {company.name}
                            <span style={{ color: '#334155', marginLeft: '0.35rem' }}>·</span>
                            <span style={{ color: '#475569', marginLeft: '0.35rem', fontSize: '0.75rem' }}>{company.industry}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {skills.slice(0, 4).map((s) => (
                            <span key={s.skill.name} style={{
                              background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                              borderRadius: '0.2rem', padding: '0.1rem 0.4rem', fontSize: '0.7rem',
                            }}>{s.skill.name}</span>
                          ))}
                          {skills.length > 4 && (
                            <span style={{ color: '#475569', fontSize: '0.7rem', alignSelf: 'center' }}>+{skills.length - 4}</span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                        <span style={{
                          background: `${workModeColors[workMode] ?? '#64748b'}22`,
                          color: workModeColors[workMode] ?? '#64748b',
                          border: `1px solid ${workModeColors[workMode] ?? '#64748b'}44`,
                          borderRadius: '0.25rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', fontWeight: 600,
                        }}>{workMode?.replace(/_/g, ' ')}</span>
                        {(job.salary_min && job.salary_max) && (
                          <span style={{ color: '#64748b', fontSize: '0.75rem' }}>
                            £{Number(job.salary_min).toLocaleString()} – £{Number(job.salary_max).toLocaleString()}
                          </span>
                        )}
                        {job.location_city && (
                          <span style={{ color: '#475569', fontSize: '0.72rem' }}>📍 {job.location_city}</span>
                        )}
                        <span style={{ color: '#334155', fontSize: '0.68rem' }}>
                          {job.employment_type?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}

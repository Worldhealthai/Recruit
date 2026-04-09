import { Suspense } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import CandidateFilters from '../components/CandidateFilters'
import { prisma } from '@/lib/prisma'

// ── Colour maps ───────────────────────────────────────────────────────────────

const availabilityColor: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e', OPEN_TO_OFFERS: '#f59e0b',
  PASSIVE: '#64748b', NOT_LOOKING: '#475569', UNAVAILABLE: '#ef4444',
}
const availabilityLabel: Record<string, string> = {
  ACTIVELY_LOOKING: 'Actively Looking', OPEN_TO_OFFERS: 'Open to Offers',
  PASSIVE: 'Passive', NOT_LOOKING: 'Not Looking', UNAVAILABLE: 'Unavailable',
}
const seniorityColor: Record<string, string> = {
  INTERN: '#64748b', JUNIOR: '#22c55e', MID: '#3b82f6', SENIOR: '#8b5cf6',
  LEAD: '#f59e0b', MANAGER: '#f59e0b', SENIOR_MANAGER: '#f97316',
  DIRECTOR: '#ef4444', VP: '#ef4444', C_SUITE: '#ef4444',
}
const avatarColors = ['#6366f1','#8b5cf6','#3b82f6','#06b6d4','#22c55e','#f59e0b','#f97316','#ef4444']

function nameColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return avatarColors[Math.abs(h) % avatarColors.length]
}

function yearsFrom(date: Date | null | undefined): number | null {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365))
}

// ── Query helpers ─────────────────────────────────────────────────────────────

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : (v ?? '')
}
function lst(v: string | string[] | undefined): string[] {
  const s = str(v)
  return s ? s.split(',').filter(Boolean) : []
}

async function getCandidates(sp: Record<string, string | string[] | undefined>) {
  const q          = str(sp.q)
  const title      = str(sp.title)
  const company    = str(sp.company)
  const industries = lst(sp.industry)
  const departments= lst(sp.department)
  const avail      = lst(sp.availability)
  const seniority  = lst(sp.seniority)
  const skills     = lst(sp.skills)
  const country    = str(sp.country)
  const location   = str(sp.location)
  const region     = str(sp.region)
  const remote     = str(sp.remote)
  const reloc      = str(sp.relocation)
  const minExp     = str(sp.min_exp)
  const maxExp     = str(sp.max_exp)
  const maxNotice  = str(sp.max_notice)
  const minSalary  = str(sp.min_salary)
  const maxSalary  = str(sp.max_salary)

  const where: Prisma.CandidateWhereInput = {}
  const and: Prisma.CandidateWhereInput[] = []

  // Keyword: name, current title, or current company
  if (q) {
    and.push({ OR: [
      { first_name:      { contains: q, mode: 'insensitive' } },
      { last_name:       { contains: q, mode: 'insensitive' } },
      { current_title:   { contains: q, mode: 'insensitive' } },
      { current_company: { name: { contains: q, mode: 'insensitive' } } },
    ]})
  }
  if (title)         and.push({ current_title: { contains: title, mode: 'insensitive' } })
  if (company)       and.push({ current_company: { name: { contains: company, mode: 'insensitive' } } })
  if (industries.length) and.push({ current_company: { industry: { in: industries } } })
  if (departments.length) and.push({ current_department: { in: departments } })
  if (avail.length)  where.availability_status = { in: avail as Prisma.EnumAvailabilityStatusFilter['in'] }
  if (seniority.length) where.seniority_level  = { in: seniority as Prisma.EnumSeniorityLevelFilter['in'] }
  if (remote === '1')   where.is_remote_open   = true
  if (reloc === '1')    where.is_relocation_open = true
  if (country)          where.location_country = { contains: country, mode: 'insensitive' }
  if (location)         where.location_city    = { contains: location, mode: 'insensitive' }
  if (region)           where.region           = { contains: region, mode: 'insensitive' }
  if (maxNotice)        where.notice_period_days = { lte: parseInt(maxNotice) }
  if (minExp || maxExp) {
    where.years_experience = {}
    if (minExp) (where.years_experience as Prisma.IntNullableFilter).gte = parseInt(minExp)
    if (maxExp) (where.years_experience as Prisma.IntNullableFilter).lte = parseInt(maxExp)
  }
  if (minSalary || maxSalary) {
    where.salary_expectation_min = {}
    if (minSalary) (where.salary_expectation_min as Prisma.DecimalNullableFilter).gte = parseFloat(minSalary)
    if (maxSalary) (where.salary_expectation_min as Prisma.DecimalNullableFilter).lte = parseFloat(maxSalary)
  }
  if (skills.length) and.push({ skills: { some: { skill: { name: { in: skills } } } } })
  if (and.length) where.AND = and

  try {
    return await prisma.candidate.findMany({
      where,
      include: {
        skills: { include: { skill: true } },
        current_company: true,
        experiences: {
          where: { is_current: true },
          select: { start_date: true, company_id: true, department: true },
          take: 1,
          orderBy: { start_date: 'desc' },
        },
      },
      take: 60,
      orderBy: { created_at: 'desc' },
    })
  } catch { return [] }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const candidates = await getCandidates(searchParams)

  const activeFilters: string[] = []
  if (str(searchParams.q))                          activeFilters.push(`"${str(searchParams.q)}"`)
  if (str(searchParams.title))                      activeFilters.push(`Title: ${str(searchParams.title)}`)
  if (str(searchParams.company))                    activeFilters.push(`Employer: ${str(searchParams.company)}`)
  if (lst(searchParams.industry).length)            activeFilters.push(`Industry (${lst(searchParams.industry).length})`)
  if (lst(searchParams.department).length)          activeFilters.push(`Dept (${lst(searchParams.department).length})`)
  if (lst(searchParams.seniority).length)           activeFilters.push(`Seniority (${lst(searchParams.seniority).length})`)
  if (lst(searchParams.availability).length)        activeFilters.push(`Availability (${lst(searchParams.availability).length})`)
  if (lst(searchParams.skills).length)              activeFilters.push(`Skills (${lst(searchParams.skills).length})`)
  if (str(searchParams.country))                    activeFilters.push(str(searchParams.country))
  if (str(searchParams.location))                   activeFilters.push(str(searchParams.location))
  if (str(searchParams.region))                     activeFilters.push(str(searchParams.region))
  if (str(searchParams.remote) === '1')             activeFilters.push('Remote open')
  if (str(searchParams.relocation) === '1')         activeFilters.push('Open to relocation')
  if (str(searchParams.min_exp)||str(searchParams.max_exp)) activeFilters.push('Experience range')
  if (str(searchParams.max_notice))                 activeFilters.push('Notice period')
  if (str(searchParams.min_salary)||str(searchParams.max_salary)) activeFilters.push('Salary range')

  return (
    <PageShell
      active="/candidates"
      title="Talent Pool"
      subtitle="Click any candidate to view their full profile and add them to your pipeline"
      badge="Candidates"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Sidebar */}
        <Suspense fallback={
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.875rem', padding: '1.25rem', height: '600px' }}>
            <div style={{ color: '#475569', fontSize: '0.82rem' }}>Loading filters…</div>
          </div>
        }>
          <CandidateFilters totalResults={candidates.length} />
        </Suspense>

        {/* Results */}
        <div>
          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
              {activeFilters.map(f => (
                <span key={f} style={{
                  background: 'rgba(99,102,241,0.12)', color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.28)', borderRadius: '999px',
                  padding: '0.18rem 0.7rem', fontSize: '0.73rem', fontWeight: 600,
                }}>{f}</span>
              ))}
              <span style={{ color: '#334155', fontSize: '0.75rem' }}>
                — {candidates.length} result{candidates.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {candidates.length === 0 ? (
            <EmptyState
              icon="👤"
              message="No candidates match your filters"
              hint="Try adjusting or clearing filters. Seed the database first if empty."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {candidates.map((c) => {
                const color        = nameColor(c.first_name + c.last_name)
                const initials     = `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
                const sColor       = seniorityColor[c.seniority_level] ?? '#64748b'
                const aColor       = availabilityColor[c.availability_status] ?? '#64748b'
                const currentExp   = c.experiences[0] ?? null
                const yrsInRole    = currentExp ? yearsFrom(currentExp.start_date) : null
                const dept         = c.current_department ?? currentExp?.department ?? null
                const industry     = c.current_company?.industry ?? null
                const topSkills    = c.skills.slice(0, 5)
                const extraSkills  = c.skills.length - topSkills.length
                const salMin       = c.salary_expectation_min ? Math.round(Number(c.salary_expectation_min) / 1000) : null
                const salMax       = c.salary_expectation_max ? Math.round(Number(c.salary_expectation_max) / 1000) : null

                return (
                  <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="candidate-card" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.875rem',
                      padding: '1.25rem 1.4rem',
                      cursor: 'pointer',
                    }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

                        {/* Avatar */}
                        <div style={{
                          width: '48px', height: '48px', borderRadius: '0.7rem', flexShrink: 0,
                          background: `${color}1a`, border: `1px solid ${color}33`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, fontSize: '0.95rem', color, letterSpacing: '-0.02em',
                        }}>
                          {initials}
                        </div>

                        {/* Main content */}
                        <div style={{ flex: 1, minWidth: 0 }}>

                          {/* Row 1: name + seniority + availability */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#f1f5f9' }}>
                              {c.first_name} {c.last_name}
                            </span>
                            <span style={{
                              background: `${sColor}18`, color: sColor, border: `1px solid ${sColor}30`,
                              borderRadius: '0.25rem', padding: '0.08rem 0.45rem', fontSize: '0.64rem', fontWeight: 700,
                            }}>
                              {c.seniority_level.replace(/_/g, ' ')}
                            </span>
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: aColor, fontWeight: 700 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: aColor }} />
                              {availabilityLabel[c.availability_status] ?? c.availability_status.replace(/_/g, ' ')}
                            </span>
                          </div>

                          {/* Row 2: title + employer + industry */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.1rem' }}>
                            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{c.current_title}</span>
                            {c.current_company && (
                              <>
                                <span style={{ color: '#334155', fontSize: '0.75rem' }}>@</span>
                                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{c.current_company.name}</span>
                              </>
                            )}
                            {industry && (
                              <>
                                <span style={{ color: '#1e293b', fontSize: '0.7rem' }}>·</span>
                                <span style={{ fontSize: '0.74rem', color: '#475569' }}>{industry}</span>
                              </>
                            )}
                          </div>

                          {/* Row 3: department */}
                          {dept && (
                            <div style={{ fontSize: '0.74rem', color: '#475569', marginBottom: '0.1rem' }}>
                              {dept}
                            </div>
                          )}

                          {/* Summary */}
                          {c.summary && (
                            <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.4rem', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {c.summary}
                            </div>
                          )}

                          {/* Skills */}
                          {topSkills.length > 0 && (
                            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.65rem' }}>
                              {topSkills.map(cs => (
                                <span key={cs.skill.name} style={{
                                  background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                                  border: '1px solid rgba(99,102,241,0.2)',
                                  borderRadius: '0.25rem', padding: '0.12rem 0.42rem', fontSize: '0.69rem',
                                }}>
                                  {cs.skill.name}
                                </span>
                              ))}
                              {extraSkills > 0 && (
                                <span style={{ color: '#475569', fontSize: '0.69rem', alignSelf: 'center' }}>+{extraSkills}</span>
                              )}
                            </div>
                          )}

                          {/* Bottom row: stats + location */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                            {/* Stat pills */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              {c.years_experience != null && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.3rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                                  {c.years_experience}y exp
                                </span>
                              )}
                              {yrsInRole != null && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.3rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                                  {yrsInRole}y in role
                                </span>
                              )}
                              {c.notice_period_days != null && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.3rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                                  {c.notice_period_days === 0 ? 'Immediate' : `${c.notice_period_days}d notice`}
                                </span>
                              )}
                              {salMin != null && (
                                <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.3rem', padding: '0.15rem 0.5rem', fontSize: '0.7rem', color: '#94a3b8' }}>
                                  £{salMin}k{salMax && salMax !== salMin ? `–£${salMax}k` : '+'}
                                </span>
                              )}
                            </div>

                            {/* Location + remote/reloc */}
                            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
                              <span style={{ color: '#475569', fontSize: '0.72rem' }}>
                                📍 {c.location_city}{c.location_country && c.location_country !== 'United Kingdom' ? `, ${c.location_country}` : ''}
                              </span>
                              {c.is_remote_open && (
                                <span style={{ background: 'rgba(34,197,94,0.08)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', fontSize: '0.64rem', fontWeight: 600 }}>Remote</span>
                              )}
                              {c.is_relocation_open && (
                                <span style={{ background: 'rgba(59,130,246,0.08)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', fontSize: '0.64rem', fontWeight: 600 }}>Relocation</span>
                              )}
                            </div>
                          </div>
                        </div>
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

import { Suspense } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import Nav from '../components/Nav'
import EmptyState from '../components/EmptyState'
import CandidateFilters from '../components/CandidateFilters'
import CandidateSearchBar from '../components/CandidateSearchBar'
import { prisma } from '@/lib/prisma'

// ── Avatar palette ────────────────────────────────────────────────────────────

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316']

function nameColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function availDot(status: string): { color: string; label: string } {
  if (status === 'ACTIVELY_LOOKING') return { color: '#22c55e', label: 'Active' }
  if (status === 'OPEN_TO_OFFERS')   return { color: '#f59e0b', label: 'Open' }
  if (status === 'PASSIVE')          return { color: '#d1d5db', label: 'Passive' }
  if (status === 'NOT_LOOKING')      return { color: '#e5e7eb', label: 'Not looking' }
  return { color: '#ef4444', label: 'Unavailable' }
}

function yearsFrom(date: Date | null | undefined): number | null {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365))
}

// ── Query ─────────────────────────────────────────────────────────────────────

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : (v ?? '')
}
function lst(v: string | string[] | undefined): string[] {
  const s = str(v)
  return s ? s.split(',').filter(Boolean) : []
}

async function getCandidates(sp: Record<string, string | string[] | undefined>) {
  const q           = str(sp.q)
  const title       = str(sp.title)
  const company     = str(sp.company)
  const industries  = lst(sp.industry)
  const departments = lst(sp.department)
  const avail       = lst(sp.availability)
  const seniority   = lst(sp.seniority)
  const skills      = lst(sp.skills)
  const country     = str(sp.country)
  const location    = str(sp.location)
  const region      = str(sp.region)
  const remote      = str(sp.remote)
  const reloc       = str(sp.relocation)
  const minExp      = str(sp.min_exp)
  const maxExp      = str(sp.max_exp)
  const maxNotice   = str(sp.max_notice)
  const minSalary   = str(sp.min_salary)
  const maxSalary   = str(sp.max_salary)

  const where: Prisma.CandidateWhereInput = {}
  const and: Prisma.CandidateWhereInput[] = []

  if (q) {
    and.push({ OR: [
      { first_name:      { contains: q, mode: 'insensitive' } },
      { last_name:       { contains: q, mode: 'insensitive' } },
      { current_title:   { contains: q, mode: 'insensitive' } },
      { current_company: { name: { contains: q, mode: 'insensitive' } } },
    ]})
  }
  if (title)              and.push({ current_title:   { contains: title,   mode: 'insensitive' } })
  if (company)            and.push({ current_company: { name: { contains: company, mode: 'insensitive' } } })
  if (industries.length)  and.push({ current_company: { industry: { in: industries } } })
  if (departments.length) and.push({ current_department: { in: departments } })
  if (avail.length)       where.availability_status = { in: avail as Prisma.EnumAvailabilityStatusFilter['in'] }
  if (seniority.length)   where.seniority_level     = { in: seniority as Prisma.EnumSeniorityLevelFilter['in'] }
  if (remote === '1')     where.is_remote_open      = true
  if (reloc === '1')      where.is_relocation_open  = true
  if (country)            where.location_country    = { contains: country,  mode: 'insensitive' }
  if (location)           where.location_city       = { contains: location, mode: 'insensitive' }
  if (region)             where.region              = { contains: region,   mode: 'insensitive' }
  if (maxNotice)          where.notice_period_days  = { lte: parseInt(maxNotice) }
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
          select: { start_date: true, department: true },
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

  const statPill: React.CSSProperties = {
    background: '#f3f4f6', borderRadius: '4px',
    padding: '0.1rem 0.42rem', fontSize: '0.7rem', color: '#6b7280',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fb', color: '#111111', fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <Nav active="/candidates" />

      <div className="page-content" style={{ maxWidth: '1380px', margin: '0 auto', padding: '2rem 2.5rem' }}>

        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: '#111111', margin: '0 0 0.25rem' }}>
            Talent Pool
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '0.83rem', margin: 0 }}>
            Search and filter your entire candidate database
          </p>
        </div>

        <Suspense fallback={
          <div style={{ height: '52px', background: '#fff', borderRadius: '0.75rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }} />
        }>
          <CandidateSearchBar totalResults={candidates.length} />
        </Suspense>

        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          <Suspense fallback={
            <div style={{ height: '600px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} />
          }>
            <CandidateFilters />
          </Suspense>

          <div>
            {candidates.length === 0 ? (
              <EmptyState
                icon="👤"
                message="No candidates match your search"
                hint="Try adjusting your filters, or seed the database if empty."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                {candidates.map((c) => {
                  const color       = nameColor(c.first_name + c.last_name)
                  const initials    = `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
                  const avail       = availDot(c.availability_status)
                  const currentExp  = c.experiences[0] ?? null
                  const yrsInRole   = currentExp ? yearsFrom(currentExp.start_date) : null
                  const dept        = c.current_department ?? currentExp?.department ?? null
                  const industry    = c.current_company?.industry ?? null
                  const topSkills   = c.skills.slice(0, 6)
                  const extraSkills = c.skills.length - topSkills.length
                  const salMin      = c.salary_expectation_min ? Math.round(Number(c.salary_expectation_min) / 1000) : null
                  const salMax      = c.salary_expectation_max ? Math.round(Number(c.salary_expectation_max) / 1000) : null

                  return (
                    <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <div className="candidate-card" style={{
                        background: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.07)',
                        borderRadius: '12px',
                        padding: '1rem 1.35rem',
                        cursor: 'pointer',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

                          {/* Avatar */}
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                            background: `${color}15`, border: `2px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 800, fontSize: '0.82rem', color, letterSpacing: '-0.02em',
                          }}>
                            {initials}
                          </div>

                          <div style={{ flex: 1, minWidth: 0 }}>

                            {/* Row 1: name + seniority + availability */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111111', letterSpacing: '-0.01em' }}>
                                {c.first_name} {c.last_name}
                              </span>
                              <span style={{
                                border: '1px solid rgba(0,0,0,0.12)', borderRadius: '4px',
                                padding: '0.04rem 0.38rem', fontSize: '0.62rem', fontWeight: 600,
                                color: '#9ca3af', letterSpacing: '0.04em', textTransform: 'uppercase',
                              }}>
                                {c.seniority_level.replace(/_/g, ' ')}
                              </span>
                              <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}>
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: avail.color, border: avail.color === '#e5e7eb' || avail.color === '#d1d5db' ? '1px solid #d1d5db' : 'none' }} />
                                <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 500 }}>{avail.label}</span>
                              </span>
                            </div>

                            {/* Row 2: title · company · industry */}
                            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.2rem', marginBottom: dept ? '0.08rem' : '0.4rem' }}>
                              {c.current_title && (
                                <span style={{ fontSize: '0.84rem', color: '#374151', fontWeight: 500 }}>{c.current_title}</span>
                              )}
                              {c.current_company && (
                                <span style={{ fontSize: '0.81rem', color: '#9ca3af' }}>· {c.current_company.name}</span>
                              )}
                              {industry && (
                                <span style={{ fontSize: '0.78rem', color: '#c0c8d4' }}>· {industry}</span>
                              )}
                            </div>

                            {dept && (
                              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.35rem' }}>{dept}</div>
                            )}

                            {c.summary && (
                              <div style={{
                                fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.55,
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                marginBottom: '0.6rem',
                              }}>
                                {c.summary}
                              </div>
                            )}

                            {topSkills.length > 0 && (
                              <div style={{ display: 'flex', gap: '0.22rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                                {topSkills.map(cs => (
                                  <span key={cs.skill.name} style={{
                                    background: '#f3f4f6', color: '#374151',
                                    borderRadius: '4px', padding: '0.1rem 0.42rem',
                                    fontSize: '0.7rem', fontWeight: 500,
                                  }}>
                                    {cs.skill.name}
                                  </span>
                                ))}
                                {extraSkills > 0 && (
                                  <span style={{ fontSize: '0.7rem', color: '#9ca3af', alignSelf: 'center' }}>+{extraSkills}</span>
                                )}
                              </div>
                            )}

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                                {c.years_experience != null && <span style={statPill}>{c.years_experience}y exp</span>}
                                {yrsInRole != null && <span style={statPill}>{yrsInRole}y in role</span>}
                                {c.notice_period_days != null && (
                                  <span style={statPill}>
                                    {c.notice_period_days === 0 ? 'Immediate' : `${c.notice_period_days}d notice`}
                                  </span>
                                )}
                                {salMin != null && (
                                  <span style={{ ...statPill, color: '#059669', background: '#f0fdf4' }}>
                                    £{salMin}k{salMax && salMax !== salMin ? `–£${salMax}k` : '+'}
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {(c.location_city || c.location_country) && (
                                  <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                                    {c.location_city || c.location_country}
                                  </span>
                                )}
                                {c.is_remote_open && (
                                  <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '4px', padding: '0.08rem 0.38rem', fontSize: '0.65rem', fontWeight: 600 }}>
                                    Remote
                                  </span>
                                )}
                                {c.is_relocation_open && (
                                  <span style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '4px', padding: '0.08rem 0.38rem', fontSize: '0.65rem', fontWeight: 600 }}>
                                    Relocation
                                  </span>
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
      </div>
    </div>
  )
}

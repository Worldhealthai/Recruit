import { Suspense } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import CandidateFilters from '../components/CandidateFilters'
import { prisma } from '@/lib/prisma'

const availabilityColor: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e',
  OPEN_TO_OFFERS: '#f59e0b',
  PASSIVE: '#64748b',
  NOT_LOOKING: '#475569',
  UNAVAILABLE: '#ef4444',
}
const availabilityLabel: Record<string, string> = {
  ACTIVELY_LOOKING: 'Actively Looking',
  OPEN_TO_OFFERS: 'Open to Offers',
  PASSIVE: 'Passive',
  NOT_LOOKING: 'Not Looking',
  UNAVAILABLE: 'Unavailable',
}
const seniorityColor: Record<string, string> = {
  INTERN: '#64748b', JUNIOR: '#22c55e', MID: '#3b82f6', SENIOR: '#8b5cf6',
  LEAD: '#f59e0b', MANAGER: '#f59e0b', SENIOR_MANAGER: '#f97316',
  DIRECTOR: '#ef4444', VP: '#ef4444', C_SUITE: '#ef4444',
}

// Generate a consistent color from a name
function nameToColor(name: string): string {
  const colors = ['#6366f1','#8b5cf6','#3b82f6','#06b6d4','#22c55e','#f59e0b','#f97316','#ef4444']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : (v ?? '')
}
function lst(v: string | string[] | undefined): string[] {
  const s = str(v)
  return s ? s.split(',').filter(Boolean) : []
}

async function getCandidates(sp: Record<string, string | string[] | undefined>) {
  const q         = str(sp.q)
  const avail     = lst(sp.availability)
  const seniority = lst(sp.seniority)
  const skills    = lst(sp.skills)
  const location  = str(sp.location)
  const remote    = str(sp.remote)
  const reloc     = str(sp.relocation)
  const minExp    = str(sp.min_exp)
  const maxExp    = str(sp.max_exp)
  const maxNotice = str(sp.max_notice)

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
  if (avail.length)     where.availability_status = { in: avail as Prisma.EnumAvailabilityStatusFilter['in'] }
  if (seniority.length) where.seniority_level      = { in: seniority as Prisma.EnumSeniorityLevelFilter['in'] }
  if (remote === '1')   where.is_remote_open        = true
  if (reloc === '1')    where.is_relocation_open    = true
  if (location)         where.location_city         = { contains: location, mode: 'insensitive' }
  if (maxNotice)        where.notice_period_days    = { lte: parseInt(maxNotice) }
  if (minExp || maxExp) {
    where.years_experience = {}
    if (minExp) (where.years_experience as Prisma.IntNullableFilter).gte = parseInt(minExp)
    if (maxExp) (where.years_experience as Prisma.IntNullableFilter).lte = parseInt(maxExp)
  }
  if (skills.length) {
    and.push({ skills: { some: { skill: { name: { in: skills } } } } })
  }
  if (and.length) where.AND = and

  try {
    return await prisma.candidate.findMany({
      where,
      include: { skills: { include: { skill: true } }, current_company: true },
      take: 60,
      orderBy: { created_at: 'desc' },
    })
  } catch { return [] }
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>
}) {
  const candidates = await getCandidates(searchParams)

  const activeFilters: { label: string; key: string }[] = []
  if (str(searchParams.q))                              activeFilters.push({ label: `"${str(searchParams.q)}"`, key: 'q' })
  if (lst(searchParams.availability).length)            activeFilters.push({ label: `Availability (${lst(searchParams.availability).length})`, key: 'availability' })
  if (lst(searchParams.seniority).length)               activeFilters.push({ label: `Seniority (${lst(searchParams.seniority).length})`, key: 'seniority' })
  if (str(searchParams.remote) === '1')                 activeFilters.push({ label: 'Remote open', key: 'remote' })
  if (str(searchParams.relocation) === '1')             activeFilters.push({ label: 'Open to relocation', key: 'relocation' })
  if (str(searchParams.location))                       activeFilters.push({ label: str(searchParams.location), key: 'location' })
  if (lst(searchParams.skills).length)                  activeFilters.push({ label: `Skills (${lst(searchParams.skills).length})`, key: 'skills' })

  return (
    <PageShell
      active="/candidates"
      title="Talent Pool"
      subtitle={`${candidates.length} candidate${candidates.length !== 1 ? 's' : ''} — click any candidate to view their profile and add to pipeline`}
      badge="Candidates"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Filter sidebar */}
        <Suspense fallback={
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', height: '600px' }}>
            <div style={{ color: '#475569', fontSize: '0.82rem' }}>Loading filters…</div>
          </div>
        }>
          <CandidateFilters totalResults={candidates.length} />
        </Suspense>

        {/* Results */}
        <div>
          {/* Active filter chips + result count */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.1rem', minHeight: '28px' }}>
            {activeFilters.map(f => (
              <span key={f.key} style={{
                background: 'rgba(99,102,241,0.14)', color: '#a5b4fc',
                border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px',
                padding: '0.2rem 0.8rem', fontSize: '0.75rem', fontWeight: 600,
              }}>{f.label}</span>
            ))}
            {activeFilters.length > 0 && (
              <span style={{ color: '#475569', fontSize: '0.78rem' }}>
                — {candidates.length} result{candidates.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {candidates.length === 0 ? (
            <EmptyState
              icon="👤"
              message="No candidates match your filters"
              hint="Try adjusting or clearing filters. Seed the database first if empty."
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {candidates.map((c) => {
                const seniority    = c.seniority_level
                const availability = c.availability_status
                const avatarColor  = nameToColor(c.first_name + c.last_name)
                const initials     = `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
                const topSkills    = c.skills.slice(0, 4)
                const extraSkills  = c.skills.length - topSkills.length

                return (
                  <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="candidate-card" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.875rem',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem',
                    }}>

                      {/* Top row: avatar + name + seniority */}
                      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '0.6rem',
                          background: `${avatarColor}22`,
                          border: `1px solid ${avatarColor}44`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', fontWeight: 800, color: avatarColor,
                          flexShrink: 0,
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.2 }}>
                              {c.first_name} {c.last_name}
                            </div>
                            <span style={{
                              background: `${seniorityColor[seniority] ?? '#64748b'}1a`,
                              color: seniorityColor[seniority] ?? '#64748b',
                              border: `1px solid ${seniorityColor[seniority] ?? '#64748b'}33`,
                              borderRadius: '0.25rem', padding: '0.1rem 0.45rem',
                              fontSize: '0.64rem', fontWeight: 700, flexShrink: 0,
                            }}>
                              {seniority?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem', lineHeight: 1.3 }}>
                            {c.current_title}
                          </div>
                          {c.current_company && (
                            <div style={{ color: '#475569', fontSize: '0.74rem', marginTop: '0.1rem' }}>
                              @ {c.current_company.name}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skills */}
                      {topSkills.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {topSkills.map((cs) => (
                            <span key={cs.skill.name} style={{
                              background: 'rgba(99,102,241,0.1)', color: '#818cf8',
                              border: '1px solid rgba(99,102,241,0.2)',
                              borderRadius: '0.25rem', padding: '0.15rem 0.45rem',
                              fontSize: '0.7rem', fontWeight: 500,
                            }}>
                              {cs.skill.name}
                            </span>
                          ))}
                          {extraSkills > 0 && (
                            <span style={{ color: '#475569', fontSize: '0.7rem', alignSelf: 'center' }}>
                              +{extraSkills} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats row */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.4rem',
                        background: 'rgba(255,255,255,0.025)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '0.5rem',
                        padding: '0.6rem 0.75rem',
                      }}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
                            {c.years_experience ?? '—'}
                            {c.years_experience != null && <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '1px' }}>y</span>}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Exp</div>
                        </div>
                        <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.06)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>
                            {c.notice_period_days ?? '—'}
                            {c.notice_period_days != null && <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: '1px' }}>d</span>}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Notice</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#f1f5f9' }}>
                            {c.salary_expectation_min
                              ? `£${Math.round(Number(c.salary_expectation_min) / 1000)}k`
                              : '—'}
                          </div>
                          <div style={{ fontSize: '0.62rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Salary</div>
                        </div>
                      </div>

                      {/* Footer: location + availability */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                          <span style={{ color: '#475569', fontSize: '0.73rem' }}>
                            📍 {c.location_city}
                          </span>
                          {c.is_remote_open && (
                            <span style={{
                              background: 'rgba(34,197,94,0.1)', color: '#4ade80',
                              border: '1px solid rgba(34,197,94,0.2)',
                              borderRadius: '0.25rem', padding: '0.1rem 0.4rem', fontSize: '0.64rem', fontWeight: 600,
                            }}>Remote</span>
                          )}
                        </div>
                        <span style={{
                          color: availabilityColor[availability] ?? '#64748b',
                          fontSize: '0.7rem', fontWeight: 700,
                          display: 'flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: availabilityColor[availability] ?? '#64748b', display: 'inline-block' }} />
                          {availabilityLabel[availability] ?? availability?.replace(/_/g, ' ')}
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

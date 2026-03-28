import { Suspense } from 'react'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import CandidateFilters from '../components/CandidateFilters'
import { prisma } from '@/lib/prisma'

const availabilityColor: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e', OPEN_TO_OFFERS: '#f59e0b',
  PASSIVE: '#64748b', NOT_LOOKING: '#475569', UNAVAILABLE: '#ef4444',
}
const seniorityColor: Record<string, string> = {
  INTERN: '#64748b', JUNIOR: '#22c55e', MID: '#3b82f6', SENIOR: '#8b5cf6',
  LEAD: '#f59e0b', MANAGER: '#f59e0b', SENIOR_MANAGER: '#f97316',
  DIRECTOR: '#ef4444', VP: '#ef4444', C_SUITE: '#ef4444',
}

function str(v: string | string[] | undefined): string {
  return Array.isArray(v) ? v[0] : (v ?? '')
}
function lst(v: string | string[] | undefined): string[] {
  const s = str(v)
  return s ? s.split(',').filter(Boolean) : []
}

async function getCandidates(sp: Record<string, string | string[] | undefined>) {
  const q        = str(sp.q)
  const avail    = lst(sp.availability)
  const seniority= lst(sp.seniority)
  const skills   = lst(sp.skills)
  const location = str(sp.location)
  const remote   = str(sp.remote)
  const reloc    = str(sp.relocation)
  const minExp   = str(sp.min_exp)
  const maxExp   = str(sp.max_exp)
  const maxNotice= str(sp.max_notice)

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
  if (avail.length)    where.availability_status = { in: avail as Prisma.EnumAvailabilityStatusFilter['in'] }
  if (seniority.length)where.seniority_level     = { in: seniority as Prisma.EnumSeniorityLevelFilter['in'] }
  if (remote === '1')  where.is_remote_open       = true
  if (reloc === '1')   where.is_relocation_open   = true
  if (location)        where.location_city        = { contains: location, mode: 'insensitive' }
  if (maxNotice)       where.notice_period_days   = { lte: parseInt(maxNotice) }
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

  // Active filter summary chips
  const activeFilters: { label: string; key: string }[] = []
  if (str(searchParams.q))           activeFilters.push({ label: `"${str(searchParams.q)}"`, key: 'q' })
  if (lst(searchParams.availability).length) activeFilters.push({ label: `Availability (${lst(searchParams.availability).length})`, key: 'availability' })
  if (lst(searchParams.seniority).length)    activeFilters.push({ label: `Seniority (${lst(searchParams.seniority).length})`, key: 'seniority' })
  if (str(searchParams.remote) === '1')      activeFilters.push({ label: 'Remote open', key: 'remote' })
  if (str(searchParams.relocation) === '1')  activeFilters.push({ label: 'Open to relocation', key: 'relocation' })
  if (str(searchParams.location))            activeFilters.push({ label: str(searchParams.location), key: 'location' })
  if (lst(searchParams.skills).length)       activeFilters.push({ label: `Skills (${lst(searchParams.skills).length})`, key: 'skills' })

  return (
    <PageShell
      active="/candidates"
      title="Candidates"
      subtitle="Search and filter talent across every UK industry"
      badge="Talent Pool"
    >
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Filter sidebar */}
        <Suspense fallback={
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', height: '600px' }}>
            <div style={{ color: '#475569', fontSize: '0.82rem' }}>Loading filters...</div>
          </div>
        }>
          <CandidateFilters totalResults={candidates.length} />
        </Suspense>

        {/* Results */}
        <div>
          {/* Active filter pills */}
          {activeFilters.length > 0 && (
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
              {activeFilters.map(f => (
                <span key={f.key} style={{
                  background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
                  border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px',
                  padding: '0.2rem 0.75rem', fontSize: '0.78rem', fontWeight: 600,
                }}>{f.label}</span>
              ))}
              <span style={{ color: '#475569', fontSize: '0.78rem', alignSelf: 'center' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.9rem' }}>
              {candidates.map((c) => {
                const seniority = c.seniority_level
                const availability = c.availability_status
                return (
                  <Link key={c.id} href={`/candidates/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="hover-card" style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '0.75rem',
                      padding: '1.1rem 1.25rem',
                      cursor: 'pointer', height: '100%',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{c.first_name} {c.last_name}</div>
                        <span style={{
                          background: `${seniorityColor[seniority] ?? '#64748b'}22`,
                          color: seniorityColor[seniority] ?? '#64748b',
                          border: `1px solid ${seniorityColor[seniority] ?? '#64748b'}33`,
                          borderRadius: '0.25rem', padding: '0.1rem 0.4rem',
                          fontSize: '0.65rem', fontWeight: 700, flexShrink: 0, marginLeft: '0.5rem',
                        }}>
                          {seniority?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.1rem' }}>{c.current_title}</div>
                      {c.current_company && (
                        <div style={{ color: '#475569', fontSize: '0.75rem', marginBottom: '0.6rem' }}>@ {c.current_company.name}</div>
                      )}

                      <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {c.skills.slice(0, 3).map((cs) => (
                          <span key={cs.skill.name} style={{
                            background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                            borderRadius: '0.2rem', padding: '0.1rem 0.4rem', fontSize: '0.68rem',
                          }}>
                            {cs.skill.name}
                          </span>
                        ))}
                        {c.skills.length > 3 && (
                          <span style={{ color: '#475569', fontSize: '0.68rem', alignSelf: 'center' }}>+{c.skills.length - 3}</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '0.72rem' }}>📍 {c.location_city}</span>
                        <span style={{
                          color: availabilityColor[availability] ?? '#64748b',
                          fontSize: '0.68rem', fontWeight: 700,
                        }}>● {availability?.replace(/_/g, ' ')}</span>
                      </div>

                      {c.years_experience != null && (
                        <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                          {c.years_experience}y exp
                          {c.salary_expectation_min && ` · £${Number(c.salary_expectation_min).toLocaleString()}+`}
                        </div>
                      )}
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

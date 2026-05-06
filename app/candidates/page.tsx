export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { Prisma } from '@prisma/client'
import AppShell from '../components/AppShell'
import EmptyState from '../components/EmptyState'
import CandidateFilters from '../components/CandidateFilters'
import CandidateSearchBar from '../components/CandidateSearchBar'
import CandidateCardList from './CandidateCardList'
import { prisma } from '@/lib/prisma'

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
  const raw = await getCandidates(searchParams)

  // Serialize Prisma Decimal fields so they cross the server→client boundary as plain numbers
  const candidates = raw.map(c => ({
    ...c,
    salary_expectation_min: c.salary_expectation_min != null ? Number(c.salary_expectation_min) : null,
    salary_expectation_max: c.salary_expectation_max != null ? Number(c.salary_expectation_max) : null,
  }))

  return (
    <AppShell>
      <div className="page-content" style={{ padding: '1.5rem 2rem 3rem' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#f8fafc', margin: '0 0 0.25rem' }}>
              Candidate database
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              {candidates.length.toLocaleString()} profiles · live from LinkedIn, Indeed &amp; CV Library
            </p>
          </div>
        </div>

        <Suspense fallback={
          <div style={{ height: '52px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', marginBottom: '1.5rem' }} />
        }>
          <CandidateSearchBar totalResults={candidates.length} />
        </Suspense>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.25rem', alignItems: 'start' }}>

          <Suspense fallback={
            <div style={{ height: '600px', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem' }} />
          }>
            <CandidateFilters />
          </Suspense>

          <div>
            {candidates.length === 0 ? (
              <EmptyState
                icon="◈"
                message="No candidates match your search"
                hint="Try adjusting your filters, or seed the database if empty."
              />
            ) : (
              <CandidateCardList candidates={candidates} />
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

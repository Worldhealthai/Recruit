export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getCompanies() {
  try {
    return await prisma.company.findMany({
      include: { _count: { select: { jobs: true, candidates: true } } },
      take: 20,
      orderBy: { name: 'asc' },
    })
  } catch {
    return []
  }
}

const sizeLabels: Record<string, string> = {
  STARTUP: '1–50',
  SMALL: '51–200',
  MEDIUM: '201–1000',
  LARGE: '1001–5000',
  ENTERPRISE: '5000+',
}

export default async function CompaniesPage() {
  const companies = await getCompanies()

  return (
    <PageShell
      active="/companies"
      title="Companies"
      subtitle="Company profiles and organisation data"
      badge="Directory"
    >
      {companies.length === 0 ? (
        <EmptyState
          icon="🏢"
          message="No companies yet"
          hint="Companies will appear here once the database is connected and seeded."
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1rem',
        }}>
          {companies.map((c) => {
            const counts = c._count
            const size = c.company_size

            return (
              <Link key={c.id} href={`/companies/${c.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hover-card" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
              }}
              >
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{c.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  {c.industry}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                    👥 {sizeLabels[size] ?? size} employees
                  </span>
                  {c.headquarters_country && (
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      📍 {c.headquarters_country}
                    </span>
                  )}
                </div>

                {counts && (
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span style={{
                      background: 'rgba(99,102,241,0.12)',
                      color: '#a5b4fc',
                      borderRadius: '0.25rem',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>
                      {counts.jobs} open jobs
                    </span>
                    <span style={{
                      background: 'rgba(99,102,241,0.12)',
                      color: '#a5b4fc',
                      borderRadius: '0.25rem',
                      padding: '0.15rem 0.5rem',
                      fontSize: '0.75rem',
                    }}>
                      {counts.candidates} candidates
                    </span>
                  </div>
                )}
              </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

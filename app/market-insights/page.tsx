export const dynamic = 'force-dynamic'

import Link from 'next/link'
import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'
import { prisma } from '@/lib/prisma'

async function getInsights() {
  try {
    return await prisma.marketInsight.findMany({
      take: 20,
      orderBy: { valid_from: 'desc' },
    })
  } catch {
    return []
  }
}

const insightTypeColors: Record<string, string> = {
  SALARY_BENCHMARK: '#a5b4fc',
  HIRING_TREND: '#22c55e',
  SKILL_DEMAND: '#f59e0b',
  TALENT_FLOW: '#3b82f6',
  COMPANY_GROWTH: '#8b5cf6',
  INDUSTRY_SHIFT: '#ef4444',
}

export default async function MarketInsightsPage() {
  const insights = await getInsights()

  return (
    <PageShell
      active="/market-insights"
      title="Market Insights"
      subtitle="Salary benchmarks, hiring trends and demand signals"
      badge="Intelligence"
    >
      {insights.length === 0 ? (
        <EmptyState
          icon="📊"
          message="No market data yet"
          hint="Salary benchmarks and hiring trend data will appear here once available."
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {insights.map((ins) => {
            const insightType = ins.insight_type

            return (
              <Link key={ins.id} href={`/market-insights/${ins.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="hover-card" style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                cursor: 'pointer',
                height: '100%',
              }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, flex: 1 }}>{ins.title}</div>
                  <span style={{
                    color: insightTypeColors[insightType] ?? '#64748b',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {insightType?.replace(/_/g, ' ')}
                  </span>
                </div>

                {ins.description && (
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                    {ins.description}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {ins.industry && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>🏭 {ins.industry}</span>
                  )}
                  {ins.region && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>📍 {ins.region}</span>
                  )}
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

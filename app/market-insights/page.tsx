import PageShell from '../components/PageShell'
import EmptyState from '../components/EmptyState'

async function getInsights() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/market-insights?limit=20`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
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
  const result = await getInsights()
  const insights: Record<string, unknown>[] = result?.data ?? []

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
            const insightType = ins.insight_type as string

            return (
              <div key={ins.id as string} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', gap: '0.5rem' }}>
                  <div style={{ fontWeight: 700, flex: 1 }}>{ins.title as string}</div>
                  <span style={{
                    color: insightTypeColors[insightType] ?? '#64748b',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {insightType?.replace(/_/g, ' ')}
                  </span>
                </div>

                {(ins.description as string | null) && (
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 0.75rem' }}>
                    {ins.description as string}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {(ins.industry as string | null) && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      🏭 {ins.industry as string}
                    </span>
                  )}
                  {(ins.region as string | null) && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      📍 {ins.region as string}
                    </span>
                  )}
                  {(ins.seniority_level as string | null) && (
                    <span style={{ color: '#64748b', fontSize: '0.78rem' }}>
                      👤 {(ins.seniority_level as string).replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.75rem' }}>
                  Valid from {new Date(ins.valid_from as string).toLocaleDateString()}
                  {(ins.valid_until as string | null) && ` · until ${new Date(ins.valid_until as string).toLocaleDateString()}`}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

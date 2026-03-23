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

const trendColors: Record<string, string> = {
  INCREASING: '#22c55e',
  STABLE: '#3b82f6',
  DECREASING: '#ef4444',
}

const trendIcons: Record<string, string> = {
  INCREASING: '↑',
  STABLE: '→',
  DECREASING: '↓',
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
            const trend = ins.demand_trend as string

            return (
              <div key={ins.id as string} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 700 }}>{ins.skill_name as string}</div>
                  {trend && (
                    <span style={{
                      color: trendColors[trend] ?? '#64748b',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}>
                      {trendIcons[trend]} {trend}
                    </span>
                  )}
                </div>

                {(ins.location_country as string | null) && (
                  <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    📍 {ins.location_city ? `${ins.location_city as string}, ` : ''}{ins.location_country as string}
                  </div>
                )}

                {(ins.avg_salary_usd as number | null) && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Avg Salary </span>
                    <span style={{ fontWeight: 700, color: '#a5b4fc' }}>
                      ${(ins.avg_salary_usd as number).toLocaleString()} USD
                    </span>
                  </div>
                )}

                {((ins.salary_min_usd as number | null) || (ins.salary_max_usd as number | null)) && (
                  <div style={{ color: '#64748b', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                    Range: ${(ins.salary_min_usd as number)?.toLocaleString()} – ${(ins.salary_max_usd as number)?.toLocaleString()}
                  </div>
                )}

                {ins.open_positions_count != null && (
                  <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                    {(ins.open_positions_count as number).toLocaleString()} open positions
                  </div>
                )}

                <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.75rem' }}>
                  Updated {new Date(ins.report_date as string).toLocaleDateString()}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageShell>
  )
}

export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PageShell from '../../components/PageShell'

const insightTypeColors: Record<string, string> = {
  SALARY_BENCHMARK: '#a5b4fc',
  HIRING_TREND: '#22c55e',
  SKILL_DEMAND: '#f59e0b',
  TALENT_FLOW: '#3b82f6',
  COMPANY_GROWTH: '#8b5cf6',
  INDUSTRY_SHIFT: '#ef4444',
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '0.6rem', padding: '1.1rem',
    }}>
      <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#f8fafc' }}>{value}</div>
      {sub && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

export default async function MarketInsightDetailPage({ params }: { params: { id: string } }) {
  const insight = await prisma.marketInsight.findUnique({
    where: { id: params.id },
  }).catch(() => null)

  if (!insight) notFound()

  const insightType = insight.insight_type
  const typeColor = insightTypeColors[insightType] ?? '#64748b'
  const data = insight.data_json as Record<string, unknown>

  // Render data_json as meaningful stat cards based on insight type
  const renderDataCards = () => {
    if (!data) return null

    if (insightType === 'SALARY_BENCHMARK') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {data.median != null ? <StatCard label="Median Salary" value={`£${Number(data.median).toLocaleString()}`} sub="per year" /> : null}
          {data.p25 != null ? <StatCard label="25th Percentile" value={`£${Number(data.p25).toLocaleString()}`} sub="lower quartile" /> : null}
          {data.p75 != null ? <StatCard label="75th Percentile" value={`£${Number(data.p75).toLocaleString()}`} sub="upper quartile" /> : null}
          {data.currency != null ? <StatCard label="Currency" value={String(data.currency)} /> : null}
        </div>
      )
    }

    if (insightType === 'SKILL_DEMAND' || insightType === 'HIRING_TREND') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          {data.growth_rate_yoy != null ? (
            <StatCard
              label="YoY Growth"
              value={`+${Math.round(Number(data.growth_rate_yoy) * 100)}%`}
              sub="year over year"
            />
          ) : null}
          {data.top_hirers != null && Array.isArray(data.top_hirers) ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '0.6rem', padding: '1.1rem' }}>
              <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Top Hirers</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(data.top_hirers as string[]).map((h) => (
                  <div key={h} style={{ color: '#a5b4fc', fontSize: '0.85rem', fontWeight: 600 }}>• {h}</div>
                ))}
              </div>
            </div>
          ) : null}
          {data.top_use_cases != null && Array.isArray(data.top_use_cases) ? (
            <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '0.6rem', padding: '1.1rem' }}>
              <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Top Use Cases</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {(data.top_use_cases as string[]).map((u) => (
                  <div key={u} style={{ color: '#86efac', fontSize: '0.85rem', fontWeight: 600 }}>• {u.replace(/_/g, ' ')}</div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )
    }

    // Generic fallback
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        {Object.entries(data).map(([key, val]) => (
          <StatCard key={key} label={key.replace(/_/g, ' ')} value={String(val as string | number | boolean)} />
        ))}
      </div>
    )
  }

  return (
    <PageShell
      active="/market-insights"
      title={insight.title}
      subtitle={[insight.industry, insight.region, insight.seniority_level].filter(Boolean).join(' · ')}
      badge="Market Intelligence"
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/market-insights" style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none' }}>
          ← Back to Market Insights
        </Link>
      </div>

      {/* Type badge + meta */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <span style={{
          background: `${typeColor}18`, color: typeColor,
          border: `1px solid ${typeColor}33`,
          borderRadius: '0.4rem', padding: '0.3rem 0.8rem', fontSize: '0.82rem', fontWeight: 700,
        }}>{insightType.replace(/_/g, ' ')}</span>
        {insight.source && (
          <span style={{ color: '#475569', fontSize: '0.82rem' }}>Source: {insight.source}</span>
        )}
      </div>

      {/* Description */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <p style={{ color: '#cbd5e1', lineHeight: 1.8, margin: 0, fontSize: '1rem' }}>
          {insight.description}
        </p>
      </div>

      {/* Data cards */}
      <div style={{
        background: `${typeColor}08`, border: `1px solid ${typeColor}25`,
        borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem',
      }}>
        <h2 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700 }}>Key Metrics</h2>
        {renderDataCards()}
      </div>

      {/* Meta */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.75rem', padding: '1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem',
      }}>
        {insight.industry && (
          <div>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Industry</div>
            <div style={{ fontWeight: 600 }}>{insight.industry}</div>
          </div>
        )}
        {insight.region && (
          <div>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Region</div>
            <div style={{ fontWeight: 600 }}>{insight.region}</div>
          </div>
        )}
        {insight.seniority_level && (
          <div>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Seniority</div>
            <div style={{ fontWeight: 600 }}>{insight.seniority_level}</div>
          </div>
        )}
        <div>
          <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Valid From</div>
          <div style={{ fontWeight: 600 }}>{new Date(insight.valid_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        {insight.valid_until && (
          <div>
            <div style={{ color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Valid Until</div>
            <div style={{ fontWeight: 600 }}>{new Date(insight.valid_until).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

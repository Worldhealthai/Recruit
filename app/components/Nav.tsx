'use client'

import Link from 'next/link'
import RecruiterBadge from './RecruiterBadge'

const links = [
  { href: '/pipeline',        label: 'Pipeline' },
  { href: '/candidates',      label: 'Candidates' },
  { href: '/jobs',            label: 'Jobs' },
  { href: '/matches',         label: 'Matches' },
  { href: '/screening',       label: 'Screening' },
  { href: '/placements',      label: 'Placements' },
  { href: '/market-insights', label: 'Market Insights' },
  { href: '/analytics',      label: 'Analytics' },
]

export default function Nav({ active }: { active?: string }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      padding: '0.85rem 2.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(15,23,42,0.97)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <Link href="/" style={{
        fontSize: '1.2rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        textDecoration: 'none',
        color: '#f8fafc',
        marginRight: '2rem',
        flexShrink: 0,
      }}>
        Recruit<span style={{ color: '#6366f1' }}>AI</span>
      </Link>

      <div style={{ display: 'flex', gap: '0.15rem', flex: 1, flexWrap: 'wrap' }}>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding: '0.38rem 0.8rem',
            borderRadius: '0.4rem',
            fontSize: '0.84rem',
            textDecoration: 'none',
            fontWeight: active === href ? 600 : 400,
            color: active === href ? '#a5b4fc' : '#64748b',
            background: active === href ? 'rgba(99,102,241,0.1)' : 'transparent',
            transition: 'color 0.15s',
          }}>
            {label}
          </Link>
        ))}
      </div>

      <RecruiterBadge />
    </nav>
  )
}

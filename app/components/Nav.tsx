'use client'

import Link from 'next/link'
import RecruiterBadge from './RecruiterBadge'

const links = [
  { href: '/pipeline',   label: 'Pipeline' },
  { href: '/candidates', label: 'Candidates' },
  { href: '/jobs',       label: 'Jobs' },
  { href: '/screening',  label: 'Screening' },
  { href: '/placements', label: 'Placements' },
]

export default function Nav({ active }: { active?: string }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      height: '56px',
      padding: '0 2.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      background: '#0f0f11',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <Link href="/" style={{
        fontSize: '1.1rem',
        fontWeight: 700,
        letterSpacing: '-0.04em',
        textDecoration: 'none',
        color: '#ffffff',
        marginRight: '2rem',
        flexShrink: 0,
      }}>
        Recruit<span style={{ color: '#6366f1' }}>AI</span>
      </Link>

      <div style={{ display: 'flex', gap: '0.1rem', flex: 1 }}>
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-link${active === href ? ' active' : ''}`}
            style={{
              padding: '0.35rem 0.85rem',
              borderRadius: '0.5rem',
              fontSize: '0.83rem',
              textDecoration: 'none',
              fontWeight: active === href ? 500 : 400,
              color: active === href ? '#ffffff' : '#71717a',
              background: active === href ? 'rgba(255,255,255,0.09)' : 'transparent',
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      <RecruiterBadge />
    </nav>
  )
}

import Link from 'next/link'

const links = [
  { href: '/candidates',     label: 'Candidates' },
  { href: '/jobs',           label: 'Jobs' },
  { href: '/companies',      label: 'Companies' },
  { href: '/matches',        label: 'Matches' },
  { href: '/screening',      label: 'Screening' },
  { href: '/placements',     label: 'Placements' },
  { href: '/market-insights',label: 'Market Insights' },
  { href: '/recruiters',     label: 'Recruiters' },
]

export default function Nav({ active }: { active?: string }) {
  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0',
      padding: '1rem 2.5rem',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(15,23,42,0.95)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(8px)',
    }}>
      <Link href="/" style={{
        fontSize: '1.25rem',
        fontWeight: 700,
        letterSpacing: '-0.03em',
        textDecoration: 'none',
        color: '#f8fafc',
        marginRight: '2.5rem',
        flexShrink: 0,
      }}>
        Recruit<span style={{ color: '#6366f1' }}>AI</span>
      </Link>

      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', flex: 1 }}>
        {links.map(({ href, label }) => (
          <Link key={href} href={href} style={{
            padding: '0.4rem 0.85rem',
            borderRadius: '0.4rem',
            fontSize: '0.85rem',
            textDecoration: 'none',
            fontWeight: active === href ? 600 : 400,
            color: active === href ? '#a5b4fc' : '#94a3b8',
            background: active === href ? 'rgba(99,102,241,0.12)' : 'transparent',
          }}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

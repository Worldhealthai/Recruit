import Nav from './Nav'

const pageStyles: React.CSSProperties = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
  color: '#f8fafc',
  fontFamily: 'system-ui, -apple-system, sans-serif',
}

export default function PageShell({
  active,
  title,
  subtitle,
  children,
  badge,
}: {
  active: string
  title: string
  subtitle: string
  children: React.ReactNode
  badge?: string
}) {
  return (
    <div style={pageStyles}>
      <Nav active={active} />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 2rem' }}>
        <header style={{ marginBottom: '2.5rem' }}>
          {badge && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.4)',
              borderRadius: '999px',
              padding: '0.2rem 0.8rem',
              fontSize: '0.75rem',
              color: '#a5b4fc',
              marginBottom: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              {badge}
            </span>
          )}
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.4rem' }}>
            {title}
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  )
}

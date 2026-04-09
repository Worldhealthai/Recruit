import Nav from './Nav'

const pageStyles: React.CSSProperties = {
  minHeight: '100vh',
  background: '#f8f9fb',
  color: '#111111',
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
      <main className="page-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 2.5rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          {badge && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '999px',
              padding: '0.18rem 0.75rem',
              fontSize: '0.72rem',
              color: '#6366f1',
              marginBottom: '0.65rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              {badge}
            </span>
          )}
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.04em', margin: '0 0 0.35rem', color: '#111111' }}>
            {title}
          </h1>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.88rem' }}>{subtitle}</p>
        </header>
        {children}
      </main>
    </div>
  )
}

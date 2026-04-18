import AppShell from './AppShell'

export default function PageShell({
  title,
  subtitle,
  children,
  badge,
}: {
  active?: string
  title: string
  subtitle: string
  children: React.ReactNode
  badge?: string
}) {
  return (
    <AppShell>
      <div style={{ padding: '1.5rem 2rem 3rem' }}>
        <header style={{ marginBottom: '2rem' }}>
          {badge && (
            <span style={{
              display: 'inline-block',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: '999px',
              padding: '0.18rem 0.75rem',
              fontSize: '0.72rem',
              color: '#a5b4fc',
              marginBottom: '0.65rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              {badge}
            </span>
          )}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0 0 0.25rem', color: '#f8fafc' }}>
            {title}
          </h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '0.85rem' }}>{subtitle}</p>
        </header>
        {children}
      </div>
    </AppShell>
  )
}

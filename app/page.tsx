export default function Home() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.03em' }}>
            Recruit<span style={{ color: '#6366f1' }}>AI</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.875rem', color: '#94a3b8' }}>
          <span>Platform</span>
          <span>Pricing</span>
          <span>Docs</span>
        </div>
        <a
          href="/api/candidates"
          style={{
            background: '#6366f1',
            color: '#fff',
            padding: '0.5rem 1.25rem',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          API Explorer →
        </a>
      </nav>

      {/* Hero */}
      <section style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '5rem 2rem 3rem',
      }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(99,102,241,0.15)',
          border: '1px solid rgba(99,102,241,0.4)',
          borderRadius: '999px',
          padding: '0.3rem 1rem',
          fontSize: '0.8rem',
          color: '#a5b4fc',
          marginBottom: '1.5rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          AI-Powered Recruitment Platform
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-0.04em',
          marginBottom: '1.5rem',
          maxWidth: '800px',
        }}>
          Find the right talent,{' '}
          <span style={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            10× faster
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: '#94a3b8',
          maxWidth: '560px',
          lineHeight: 1.7,
          marginBottom: '2.5rem',
        }}>
          AI screening calls, deep candidate matching, and live market intelligence —
          built for modern recruitment teams.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            href="/api/candidates"
            style={{
              background: '#6366f1',
              color: '#fff',
              padding: '0.85rem 2rem',
              borderRadius: '0.625rem',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Browse Candidates
          </a>
          <a
            href="/api/jobs"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#f8fafc',
              padding: '0.85rem 2rem',
              borderRadius: '0.625rem',
              fontSize: '1rem',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View Open Jobs
          </a>
        </div>
      </section>

      {/* API endpoints */}
      <section style={{
        padding: '3rem 2.5rem 5rem',
        maxWidth: '960px',
        margin: '0 auto',
        width: '100%',
      }}>
        <h2 style={{
          textAlign: 'center',
          fontSize: '1rem',
          fontWeight: 600,
          color: '#475569',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '2rem',
        }}>
          REST API Endpoints
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1rem',
        }}>
          {[
            { path: '/api/candidates',      label: 'Candidates',      desc: 'Search & filter talent profiles' },
            { path: '/api/jobs',            label: 'Jobs',            desc: 'Active job listings with skill requirements' },
            { path: '/api/companies',       label: 'Companies',       desc: 'Company profiles and org data' },
            { path: '/api/matches',         label: 'Matches',         desc: 'AI-scored candidate ↔ job matches' },
            { path: '/api/screening',       label: 'Screening Calls', desc: 'AI call transcripts and recommendations' },
            { path: '/api/market-insights', label: 'Market Insights', desc: 'Salary benchmarks and hiring trends' },
            { path: '/api/recruiters',      label: 'Recruiters',      desc: 'Recruiter accounts and subscriptions' },
          ].map(({ path, label, desc }) => (
            <a
              key={path}
              href={path}
              style={{
                display: 'block',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.75rem',
                padding: '1.25rem 1.5rem',
                textDecoration: 'none',
                transition: 'border-color 0.15s',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.4rem',
              }}>
                <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>{label}</span>
                <span style={{
                  background: 'rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                  borderRadius: '0.25rem',
                  padding: '0.1rem 0.4rem',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                }}>GET</span>
              </div>
              <code style={{ display: 'block', color: '#6366f1', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                {path}
              </code>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}

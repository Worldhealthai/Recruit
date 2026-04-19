'use client'

import { useState } from 'react'

const PRESET_SEARCHES = [
  { query: 'Sales Manager',           location: 'London, UK' },
  { query: 'Business Development',    location: 'London, UK' },
  { query: 'Software Engineer',       location: 'London, UK' },
  { query: 'Marketing Manager',       location: 'London, UK' },
  { query: 'Finance Director',        location: 'London, UK' },
  { query: 'Account Manager',         location: 'Manchester, UK' },
  { query: 'Customer Success Manager',location: 'London, UK' },
  { query: 'Product Manager',         location: 'London, UK' },
  { query: 'Data Analyst',            location: 'London, UK' },
  { query: 'HR Manager',              location: 'London, UK' },
]

type Result = { created: number; skipped: number; errors?: string[] }

export default function JobImportTrigger() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('London, UK')
  const [sites, setSites] = useState<string[]>(['indeed', 'linkedin'])
  const [results, setResults] = useState('50')
  const [hours, setHours] = useState('168')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)

  const SITES = ['indeed', 'linkedin', 'glassdoor']

  function toggleSite(s: string) {
    setSites(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  }

  async function runImport() {
    if (!query.trim()) { setStatus('Enter a search query.'); return }
    if (sites.length === 0) { setStatus('Select at least one job board.'); return }
    setLoading(true)
    setStatus('Scraping jobs — this may take 20–60 seconds…')
    setResult(null)

    try {
      const res = await fetch('/api/jobs/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, sites, results: parseInt(results), hours: parseInt(hours) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scrape failed')
      setResult(data)
      setStatus(null)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem',
    padding: '0.45rem 0.65rem', color: '#f8fafc', fontSize: '0.82rem',
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff',
          border: 'none', borderRadius: '0.5rem', padding: '0.55rem 1rem',
          fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
        }}
      >
        ✦ Scrape Jobs
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem',
        }}
        onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '520px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Scrape Jobs</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Powered by JobSpy — pulls live listings from job boards
                </p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
            </div>

            {/* Presets */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>Quick Presets</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {PRESET_SEARCHES.map(p => (
                  <button key={p.query}
                    onClick={() => { setQuery(p.query); setLocation(p.location) }}
                    style={{
                      background: query === p.query ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${query === p.query ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: query === p.query ? '#a5b4fc' : '#94a3b8',
                      borderRadius: '999px', padding: '0.2rem 0.6rem',
                      fontSize: '0.71rem', cursor: 'pointer',
                    }}>
                    {p.query}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Search Query *</label>
                <input style={inputStyle} value={query} onChange={e => setQuery(e.target.value)} placeholder='e.g. "Sales Manager"' />
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Location</label>
                <input style={inputStyle} value={location} onChange={e => setLocation(e.target.value)} placeholder='e.g. London, UK' />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Max Results</label>
                <select value={results} onChange={e => setResults(e.target.value)} style={inputStyle}>
                  {['20', '50', '100', '200'].map(n => <option key={n} value={n}>{n} jobs</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Posted Within</label>
                <select value={hours} onChange={e => setHours(e.target.value)} style={inputStyle}>
                  <option value="24">Last 24 hours</option>
                  <option value="72">Last 3 days</option>
                  <option value="168">Last 7 days</option>
                  <option value="720">Last 30 days</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>Job Boards</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {SITES.map(s => (
                  <button key={s}
                    onClick={() => toggleSite(s)}
                    style={{
                      background: sites.includes(s) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${sites.includes(s) ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      color: sites.includes(s) ? '#a5b4fc' : '#64748b',
                      borderRadius: '0.4rem', padding: '0.35rem 0.8rem',
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {status && (
              <div style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', color: '#a5b4fc', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {loading && <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />}
                {status}
              </div>
            )}

            {result && (
              <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.5rem' }}>
                <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem' }}>
                  ✓ Import complete
                </div>
                <div style={{ color: '#86efac', fontSize: '0.8rem' }}>
                  {result.created} jobs added · {result.skipped} duplicates skipped
                </div>
                {result.errors?.length && (
                  <div style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                    {result.errors.length} errors — check console
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '0.5rem', padding: '0.55rem 1rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={runImport} disabled={loading} style={{
                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.55rem 1.25rem',
                fontSize: '0.82rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              }}>
                {loading ? 'Scraping…' : 'Run Scrape'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

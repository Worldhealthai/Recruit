'use client'

import { useState } from 'react'

const PRESET_SEARCHES = [
  { query: 'Sales Manager',            location: 'London, UK' },
  { query: 'Business Development',     location: 'London, UK' },
  { query: 'Software Engineer',        location: 'London, UK' },
  { query: 'Marketing Manager',        location: 'London, UK' },
  { query: 'Finance Director',         location: 'London, UK' },
  { query: 'Account Manager',          location: 'Manchester, UK' },
  { query: 'Customer Success Manager', location: 'London, UK' },
  { query: 'Product Manager',          location: 'London, UK' },
  { query: 'Data Analyst',             location: 'London, UK' },
  { query: 'HR Manager',               location: 'London, UK' },
]

type Tab = 'cli' | 'paste'
type Result = { created: number; skipped: number; total?: number; errors?: string[] }

export default function JobImportTrigger() {
  const [open, setOpen]       = useState(false)
  const [tab, setTab]         = useState<Tab>('cli')
  const [query, setQuery]     = useState('Sales Manager')
  const [location, setLocation] = useState('London, UK')
  const [sites, setSites]     = useState<string[]>(['indeed', 'linkedin'])
  const [results, setResults] = useState('50')
  const [hours, setHours]     = useState('168')
  const [json, setJson]       = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied]   = useState(false)
  const [result, setResult]   = useState<Result | null>(null)
  const [error, setError]     = useState<string | null>(null)

  const SITES = ['indeed', 'linkedin', 'glassdoor']

  function toggleSite(s: string) {
    setSites(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  }

  const cliCommand = [
    'python scripts/scrape_jobs.py',
    `--query "${query}"`,
    `--location "${location}"`,
    sites.length ? `--sites ${sites.join(' ')}` : '',
    `--results ${results}`,
    `--hours ${hours}`,
    '--output jobs.json',
  ].filter(Boolean).join(' \\\n  ')

  function copyCmd() {
    navigator.clipboard.writeText(cliCommand.replace(/\\\n  /g, ' '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function importJson() {
    setError(null)
    setResult(null)
    let parsed: { jobs?: unknown[] }
    try {
      parsed = JSON.parse(json.trim())
    } catch {
      setError('Invalid JSON — paste the full output from the CLI script.')
      return
    }
    if (!Array.isArray(parsed.jobs) || parsed.jobs.length === 0) {
      setError('No jobs array found. Make sure you paste the full JSON output.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/jobs/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: parsed.jobs }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setResult(data)
      setJson('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
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

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.45rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
    border: 'none', borderRadius: '0.4rem',
    background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
    color: active ? '#a5b4fc' : '#64748b',
  })

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
        ✦ Import Jobs
      </button>

      {open && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.75rem', width: '100%', maxWidth: '560px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Import Jobs</h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#64748b' }}>Powered by JobSpy — scrapes Indeed, LinkedIn, Glassdoor</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', padding: '0.25rem' }}>
              <button style={tabStyle(tab === 'cli')}   onClick={() => setTab('cli')}>① Generate CLI Command</button>
              <button style={tabStyle(tab === 'paste')} onClick={() => setTab('paste')}>② Paste & Import JSON</button>
            </div>

            {/* ── Tab 1: CLI command builder ── */}
            {tab === 'cli' && (
              <>
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
                          borderRadius: '999px', padding: '0.2rem 0.6rem', fontSize: '0.71rem', cursor: 'pointer',
                        }}>
                        {p.query}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem' }}>Search Query</label>
                    <input style={inputStyle} value={query} onChange={e => setQuery(e.target.value)} placeholder='e.g. Sales Manager' />
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
                      {['20','50','100','200'].map(n => <option key={n} value={n}>{n} jobs</option>)}
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
                      <button key={s} onClick={() => toggleSite(s)} style={{
                        background: sites.includes(s) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${sites.includes(s) ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: sites.includes(s) ? '#a5b4fc' : '#64748b',
                        borderRadius: '0.4rem', padding: '0.35rem 0.8rem',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                      }}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Generated command */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Run this in your terminal</label>
                    <button onClick={copyCmd} style={{ background: 'none', border: 'none', color: copied ? '#4ade80' : '#6366f1', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                      {copied ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                  <pre style={{
                    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.5rem', padding: '0.85rem 1rem',
                    fontSize: '0.75rem', color: '#a5b4fc', margin: 0,
                    whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontFamily: 'monospace',
                  }}>
                    {cliCommand}
                  </pre>
                </div>

                <div style={{ padding: '0.65rem 0.9rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.5rem', fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#a5b4fc' }}>Setup (one time):</strong>{' '}
                  <code style={{ color: '#818cf8' }}>pip install python-jobspy</code>
                  <br />
                  After running, come back and paste <code style={{ color: '#818cf8' }}>jobs.json</code> in the next tab.
                </div>

                <button
                  onClick={() => setTab('paste')}
                  style={{ marginTop: '1rem', width: '100%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.6rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                  Next: Paste JSON →
                </button>
              </>
            )}

            {/* ── Tab 2: Paste JSON ── */}
            {tab === 'paste' && (
              <>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.4rem' }}>
                    Paste the contents of <code style={{ color: '#818cf8', fontStyle: 'normal' }}>jobs.json</code>
                  </label>
                  <textarea
                    value={json}
                    onChange={e => setJson(e.target.value)}
                    placeholder={'{\n  "jobs": [...]\n}'}
                    rows={12}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '0.75rem', lineHeight: 1.5 }}
                  />
                </div>

                {error && (
                  <div style={{ marginBottom: '0.75rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.8rem' }}>
                    {error}
                  </div>
                )}

                {result && (
                  <div style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.5rem' }}>
                    <div style={{ color: '#4ade80', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.2rem' }}>✓ Import complete</div>
                    <div style={{ color: '#86efac', fontSize: '0.8rem' }}>
                      {result.created} jobs added · {result.skipped} duplicates skipped
                      {result.total ? ` · ${result.total} total parsed` : ''}
                    </div>
                    {result.errors?.length ? (
                      <div style={{ color: '#f87171', fontSize: '0.72rem', marginTop: '0.3rem' }}>{result.errors.length} rows had errors</div>
                    ) : null}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  <button onClick={() => setTab('cli')} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '0.5rem', padding: '0.55rem', fontSize: '0.82rem', cursor: 'pointer' }}>
                    ← Back
                  </button>
                  <button onClick={importJson} disabled={loading || !json.trim()} style={{
                    flex: 2,
                    background: loading || !json.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.55rem',
                    fontSize: '0.82rem', fontWeight: 700, cursor: loading || !json.trim() ? 'not-allowed' : 'pointer',
                    boxShadow: loading || !json.trim() ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                    {loading && <span style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                    {loading ? 'Importing…' : `Import ${json.trim() ? 'Jobs' : '(paste JSON first)'}`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

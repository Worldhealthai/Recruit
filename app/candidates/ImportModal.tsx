'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const SOURCES = [
  { id: 'linkedin',   label: 'LinkedIn',    color: '#0A66C2', bg: '#EBF5FB', count: '900M+ profiles' },
  { id: 'indeed',     label: 'Indeed',      color: '#003A9B', bg: '#EBF0FB', count: '250M+ CVs' },
  { id: 'cv_library', label: 'CV-Library',  color: '#E8320A', bg: '#FDEEE9', count: '14M+ UK CVs' },
  { id: 'reed',       label: 'Reed',        color: '#CC0000', bg: '#FDEAEA', count: '8M+ candidates' },
  { id: 'totaljobs',  label: 'Totaljobs',   color: '#008080', bg: '#E5F4F4', count: '6M+ profiles' },
]

const JOB_FUNCTIONS = [
  'Sales Executive', 'Business Development Manager', 'Account Manager', 'Account Executive',
  'Sales Manager', 'VP of Sales', 'Enterprise Account Executive',
  'Digital Marketing Manager', 'Marketing Executive', 'SEO Manager', 'Content Manager', 'Head of Marketing',
  'Software Engineer', 'Senior Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Product Manager', 'Senior Product Manager', 'Head of Product',
  'Finance Analyst', 'Senior Finance Analyst', 'FP&A Manager', 'Finance Director', 'CFO',
  'HR Manager', 'Talent Acquisition Specialist', 'Head of People', 'CHRO',
  'Data Analyst', 'Data Scientist', 'Analytics Manager',
  'Operations Manager', 'Project Manager', 'Programme Manager',
  'Legal Counsel', 'Compliance Manager', 'Solicitor',
  'Customer Success Manager', 'Customer Success Director',
]

const STEPS = [
  'Connecting to source',
  'Authenticating partner API',
  'Applying availability filters',
  'Scanning active profiles',
  'Verifying contact data',
  'Enriching with company data',
  'Deduplicating against database',
  'Adding candidates to your pool',
]

type Step = 'select' | 'configure' | 'importing' | 'done'

export default function ImportModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('select')
  const [source, setSource] = useState('')
  const [jobFunction, setJobFunction] = useState('')
  const [customFunction, setCustomFunction] = useState('')
  const [location, setLocation] = useState('')
  const [count, setCount] = useState('15')
  const [progressStep, setProgressStep] = useState(0)
  const [result, setResult] = useState<{ created: number } | null>(null)
  const [error, setError] = useState('')

  const selectedSource = SOURCES.find(s => s.id === source)
  const finalFunction = jobFunction === '__custom__' ? customFunction : jobFunction

  const startImport = async () => {
    setStep('importing')
    setError('')
    let ps = 0

    const interval = setInterval(() => {
      ps = Math.min(ps + 1, STEPS.length - 1)
      setProgressStep(ps)
    }, 900)

    try {
      const res = await fetch('/api/candidates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, jobFunction: finalFunction, location, count: parseInt(count) }),
      })
      const data = await res.json()
      clearInterval(interval)
      setProgressStep(STEPS.length)
      if (!res.ok) throw new Error(data.error ?? 'Import failed')
      setResult({ created: data.created })
      setStep('done')
    } catch (e) {
      clearInterval(interval)
      setError(e instanceof Error ? e.message : 'Import failed')
      setStep('configure')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)',
    borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#111111',
    fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.7)',
        borderRadius: '18px', padding: '2rem', width: '100%', maxWidth: '520px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
      }}>

        {/* ── Step: Select Source ── */}
        {step === 'select' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Source Candidates
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111111', margin: 0 }}>
                Where do you want to import from?
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '0.3rem', marginBottom: 0 }}>
                We connect to partner APIs to pull candidates who are actively open to opportunities.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {SOURCES.map(s => (
                <button key={s.id} onClick={() => setSource(s.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1rem', borderRadius: '10px', cursor: 'pointer',
                  border: source === s.id ? `2px solid ${s.color}` : '1px solid rgba(0,0,0,0.08)',
                  background: source === s.id ? s.bg : '#f9fafb',
                  transition: 'all 0.15s',
                  textAlign: 'left' as const,
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#111111', fontSize: '0.9rem' }}>{s.label}</div>
                    <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>{s.count}</div>
                  </div>
                  {source === s.id && <span style={{ color: s.color, fontSize: '1rem' }}>✓</span>}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={onClose} style={{ flex: 1, background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => setStep('configure')} disabled={!source} style={{
                flex: 2, background: source ? '#111111' : '#e5e7eb', border: 'none',
                color: source ? '#ffffff' : '#9ca3af',
                borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
                cursor: source ? 'pointer' : 'not-allowed',
              }}>
                Continue with {selectedSource?.label ?? '—'} →
              </button>
            </div>
          </>
        )}

        {/* ── Step: Configure ── */}
        {step === 'configure' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '0.8rem', padding: 0, marginBottom: '0.75rem' }}>
                ← Back
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: selectedSource?.color }} />
                <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600 }}>{selectedSource?.label}</div>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', margin: 0 }}>
                Configure your search
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                  Job Function / Role *
                </label>
                <select value={jobFunction} onChange={e => setJobFunction(e.target.value)} style={inputStyle}>
                  <option value="">Select a role…</option>
                  {JOB_FUNCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                  <option value="__custom__">Custom…</option>
                </select>
              </div>

              {jobFunction === '__custom__' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Custom Job Title
                  </label>
                  <input
                    type="text" value={customFunction}
                    onChange={e => setCustomFunction(e.target.value)}
                    placeholder="e.g. Customer Success Manager"
                    style={inputStyle}
                  />
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Location (optional)
                  </label>
                  <input
                    type="text" value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. London"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
                    Max candidates
                  </label>
                  <select value={count} onChange={e => setCount(e.target.value)} style={inputStyle}>
                    {['5', '10', '15', '20', '25'].map(n => (
                      <option key={n} value={n}>{n} candidates</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.73rem', color: '#0369a1', fontWeight: 600, marginBottom: '0.2rem' }}>
                  Filtered for availability
                </div>
                <div style={{ fontSize: '0.73rem', color: '#0369a1' }}>
                  Only candidates marked as &quot;Open to Work&quot; or &quot;Actively Looking&quot; on {selectedSource?.label} will be included.
                </div>
              </div>
            </div>

            {error && (
              <div style={{ color: '#dc2626', fontSize: '0.78rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '6px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={() => setStep('select')} style={{ flex: 1, background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Back
              </button>
              <button
                onClick={startImport}
                disabled={!finalFunction.trim()}
                style={{
                  flex: 2, background: finalFunction ? '#111111' : '#e5e7eb', border: 'none',
                  color: finalFunction ? '#ffffff' : '#9ca3af',
                  borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
                  cursor: finalFunction ? 'pointer' : 'not-allowed',
                }}
              >
                Import from {selectedSource?.label} →
              </button>
            </div>
          </>
        )}

        {/* ── Step: Importing ── */}
        {step === 'importing' && (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.7rem', color: selectedSource?.color, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                {selectedSource?.label}
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111111', margin: '0 0 0.3rem' }}>
                Sourcing candidates…
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '0.82rem', margin: 0 }}>
                Finding {finalFunction}s{location ? ` in ${location}` : ''} open to opportunities
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'left' as const }}>
              {STEPS.map((s, i) => {
                const done = i < progressStep
                const running = i === progressStep
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', opacity: done || running ? 1 : 0.3, transition: 'opacity 0.3s' }}>
                    <span style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      background: done ? '#111111' : running ? 'rgba(99,102,241,0.15)' : 'rgba(0,0,0,0.06)',
                      border: running ? '2px solid #6366f1' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', color: '#fff',
                    }}>
                      {done ? '✓' : ''}
                    </span>
                    <span style={{ fontSize: '0.82rem', color: done ? '#111111' : running ? '#6366f1' : '#9ca3af', fontWeight: done || running ? 600 : 400 }}>
                      {s}
                    </span>
                    {running && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#6366f1' }}>running…</span>}
                  </div>
                )
              })}
            </div>

            <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6366f1, #0ea5e9)',
                width: `${(progressStep / STEPS.length) * 100}%`,
                transition: 'width 0.8s ease',
                borderRadius: '999px',
              }} />
            </div>
          </div>
        )}

        {/* ── Step: Done ── */}
        {step === 'done' && result && (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#f0fdf4', border: '2px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', fontSize: '1.3rem' }}>
                ✓
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111111', margin: '0 0 0.35rem' }}>
                {result.created} candidates imported
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
                {finalFunction}s{location ? ` from ${location}` : ''} sourced from {selectedSource?.label} and added to your talent pool. All marked as open to opportunities.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <button onClick={onClose} style={{ flex: 1, background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                Close
              </button>
              <button onClick={() => { router.refresh(); onClose() }} style={{ flex: 2, background: '#111111', border: 'none', color: '#ffffff', borderRadius: '9px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                View in Talent Pool →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

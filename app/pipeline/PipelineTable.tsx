'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type SkillEdge = { skill: { name: string } }
type Candidate = {
  id: string; first_name: string; last_name: string; current_title: string | null
  salary_expectation_min: number | null; salary_expectation_max: number | null
  current_company: { name: string } | null; skills: SkillEdge[]
}
type Job = { id: string; title: string; company: { name: string; industry: string } | null; salary_max: number | null }
type ScreeningCall = { id: string; recommendation: string | null; status: string }
type Placement = { id: string; fee_total: number; recruiter_earnings: number; invoice_status: string }
type Match = {
  id: string; status: string; overall_score: number
  candidate: Candidate; job: Job; screening_calls: ScreeningCall[]; placement: Placement | null
}

const STATUS_META: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  CONTACTED:    { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'Contacted' },
  INTERVIEWING: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b', label: 'Interviewing' },
  OFFERED:      { bg: '#fff7ed', text: '#ea580c', dot: '#f97316', label: 'Offer Made' },
  PLACED:       { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e', label: 'Placed' },
  REJECTED:     { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444', label: 'Rejected' },
  SUGGESTED:    { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'In Pipeline' },
  SHORTLISTED:  { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6', label: 'In Pipeline' },
}

const RECOMMEND_COLOR: Record<string, string> = {
  STRONG_YES: '#16a34a', YES: '#22c55e', MAYBE: '#d97706',
  NO: '#ea580c', STRONG_NO: '#dc2626',
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316']
function nameColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

// ─── Placement Modal ──────────────────────────────────────────────────────────
function PlacementModal({ match, onClose, onSuccess }: {
  match: Match; onClose: () => void; onSuccess: () => void
}) {
  const candidateMid = Math.round(
    ((match.candidate.salary_expectation_min ?? 60000) + (match.candidate.salary_expectation_max ?? 80000)) / 2
  )
  const [salary, setSalary] = useState(candidateMid.toString())
  const [feePct, setFeePct] = useState('20')
  const [feeType, setFeeType] = useState('CONTINGENCY')
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const grossFee    = Math.round((Number(salary) || 0) * ((Number(feePct) || 0) / 100))
  const platformCut = Math.round(grossFee * 0.10)
  const netEarnings = grossFee - platformCut

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const salaryNum = Math.round(Number(salary))
      const feePctNum = Number(feePct)
      if (!salaryNum || salaryNum <= 0) { setError('Please enter a valid salary'); setLoading(false); return }
      if (!feePctNum || feePctNum <= 0 || feePctNum > 50) { setError('Fee % must be between 1 and 50'); setLoading(false); return }

      const res = await fetch('/api/placements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          candidateId: match.candidate.id,
          jobId: match.job.id,
          agreedSalary: salaryNum,
          feePercentage: feePctNum,
          feeType,
          startDate,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create placement')
      onSuccess()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', background: '#f9fafb', border: '1px solid rgba(0,0,0,0.12)',
    borderRadius: '8px', padding: '0.6rem 0.75rem', color: '#111111',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.35rem' }}>
            Convert to Placement
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111111' }}>
            {match.candidate.first_name} {match.candidate.last_name}
          </div>
          <div style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            {match.job.title} · {match.job.company?.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Agreed Salary (£)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Fee Type</label>
              <select value={feeType} onChange={e => setFeeType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="CONTINGENCY">Contingency</option>
                <option value="RETAINED">Retained</option>
                <option value="FLAT_FEE">Flat Fee</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Fee %</label>
              <div style={{ position: 'relative' as const }}>
                <input type="number" value={feePct} min={5} max={35} onChange={e => setFeePct(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '1.8rem' }} />
                <span style={{ position: 'absolute' as const, right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem' }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['15', '17.5', '20', '22.5', '25'].map(p => (
              <button key={p} onClick={() => setFeePct(p)} style={{
                background: feePct === p ? '#111111' : '#f3f4f6',
                border: 'none',
                color: feePct === p ? '#ffffff' : '#6b7280',
                borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.75rem',
                fontWeight: 600, cursor: 'pointer',
              }}>{p}%</button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#6b7280', display: 'block', marginBottom: '0.3rem', fontWeight: 500 }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ background: '#f8f9fb', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '10px', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: '0.6rem' }}>Fee Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: 'Agreed Salary', value: `£${Number(salary || 0).toLocaleString()}`, color: '#374151' },
                { label: `Fee (${feePct}%)`, value: `£${grossFee.toLocaleString()}`, color: '#374151' },
                { label: 'Platform cut (10%)', value: `−£${platformCut.toLocaleString()}`, color: '#ef4444' },
                { label: 'Your net earnings', value: `£${netEarnings.toLocaleString()}`, color: '#16a34a', bold: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: r.bold ? '0.9rem' : '0.8rem', borderTop: r.bold ? '1px solid rgba(0,0,0,0.07)' : 'none', paddingTop: r.bold ? '0.4rem' : '0' }}>
                  <span style={{ color: '#6b7280' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: r.bold ? 800 : 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} disabled={loading} style={{
            flex: 1, background: '#f3f4f6', border: 'none',
            color: '#6b7280', borderRadius: '8px', padding: '0.7rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={submit} disabled={loading || !salary || !feePct} style={{
            flex: 2, background: loading ? '#dcfce7' : '#111111',
            border: 'none', color: loading ? '#16a34a' : '#ffffff',
            borderRadius: '8px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating placement…' : `Confirm — £${netEarnings.toLocaleString()} earnings`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Screening Modal ───────────────────────────────────────────────────────
function ScreeningModal({ match, onClose, onScreened }: {
  match: Match; onClose: () => void; onScreened: () => void
}) {
  const [simStep, setSimStep] = useState(0)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState<{ recommendation: string } | null>(null)

  const steps = [
    { label: 'Analysing match profile',      color: '#6366f1' },
    { label: 'Preparing tailored questions', color: '#8b5cf6' },
    { label: 'Initiating AI screening call', color: '#3b82f6' },
    { label: 'Screening in progress',        color: '#0ea5e9' },
    { label: 'Scoring responses',            color: '#f59e0b' },
    { label: 'Generating recommendation',    color: '#16a34a' },
  ]

  const existing = match.screening_calls[0]

  const startCall = async () => {
    setSimStep(1); setApiError('')
    let s = 1
    const interval = setInterval(() => {
      s = Math.min(s + 1, steps.length - 1)
      setSimStep(s)
    }, 700)

    try {
      const res = await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id }),
      })
      const data = await res.json()
      clearInterval(interval)
      if (!res.ok) { setApiError(data.error ?? 'Screening failed'); setSimStep(0); return }
      setSimStep(steps.length)
      setResult({ recommendation: data.recommendation })
      onScreened()
    } catch (e) {
      clearInterval(interval)
      setApiError(e instanceof Error ? e.message : 'Network error')
      setSimStep(0)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '460px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111111' }}>AI Phone Screen</div>
          <div style={{ color: '#9ca3af', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            {match.candidate.first_name} {match.candidate.last_name} · {match.job.title}
          </div>
        </div>

        {existing ? (
          <div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '1rem', textAlign: 'center' as const, marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Screening Completed</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: RECOMMEND_COLOR[existing.recommendation ?? ''] ?? '#6b7280' }}>
                {existing.recommendation?.replace(/_/g, ' ') ?? 'Reviewed'}
              </div>
            </div>
            <a href="/screening" style={{
              display: 'block', textAlign: 'center' as const,
              background: '#111111', color: '#ffffff',
              borderRadius: '8px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
              textDecoration: 'none', marginBottom: '0.75rem',
            }}>
              View Full Screening Report →
            </a>
            <button onClick={onClose} style={{ width: '100%', background: '#f3f4f6', border: 'none', color: '#6b7280', borderRadius: '8px', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : simStep === 0 ? (
          <div>
            <p style={{ color: '#6b7280', fontSize: '0.83rem', textAlign: 'center' as const, lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The AI conducts a structured phone screen, scores each response, flags concerns, and delivers an instant recommendation saved to your Screening dashboard.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {['Role-specific competency questions', 'Salary & notice confirmation', 'Motivation & cultural fit probing', 'Key concern flagging', 'Scored transcript + recommendation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#374151' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
            {apiError && <div style={{ color: '#dc2626', fontSize: '0.78rem', marginBottom: '0.75rem', background: '#fef2f2', border: '1px solid #fecaca', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>{apiError}</div>}
            <button onClick={startCall} style={{
              width: '100%', background: '#111111', border: 'none',
              color: '#ffffff', borderRadius: '8px', padding: '0.85rem',
              fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            }}>
              Start AI Screening Call
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: '#9ca3af', padding: '0.6rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem' }}>
              Cancel
            </button>
          </div>
        ) : simStep < steps.length ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: i < simStep ? 1 : i === simStep ? 0.8 : 0.25, transition: 'opacity 0.3s' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < simStep ? '#16a34a' : step.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: i < simStep ? '#16a34a' : step.color }}>{step.label}</span>
                  {i < simStep && <span style={{ marginLeft: 'auto', color: '#16a34a', fontSize: '0.72rem' }}>done</span>}
                  {i === simStep && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: step.color }}>running…</span>}
                </div>
              ))}
            </div>
            <div style={{ background: '#f3f4f6', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #16a34a)', width: `${(simStep / steps.length) * 100}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#16a34a', marginBottom: '0.3rem' }}>Screening Complete</div>
            {result && (
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: RECOMMEND_COLOR[result.recommendation] ?? '#6b7280', marginBottom: '0.8rem' }}>
                {result.recommendation.replace(/_/g, ' ')}
              </div>
            )}
            <p style={{ color: '#6b7280', fontSize: '0.82rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Full transcript, scored Q&amp;A, and recommendation saved to your Screening dashboard.
            </p>
            <a href="/screening" style={{
              display: 'block', background: '#111111', color: '#ffffff',
              borderRadius: '8px', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
              textDecoration: 'none', marginBottom: '0.6rem',
            }}>
              View Screening Report →
            </a>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pipeline Card ────────────────────────────────────────────────────────────
function PipelineCard({ match, onScreen, onPlace }: {
  match: Match
  onScreen: (m: Match) => void
  onPlace: (m: Match) => void
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  const meta = STATUS_META[match.status] ?? { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af', label: match.status.replace(/_/g, ' ') }
  const color = nameColor(match.candidate.first_name + match.candidate.last_name)
  const initials = `${match.candidate.first_name[0]}${match.candidate.last_name[0]}`.toUpperCase()
  const screen = match.screening_calls[0]
  const isPlaced = match.status === 'PLACED'
  const canScreen = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING'].includes(match.status)
  const canPlace = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED'].includes(match.status) && !isPlaced

  const removeFromPipeline = async () => {
    if (!confirm(`Remove ${match.candidate.first_name} ${match.candidate.last_name} from pipeline?`)) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/matches/${match.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      router.refresh()
    } catch {
      setRemoving(false)
    }
  }

  return (
    <div className="pipeline-card" style={{
      background: 'rgba(255,255,255,0.82)',
      border: '1px solid rgba(255,255,255,0.65)',
      borderRadius: '12px', padding: '1.25rem 1.5rem',
      boxShadow: '0 2px 12px rgba(99,102,241,0.07), 0 1px 3px rgba(0,0,0,0.04)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
    }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

        {/* Avatar */}
        <a href={`/candidates/${match.candidate.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: `${color}15`, border: `2px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '0.82rem', color, letterSpacing: '-0.02em',
          }}>
            {initials}
          </div>
        </a>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Top row: name + status */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div>
              <a href={`/candidates/${match.candidate.id}`} style={{ fontWeight: 700, fontSize: '0.93rem', color: '#111111', textDecoration: 'none' }}>
                {match.candidate.first_name} {match.candidate.last_name}
              </a>
              {match.candidate.current_title && (
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: '0.1rem' }}>{match.candidate.current_title}</div>
              )}
            </div>
            <span style={{
              background: meta.bg, color: meta.text,
              borderRadius: '999px', padding: '0.2rem 0.75rem',
              fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.dot, display: 'inline-block', marginRight: '0.35rem', verticalAlign: 'middle' }} />
              {meta.label}
            </span>
          </div>

          {/* Job */}
          <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <a href={`/jobs/${match.job.id}`} style={{ fontSize: '0.82rem', color: '#374151', fontWeight: 600, textDecoration: 'none' }}>
              {match.job.title}
            </a>
            {match.job.company && (
              <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>· {match.job.company.name}</span>
            )}
          </div>

          {/* Skills */}
          {match.candidate.skills.length > 0 && (
            <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              {match.candidate.skills.slice(0, 3).map(s => (
                <span key={s.skill.name} style={{
                  background: '#f3f4f6', color: '#374151',
                  borderRadius: '4px', padding: '0.1rem 0.4rem', fontSize: '0.7rem', fontWeight: 500,
                }}>
                  {s.skill.name}
                </span>
              ))}
            </div>
          )}

          {/* Screening result */}
          {screen && (
            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>Screened:</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: RECOMMEND_COLOR[screen.recommendation ?? ''] ?? '#6b7280' }}>
                {screen.recommendation?.replace(/_/g, ' ') ?? 'Completed'}
              </span>
            </div>
          )}

          {/* Placed earnings */}
          {isPlaced && match.placement && (
            <div style={{ marginTop: '0.5rem' }}>
              <a href={`/placements/${match.placement.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                borderRadius: '6px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 700,
                textDecoration: 'none',
              }}>
                £{Math.round(Number(match.placement.recruiter_earnings)).toLocaleString()} earned · View Placement →
              </a>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
            {canScreen && (
              <button onClick={() => onScreen(match)} style={{
                background: screen ? '#f9fafb' : '#111111',
                border: screen ? '1px solid rgba(0,0,0,0.1)' : 'none',
                color: screen ? '#374151' : '#ffffff',
                borderRadius: '7px', padding: '0.4rem 0.9rem',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>
                {screen ? 'Review Screening' : 'AI Screening'}
              </button>
            )}
            {canPlace && (
              <button onClick={() => onPlace(match)} style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#16a34a',
                borderRadius: '7px', padding: '0.4rem 0.9rem',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
              }}>
                Convert to Placement
              </button>
            )}
            <button
              onClick={removeFromPipeline}
              disabled={removing}
              style={{
                background: 'transparent', border: '1px solid rgba(0,0,0,0.1)',
                color: '#9ca3af', borderRadius: '7px', padding: '0.4rem 0.9rem',
                fontSize: '0.78rem', cursor: removing ? 'not-allowed' : 'pointer',
                marginLeft: 'auto',
              }}
            >
              {removing ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PipelineTable({ matches }: { matches: Match[] }) {
  const router = useRouter()
  const [placementMatch, setPlacementMatch] = useState<Match | null>(null)
  const [screeningMatch, setScreeningMatch] = useState<Match | null>(null)
  const [filter, setFilter] = useState('ALL')

  const PIPELINE_STATUSES = ['CONTACTED', 'INTERVIEWING', 'OFFERED', 'PLACED']
  const pipelineMatches = matches.filter(m =>
    PIPELINE_STATUSES.includes(m.status) || m.status === 'SUGGESTED' || m.status === 'SHORTLISTED'
  )
  const filterOptions = ['ALL', ...PIPELINE_STATUSES.filter(s => pipelineMatches.some(m => m.status === s || ((m.status === 'SUGGESTED' || m.status === 'SHORTLISTED') && s === 'CONTACTED')))]
  const uniqueFilters = filterOptions.filter((v, i, a) => a.indexOf(v) === i)

  const displayed = filter === 'ALL' ? pipelineMatches : pipelineMatches.filter(m => {
    if (filter === 'CONTACTED') return ['CONTACTED', 'SUGGESTED', 'SHORTLISTED'].includes(m.status)
    return m.status === filter
  })

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {uniqueFilters.map(f => {
          const count = f === 'ALL'
            ? pipelineMatches.length
            : f === 'CONTACTED'
              ? pipelineMatches.filter(m => ['CONTACTED', 'SUGGESTED', 'SHORTLISTED'].includes(m.status)).length
              : pipelineMatches.filter(m => m.status === f).length
          const active = filter === f
          const label = f === 'ALL' ? 'All' : STATUS_META[f]?.label ?? f.replace(/_/g, ' ')
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: active ? '#111111' : '#ffffff',
              border: `1px solid ${active ? '#111111' : 'rgba(0,0,0,0.1)'}`,
              color: active ? '#ffffff' : '#6b7280',
              borderRadius: '8px', padding: '0.35rem 0.9rem',
              fontSize: '0.78rem', fontWeight: active ? 700 : 400, cursor: 'pointer',
            }}>
              {label}
              <span style={{ marginLeft: '0.4rem', opacity: 0.65 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {displayed.length === 0 ? (
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '12px', padding: '3rem', textAlign: 'center' as const, color: '#9ca3af', fontSize: '0.88rem' }}>
          No candidates in this stage.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          {displayed.map(m => (
            <PipelineCard
              key={m.id}
              match={m}
              onScreen={setScreeningMatch}
              onPlace={setPlacementMatch}
            />
          ))}
        </div>
      )}

      {placementMatch && (
        <PlacementModal
          match={placementMatch}
          onClose={() => setPlacementMatch(null)}
          onSuccess={() => { setPlacementMatch(null); router.push('/placements') }}
        />
      )}

      {screeningMatch && (
        <ScreeningModal
          match={screeningMatch}
          onClose={() => setScreeningMatch(null)}
          onScreened={() => { router.refresh() }}
        />
      )}
    </>
  )
}

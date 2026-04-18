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
  CONTACTED:    { bg: 'rgba(59,130,246,0.1)',  text: '#60a5fa', dot: '#3b82f6',  label: 'Contacted' },
  SHORTLISTED:  { bg: 'rgba(139,92,246,0.1)',  text: '#a78bfa', dot: '#8b5cf6',  label: 'Shortlisted' },
  INTERVIEWING: { bg: 'rgba(245,158,11,0.1)',  text: '#fbbf24', dot: '#f59e0b',  label: 'Interviewing' },
  OFFERED:      { bg: 'rgba(249,115,22,0.1)',  text: '#fb923c', dot: '#f97316',  label: 'Offer Made' },
  PLACED:       { bg: 'rgba(34,197,94,0.1)',   text: '#4ade80', dot: '#22c55e',  label: 'Placed' },
  REJECTED:     { bg: 'rgba(239,68,68,0.1)',   text: '#f87171', dot: '#ef4444',  label: 'Rejected' },
  SUGGESTED:    { bg: 'rgba(100,116,139,0.1)', text: '#94a3b8', dot: '#64748b',  label: 'Suggested' },
}

const RECOMMEND_COLOR: Record<string, string> = {
  STRONG_YES: '#22c55e', YES: '#4ade80', MAYBE: '#f59e0b',
  NO: '#f87171', STRONG_NO: '#ef4444',
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
        body: JSON.stringify({ matchId: match.id, candidateId: match.candidate.id, jobId: match.job.id, agreedSalary: salaryNum, feePercentage: feePctNum, feeType, startDate }),
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
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.4rem', padding: '0.6rem 0.75rem',
    color: '#f8fafc', fontSize: '0.88rem', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit',
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.35rem' }}>
            Convert to Placement
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>
            {match.candidate.first_name} {match.candidate.last_name}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            {match.job.title} · {match.job.company?.name}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Agreed Salary (£)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Fee Type</label>
              <select value={feeType} onChange={e => setFeeType(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="CONTINGENCY">Contingency</option>
                <option value="RETAINED">Retained</option>
                <option value="FLAT_FEE">Flat Fee</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Fee %</label>
              <div style={{ position: 'relative' as const }}>
                <input type="number" value={feePct} min={5} max={35} onChange={e => setFeePct(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '1.8rem' }} />
                <span style={{ position: 'absolute' as const, right: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', fontSize: '0.85rem' }}>%</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['15', '17.5', '20', '22.5', '25'].map(p => (
              <button key={p} onClick={() => setFeePct(p)} style={{
                background: feePct === p ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${feePct === p ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                color: feePct === p ? '#a5b4fc' : '#64748b',
                borderRadius: '0.35rem', padding: '0.25rem 0.65rem', fontSize: '0.75rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>{p}%</button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem', fontWeight: 600 }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.5rem', padding: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: '0.6rem' }}>Fee Breakdown</div>
            {[
              { label: 'Agreed Salary',    value: `£${Number(salary || 0).toLocaleString()}`, color: '#cbd5e1' },
              { label: `Fee (${feePct}%)`, value: `£${grossFee.toLocaleString()}`,            color: '#cbd5e1' },
              { label: 'Platform cut (10%)', value: `−£${platformCut.toLocaleString()}`,      color: '#f87171' },
              { label: 'Your net earnings', value: `£${netEarnings.toLocaleString()}`,         color: '#4ade80', bold: true },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: r.bold ? '0.9rem' : '0.8rem', borderTop: r.bold ? '1px solid rgba(255,255,255,0.06)' : 'none', paddingTop: r.bold ? '0.4rem' : '0', marginBottom: '0.3rem' }}>
                <span style={{ color: '#64748b' }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: r.bold ? 800 : 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} disabled={loading} style={{
            flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#94a3b8', borderRadius: '0.5rem', padding: '0.7rem',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={submit} disabled={loading || !salary || !feePct} style={{
            flex: 2,
            background: loading ? 'rgba(34,197,94,0.15)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: loading ? '#4ade80' : '#ffffff',
            borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
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
    { label: 'Screening in progress',        color: '#06b6d4' },
    { label: 'Scoring responses',            color: '#f59e0b' },
    { label: 'Generating recommendation',    color: '#22c55e' },
  ]

  const existing = match.screening_calls[0]

  const startCall = async () => {
    setSimStep(1); setApiError('')
    let s = 1
    const interval = setInterval(() => {
      s = Math.min(s + 1, steps.length - 1)
      setSimStep(s)
    }, 600)
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
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#f8fafc' }}>AI Phone Screen</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            {match.candidate.first_name} {match.candidate.last_name} · {match.job.title}
          </div>
        </div>

        {existing ? (
          <div>
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.5rem', padding: '1rem', textAlign: 'center' as const, marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Screening Completed</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: RECOMMEND_COLOR[existing.recommendation ?? ''] ?? '#94a3b8' }}>
                {existing.recommendation?.replace(/_/g, ' ') ?? 'Reviewed'}
              </div>
            </div>
            <a href="/screening" style={{
              display: 'block', textAlign: 'center' as const,
              background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.7rem',
              fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '0.75rem',
            }}>
              View Full Screening Report →
            </a>
            <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: '#64748b', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
              Close
            </button>
          </div>
        ) : simStep === 0 ? (
          <div>
            <p style={{ color: '#64748b', fontSize: '0.83rem', textAlign: 'center' as const, lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The AI conducts a structured phone screen, scores each response, flags concerns, and delivers an instant recommendation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {['Role-specific competency questions', 'Salary & notice confirmation', 'Motivation & cultural fit', 'Key concern flagging', 'Scored transcript + recommendation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
            {apiError && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{apiError}</div>}
            <button onClick={startCall} style={{
              width: '100%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.85rem',
              fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Start AI Screening Call
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: '#475569', padding: '0.6rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        ) : simStep < steps.length ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: i < simStep ? 1 : i === simStep ? 0.8 : 0.2, transition: 'opacity 0.3s' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < simStep ? '#4ade80' : step.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: i < simStep ? '#4ade80' : step.color }}>{step.label}</span>
                  {i < simStep && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.72rem' }}>done</span>}
                  {i === simStep && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: step.color }}>running…</span>}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', width: `${(simStep / steps.length) * 100}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4ade80', marginBottom: '0.3rem' }}>Screening Complete</div>
            {result && (
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: RECOMMEND_COLOR[result.recommendation] ?? '#94a3b8', marginBottom: '0.8rem' }}>
                {result.recommendation.replace(/_/g, ' ')}
              </div>
            )}
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Full transcript and recommendation saved to your Screening dashboard.
            </p>
            <a href="/screening" style={{
              display: 'block', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', borderRadius: '0.5rem', padding: '0.7rem',
              fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '0.6rem',
            }}>
              View Screening Report →
            </a>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Pipeline Row (table row) ─────────────────────────────────────────────────
function PipelineRow({ match, onScreen, onPlace, isLast }: {
  match: Match; onScreen: (m: Match) => void; onPlace: (m: Match) => void; isLast: boolean
}) {
  const router = useRouter()
  const [removing, setRemoving] = useState(false)

  const meta = STATUS_META[match.status] ?? STATUS_META.SUGGESTED
  const color = nameColor(match.candidate.first_name + match.candidate.last_name)
  const initials = `${match.candidate.first_name[0]}${match.candidate.last_name[0]}`.toUpperCase()
  const screen = match.screening_calls[0]
  const isPlaced = match.status === 'PLACED'
  const canScreen = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING'].includes(match.status)
  const canPlace  = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED'].includes(match.status) && !isPlaced

  const removeFromPipeline = async () => {
    if (!confirm(`Remove ${match.candidate.first_name} ${match.candidate.last_name} from pipeline?`)) return
    setRemoving(true)
    try {
      const res = await fetch(`/api/matches/${match.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove')
      router.refresh()
    } catch { setRemoving(false) }
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 2fr 130px 150px 1fr',
      padding: '1rem 1.25rem', alignItems: 'center',
      borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,0.04)',
      background: isPlaced ? 'rgba(34,197,94,0.03)' : 'transparent',
      transition: 'background 0.15s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = isPlaced ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)' }}
    onMouseLeave={e => { e.currentTarget.style.background = isPlaced ? 'rgba(34,197,94,0.03)' : 'transparent' }}
    >
      {/* Candidate */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: `${color}20`, border: `1.5px solid ${color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: '0.72rem', color,
        }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <a href={`/candidates/${match.candidate.id}`} style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {match.candidate.first_name} {match.candidate.last_name}
          </a>
          <div style={{ color: '#64748b', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.candidate.current_title}</div>
          <div style={{ display: 'flex', gap: '0.2rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            {match.candidate.skills.slice(0, 2).map(s => (
              <span key={s.skill.name} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderRadius: '0.2rem', padding: '0.04rem 0.35rem', fontSize: '0.65rem' }}>
                {s.skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Job */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.job.title}</div>
        <div style={{ color: '#475569', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{match.job.company?.name}{match.job.company?.industry ? ` · ${match.job.company.industry}` : ''}</div>
      </div>

      {/* Status */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: meta.bg, color: meta.text,
          border: `1px solid ${meta.dot}40`,
          borderRadius: '0.3rem', padding: '0.2rem 0.55rem',
          fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.04em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.dot }} />
          {meta.label}
        </span>
      </div>

      {/* Screening */}
      <div>
        {screen?.recommendation ? (
          <span style={{
            background: `${RECOMMEND_COLOR[screen.recommendation] ?? '#64748b'}1a`,
            color: RECOMMEND_COLOR[screen.recommendation] ?? '#94a3b8',
            border: `1px solid ${RECOMMEND_COLOR[screen.recommendation] ?? '#64748b'}3d`,
            borderRadius: '0.3rem', padding: '0.15rem 0.45rem',
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
          }}>
            {screen.recommendation.replace(/_/g, ' ')}
          </span>
        ) : (
          <span style={{ fontSize: '0.72rem', color: '#334155' }}>—</span>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap', alignItems: 'center' }}>
        {isPlaced && match.placement ? (
          <a href={`/placements/${match.placement.id}`} style={{
            background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
            color: '#fbbf24', borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
            fontSize: '0.72rem', fontWeight: 700, textDecoration: 'none',
          }}>
            £{Math.round(Number(match.placement.recruiter_earnings)).toLocaleString()} earned
          </a>
        ) : (
          <>
            {canScreen && (
              <button onClick={() => onScreen(match)} style={{
                background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#a5b4fc', borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                {screen ? 'Review' : 'AI Screen'}
              </button>
            )}
            {canPlace && (
              <button onClick={() => onPlace(match)} style={{
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                color: '#4ade80', borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Place
              </button>
            )}
            <button onClick={removeFromPipeline} disabled={removing} style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
              color: '#475569', borderRadius: '0.35rem', padding: '0.3rem 0.55rem',
              fontSize: '0.72rem', cursor: removing ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}>
              {removing ? '…' : '×'}
            </button>
          </>
        )}
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

  const ALL_STATUSES = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'PLACED', 'REJECTED']
  const pipelineMatches = matches.filter(m => ALL_STATUSES.includes(m.status))

  const statusCounts: Record<string, number> = {}
  for (const m of pipelineMatches) {
    statusCounts[m.status] = (statusCounts[m.status] ?? 0) + 1
  }

  const availableFilters = ['ALL', ...ALL_STATUSES.filter(s => statusCounts[s])]

  const displayed = filter === 'ALL' ? pipelineMatches : pipelineMatches.filter(m => m.status === filter)

  return (
    <>
      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {availableFilters.map(f => {
          const count = f === 'ALL' ? pipelineMatches.length : (statusCounts[f] ?? 0)
          const active = filter === f
          const meta = STATUS_META[f]
          const color = meta?.dot ?? '#6366f1'
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: active ? (f === 'ALL' ? 'rgba(99,102,241,0.18)' : `${color}2e`) : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? (f === 'ALL' ? 'rgba(99,102,241,0.4)' : `${color}66`) : 'rgba(255,255,255,0.08)'}`,
              color: active ? (f === 'ALL' ? '#a5b4fc' : meta?.text ?? '#a5b4fc') : '#94a3b8',
              borderRadius: '999px', padding: '0.35rem 0.85rem',
              fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em',
              textTransform: 'uppercase' as const, cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}>
              {f === 'ALL' ? 'All' : (meta?.label ?? f.replace(/_/g, ' '))}
              {' '}<span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {displayed.length === 0 ? (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '3rem', textAlign: 'center' as const, color: '#475569', fontSize: '0.88rem' }}>
          No candidates in this stage.
        </div>
      ) : (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 130px 150px 1fr', padding: '0.7rem 1.25rem', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.7rem', color: '#475569', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const }}>
            <span>Candidate</span><span>Role</span><span>Status</span><span>Screening</span><span style={{ textAlign: 'right' as const }}>Actions</span>
          </div>
          {displayed.map((m, i) => (
            <PipelineRow
              key={m.id}
              match={m}
              onScreen={setScreeningMatch}
              onPlace={setPlacementMatch}
              isLast={i === displayed.length - 1}
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
          onScreened={() => router.refresh()}
        />
      )}
    </>
  )
}

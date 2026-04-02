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

const STATUS_COLOR: Record<string, string> = {
  CONTACTED: '#3b82f6',
  INTERVIEWING: '#f59e0b', OFFERED: '#f97316', PLACED: '#22c55e', REJECTED: '#ef4444',
  // legacy
  SUGGESTED: '#64748b', SHORTLISTED: '#3b82f6',
}

const RECOMMEND_COLOR: Record<string, string> = {
  STRONG_YES: '#22c55e', YES: '#4ade80', MAYBE: '#f59e0b',
  NO: '#f87171', STRONG_NO: '#ef4444',
}

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? '#64748b'
  return (
    <span style={{
      background: `${color}1a`, color, border: `1px solid ${color}44`,
      borderRadius: '0.3rem', padding: '0.15rem 0.6rem', fontSize: '0.7rem', fontWeight: 700,
    }}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}


// ─── Placement Modal ─────────────────────────────────────────────────────────
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

  const grossFee   = Math.round((Number(salary) || 0) * ((Number(feePct) || 0) / 100))
  const platformCut = Math.round(grossFee * 0.10)
  const netEarnings = grossFee - platformCut

  const submit = async () => {
    setLoading(true); setError('')
    try {
      const salaryNum = Math.round(Number(salary))
      const feePctNum = Number(feePct)  // send as whole number (e.g. 20); API normalises
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
          feePercentage: feePctNum,  // whole number — API normalises
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

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '480px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const, marginBottom: '0.4rem' }}>
            Convert to Placement
          </div>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            {match.candidate.first_name} {match.candidate.last_name}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.15rem' }}>
            {match.job.title} · {match.job.company?.name}
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Agreed Salary (£)</label>
            <input type="number" value={salary} onChange={e => setSalary(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', padding: '0.6rem 0.75rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Fee Type</label>
              <select value={feeType} onChange={e => setFeeType(e.target.value)}
                style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.4rem', padding: '0.55rem 0.6rem', color: '#f8fafc', fontSize: '0.82rem', outline: 'none', cursor: 'pointer' }}>
                <option value="CONTINGENCY">Contingency</option>
                <option value="RETAINED">Retained</option>
                <option value="FLAT_FEE">Flat Fee</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Fee % (of salary)</label>
              <div style={{ position: 'relative' as const }}>
                <input type="number" value={feePct} min={5} max={35} onChange={e => setFeePct(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', padding: '0.6rem 1.8rem 0.6rem 0.75rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const }} />
                <span style={{ position: 'absolute' as const, right: '0.6rem', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '0.85rem' }}>%</span>
              </div>
            </div>
          </div>

          {/* Quick fee % presets */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['15', '17.5', '20', '22.5', '25'].map(p => (
              <button key={p} onClick={() => setFeePct(p)} style={{
                background: feePct === p ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${feePct === p ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
                color: feePct === p ? '#a5b4fc' : '#64748b',
                borderRadius: '0.3rem', padding: '0.2rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
              }}>{p}%</button>
            ))}
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.3rem' }}>Start Date</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.4rem', padding: '0.6rem 0.75rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' as const, colorScheme: 'dark' as const }} />
          </div>

          {/* Live fee calculation */}
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.6rem', padding: '1rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const, marginBottom: '0.6rem' }}>Fee Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { label: 'Agreed Salary', value: `£${Number(salary || 0).toLocaleString()}`, color: '#94a3b8' },
                { label: `Fee (${feePct}% × salary)`, value: `£${grossFee.toLocaleString()}`, color: '#a5b4fc' },
                { label: 'Platform cut (10%)', value: `−£${platformCut.toLocaleString()}`, color: '#f87171' },
                { label: 'Your net earnings', value: `£${netEarnings.toLocaleString()}`, color: '#4ade80', bold: true },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: r.bold ? '0.88rem' : '0.8rem', borderTop: r.bold ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingTop: r.bold ? '0.4rem' : '0' }}>
                  <span style={{ color: '#64748b' }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: r.bold ? 800 : 600 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{error}</div>}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} disabled={loading} style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#94a3b8', borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', cursor: 'pointer',
          }}>Cancel</button>
          <button onClick={submit} disabled={loading || !salary || !feePct} style={{
            flex: 2, background: loading ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.15)',
            border: '1px solid rgba(34,197,94,0.4)', color: '#4ade80',
            borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Creating placement…' : `Confirm Placement — £${netEarnings.toLocaleString()} earnings`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AI Screening Call Modal ──────────────────────────────────────────────────
function ScreeningModal({ match, onClose, onScreened }: {
  match: Match; onClose: () => void; onScreened: () => void
}) {
  const [simStep, setSimStep] = useState(0)
  const [apiError, setApiError] = useState('')
  const [result, setResult] = useState<{ recommendation: string } | null>(null)

  const steps = [
    { label: 'Analysing match profile',       color: '#6366f1' },
    { label: 'Preparing tailored questions',  color: '#8b5cf6' },
    { label: 'Initiating AI video call',      color: '#3b82f6' },
    { label: 'Screening in progress',         color: '#06b6d4' },
    { label: 'Scoring responses',             color: '#f59e0b' },
    { label: 'Generating recommendation',     color: '#22c55e' },
  ]

  const existing = match.screening_calls[0]

  const startCall = async () => {
    setSimStep(1)
    setApiError('')

    // Animate steps while API runs in parallel
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
      onScreened()  // refresh parent
    } catch (e) {
      clearInterval(interval)
      setApiError(e instanceof Error ? e.message : 'Network error')
      setSimStep(0)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.80)', zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '460px',
        boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
      }}>
        <div style={{ textAlign: 'center' as const, marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>AI Phone Screen</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.2rem' }}>
            {match.candidate.first_name} {match.candidate.last_name} → {match.job.title}
          </div>
        </div>

        {existing ? (
          // Already screened — show result summary
          <div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.6rem', padding: '1rem', textAlign: 'center' as const, marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Screening Completed</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: RECOMMEND_COLOR[existing.recommendation ?? ''] ?? '#94a3b8' }}>
                {existing.recommendation?.replace(/_/g, ' ') ?? 'Reviewed'}
              </div>
            </div>
            <a href="/screening" style={{
              display: 'block', textAlign: 'center' as const, background: 'rgba(99,102,241,0.15)',
              border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc',
              borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700,
              textDecoration: 'none', marginBottom: '0.75rem',
            }}>
              View Full Screening Report →
            </a>
            <button onClick={onClose} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', borderRadius: '0.4rem', padding: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        ) : simStep === 0 ? (
          // Pre-call confirmation screen
          <div>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center' as const, marginBottom: '1.5rem' }}>
              The AI will conduct a structured phone call, score every response, flag concerns, and deliver a hiring recommendation — instantly saved to your Screening dashboard.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['Role-specific competency questions', 'Salary & notice confirmation', 'Motivation & cultural fit probing', 'Key concern flagging', 'Scored transcript + recommendation'].map(item => (
                <div key={item} style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item}</div>
              ))}
            </div>
            {apiError && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{apiError}</div>}
            <button onClick={startCall} style={{
              width: '100%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)',
              color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.85rem',
              fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
            }}>
              Start AI Screening Call
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: '#475569', padding: '0.6rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem' }}>Cancel</button>
          </div>
        ) : simStep < steps.length ? (
          // Animated progress (API running in background)
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: i < simStep ? 1 : i === simStep ? 0.8 : 0.2, transition: 'opacity 0.3s' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < simStep ? '#4ade80' : step.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.82rem', color: i < simStep ? '#4ade80' : step.color }}>{step.label}</span>
                  {i < simStep && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.75rem' }}>done</span>}
                  {i === simStep && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: step.color }}>running</span>}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.4rem', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', width: `${(simStep / steps.length) * 100}%`, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ color: '#334155', fontSize: '0.72rem', marginTop: '0.5rem', textAlign: 'center' as const }}>Running call & saving to database…</div>
          </div>
        ) : (
          // Complete — show result and link to screening page
          <div style={{ textAlign: 'center' as const }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4ade80', marginBottom: '0.3rem' }}>Screening Complete</div>
            {result && (
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: RECOMMEND_COLOR[result.recommendation] ?? '#94a3b8', marginBottom: '0.8rem' }}>
                {result.recommendation.replace(/_/g, ' ')}
              </div>
            )}
            <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              Full transcript, scored Q&amp;A, and recommendation are now live in your Screening dashboard.
            </div>
            <a href="/screening" style={{
              display: 'block', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
              color: '#4ade80', borderRadius: '0.5rem', padding: '0.7rem',
              fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '0.6rem',
            }}>
              View Screening Report →
            </a>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function PipelineTable({ matches }: { matches: Match[] }) {
  const router = useRouter()
  const [placementMatch, setPlacementMatch] = useState<Match | null>(null)
  const [screeningMatch, setScreeningMatch] = useState<Match | null>(null)
  const [filter, setFilter] = useState('ALL')

  // Pipeline = active work only. SUGGESTED/SHORTLISTED are legacy, map to CONTACTED in UI.
  const PIPELINE_STATUSES = ['CONTACTED', 'INTERVIEWING', 'OFFERED', 'PLACED']
  // Include legacy SUGGESTED/SHORTLISTED as CONTACTED in the pipeline
  const pipelineMatches = matches.filter(m =>
    PIPELINE_STATUSES.includes(m.status) || m.status === 'SUGGESTED' || m.status === 'SHORTLISTED'
  )
  const filterOptions = ['ALL', ...PIPELINE_STATUSES.filter(s => pipelineMatches.some(m => m.status === s))]

  const displayed = filter === 'ALL' ? pipelineMatches : pipelineMatches.filter(m => m.status === filter)

  return (
    <>
      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {filterOptions.map(f => {
          const count = f === 'ALL' ? pipelineMatches.length : pipelineMatches.filter(m => m.status === f).length
          const active = filter === f
          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: active ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: active ? '#a5b4fc' : '#64748b',
              borderRadius: '0.4rem', padding: '0.3rem 0.8rem',
              fontSize: '0.78rem', fontWeight: active ? 700 : 400, cursor: 'pointer',
            }}>
              {f.replace(/_/g, ' ')}
              <span style={{ marginLeft: '0.4rem', opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 2fr 120px 140px 1fr',
          gap: '0', padding: '0.7rem 1.25rem',
          background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)',
          fontSize: '0.7rem', color: '#475569', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' as const,
        }}>
          <span>Candidate</span><span>Role</span><span>Status</span><span>Screening</span><span style={{ textAlign: 'right' as const }}>Actions</span>
        </div>

        {displayed.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' as const, color: '#475569' }}>No matches in this stage.</div>
        ) : (
          displayed.map((m, idx) => {
            const hasScreen = m.screening_calls.length > 0
            const screen = m.screening_calls[0]
            const isPlaced = m.status === 'PLACED'
            const canScreen = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING'].includes(m.status)
            const canPlace = ['SUGGESTED', 'CONTACTED', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED'].includes(m.status) && !isPlaced

            return (
              <div key={m.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 2fr 120px 140px 1fr',
                gap: '0', padding: '1rem 1.25rem', alignItems: 'center',
                borderBottom: idx < displayed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: isPlaced ? 'rgba(34,197,94,0.03)' : 'transparent',
              }}>
                {/* Candidate */}
                <div>
                  <a href={`/candidates/${m.candidate.id}`} style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9', textDecoration: 'none' }}>
                    {m.candidate.first_name} {m.candidate.last_name}
                  </a>
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>{m.candidate.current_title}</div>
                  <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                    {m.candidate.skills.slice(0, 2).map(s => (
                      <span key={s.skill.name} style={{ background: 'rgba(99,102,241,0.1)', color: '#7c87d6', borderRadius: '0.2rem', padding: '0.05rem 0.35rem', fontSize: '0.65rem' }}>
                        {s.skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Job */}
                <div>
                  <a href={`/jobs/${m.job.id}`} style={{ fontWeight: 600, fontSize: '0.85rem', color: '#cbd5e1', textDecoration: 'none' }}>
                    {m.job.title}
                  </a>
                  <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                    {m.job.company?.name} · {m.job.company?.industry}
                  </div>
                </div>

                {/* Status */}
                <div><StatusBadge status={m.status} /></div>

                {/* Screening result */}
                <div>
                  {hasScreen ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', color: RECOMMEND_COLOR[screen?.recommendation ?? ''] ?? '#64748b', fontWeight: 700 }}>
                        {screen?.recommendation?.replace(/_/g, ' ') ?? '—'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#334155' }}>Screened</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#334155' }}>—</span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  {canScreen && (
                    <button
                      onClick={() => setScreeningMatch(m)}
                      style={{
                        background: hasScreen ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.18)',
                        border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc',
                        borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
                      }}>
                      {hasScreen ? 'Review Screening' : 'Run AI Screening'}
                    </button>
                  )}

                  {canPlace && (
                    <button
                      onClick={() => setPlacementMatch(m)}
                      style={{
                        background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                        color: '#4ade80', borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
                        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' as const,
                      }}>
                      Convert to Placement
                    </button>
                  )}

                  {isPlaced && m.placement && (
                    <a href={`/placements/${m.placement.id}`} style={{
                      background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)',
                      color: '#fbbf24', borderRadius: '0.35rem', padding: '0.3rem 0.7rem',
                      fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' as const,
                    }}>
                      £{Math.round(Number(m.placement.recruiter_earnings)).toLocaleString()} earned
                    </a>
                  )}

                  <a href={`/matches/${m.id}`} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    color: '#475569', borderRadius: '0.35rem', padding: '0.3rem 0.5rem',
                    fontSize: '0.72rem', textDecoration: 'none',
                  }}>
                    ›
                  </a>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modals */}
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

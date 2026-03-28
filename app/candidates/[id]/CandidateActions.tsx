'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ScreeningCall = { id: string; recommendation: string | null; status: string }
type Placement = { id: string; fee_total: number; recruiter_earnings: number }
type MatchWithJob = {
  id: string
  status: string
  overall_score: number
  job: { id: string; title: string; company: { name: string } | null }
  screening_calls: ScreeningCall[]
  placement: Placement | null
}

const STATUS_COLOR: Record<string, string> = {
  SUGGESTED: '#64748b', CONTACTED: '#3b82f6', SHORTLISTED: '#8b5cf6',
  INTERVIEWING: '#f59e0b', OFFERED: '#f97316', PLACED: '#22c55e', REJECTED: '#ef4444',
}

const RECOMMEND_COLOR: Record<string, string> = {
  STRONG_YES: '#22c55e', YES: '#4ade80', MAYBE: '#f59e0b', NO: '#f87171', STRONG_NO: '#ef4444',
}

// ─── Inline Screening Modal ───────────────────────────────────────────────────
function ScreeningModal({ match, onClose, onDone }: {
  match: MatchWithJob; onClose: () => void; onDone: () => void
}) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [result, setResult] = useState<string | null>(null)

  const steps = [
    { label: 'Analysing match profile',      color: '#6366f1' },
    { label: 'Preparing tailored questions', color: '#8b5cf6' },
    { label: 'Initiating AI video call',     color: '#3b82f6' },
    { label: 'Screening in progress',        color: '#06b6d4' },
    { label: 'Scoring responses',            color: '#f59e0b' },
    { label: 'Generating recommendation',    color: '#22c55e' },
  ]

  const existing = match.screening_calls[0]

  const startCall = async () => {
    setStep(1); setError('')
    let s = 1
    const interval = setInterval(() => { s = Math.min(s + 1, steps.length - 1); setStep(s) }, 700)
    try {
      const res = await fetch('/api/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId: match.id }),
      })
      const data = await res.json()
      clearInterval(interval)
      if (!res.ok) { setError(data.error ?? 'Screening failed'); setStep(0); return }
      setStep(steps.length)
      setResult(data.recommendation)
      onDone()
    } catch (e) {
      clearInterval(interval)
      setError(e instanceof Error ? e.message : 'Network error')
      setStep(0)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>AI Screening Call</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.25rem' }}>
            {match.job.title} · {match.job.company?.name}
          </div>
        </div>

        {existing ? (
          <div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.6rem', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Already Screened</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: RECOMMEND_COLOR[existing.recommendation ?? ''] ?? '#94a3b8' }}>
                {existing.recommendation?.replace(/_/g, ' ') ?? 'Reviewed'}
              </div>
            </div>
            <a href="/screening" style={{ display: 'block', textAlign: 'center', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '0.75rem' }}>
              View Full Screening Report →
            </a>
            <button onClick={onClose} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#475569', borderRadius: '0.4rem', padding: '0.6rem', fontSize: '0.82rem', cursor: 'pointer' }}>Close</button>
          </div>
        ) : step === 0 ? (
          <div>
            <div style={{ color: '#64748b', fontSize: '0.82rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              The AI will conduct a structured screening call, score every response, flag concerns, and deliver a hiring recommendation.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {['Role-specific competency questions', 'Salary & notice confirmation', 'Motivation & cultural fit probing', 'Key concerns flagged', 'Scored transcript + recommendation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ width: '5px', height: '5px', background: '#6366f1', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                  {item}
                </div>
              ))}
            </div>
            {error && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{error}</div>}
            <button onClick={startCall} style={{ width: '100%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.85rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
              Start AI Screening Call
            </button>
            <button onClick={onClose} style={{ width: '100%', background: 'transparent', border: 'none', color: '#475569', padding: '0.6rem', fontSize: '0.8rem', cursor: 'pointer', marginTop: '0.4rem' }}>Cancel</button>
          </div>
        ) : step < steps.length ? (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {steps.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', opacity: i < step ? 1 : i === step ? 0.9 : 0.2, transition: 'opacity 0.3s' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: i < step ? '#4ade80' : s.color, flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ fontSize: '0.82rem', color: i < step ? '#4ade80' : s.color }}>{s.label}</span>
                  {i < step && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.72rem' }}>done</span>}
                  {i === step && <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: s.color }}>running</span>}
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '0.4rem', height: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #22c55e)', width: `${(step / steps.length) * 100}%`, transition: 'width 0.5s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#4ade80', marginBottom: '0.4rem' }}>Screening Complete</div>
            {result && (
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: RECOMMEND_COLOR[result] ?? '#94a3b8', marginBottom: '0.75rem' }}>
                {result.replace(/_/g, ' ')}
              </div>
            )}
            <div style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              Full transcript and recommendation saved to your Screening dashboard.
            </div>
            <a href="/screening" style={{ display: 'block', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#4ade80', borderRadius: '0.5rem', padding: '0.7rem', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', marginBottom: '0.6rem' }}>
              View Screening Report →
            </a>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer' }}>Close</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Per-match action buttons ─────────────────────────────────────────────────
function MatchActions({ match, onRefresh }: { match: MatchWithJob; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  const [showScreening, setShowScreening] = useState(false)
  const { status } = match
  const hasScreen = match.screening_calls.length > 0

  const advance = async (newStatus: string) => {
    setLoading(true)
    await fetch(`/api/matches/${match.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setLoading(false)
    onRefresh()
  }

  const btnBase: React.CSSProperties = {
    borderRadius: '0.35rem', padding: '0.28rem 0.7rem',
    fontSize: '0.75rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1, border: '1px solid', whiteSpace: 'nowrap',
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {status === 'SUGGESTED' && (
          <button onClick={() => advance('CONTACTED')} style={{ ...btnBase, background: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)', color: '#60a5fa' }}>
            Contact
          </button>
        )}

        {status === 'CONTACTED' && (
          <>
            <button onClick={() => advance('SHORTLISTED')} style={{ ...btnBase, background: 'rgba(139,92,246,0.15)', borderColor: 'rgba(139,92,246,0.4)', color: '#a78bfa' }}>
              Shortlist
            </button>
            <button onClick={() => setShowScreening(true)} style={{ ...btnBase, background: 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.4)', color: '#a5b4fc' }}>
              AI Screening
            </button>
          </>
        )}

        {status === 'SHORTLISTED' && (
          <>
            <button onClick={() => setShowScreening(true)} style={{ ...btnBase, background: hasScreen ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.15)', borderColor: 'rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
              {hasScreen ? 'Review Screening' : 'AI Screening'}
            </button>
            <button onClick={() => advance('INTERVIEWING')} style={{ ...btnBase, background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.35)', color: '#fbbf24' }}>
              Schedule Interview
            </button>
          </>
        )}

        {status === 'INTERVIEWING' && (
          <>
            <button onClick={() => advance('OFFERED')} style={{ ...btnBase, background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.35)', color: '#fb923c' }}>
              Make Offer
            </button>
            <a href="/pipeline" style={{ ...btnBase, background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.3)', color: '#4ade80', textDecoration: 'none', display: 'inline-block' }}>
              Convert to Placement
            </a>
          </>
        )}

        {status === 'OFFERED' && (
          <a href="/pipeline" style={{ ...btnBase, background: 'rgba(34,197,94,0.12)', borderColor: 'rgba(34,197,94,0.35)', color: '#4ade80', textDecoration: 'none', display: 'inline-block' }}>
            Convert to Placement
          </a>
        )}

        {status === 'PLACED' && match.placement && (
          <a href={`/placements/${match.placement.id}`} style={{ ...btnBase, background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.25)', color: '#fbbf24', textDecoration: 'none', display: 'inline-block' }}>
            £{Math.round(Number(match.placement.recruiter_earnings)).toLocaleString()} earned
          </a>
        )}

        {(status === 'REJECTED') && (
          <button onClick={() => advance('SUGGESTED')} style={{ ...btnBase, background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#475569' }}>
            Restore
          </button>
        )}

        <button onClick={() => advance('REJECTED')} disabled={status === 'REJECTED' || status === 'PLACED'} style={{ ...btnBase, background: 'transparent', borderColor: 'rgba(239,68,68,0.2)', color: '#64748b', opacity: (status === 'REJECTED' || status === 'PLACED') ? 0.3 : 1 }}>
          Reject
        </button>
      </div>

      {showScreening && (
        <ScreeningModal
          match={match}
          onClose={() => setShowScreening(false)}
          onDone={() => { setShowScreening(false); onRefresh() }}
        />
      )}
    </>
  )
}

// ─── Pipeline status label with next-step hint ───────────────────────────────
const NEXT_STEP: Record<string, string> = {
  SUGGESTED:    'Next: contact candidate',
  CONTACTED:    'Next: shortlist or screen',
  SHORTLISTED:  'Next: schedule interview',
  INTERVIEWING: 'Next: make offer',
  OFFERED:      'Next: confirm placement',
  PLACED:       'Placement confirmed',
  REJECTED:     'Rejected',
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function CandidateActions({ initialMatches }: { initialMatches: MatchWithJob[] }) {
  const router = useRouter()
  const [matches, setMatches] = useState(initialMatches)

  const refresh = async () => {
    router.refresh()
    // Optimistically re-fetch by just triggering a router refresh; the server
    // component will re-query and pass new props on next render.
  }

  if (matches.length === 0) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '2rem', textAlign: 'center', color: '#475569', fontSize: '0.9rem' }}>
        No AI matches yet. Run the matching engine to find suitable roles for this candidate.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {matches.map((m) => {
        const statusColor = STATUS_COLOR[m.status] ?? '#64748b'
        const screen = m.screening_calls[0]
        const pct = Math.round(m.overall_score * 100)
        const scoreColor = pct >= 85 ? '#22c55e' : pct >= 70 ? '#f59e0b' : '#ef4444'

        return (
          <div key={m.id} style={{
            background: m.status === 'PLACED' ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${m.status === 'PLACED' ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: '0.6rem',
            padding: '0.9rem 1.1rem',
          }}>
            {/* Top row: job info + score + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <a href={`/jobs/${m.job.id}`} style={{ fontWeight: 600, fontSize: '0.88rem', color: '#f1f5f9', textDecoration: 'none' }}>
                  {m.job.title}
                </a>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                  {m.job.company?.name}
                </div>
              </div>

              {/* Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{ width: '44px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: scoreColor, borderRadius: '2px' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: scoreColor, fontWeight: 700 }}>{pct}%</span>
              </div>

              {/* Status badge */}
              <span style={{ background: `${statusColor}1a`, color: statusColor, border: `1px solid ${statusColor}44`, borderRadius: '0.3rem', padding: '0.15rem 0.55rem', fontSize: '0.7rem', fontWeight: 700 }}>
                {m.status.replace(/_/g, ' ')}
              </span>

              {/* Screening result if exists */}
              {screen?.recommendation && (
                <span style={{ color: RECOMMEND_COLOR[screen.recommendation] ?? '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>
                  {screen.recommendation.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Bottom row: hint + action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.72rem', color: '#334155' }}>
                {NEXT_STEP[m.status] ?? ''}
              </span>
              <MatchActions match={m} onRefresh={refresh} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

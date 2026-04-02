'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ScorecardModal from '../../components/ScorecardModal'
import OfferLetterModal from '../../components/OfferLetterModal'

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
  CONTACTED: '#3b82f6',
  INTERVIEWING: '#f59e0b',
  OFFERED: '#f97316',
  PLACED: '#22c55e',
  REJECTED: '#ef4444',
}

const STATUS_LABEL: Record<string, string> = {
  CONTACTED:    'Contacted',
  INTERVIEWING: 'Interviewing',
  OFFERED:      'Offer Made',
  PLACED:       'Placed',
  REJECTED:     'Rejected',
  // legacy statuses mapped gracefully
  SUGGESTED:    'In Pipeline',
  SHORTLISTED:  'Contacted',
  SCREENING:    'Screening',
  SUBMITTED:    'Submitted',
  INTERVIEW:    'Interviewing',
  OFFER:        'Offer Made',
  WITHDRAWN:    'Withdrawn',
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
    { label: 'Initiating AI phone call',     color: '#3b82f6' },
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
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.7)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: '0.25rem' }}>AI Phone Screen</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem' }}>
            {match.job.title} · {match.job.company?.name}
          </div>
        </div>

        {existing ? (
          <div>
            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.6rem', padding: '1rem', textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>Already Screened</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: RECOMMEND_COLOR[existing.recommendation ?? ''] ?? '#94a3b8' }}>
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
              The AI will conduct a structured phone call, score every response, flag concerns, and deliver a clear hiring recommendation.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
              {['Role-specific competency questions', 'Salary & notice confirmation', 'Motivation & cultural fit probing', 'Key concerns flagged automatically', 'Scored transcript + hire recommendation'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                  <span style={{ width: '5px', height: '5px', background: '#6366f1', borderRadius: '50%', flexShrink: 0, display: 'inline-block' }} />
                  {item}
                </div>
              ))}
            </div>
            {error && <div style={{ color: '#f87171', fontSize: '0.78rem', marginBottom: '0.75rem', background: 'rgba(239,68,68,0.1)', padding: '0.5rem 0.75rem', borderRadius: '0.4rem' }}>{error}</div>}
            <button onClick={startCall} style={{ width: '100%', background: 'rgba(99,102,241,0.18)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.9rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}>
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
              <div style={{ fontSize: '1.35rem', fontWeight: 900, color: RECOMMEND_COLOR[result] ?? '#94a3b8', marginBottom: '0.75rem' }}>
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
function MatchActions({ match, candidateName, onRefresh }: { match: MatchWithJob; candidateName: string; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false)
  const [showScreening, setShowScreening] = useState(false)
  const [showScorecard, setShowScorecard] = useState(false)
  const [showOfferLetter, setShowOfferLetter] = useState(false)
  const { status } = match
  const hasScreen = match.screening_calls.length > 0

  // Normalise legacy statuses to current flow
  const normStatus = status === 'SUGGESTED' || status === 'SHORTLISTED' ? 'CONTACTED' : status

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
    borderRadius: '0.35rem', padding: '0.3rem 0.75rem',
    fontSize: '0.75rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1, border: '1px solid', whiteSpace: 'nowrap',
    transition: 'opacity 0.15s ease',
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>

        {/* ── Contacted: run screen or advance to interview ── */}
        {normStatus === 'CONTACTED' && (
          <>
            <button onClick={() => setShowScreening(true)} style={{ ...btnBase, background: 'rgba(99,102,241,0.18)', borderColor: 'rgba(99,102,241,0.45)', color: '#a5b4fc', padding: '0.35rem 1rem' }}>
              Run AI Screen
            </button>
            <button onClick={() => advance('INTERVIEWING')} style={{ ...btnBase, background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.4)', color: '#fbbf24', padding: '0.35rem 1rem' }}>
              Schedule Interview
            </button>
          </>
        )}

        {/* ── Interviewing → scorecard + offer ── */}
        {normStatus === 'INTERVIEWING' && (
          <>
            {hasScreen && (
              <button onClick={() => setShowScreening(true)} style={{ ...btnBase, background: 'rgba(99,102,241,0.08)', borderColor: 'rgba(99,102,241,0.25)', color: '#818cf8' }}>
                Review Screening
              </button>
            )}
            <button onClick={() => setShowScorecard(true)} style={{ ...btnBase, background: 'rgba(245,158,11,0.12)', borderColor: 'rgba(245,158,11,0.35)', color: '#fbbf24' }}>
              Interview Scorecard
            </button>
            <button onClick={() => advance('OFFERED')} style={{ ...btnBase, background: 'rgba(249,115,22,0.15)', borderColor: 'rgba(249,115,22,0.4)', color: '#fb923c', padding: '0.35rem 1rem' }}>
              Make Offer
            </button>
          </>
        )}

        {/* ── Offered → view offer letter + confirm placement ── */}
        {normStatus === 'OFFERED' && (
          <>
            <button onClick={() => setShowOfferLetter(true)} style={{ ...btnBase, background: 'rgba(249,115,22,0.12)', borderColor: 'rgba(249,115,22,0.35)', color: '#fb923c' }}>
              View Offer Letter
            </button>
            <a href="/pipeline" style={{ ...btnBase, background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.4)', color: '#4ade80', textDecoration: 'none', display: 'inline-block', padding: '0.35rem 1rem' }}>
              Confirm Placement →
            </a>
          </>
        )}

        {/* ── Placed: show earnings ── */}
        {normStatus === 'PLACED' && match.placement && (
          <a href={`/placements/${match.placement.id}`} style={{ ...btnBase, background: 'rgba(251,191,36,0.1)', borderColor: 'rgba(251,191,36,0.25)', color: '#fbbf24', textDecoration: 'none', display: 'inline-block' }}>
            £{Math.round(Number(match.placement.recruiter_earnings)).toLocaleString()} earned — view
          </a>
        )}

        {/* ── Rejected: restore ── */}
        {normStatus === 'REJECTED' && (
          <button onClick={() => advance('CONTACTED')} style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.12)', color: '#64748b' }}>
            Restore to Pipeline
          </button>
        )}

        {/* Reject — available on any active non-placed stage */}
        {!['PLACED', 'REJECTED'].includes(normStatus) && (
          <button onClick={() => advance('REJECTED')} style={{ ...btnBase, background: 'transparent', borderColor: 'rgba(239,68,68,0.2)', color: '#475569' }}>
            Reject
          </button>
        )}
      </div>

      {showScreening && (
        <ScreeningModal
          match={match}
          onClose={() => setShowScreening(false)}
          onDone={() => { setShowScreening(false); onRefresh() }}
        />
      )}
      {showScorecard && (
        <ScorecardModal
          candidateName={candidateName}
          jobTitle={match.job.title}
          matchId={match.id}
          onClose={() => setShowScorecard(false)}
          onSaved={() => { setShowScorecard(false); onRefresh() }}
        />
      )}
      {showOfferLetter && (
        <OfferLetterModal
          candidateName={candidateName}
          jobTitle={match.job.title}
          companyName={match.job.company?.name ?? ''}
          salary={0}
          startDate=""
          onClose={() => setShowOfferLetter(false)}
        />
      )}
    </>
  )
}

// ─── Stage priority for deduplication ────────────────────────────────────────
const STAGE_RANK: Record<string, number> = {
  SUGGESTED: 0, CONTACTED: 1, SHORTLISTED: 1,
  INTERVIEWING: 2, OFFERED: 3, PLACED: 4, REJECTED: -1,
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function CandidateActions({
  initialMatches,
  candidateId,
  candidateName,
  fallbackJobId,
}: {
  initialMatches: MatchWithJob[]
  candidateId: string
  candidateName: string
  fallbackJobId: string | null
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const addToPipeline = async () => {
    if (!fallbackJobId) return
    setCreating(true); setCreateError('')
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate: { connect: { id: candidateId } },
          job: { connect: { id: fallbackJobId } },
          status: 'CONTACTED',
          overall_score: 0.75,
        }),
      })
      if (!res.ok) throw new Error('Failed to add to pipeline')
      router.refresh()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCreating(false)
    }
  }

  // Deduplicate: one row per job — keep the match furthest along in the pipeline
  const matches = Object.values(
    initialMatches.reduce<Record<string, MatchWithJob>>((acc, m) => {
      const existing = acc[m.job.id]
      if (!existing || (STAGE_RANK[m.status] ?? 0) > (STAGE_RANK[existing.status] ?? 0)) {
        acc[m.job.id] = m
      }
      return acc
    }, {})
  )

  const refresh = () => router.refresh()

  // ── Not yet in pipeline ────────────────────────────────────────────────────
  if (matches.length === 0) {
    return (
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.875rem',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.3rem', color: '#f1f5f9' }}>
            Not yet in pipeline
          </div>
          <div style={{ color: '#475569', fontSize: '0.85rem', lineHeight: 1.6 }}>
            Add this candidate to your pipeline to start tracking their progress toward a placement.
          </div>
        </div>

        {createError && (
          <div style={{ color: '#f87171', fontSize: '0.78rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.4rem', padding: '0.5rem 0.75rem' }}>
            {createError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={addToPipeline}
            disabled={creating || !fallbackJobId}
            style={{
              background: 'rgba(99,102,241,0.18)',
              border: '1px solid rgba(99,102,241,0.45)',
              color: '#a5b4fc',
              borderRadius: '0.5rem',
              padding: '0.6rem 1.4rem',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: creating || !fallbackJobId ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.6 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            {creating ? 'Adding to pipeline…' : '+ Add to Pipeline'}
          </button>

          {!fallbackJobId && (
            <span style={{ color: '#334155', fontSize: '0.8rem' }}>
              No active jobs —{' '}
              <a href="/jobs" style={{ color: '#6366f1', textDecoration: 'none' }}>add a job first</a>
            </span>
          )}

          <a
            href="/pipeline"
            style={{ color: '#475569', fontSize: '0.8rem', textDecoration: 'none' }}
          >
            View pipeline →
          </a>
        </div>
      </div>
    )
  }

  // ── Already in pipeline ────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {matches.map((m) => {
        const displayStatus = STATUS_LABEL[m.status] ?? m.status.replace(/_/g, ' ')
        const normStatus = m.status === 'SUGGESTED' || m.status === 'SHORTLISTED' ? 'CONTACTED' : m.status
        const statusColor = STATUS_COLOR[normStatus] ?? '#64748b'
        const screen = m.screening_calls[0]
        const isPlaced = normStatus === 'PLACED'

        return (
          <div key={m.id} style={{
            background: isPlaced ? 'rgba(34,197,94,0.04)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isPlaced ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '0.75rem',
            padding: '1rem 1.25rem',
          }}>
            {/* Top row: job + status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '160px' }}>
                <a href={`/jobs/${m.job.id}`} style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f1f5f9', textDecoration: 'none' }}>
                  {m.job.title}
                </a>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                  {m.job.company?.name}
                </div>
              </div>

              <span style={{
                background: `${statusColor}1a`, color: statusColor,
                border: `1px solid ${statusColor}44`,
                borderRadius: '0.3rem', padding: '0.2rem 0.6rem',
                fontSize: '0.72rem', fontWeight: 700,
              }}>
                {displayStatus}
              </span>

              {screen?.recommendation && (
                <span style={{ color: RECOMMEND_COLOR[screen.recommendation] ?? '#64748b', fontSize: '0.72rem', fontWeight: 700 }}>
                  {screen.recommendation.replace(/_/g, ' ')}
                </span>
              )}
            </div>

            {/* Actions */}
            <MatchActions match={{ ...m, status: normStatus }} candidateName={candidateName} onRefresh={refresh} />
          </div>
        )
      })}

      <div style={{ paddingTop: '0.25rem' }}>
        <a href="/pipeline" style={{ fontSize: '0.8rem', color: '#475569', textDecoration: 'none' }}>
          Manage full pipeline →
        </a>
      </div>
    </div>
  )
}

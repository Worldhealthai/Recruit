'use client'

import { useState } from 'react'

type Props = {
  candidateName: string
  jobTitle: string
  matchId: string
  onClose: () => void
  onSaved: () => void
}

const CRITERIA = [
  { key: 'communication', label: 'Communication', desc: 'Clarity, listening, articulation' },
  { key: 'technical', label: 'Technical Skills', desc: 'Role-specific knowledge and depth' },
  { key: 'culture', label: 'Culture Fit', desc: 'Values, work style, team dynamic' },
  { key: 'motivation', label: 'Motivation', desc: 'Enthusiasm for the role and company' },
  { key: 'experience', label: 'Relevant Experience', desc: 'Past work directly applicable to this role' },
]

function RatingInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div style={{ display: 'flex', gap: '0.3rem' }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: '32px', height: '32px', borderRadius: '0.3rem', border: '1px solid',
            fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
            background: n <= value ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.04)',
            borderColor: n <= value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)',
            color: n <= value ? '#a5b4fc' : '#475569',
          }}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

export default function ScorecardModal({ candidateName, jobTitle, matchId, onClose, onSaved }: Props) {
  const [scores, setScores] = useState<Record<string, number>>({})
  const [overallNotes, setOverallNotes] = useState('')
  const [recommendation, setRecommendation] = useState<'HIRE' | 'NO_HIRE' | 'CONSIDER' | ''>('')
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)

  const avg = Object.values(scores).length
    ? Math.round((Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length) * 10) / 10
    : 0

  const setScore = (key: string, val: number) => setScores(s => ({ ...s, [key]: val }))

  const submit = async () => {
    setSaving(true)
    const summary = [
      `--- Interview Scorecard ---`,
      ...CRITERIA.map(c => `${c.label}: ${scores[c.key] ?? '—'}/5`),
      `Average: ${avg}/5`,
      `Recommendation: ${recommendation || '—'}`,
      overallNotes ? `\nNotes: ${overallNotes}` : '',
    ].join('\n')

    await fetch(`/api/matches/${matchId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recruiter_notes: summary }),
    })
    setSaving(false)
    setSavedState(true)
    setTimeout(() => { onSaved(); onClose() }, 1200)
  }

  const recColors: Record<string, string> = { HIRE: '#22c55e', CONSIDER: '#f59e0b', NO_HIRE: '#ef4444' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 30px 70px rgba(0,0,0,0.7)' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.35rem' }}>Interview Scorecard</div>
          <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{candidateName}</div>
          <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: '0.15rem' }}>{jobTitle}</div>
        </div>

        {/* Criteria ratings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          {CRITERIA.map(c => (
            <div key={c.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#f1f5f9' }}>{c.label}</span>
                  <span style={{ color: '#475569', fontSize: '0.72rem', marginLeft: '0.5rem' }}>{c.desc}</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: scores[c.key] ? '#a5b4fc' : '#334155' }}>
                  {scores[c.key] ? `${scores[c.key]}/5` : 'Not rated'}
                </span>
              </div>
              <RatingInput value={scores[c.key] ?? 0} onChange={val => setScore(c.key, val)} />
            </div>
          ))}
        </div>

        {/* Average */}
        {avg > 0 && (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Overall average</span>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: avg >= 4 ? '#4ade80' : avg >= 3 ? '#f59e0b' : '#f87171' }}>{avg} / 5</span>
          </div>
        )}

        {/* Recommendation */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600 }}>Hire recommendation</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['HIRE', 'CONSIDER', 'NO_HIRE'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRecommendation(r)}
                style={{ flex: 1, padding: '0.5rem', borderRadius: '0.4rem', border: '1px solid', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', background: recommendation === r ? `${recColors[r]}22` : 'rgba(255,255,255,0.04)', borderColor: recommendation === r ? recColors[r] + '88' : 'rgba(255,255,255,0.1)', color: recommendation === r ? recColors[r] : '#475569' }}
              >
                {r.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>Interview notes</label>
          <textarea
            value={overallNotes}
            onChange={e => setOverallNotes(e.target.value)}
            placeholder="Key impressions, strengths, concerns, follow-up questions..."
            rows={3}
            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.4rem', padding: '0.65rem 0.75rem', color: '#f8fafc', fontSize: '0.85rem', lineHeight: 1.55, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        {saved ? (
          <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center', color: '#4ade80', fontWeight: 700, fontSize: '0.88rem' }}>
            Scorecard saved
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={onClose} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748b', borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.85rem', cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={submit}
              disabled={saving || Object.keys(scores).length === 0}
              style={{ flex: 2, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', opacity: Object.keys(scores).length === 0 ? 0.5 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Scorecard'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

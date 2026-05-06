'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Match = {
  id: string
  status: string
  job: { id: string; title: string; company: { name: string } | null }
}

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  CONTACTED:    { bg: '#eff6ff', text: '#2563eb', dot: '#3b82f6' },
  INTERVIEWING: { bg: '#fffbeb', text: '#d97706', dot: '#f59e0b' },
  OFFERED:      { bg: '#fff7ed', text: '#ea580c', dot: '#f97316' },
  PLACED:       { bg: '#f0fdf4', text: '#16a34a', dot: '#22c55e' },
  REJECTED:     { bg: '#fef2f2', text: '#dc2626', dot: '#ef4444' },
}

function getStatusStyle(status: string) {
  const norm = status === 'SUGGESTED' || status === 'SHORTLISTED' ? 'CONTACTED' : status
  return STATUS_COLORS[norm] ?? { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af' }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    CONTACTED: 'In Pipeline', INTERVIEWING: 'Interviewing',
    OFFERED: 'Offer Made', PLACED: 'Placed', REJECTED: 'Rejected',
    SUGGESTED: 'In Pipeline', SHORTLISTED: 'In Pipeline',
  }
  return map[status] ?? status.replace(/_/g, ' ')
}

export default function CandidateActions({
  initialMatches,
  candidateId,
  fallbackJobId,
}: {
  initialMatches: Match[]
  candidateId: string
  candidateName: string
  fallbackJobId: string | null
}) {
  const router = useRouter()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const addToPipeline = async () => {
    if (!fallbackJobId) return
    setCreating(true); setError('')
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
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setCreating(false)
    }
  }

  // Deduplicate matches by job — keep furthest-along stage
  const RANK: Record<string, number> = {
    SUGGESTED: 1, SHORTLISTED: 1, CONTACTED: 1,
    INTERVIEWING: 2, OFFERED: 3, PLACED: 4, REJECTED: 0,
  }
  const deduped = Object.values(
    initialMatches.reduce<Record<string, Match>>((acc, m) => {
      const ex = acc[m.job.id]
      if (!ex || (RANK[m.status] ?? 0) > (RANK[ex.status] ?? 0)) acc[m.job.id] = m
      return acc
    }, {})
  )

  if (deduped.length === 0) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px', padding: '1.5rem',
      }}>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
          Add this candidate to your pipeline to begin working with them — contact, screen, and ultimately place them.
        </p>

        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.78rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '0.5rem 0.75rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={addToPipeline}
            disabled={creating || !fallbackJobId}
            className="btn-primary"
            style={{
              background: '#111111', color: '#ffffff',
              border: 'none', borderRadius: '8px',
              padding: '0.65rem 1.5rem', fontSize: '0.875rem', fontWeight: 600,
              cursor: creating || !fallbackJobId ? 'not-allowed' : 'pointer',
              opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? 'Adding…' : '+ Add to Pipeline'}
          </button>

          {!fallbackJobId && (
            <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>
              No active jobs —{' '}
              <a href="/jobs" style={{ color: '#6366f1', textDecoration: 'underline' }}>create one first</a>
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
        {deduped.map(m => {
          const style = getStatusStyle(m.status)
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: style.dot, flexShrink: 0 }} />
              <span style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500, flex: 1 }}>
                {m.job.title}
                {m.job.company && <span style={{ color: '#9ca3af', fontWeight: 400 }}> · {m.job.company.name}</span>}
              </span>
              <span style={{
                background: style.bg, color: style.text,
                borderRadius: '999px', padding: '0.15rem 0.65rem',
                fontSize: '0.72rem', fontWeight: 600,
              }}>
                {statusLabel(m.status)}
              </span>
            </div>
          )
        })}
      </div>

      <a
        href="/pipeline"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: '#111111', color: '#ffffff',
          borderRadius: '8px', padding: '0.55rem 1.25rem',
          fontSize: '0.83rem', fontWeight: 600, textDecoration: 'none',
        }}
      >
        Manage in Pipeline →
      </a>
    </div>
  )
}

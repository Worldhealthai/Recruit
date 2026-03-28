'use client'

import { useState, useEffect } from 'react'

export default function CandidateNotes({ candidateId }: { candidateId: string }) {
  const key = `candidate_notes_${candidateId}`
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) { setNotes(stored); setLastSaved(new Date().toLocaleTimeString()) }
  }, [key])

  const save = () => {
    localStorage.setItem(key, notes)
    setSaved(true)
    setLastSaved(new Date().toLocaleTimeString())
  }

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Recruiter Notes</h2>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {lastSaved && saved && (
            <span style={{ fontSize: '0.72rem', color: '#334155' }}>Saved {lastSaved}</span>
          )}
          {!saved && (
            <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Unsaved changes</span>
          )}
          <button
            onClick={save}
            disabled={saved}
            style={{ background: saved ? 'rgba(255,255,255,0.04)' : 'rgba(99,102,241,0.2)', border: `1px solid ${saved ? 'rgba(255,255,255,0.08)' : 'rgba(99,102,241,0.4)'}`, color: saved ? '#334155' : '#a5b4fc', borderRadius: '0.35rem', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: saved ? 'default' : 'pointer' }}
          >
            Save
          </button>
        </div>
      </div>
      <textarea
        value={notes}
        onChange={e => { setNotes(e.target.value); setSaved(false) }}
        onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save() } }}
        placeholder="Add notes about this candidate — interview feedback, salary discussions, client preferences, follow-up reminders..."
        rows={5}
        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem', padding: '0.75rem', color: '#f8fafc', fontSize: '0.85rem', lineHeight: 1.6, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
      />
      <div style={{ fontSize: '0.7rem', color: '#1e293b', marginTop: '0.35rem' }}>Cmd/Ctrl + S to save</div>
    </div>
  )
}

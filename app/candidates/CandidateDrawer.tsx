'use client'

import { useEffect } from 'react'

interface Skill { skill: { name: string } }
interface Candidate {
  id: string
  first_name: string
  last_name: string
  current_title: string
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  location_city: string
  location_country: string
  salary_expectation_min?: number | null
  salary_expectation_max?: number | null
  years_experience?: number | null
  availability_status: string
  seniority_level: string
  summary?: string | null
  skills: Skill[]
  current_company?: { name: string } | null
}

const AVAIL_COLOR: Record<string, string> = {
  ACTIVELY_LOOKING: '#22c55e',
  OPEN_TO_OFFERS:   '#f59e0b',
  PASSIVE:          '#64748b',
  NOT_LOOKING:      '#475569',
}

export default function CandidateDrawer({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const initials = `${candidate.first_name[0]}${candidate.last_name[0]}`.toUpperCase()
  const availColor = AVAIL_COLOR[candidate.availability_status] ?? '#64748b'

  const fmt = (n?: number | null) => n ? `£${Number(n).toLocaleString()}` : null
  const salaryRange = fmt(candidate.salary_expectation_min) && fmt(candidate.salary_expectation_max)
    ? `${fmt(candidate.salary_expectation_min)} – ${fmt(candidate.salary_expectation_max)}`
    : fmt(candidate.salary_expectation_min) ?? fmt(candidate.salary_expectation_max) ?? null

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 400 }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, width: 520, height: '100vh',
        background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.08)',
        zIndex: 401, display: 'flex', flexDirection: 'column',
        fontFamily: "system-ui,-apple-system,sans-serif",
        animation: 'slideIn 0.25s ease',
      }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Avatar */}
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem', flexShrink: 0 }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                {candidate.first_name} {candidate.last_name}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.1rem' }}>
                {candidate.current_title}
                {candidate.current_company && <span style={{ color: '#64748b' }}> · {candidate.current_company.name}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.35rem' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: availColor, flexShrink: 0, boxShadow: candidate.availability_status === 'ACTIVELY_LOOKING' ? `0 0 6px ${availColor}` : 'none' }} />
                <span style={{ fontSize: '0.72rem', color: availColor, fontWeight: 600 }}>
                  {candidate.availability_status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem' }}>

          {/* Contact info */}
          {(candidate.email || candidate.phone) && (
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '0.6rem', padding: '0.85rem 1rem', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Contact</div>
              {candidate.email && (
                <a href={`mailto:${candidate.email}`} style={{ display: 'block', color: '#a5b4fc', fontSize: '0.82rem', textDecoration: 'none', marginBottom: '0.2rem' }}>
                  ✉ {candidate.email}
                </a>
              )}
              {candidate.phone && (
                <a href={`tel:${candidate.phone}`} style={{ display: 'block', color: '#a5b4fc', fontSize: '0.82rem', textDecoration: 'none' }}>
                  ✆ {candidate.phone}
                </a>
              )}
              {candidate.linkedin_url && (
                <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" style={{ display: 'block', color: '#60a5fa', fontSize: '0.82rem', textDecoration: 'none', marginTop: '0.2rem' }}>
                  ↗ LinkedIn
                </a>
              )}
            </div>
          )}

          {/* Quick stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginBottom: '1.25rem' }}>
            {[
              { label: 'Location',    value: `${candidate.location_city}, ${candidate.location_country}` },
              { label: 'Seniority',   value: candidate.seniority_level.replace(/_/g, ' ') },
              { label: 'Experience',  value: candidate.years_experience ? `${candidate.years_experience} yrs` : '—' },
              { label: 'Salary',      value: salaryRange ?? '—' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '0.65rem 0.8rem' }}>
                <div style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>{s.label}</div>
                <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 600 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {candidate.summary && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>About</div>
              <p style={{ color: '#94a3b8', fontSize: '0.83rem', lineHeight: 1.65, margin: 0 }}>{candidate.summary}</p>
            </div>
          )}

          {/* Skills */}
          {candidate.skills.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Skills</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {candidate.skills.map(s => (
                  <span key={s.skill.name} style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.3rem', padding: '0.2rem 0.55rem', fontSize: '0.75rem', fontWeight: 500 }}>
                    {s.skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
          {candidate.email && (
            <a href={`mailto:${candidate.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: '0.5rem', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}>
              Contact
            </a>
          )}
          <a href={`/candidates/${candidate.id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1', borderRadius: '0.5rem', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
            Full Profile →
          </a>
          <a href={`/pipeline`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', color: '#a78bfa', borderRadius: '0.5rem', padding: '0.6rem', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}>
            Add to Pipeline
          </a>
        </div>
      </div>

      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </>
  )
}

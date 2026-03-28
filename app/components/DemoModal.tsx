'use client'

import { useState, useEffect, useRef } from 'react'

const SCREENS = [
  {
    title: 'AI suggests the best candidates for every role',
    desc: 'The matching engine scores every candidate across skills, experience, location, salary and culture fit — surfacing the strongest matches instantly.',
    bg: '#0f172a',
    accent: '#6366f1',
    visual: 'matches',
  },
  {
    title: 'Contact candidates and track every interaction',
    desc: 'Mark candidates as contacted, log notes, and move them through your pipeline in one click. Every stage is timestamped and visible.',
    bg: '#0f172a',
    accent: '#3b82f6',
    visual: 'pipeline',
  },
  {
    title: 'AI phone screening — no manual calls needed',
    desc: 'The AI conducts a structured phone screen, asks role-specific questions, scores every response, flags concerns, and delivers a STRONG YES / YES / MAYBE / NO recommendation.',
    bg: '#0f172a',
    accent: '#8b5cf6',
    visual: 'screening',
  },
  {
    title: 'Shortlist and move to interview in seconds',
    desc: 'Once screened, shortlist candidates with one click. Schedule interviews, advance to offer stage, and keep your client updated throughout.',
    bg: '#0f172a',
    accent: '#f59e0b',
    visual: 'shortlist',
  },
  {
    title: 'Confirm placements and track your earnings',
    desc: 'Enter the agreed salary and fee percentage — the platform calculates your gross fee, platform cut, and net earnings. Every invoice tracked in one place.',
    bg: '#0f172a',
    accent: '#22c55e',
    visual: 'placement',
  },
]

function VisualMockup({ type, accent }: { type: string; accent: string }) {
  const card = (label: string, sub: string, color: string = '#64748b') => (
    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.7rem 1rem', marginBottom: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9' }}>{label}</div>
          <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.1rem' }}>{sub}</div>
        </div>
        <span style={{ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>
          {type === 'matches' ? 'AI MATCH' : type === 'pipeline' ? 'CONTACTED' : type === 'shortlist' ? 'SHORTLISTED' : 'PLACED'}
        </span>
      </div>
    </div>
  )

  if (type === 'matches') return (
    <div>
      {[
        ['James Thornton', 'Senior React Engineer · 8y exp', '#6366f1'],
        ['Priya Mehta', 'Full Stack Developer · 5y exp', '#6366f1'],
        ['Daniel Osei', 'Frontend Lead · 10y exp', '#8b5cf6'],
      ].map(([n, s, c]) => card(n, s, c))}
    </div>
  )

  if (type === 'pipeline') return (
    <div>
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {['All', 'Contacted', 'Shortlisted', 'Offered', 'Placed'].map(s => (
          <span key={s} style={{ background: s === 'Contacted' ? `${accent}22` : 'rgba(255,255,255,0.05)', color: s === 'Contacted' ? accent : '#64748b', border: `1px solid ${s === 'Contacted' ? accent + '44' : 'rgba(255,255,255,0.08)'}`, borderRadius: '0.3rem', padding: '0.15rem 0.6rem', fontSize: '0.68rem', fontWeight: s === 'Contacted' ? 700 : 400 }}>{s}</span>
        ))}
      </div>
      {[
        ['Sarah Mitchell', 'Senior Product Manager · Deliveroo'],
        ['Tom Hughes', 'Engineering Manager · ASOS'],
      ].map(([n, s]) => (
        <div key={n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.45rem', padding: '0.65rem 0.9rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{n}</div><div style={{ fontSize: '0.7rem', color: '#64748b' }}>{s}</div></div>
          <span style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>CONTACTED</span>
        </div>
      ))}
    </div>
  )

  if (type === 'screening') return (
    <div>
      <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>AI Phone Screen — James Thornton</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {['Analysing match profile', 'Preparing role-specific questions', 'Conducting phone call', 'Scoring responses', 'Generating recommendation'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < 4 ? '#4ade80' : '#6366f1', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ color: i < 4 ? '#4ade80' : '#a5b4fc' }}>{s}</span>
              {i < 4 && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.65rem' }}>done</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', textAlign: 'center' }}>
        <div style={{ color: '#4ade80', fontWeight: 800, fontSize: '1.1rem' }}>STRONG YES</div>
        <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.2rem' }}>Recommendation saved to Screening dashboard</div>
      </div>
    </div>
  )

  if (type === 'shortlist') return (
    <div>
      {[
        { name: 'James Thornton', rec: 'STRONG YES', recColor: '#22c55e', status: 'SHORTLISTED', statusColor: '#8b5cf6' },
        { name: 'Priya Mehta', rec: 'YES', recColor: '#4ade80', status: 'SHORTLISTED', statusColor: '#8b5cf6' },
        { name: 'Daniel Osei', rec: 'MAYBE', recColor: '#f59e0b', status: 'INTERVIEWING', statusColor: '#f59e0b' },
      ].map(r => (
        <div key={r.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.45rem', padding: '0.65rem 0.9rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{r.name}</div><div style={{ fontSize: '0.7rem', color: r.recColor, fontWeight: 700 }}>{r.rec}</div></div>
          <span style={{ background: `${r.statusColor}22`, color: r.statusColor, border: `1px solid ${r.statusColor}44`, borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.65rem', fontWeight: 700 }}>{r.status}</span>
        </div>
      ))}
    </div>
  )

  // placement
  return (
    <div>
      <div style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.6rem', padding: '1rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Placement Confirmed</div>
        {[
          { label: 'Agreed Salary', value: '£85,000', color: '#94a3b8' },
          { label: 'Fee (20%)', value: '£17,000', color: '#a5b4fc' },
          { label: 'Platform cut (10%)', value: '−£1,700', color: '#f87171' },
          { label: 'Your net earnings', value: '£15,300', color: '#4ade80', bold: true },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: r.bold ? '0.88rem' : '0.78rem', borderTop: r.bold ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingTop: r.bold ? '0.5rem' : '0', marginBottom: '0.3rem' }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ color: r.color, fontWeight: r.bold ? 800 : 600 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const NARRATION = [
  'Welcome to RecruitAI. The matching engine automatically scores every candidate in your talent pool against open roles — surfacing the strongest fits instantly, so you never miss a great hire.',
  'Once a candidate is identified, mark them as contacted and track every interaction. Your full pipeline is visible in one place, with every stage timestamped.',
  'The AI conducts a structured phone screen on your behalf. It asks role-specific questions, scores every answer, flags concerns, and delivers a clear recommendation — Strong Yes, Yes, Maybe, or No.',
  'After screening, shortlist the best candidates with one click. Advance them to interview, then to offer stage — all tracked in your personal pipeline.',
  'When a placement is confirmed, enter the agreed salary and fee percentage. RecruitAI calculates your gross fee, platform cut, and net earnings instantly — and logs every invoice.',
]

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [voiceOn, setVoiceOn] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Auto-advance timer — longer when voice is on so narration can finish
  useEffect(() => {
    if (!playing) return
    const delay = voiceOn ? 8000 : 4000
    const t = setTimeout(() => {
      setCurrent(c => (c + 1) % SCREENS.length)
    }, delay)
    return () => clearTimeout(t)
  }, [current, playing, voiceOn])

  // Voice narration via Web Speech API
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (!voiceOn) return
    const u = new SpeechSynthesisUtterance(NARRATION[current])
    u.rate = 0.92
    u.pitch = 1.05
    // Prefer a natural-sounding voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
                      voices.find(v => v.lang.startsWith('en-GB')) ||
                      voices.find(v => v.lang.startsWith('en'))
    if (preferred) u.voice = preferred
    utterRef.current = u
    window.speechSynthesis.speak(u)
    return () => { window.speechSynthesis.cancel() }
  }, [current, voiceOn])

  // Stop speech when modal closes
  useEffect(() => {
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }
  }, [])

  const screen = SCREENS[current]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', width: '100%', maxWidth: '820px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.7)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>Recruit<span style={{ color: '#6366f1' }}>AI</span> — Product Tour</span>
            <span style={{ marginLeft: '1rem', fontSize: '0.75rem', color: '#475569' }}>{current + 1} of {SCREENS.length}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <button
              onClick={() => setVoiceOn(v => !v)}
              title={voiceOn ? 'Mute narration' : 'Enable voice narration'}
              style={{ background: voiceOn ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${voiceOn ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, color: voiceOn ? '#a5b4fc' : '#64748b', borderRadius: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}>
              {voiceOn ? 'Voice on' : 'Voice off'}
            </button>
            <button onClick={() => setPlaying(p => !p)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.78rem', cursor: 'pointer' }}>
              {playing ? 'Pause' : 'Play'}
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.25rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '3px', padding: '0.75rem 1.75rem 0' }}>
          {SCREENS.map((_, i) => (
            <button key={i} onClick={() => { setCurrent(i); setPlaying(false) }} style={{ flex: 1, height: '3px', background: i <= current ? screen.accent : 'rgba(255,255,255,0.1)', borderRadius: '2px', border: 'none', cursor: 'pointer', transition: 'background 0.3s' }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', minHeight: '340px' }}>
          {/* Left: text */}
          <div style={{ padding: '2rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ width: '32px', height: '3px', background: screen.accent, borderRadius: '2px', marginBottom: '1.25rem' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.9rem', color: '#f8fafc' }}>
              {screen.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.7, margin: 0 }}>
              {screen.desc}
            </p>
          </div>

          {/* Right: visual mockup */}
          <div style={{ background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem' }}>
            <VisualMockup type={screen.visual} accent={screen.accent} />
          </div>
        </div>

        {/* Nav footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => { setCurrent(c => Math.max(0, c - 1)); setPlaying(false) }}
            disabled={current === 0}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: current === 0 ? '#334155' : '#94a3b8', borderRadius: '0.4rem', padding: '0.45rem 1.1rem', fontSize: '0.82rem', cursor: current === 0 ? 'default' : 'pointer' }}
          >
            Previous
          </button>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {SCREENS.map((_, i) => (
              <button key={i} onClick={() => { setCurrent(i); setPlaying(false) }} style={{ width: '7px', height: '7px', borderRadius: '50%', background: i === current ? screen.accent : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: 0, transition: 'background 0.2s' }} />
            ))}
          </div>

          {current < SCREENS.length - 1 ? (
            <button
              onClick={() => { setCurrent(c => c + 1); setPlaying(false) }}
              style={{ background: screen.accent, border: 'none', color: '#fff', borderRadius: '0.4rem', padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Next
            </button>
          ) : (
            <a href="/login" style={{ background: '#22c55e', border: 'none', color: '#fff', borderRadius: '0.4rem', padding: '0.45rem 1.1rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
              Try it now →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

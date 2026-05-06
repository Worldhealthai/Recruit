'use client'

import { useState, useEffect, useRef } from 'react'

const SCREENS = [
  {
    title: 'Every candidate, scored and ranked instantly',
    desc: 'The moment a candidate enters your pool, our AI cross-references them against every open role — scoring across skills, seniority, experience, location, and salary. The strongest fits surface at the top. Zero manual effort.',
    bg: '#0f172a',
    accent: '#6366f1',
    visual: 'matches',
  },
  {
    title: 'Your pipeline. Every stage. One place.',
    desc: 'Mark candidates as contacted, log notes, and move them forward. Your entire recruitment workflow is tracked, timestamped, and visible at a glance — so nothing slips and nothing gets lost.',
    bg: '#0f172a',
    accent: '#3b82f6',
    visual: 'pipeline',
  },
  {
    title: 'AI phone screening. No calendar. No calls.',
    desc: 'One click triggers a structured phone screen conducted entirely by AI. It asks the right questions, digs into motivation, confirms salary and notice, flags red flags, and hands you a scored transcript with a clear recommendation.',
    bg: '#0f172a',
    accent: '#8b5cf6',
    visual: 'screening',
  },
  {
    title: 'From interview to offer in seconds',
    desc: 'Move candidates to interview when you\'re ready. Make the offer when the time is right. Every stage is tracked, every action is one click. Your pipeline moves as fast as you do.',
    bg: '#0f172a',
    accent: '#f59e0b',
    visual: 'interview',
  },
  {
    title: 'Confirm the placement. Watch the money.',
    desc: 'Enter the agreed salary and your fee percentage — RecruitAI calculates your gross fee, the platform cut, and your net earnings in real time. Every placement logged. Every invoice tracked. Your earnings, crystal clear.',
    bg: '#0f172a',
    accent: '#22c55e',
    visual: 'placement',
  },
]

function VisualMockup({ type, accent }: { type: string; accent: string }) {
  if (type === 'matches') return (
    <div>
      <div style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.6rem' }}>Top Matches — Senior React Engineer</div>
      {[
        { name: 'James Thornton', meta: 'Senior React · 8y exp · London', score: 96, color: '#6366f1' },
        { name: 'Priya Mehta', meta: 'Full Stack Dev · 5y exp · Remote', score: 88, color: '#8b5cf6' },
        { name: 'Daniel Osei', meta: 'Frontend Lead · 10y exp · London', score: 81, color: '#8b5cf6' },
      ].map((c, i) => (
        <div key={c.name} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? accent + '44' : 'rgba(255,255,255,0.08)'}`, borderRadius: '0.5rem', padding: '0.65rem 0.85rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#f1f5f9' }}>{c.name}</div>
            <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.1rem' }}>{c.meta}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: c.color }}>{c.score}%</div>
            <div style={{ fontSize: '0.62rem', color: '#475569' }}>match</div>
          </div>
        </div>
      ))}
    </div>
  )

  if (type === 'pipeline') return (
    <div>
      <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        {['All', 'Contacted', 'Interviewing', 'Offered', 'Placed'].map(s => (
          <span key={s} style={{
            background: s === 'Contacted' ? `${accent}22` : 'rgba(255,255,255,0.05)',
            color: s === 'Contacted' ? accent : '#64748b',
            border: `1px solid ${s === 'Contacted' ? accent + '44' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '0.3rem', padding: '0.15rem 0.55rem', fontSize: '0.66rem', fontWeight: s === 'Contacted' ? 700 : 400,
          }}>{s}</span>
        ))}
      </div>
      {[
        { name: 'Sarah Mitchell', role: 'Senior PM · Deliveroo', stage: 'CONTACTED' },
        { name: 'Tom Hughes', role: 'Eng Manager · ASOS', stage: 'CONTACTED' },
      ].map(c => (
        <div key={c.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.45rem', padding: '0.65rem 0.9rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{c.name}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{c.role}</div>
          </div>
          <span style={{ background: `${accent}22`, color: accent, border: `1px solid ${accent}44`, borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.62rem', fontWeight: 700 }}>{c.stage}</span>
        </div>
      ))}
    </div>
  )

  if (type === 'screening') return (
    <div>
      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.5rem', padding: '0.8rem 1rem', marginBottom: '0.75rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>AI Screen — James Thornton</div>
        {['Analysing match profile', 'Preparing role-specific questions', 'Conducting phone call', 'Scoring responses', 'Generating recommendation'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.73rem', marginBottom: '0.25rem' }}>
            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: i < 4 ? '#4ade80' : '#6366f1', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ color: i < 4 ? '#4ade80' : '#a5b4fc' }}>{s}</span>
            {i < 4 && <span style={{ marginLeft: 'auto', color: '#4ade80', fontSize: '0.62rem' }}>done</span>}
          </div>
        ))}
      </div>
      <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '0.5rem', padding: '0.75rem', textAlign: 'center' }}>
        <div style={{ color: '#4ade80', fontWeight: 900, fontSize: '1.1rem', letterSpacing: '0.02em' }}>STRONG YES</div>
        <div style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '0.2rem' }}>Transcript & scores saved to dashboard</div>
      </div>
    </div>
  )

  if (type === 'interview') return (
    <div>
      {[
        { name: 'James Thornton', rec: 'STRONG YES', recColor: '#22c55e', status: 'INTERVIEWING', statusColor: '#f59e0b' },
        { name: 'Priya Mehta', rec: 'YES', recColor: '#4ade80', status: 'INTERVIEWING', statusColor: '#f59e0b' },
        { name: 'Daniel Osei', rec: 'MAYBE', recColor: '#f59e0b', status: 'CONTACTED', statusColor: '#3b82f6' },
      ].map(r => (
        <div key={r.name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.45rem', padding: '0.65rem 0.9rem', marginBottom: '0.45rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{r.name}</div>
            <div style={{ fontSize: '0.7rem', color: r.recColor, fontWeight: 700 }}>{r.rec}</div>
          </div>
          <span style={{ background: `${r.statusColor}22`, color: r.statusColor, border: `1px solid ${r.statusColor}44`, borderRadius: '0.3rem', padding: '0.1rem 0.5rem', fontSize: '0.62rem', fontWeight: 700 }}>{r.status}</span>
        </div>
      ))}
    </div>
  )

  // placement
  return (
    <div>
      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)', borderRadius: '0.6rem', padding: '1rem' }}>
        <div style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Placement Confirmed — James Thornton</div>
        {[
          { label: 'Agreed Salary', value: '£92,000', color: '#94a3b8' },
          { label: 'Fee (20%)', value: '£18,400', color: '#a5b4fc' },
          { label: 'Platform cut (10%)', value: '−£1,840', color: '#f87171' },
          { label: 'Your net earnings', value: '£16,560', color: '#4ade80', bold: true },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: r.bold ? '0.9rem' : '0.78rem', borderTop: r.bold ? '1px solid rgba(255,255,255,0.07)' : 'none', paddingTop: r.bold ? '0.5rem' : '0', marginBottom: '0.3rem' }}>
            <span style={{ color: '#64748b' }}>{r.label}</span>
            <span style={{ color: r.color, fontWeight: r.bold ? 900 : 600 }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const NARRATION = [
  'Meet your new best hire. RecruitAI\'s matching engine scores every candidate against every open role the moment they enter your pool — surfacing the strongest fits instantly, ranked by overall match. Skills, seniority, location, salary — all weighted automatically. You see the best candidates first, every time.',
  'Your pipeline is your command centre. Every candidate, every role, every stage — tracked, timestamped, and visible at a glance. Mark someone as contacted. Log a note. Move them forward. Nothing falls through the cracks. Your whole team can see exactly where things stand.',
  'No more playing phone tag. The AI conducts a full structured screening call on your behalf — asking role-specific questions, probing motivation and cultural fit, confirming notice period and salary expectations. Then it hands you a scored transcript and a clear recommendation. Strong Yes. Yes. Maybe. Or No. So you only speak to the people worth your time.',
  'When a candidate is ready, you move fast. Advance them to interview in one click. Make the offer when the time is right. The whole workflow follows your pace — structured, tracked, and crystal clear at every stage.',
  'This is what you\'re working towards. Enter the agreed salary, set your fee percentage, and RecruitAI calculates everything instantly — gross fee, platform cut, your net earnings. Every placement is logged, every invoice tracked, and your total billed is always live on your dashboard. Your money, always visible.',
]

export default function DemoModal({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [voiceOn, setVoiceOn] = useState(false)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Auto-advance timer
  useEffect(() => {
    if (!playing) return
    const delay = voiceOn ? 10000 : 5000
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
    u.rate = 0.88
    u.pitch = 1.0
    u.volume = 1.0

    // Prefer the most natural-sounding voice available
    const tryVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const preferred =
        voices.find(v => v.name === 'Google UK English Female') ||
        voices.find(v => v.name === 'Samantha') ||
        voices.find(v => v.name.includes('Female') && v.lang.startsWith('en')) ||
        voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) ||
        voices.find(v => v.lang === 'en-GB') ||
        voices.find(v => v.lang.startsWith('en'))
      if (preferred) u.voice = preferred
    }

    if (window.speechSynthesis.getVoices().length) {
      tryVoice()
    } else {
      window.speechSynthesis.onvoiceschanged = tryVoice
    }

    utterRef.current = u
    window.speechSynthesis.speak(u)
    return () => { window.speechSynthesis.cancel() }
  }, [current, voiceOn])

  // Stop speech on unmount
  useEffect(() => {
    return () => { if (typeof window !== 'undefined') window.speechSynthesis?.cancel() }
  }, [])

  const screen = SCREENS[current]

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f172a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.25rem',
          width: '100%',
          maxWidth: '860px',
          overflow: 'hidden',
          boxShadow: `0 40px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(99,102,241,0.1)`,
          animation: 'scaleIn 0.2s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>
              Recruit<span style={{ color: '#6366f1' }}>AI</span>
            </span>
            <span style={{ fontSize: '0.72rem', color: '#475569', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.3rem', padding: '0.15rem 0.55rem' }}>
              Product Tour · {current + 1}/{SCREENS.length}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setVoiceOn(v => !v)}
              title={voiceOn ? 'Mute narration' : 'Enable voice narration'}
              style={{
                background: voiceOn ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${voiceOn ? 'rgba(99,102,241,0.45)' : 'rgba(255,255,255,0.1)'}`,
                color: voiceOn ? '#a5b4fc' : '#475569',
                borderRadius: '0.4rem', padding: '0.3rem 0.8rem',
                fontSize: '0.75rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
              }}>
              {voiceOn ? '🔊 Voice on' : '🔇 Voice off'}
            </button>
            <button
              onClick={() => setPlaying(p => !p)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#64748b', borderRadius: '0.4rem', padding: '0.3rem 0.75rem', fontSize: '0.75rem', cursor: 'pointer' }}>
              {playing ? '⏸' : '▶'}
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1, padding: '0 0.25rem' }}>
              ×
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: '4px', padding: '0.75rem 1.75rem 0' }}>
          {SCREENS.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setPlaying(false) }}
              style={{
                flex: 1, height: '3px',
                background: i <= current ? screen.accent : 'rgba(255,255,255,0.08)',
                borderRadius: '2px', border: 'none', cursor: 'pointer',
                transition: 'background 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', minHeight: '360px' }}>
          {/* Left: text */}
          <div style={{ padding: '2.25rem 1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '28px', height: '3px', background: screen.accent, borderRadius: '2px' }} />
              <span style={{ fontSize: '0.68rem', color: screen.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Step {current + 1} of {SCREENS.length}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.28, marginBottom: '1rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              {screen.title}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
              {screen.desc}
            </p>

            {/* Voice indicator */}
            {voiceOn && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                  {[0.4, 0.7, 1, 0.7, 0.5].map((h, i) => (
                    <div key={i} style={{ width: '3px', height: `${h * 14}px`, background: screen.accent, borderRadius: '2px', opacity: 0.7, animation: `bounce-dot 1.2s ease ${i * 0.15}s infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.72rem', color: '#475569' }}>Narrating…</span>
              </div>
            )}
          </div>

          {/* Right: visual mockup */}
          <div style={{ background: 'rgba(255,255,255,0.025)', borderLeft: '1px solid rgba(255,255,255,0.06)', padding: '1.75rem' }}>
            <VisualMockup type={screen.visual} accent={screen.accent} />
          </div>
        </div>

        {/* Nav footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={() => { setCurrent(c => Math.max(0, c - 1)); setPlaying(false) }}
            disabled={current === 0}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: current === 0 ? '#1e293b' : '#64748b',
              borderRadius: '0.4rem', padding: '0.45rem 1.2rem',
              fontSize: '0.82rem', cursor: current === 0 ? 'default' : 'pointer',
              transition: 'color 0.15s',
            }}>
            ← Previous
          </button>

          <div style={{ display: 'flex', gap: '6px' }}>
            {SCREENS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrent(i); setPlaying(false) }}
                style={{
                  width: i === current ? '20px' : '7px', height: '7px',
                  borderRadius: '4px',
                  background: i === current ? screen.accent : 'rgba(255,255,255,0.15)',
                  border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {current < SCREENS.length - 1 ? (
            <button
              onClick={() => { setCurrent(c => c + 1); setPlaying(false) }}
              style={{
                background: screen.accent, border: 'none', color: '#fff',
                borderRadius: '0.4rem', padding: '0.45rem 1.2rem',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
              }}>
              Next →
            </button>
          ) : (
            <a
              href="#contact"
              onClick={onClose}
              style={{
                background: '#22c55e', border: 'none', color: '#fff',
                borderRadius: '0.4rem', padding: '0.45rem 1.2rem',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                textDecoration: 'none', display: 'inline-block',
              }}>
              Get early access →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

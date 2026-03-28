'use client'

import { useState } from 'react'
import Link from 'next/link'
import DemoModal from './components/DemoModal'

const FEATURES = [
  {
    title: 'AI Phone Screening',
    desc: 'The AI conducts structured phone screens on your behalf — asking role-specific questions, scoring every answer, flagging concerns, and delivering a clear hire recommendation.',
    detail: 'STRONG YES / YES / MAYBE / NO with full transcript',
    color: '#6366f1',
  },
  {
    title: 'Smart Candidate Matching',
    desc: 'Every candidate is automatically matched against open roles across skills, seniority, location, salary expectations and availability. No manual sifting.',
    detail: 'Multi-dimension matching across your full talent pool',
    color: '#8b5cf6',
  },
  {
    title: 'Pipeline Control',
    desc: 'Move candidates from Suggested → Contacted → Shortlisted → Interviewing → Offered → Placed in one click. Every stage tracked with timestamps.',
    detail: 'Full pipeline visibility from first touch to placement',
    color: '#3b82f6',
  },
  {
    title: 'Placement & Fee Tracking',
    desc: 'Confirm placements with agreed salary and fee percentage. The platform calculates gross fees, your net earnings after platform cut, and tracks every invoice.',
    detail: 'Live earnings dashboard per recruiter',
    color: '#22c55e',
  },
  {
    title: 'Market Intelligence',
    desc: 'Live salary benchmarks, in-demand skill signals, and hiring trend data across every UK sector — so you can advise clients with confidence.',
    detail: 'Data across 120+ industries and 130+ skill categories',
    color: '#f59e0b',
  },
  {
    title: 'Recruiter Dashboards',
    desc: 'Every recruiter gets their own private view — total billed, net earnings, pipeline value, placements, and candidates ready to screen. No sharing, fully personal.',
    detail: 'Individual login with unique pipeline per recruiter',
    color: '#06b6d4',
  },
]

const HOW = [
  { n: '01', title: 'Source & Match', desc: 'Add candidates to your talent pool. The AI immediately identifies the best-fit open roles and surfaces them in your pipeline.' },
  { n: '02', title: 'Screen & Shortlist', desc: 'Run an AI phone screen in one click. Review the scored transcript and recommendation, then shortlist the strongest candidates.' },
  { n: '03', title: 'Place & Earn', desc: 'Move shortlisted candidates through interview and offer stages. Confirm the placement, and your fee is calculated and logged instantly.' },
]

const COMPARE = [
  { feature: 'Built for recruitment agencies', us: true, them: false },
  { feature: 'AI phone screening with hire recommendation', us: true, them: true },
  { feature: 'Placement & fee calculation per recruiter', us: true, them: false },
  { feature: 'Net earnings dashboard', us: true, them: false },
  { feature: 'Per-recruiter pipeline (private login)', us: true, them: false },
  { feature: 'Market salary benchmarks', us: true, them: true },
  { feature: 'Candidate–job AI matching', us: true, them: true },
  { feature: 'Multi-recruiter team support', us: true, them: true },
  { feature: 'Internal HR / onboarding workflows', us: false, them: true },
  { feature: 'Job board posting (200+ boards)', us: false, them: true },
]

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.95)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)', padding: '0.9rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.03em' }}>
          Recruit<span style={{ color: '#6366f1' }}>AI</span>
        </span>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>How it works</a>
          <a href="#compare" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Compare</a>
          <a href="#contact" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Contact</a>
          <Link href="/login" style={{ background: '#6366f1', color: '#fff', borderRadius: '0.4rem', padding: '0.4rem 1.1rem', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '7rem 2rem 5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: '999px', padding: '0.3rem 1.1rem', fontSize: '0.78rem', color: '#a5b4fc', marginBottom: '1.75rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          AI-Powered Recruitment Platform for Agencies
        </div>

        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.2rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}>
          Fill roles faster.<br />
          <span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Earn more per placement.
          </span>
        </h1>

        <p style={{ fontSize: '1.15rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          RecruitAI handles screening, matching, and pipeline management so your recruiters spend their time closing deals — not admin.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowDemo(true)}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Watch product demo
          </button>
          <a href="#contact" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#f8fafc', borderRadius: '0.6rem', padding: '0.9rem 2.2rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
            Request early access
          </a>
        </div>

        {/* Stat strip */}
        <div style={{ display: 'flex', gap: '0', marginTop: '4rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', overflow: 'hidden' }}>
          {[
            { v: '10×', l: 'faster screening' },
            { v: '£0', l: 'missed placements' },
            { v: '100%', l: 'pipeline visibility' },
            { v: '1 click', l: 'AI phone screen' },
          ].map(({ v, l }, i, a) => (
            <div key={l} style={{ flex: 1, padding: '1.25rem 1rem', textAlign: 'center', borderRight: i < a.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontWeight: 900, fontSize: '1.6rem', color: '#f8fafc', letterSpacing: '-0.03em' }}>{v}</div>
              <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Demo video section ── */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem 6rem' }}>
        <div
          onClick={() => setShowDemo(true)}
          style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
        >
          {/* Fake browser chrome */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.6rem 1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0.3rem', padding: '0.2rem 0.75rem', fontSize: '0.72rem', color: '#475569', marginLeft: '0.5rem' }}>app.recruitai.co.uk/pipeline</span>
          </div>

          {/* Preview content */}
          <div style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px' }}>
            <div style={{ width: '72px', height: '72px', background: 'rgba(99,102,241,0.2)', border: '2px solid rgba(99,102,241,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '12px 0 12px 22px', borderColor: 'transparent transparent transparent #a5b4fc', marginLeft: '4px' }} />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>Watch the 2-minute product tour</div>
            <div style={{ color: '#475569', fontSize: '0.85rem' }}>See how RecruitAI takes a candidate from suggestion to placed in minutes</div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 7rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Everything a recruitment agency needs</h2>
          <p style={{ color: '#64748b', maxWidth: '520px', margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Built specifically for agencies — not internal HR teams. Every feature maps to how you actually make placements and earn fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', padding: '1.75rem' }}>
              <div style={{ width: '36px', height: '3px', background: f.color, borderRadius: '2px', marginBottom: '1.1rem' }} />
              <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', color: '#f1f5f9' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.65, margin: '0 0 1rem' }}>{f.desc}</p>
              <div style={{ fontSize: '0.72rem', color: f.color, fontWeight: 600, background: `${f.color}12`, border: `1px solid ${f.color}25`, borderRadius: '0.3rem', padding: '0.25rem 0.65rem', display: 'inline-block' }}>
                {f.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)', padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em' }}>Source to placed in 3 steps</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {HOW.map((step, i) => (
              <div key={step.n} style={{ position: 'relative' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'rgba(99,102,241,0.25)', letterSpacing: '-0.05em', marginBottom: '1rem' }}>{step.n}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem', color: '#f1f5f9' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.65, margin: 0 }}>{step.desc}</p>
                {i < HOW.length - 1 && (
                  <div style={{ position: 'absolute', top: '1.25rem', right: '-1rem', color: 'rgba(99,102,241,0.3)', fontSize: '1.5rem' }}>›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Compare ── */}
      <section id="compare" style={{ maxWidth: '780px', margin: '0 auto', padding: '7rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Why RecruitAI</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>Built for agencies, not HR departments</h2>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7, fontSize: '0.95rem' }}>
            Platforms like Workable are great for internal teams. RecruitAI is built around the way agencies actually work — placements, fees, and earning per recruiter.
          </p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.875rem', overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</span>
            <span style={{ fontSize: '0.72rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>RecruitAI</span>
            <span style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Workable</span>
          </div>

          {COMPARE.map((row, i) => (
            <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 120px', padding: '0.8rem 1.5rem', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', alignItems: 'center', background: row.us && !row.them ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{row.feature}</span>
              <span style={{ textAlign: 'center', fontSize: '0.9rem', color: row.us ? '#4ade80' : '#334155', fontWeight: 700 }}>{row.us ? '✓' : '—'}</span>
              <span style={{ textAlign: 'center', fontSize: '0.9rem', color: row.them ? '#64748b' : '#1e293b', fontWeight: 700 }}>{row.them ? '✓' : '—'}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact / Subscribe ── */}
      <section id="contact" style={{ background: 'rgba(99,102,241,0.05)', borderTop: '1px solid rgba(99,102,241,0.12)', padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Early Access</div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Join the waitlist
          </h2>
          <p style={{ color: '#64748b', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            We are onboarding a small number of recruitment agencies in our early access programme. Get in touch and we will be in touch within 24 hours.
          </p>

          {submitted ? (
            <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.75rem', padding: '1.5rem', color: '#4ade80', fontWeight: 600 }}>
              Thank you — we will be in touch shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <input
                  type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                />
                <input
                  type="text" placeholder="Agency name" value={company} onChange={e => setCompany(e.target.value)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <input
                type="email" placeholder="Work email address" value={email} onChange={e => setEmail(e.target.value)} required
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
              />
              <button type="submit" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer' }}>
                Request early access
              </button>
              <p style={{ color: '#334155', fontSize: '0.75rem', margin: 0 }}>No spam. No commitment. We will reach out personally.</p>
            </form>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '2.5rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem' }}>Recruit<span style={{ color: '#6366f1' }}>AI</span></span>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <a href="#features" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>Features</a>
          <a href="#compare" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>Compare</a>
          <a href="#contact" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>Contact</a>
        </div>
        {/* Private platform access link */}
        <Link href="/pipeline" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', borderRadius: '0.4rem', padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, textDecoration: 'none' }}>
          Platform access →
        </Link>
      </footer>

      {/* Demo modal */}
      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  )
}

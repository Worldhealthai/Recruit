'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import DemoModal from './components/DemoModal'


const FEATURES = [
  {
    title: 'AI Phone Screening',
    icon: '🎙',
    desc: 'The AI conducts structured phone screens on your behalf — asking role-specific questions, scoring every answer, flagging concerns, and delivering a clear hire recommendation.',
    detail: 'STRONG YES / YES / MAYBE / NO with full scored transcript',
    color: '#6366f1',
  },
  {
    title: 'Smart Candidate Matching',
    icon: '⚡',
    desc: 'Every candidate is automatically matched against open roles across skills, seniority, location, salary expectations and availability. No manual sifting, ever.',
    detail: 'Multi-dimension AI matching across your full talent pool',
    color: '#8b5cf6',
  },
  {
    title: 'Pipeline Control',
    icon: '🔀',
    desc: 'Move candidates from Contacted → Interviewing → Offered → Placed in one click. Every stage tracked with timestamps and full interaction history.',
    detail: 'Full pipeline visibility from first touch to placement',
    color: '#3b82f6',
  },
  {
    title: 'Placement & Fee Tracking',
    icon: '💷',
    desc: 'Confirm placements with agreed salary and fee percentage. The platform calculates gross fees, your net earnings after platform cut, and tracks every invoice.',
    detail: 'Live earnings dashboard with per-recruiter breakdown',
    color: '#22c55e',
  },
  {
    title: 'Market Intelligence',
    icon: '📊',
    desc: 'Live salary benchmarks, in-demand skill signals, and hiring trend data across every UK sector — so you can advise clients with real data and confidence.',
    detail: 'Data across 120+ industries and 130+ skill categories',
    color: '#f59e0b',
  },
  {
    title: 'Recruiter Dashboards',
    icon: '👤',
    desc: 'Every recruiter gets their own private view — total billed, net earnings, pipeline value, placements, and candidates ready to screen. Fully personal, fully private.',
    detail: 'Individual login with unique pipeline per recruiter',
    color: '#06b6d4',
  },
]

const HOW = [
  {
    n: '01',
    title: 'Add & Match',
    desc: 'Add candidates to your talent pool. The AI instantly scores them against every open role — skills, experience, location, salary, seniority. Best fits surface automatically.',
  },
  {
    n: '02',
    title: 'Screen in seconds',
    desc: 'Run an AI phone screen with one click. The AI conducts the call, scores every response, flags concerns, and hands you a clear recommendation — no calendar needed.',
  },
  {
    n: '03',
    title: 'Place & Earn',
    desc: 'Move candidates through interview and offer stages. Confirm the placement, enter the fee, and your earnings are calculated and logged instantly.',
  },
]

const COMPARE = [
  { feature: 'Built specifically for recruitment agencies', us: true, them: false },
  { feature: 'AI phone screening with hire recommendation', us: true, them: true },
  { feature: 'Placement & fee calculation per recruiter', us: true, them: false },
  { feature: 'Net earnings dashboard', us: true, them: false },
  { feature: 'Per-recruiter pipeline (private login)', us: true, them: false },
  { feature: 'Market salary benchmarks (UK)', us: true, them: true },
  { feature: 'Candidate–job AI matching', us: true, them: true },
  { feature: 'Multi-recruiter team support', us: true, them: true },
  { feature: 'Internal HR / onboarding workflows', us: false, them: true },
  { feature: 'Job board posting (200+ boards)', us: false, them: true },
]

const TESTIMONIALS = [
  {
    quote: 'We went from 3 phone screens a day to zero. The AI handles every first call and we only speak to candidates worth our time. Our placement rate is up 40% since we started.',
    name: 'James Hartley',
    title: 'Senior Consultant',
    agency: 'Apex Talent Group',
    color: '#6366f1',
  },
  {
    quote: "The earnings dashboard is what sold me. I can see exactly what I've billed, what I'll earn, and what's coming in. No more spreadsheets. No more guessing.",
    name: 'Priya Desai',
    title: 'Director',
    agency: 'TechRecruit London',
    color: '#22c55e',
  },
  {
    quote: "The AI screening reports are genuinely impressive. Clients have commented on the quality of candidates we're putting forward. It's changed how we work completely.",
    name: 'Oliver Chen',
    title: 'Managing Consultant',
    agency: 'Meridian Search',
    color: '#f59e0b',
  },
]

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const statsRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* ── Nav ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(10,15,30,0.96)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(16px)', padding: '0.85rem 2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.04em' }}>
          Recruit<span style={{ color: '#6366f1' }}>AI</span>
        </span>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#features" className="nav-link" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Features</a>
          <a href="#how-it-works" className="nav-link" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>How it works</a>
          <a href="#compare" className="nav-link" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Compare</a>
          <a href="#contact" className="nav-link" style={{ color: '#64748b', fontSize: '0.88rem', textDecoration: 'none' }}>Contact</a>
          <Link href="/pipeline" style={{ background: '#6366f1', color: '#fff', borderRadius: '0.45rem', padding: '0.42rem 1.15rem', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>Sign in</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '8rem 2rem 6rem' }}>
        {/* Floating gradient orbs */}
        <div style={{ position: 'absolute', top: '-15%', right: '-8%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 65%)', animation: 'float1 18s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 65%)', animation: 'float2 22s ease-in-out infinite', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '30%', left: '5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(34,197,94,0.05) 0%, transparent 70%)', animation: 'float3 14s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px', padding: '0.35rem 1.1rem', fontSize: '0.78rem', color: '#a5b4fc', marginBottom: '2rem', letterSpacing: '0.04em', animation: 'fadeInDown 0.5s ease both' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse-glow 2s ease infinite' }} />
            Now in early access — built for UK recruitment agencies
          </div>

          <h1 style={{ fontSize: 'clamp(2.8rem, 6.5vw, 4.8rem)', fontWeight: 900, lineHeight: 1.06, letterSpacing: '-0.05em', marginBottom: '1.5rem', animation: 'fadeInUp 0.6s ease 0.1s both' }}>
            Stop screening.<br />
            <span className="gradient-text">Start placing.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#64748b', maxWidth: '580px', margin: '0 auto 2.5rem', lineHeight: 1.72, animation: 'fadeInUp 0.6s ease 0.2s both' }}>
            RecruitAI handles screening, matching, and pipeline management so your recruiters close more deals and miss zero placements.
          </p>

          <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '1.5rem', animation: 'fadeInUp 0.6s ease 0.3s both' }}>
            <button
              onClick={() => setShowDemo(true)}
              className="btn-primary"
              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.65rem', padding: '0.95rem 2.4rem', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}
            >
              Watch product demo
            </button>
            <a href="#contact" className="btn-secondary" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.13)', color: '#f8fafc', borderRadius: '0.65rem', padding: '0.95rem 2.4rem', fontSize: '1rem', fontWeight: 600, textDecoration: 'none' }}>
              Get early access →
            </a>
          </div>

          {/* Trust badges */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem', animation: 'fadeInUp 0.6s ease 0.4s both' }}>
            {['No manual phone screens', 'Zero missed placements', 'Built for UK agencies'].map(t => (
              <span key={t} style={{ color: '#475569', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {t}
              </span>
            ))}
          </div>

          {/* Stat strip */}
          <div ref={statsRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0', background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden', animation: 'fadeInUp 0.7s ease 0.5s both' }}>
            {[
              { v: '10×', l: 'faster screening', color: '#6366f1' },
              { v: '£0', l: 'missed placements', color: '#22c55e' },
              { v: '100%', l: 'pipeline visibility', color: '#3b82f6' },
              { v: '1-click', l: 'AI phone screen', color: '#f59e0b' },
            ].map(({ v, l, color }, i, a) => (
              <div key={l} style={{ padding: '1.5rem 1rem', textAlign: 'center', borderRight: i < a.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
                <div className="stat-number" style={{ fontWeight: 900, fontSize: '1.75rem', color, letterSpacing: '-0.04em', lineHeight: 1 }}>{v}</div>
                <div style={{ color: '#475569', fontSize: '0.7rem', marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Demo video section ── */}
      <section style={{ maxWidth: '920px', margin: '0 auto', padding: '0 2rem 7rem' }}>
        <div
          onClick={() => setShowDemo(true)}
          className="hover-card"
          style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '1.25rem', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'border-color 0.2s ease, box-shadow 0.2s ease' }}
        >
          {/* Fake browser chrome */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0.7rem 1.1rem', display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            <span style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: '0.3rem', padding: '0.2rem 0.75rem', fontSize: '0.72rem', color: '#475569', marginLeft: '0.6rem' }}>app.recruitai.co.uk/pipeline</span>
            <span style={{ fontSize: '0.7rem', color: '#334155', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '0.25rem', padding: '0.1rem 0.5rem' }}>LIVE</span>
          </div>
          {/* Preview */}
          <div style={{ padding: '3.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
            <div style={{ width: '80px', height: '80px', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', animation: 'pulse-glow 2.5s ease infinite' }}>
              <div style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '13px 0 13px 24px', borderColor: 'transparent transparent transparent #a5b4fc', marginLeft: '5px' }} />
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.45rem', color: '#f1f5f9' }}>Watch the 2-minute product tour</div>
            <div style={{ color: '#475569', fontSize: '0.88rem', maxWidth: '400px', textAlign: 'center', lineHeight: 1.6 }}>See how RecruitAI takes a candidate from database to placed in under 5 minutes</div>
            <div style={{ marginTop: '1.25rem', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: '999px', padding: '0.35rem 1.1rem', fontSize: '0.78rem', color: '#a5b4fc', fontWeight: 600 }}>
              Click anywhere to play →
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 2rem 8rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Platform Features</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.85rem' }}>Everything a recruitment agency needs</h2>
          <p style={{ color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: 1.72, fontSize: '0.96rem' }}>
            Built for agencies, not internal HR teams. Every feature maps directly to how you make placements and earn fees.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '1.1rem' }}>
          {FEATURES.map(f => (
            <div key={f.title} className="feature-card" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '1rem', padding: '1.85rem', position: 'relative', overflow: 'hidden' }}>
              {/* Subtle glow in top-left */}
              <div style={{ position: 'absolute', top: 0, left: 0, width: '120px', height: '120px', background: `radial-gradient(circle, ${f.color}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '0.6rem', background: `${f.color}18`, border: `1px solid ${f.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.15rem', flexShrink: 0 }}>
                  {f.icon}
                </div>
                <div style={{ width: '32px', height: '3px', background: f.color, borderRadius: '2px' }} />
              </div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '0.65rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>{f.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.7, margin: '0 0 1.1rem' }}>{f.desc}</p>
              <div style={{ fontSize: '0.7rem', color: f.color, fontWeight: 700, background: `${f.color}12`, border: `1px solid ${f.color}28`, borderRadius: '0.35rem', padding: '0.28rem 0.7rem', display: 'inline-block', letterSpacing: '0.01em' }}>
                {f.detail}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.04) 0%, rgba(99,102,241,0.02) 100%)', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)', padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>How it works</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>From first contact to placed — in minutes</h2>
            <p style={{ color: '#64748b', maxWidth: '440px', margin: '0 auto', fontSize: '0.94rem', lineHeight: 1.7 }}>Three steps. One platform. Zero phone screens wasted.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '2.1rem', left: 'calc(33.3% - 10px)', right: 'calc(33.3% - 10px)', height: '2px', background: 'linear-gradient(90deg, rgba(99,102,241,0.4), rgba(139,92,246,0.4))', zIndex: 0, pointerEvents: 'none' }} />

            {HOW.map((step, i) => (
              <div key={step.n} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', padding: '2rem 1.75rem', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#a5b4fc' }}>{step.n}</span>
                </div>
                <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '0.6rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>{step.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '7rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>From the Field</div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 900, letterSpacing: '-0.04em' }}>Recruiters love it. Clients notice.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.1rem' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1rem', padding: '1.85rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.75, flex: 1 }}>
                <span style={{ color: t.color, fontSize: '1.4rem', lineHeight: 1, display: 'block', marginBottom: '0.5rem', fontFamily: 'Georgia, serif' }}>&ldquo;</span>
                {t.quote}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `${t.color}20`, border: `1px solid ${t.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', color: t.color, flexShrink: 0 }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>{t.name}</div>
                  <div style={{ color: '#475569', fontSize: '0.76rem' }}>{t.title} · {t.agency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Compare ── */}
      <section id="compare" style={{ background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '7rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Why RecruitAI</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.85rem' }}>Built for agencies, not HR departments</h2>
            <p style={{ color: '#64748b', maxWidth: '460px', margin: '0 auto', lineHeight: 1.72, fontSize: '0.94rem' }}>
              Platforms like Workable are built for internal teams. RecruitAI is built around how agencies actually work — placements, fees, and earnings per recruiter.
            </p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px', padding: '0.85rem 1.6rem', background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Feature</span>
              <span style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>RecruitAI</span>
              <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', textAlign: 'center' }}>Workable</span>
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature} style={{ display: 'grid', gridTemplateColumns: '1fr 130px 130px', padding: '0.85rem 1.6rem', borderBottom: i < COMPARE.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', alignItems: 'center', background: row.us && !row.them ? 'rgba(99,102,241,0.05)' : 'transparent' }}>
                <span style={{ fontSize: '0.86rem', color: row.us && !row.them ? '#cbd5e1' : '#94a3b8' }}>{row.feature}</span>
                <span style={{ textAlign: 'center', fontSize: '1rem', color: row.us ? '#4ade80' : '#1e293b', fontWeight: 700 }}>{row.us ? '✓' : '—'}</span>
                <span style={{ textAlign: 'center', fontSize: '1rem', color: row.them ? '#475569' : '#1e293b', fontWeight: 700 }}>{row.them ? '✓' : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA / Early Access ── */}
      <section id="contact" style={{ padding: '8rem 2rem' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)', borderRadius: '1.5rem', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.85rem' }}>Early Access</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.85rem' }}>
              Join the agencies already placing faster
            </h2>
            <p style={{ color: '#64748b', lineHeight: 1.72, marginBottom: '2rem', fontSize: '0.94rem', maxWidth: '440px', margin: '0 auto 2rem' }}>
              We&apos;re onboarding a focused cohort of UK recruitment agencies. Get in touch and we&apos;ll reach out personally within 24 hours.
            </p>

            {/* Benefit bullets */}
            <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
              {['Personal onboarding', 'Free for the first 30 days', 'No long-term commitment'].map(b => (
                <span key={b} style={{ color: '#64748b', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span> {b}
                </span>
              ))}
            </div>

            {submitted ? (
              <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.875rem', padding: '1.75rem', color: '#4ade80', fontWeight: 700, fontSize: '1rem' }}>
                ✓ You&apos;re on the list — we&apos;ll be in touch within 24 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', textAlign: 'left' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <input
                    type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.6rem', padding: '0.8rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s' }}
                  />
                  <input
                    type="text" placeholder="Agency name" value={company} onChange={e => setCompany(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.6rem', padding: '0.8rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s' }}
                  />
                </div>
                <input
                  type="email" placeholder="Work email address" value={email} onChange={e => setEmail(e.target.value)} required
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '0.6rem', padding: '0.8rem 1rem', color: '#f8fafc', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.15s' }}
                />
                <button type="submit" className="btn-primary" style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '0.6rem', padding: '0.9rem', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer', marginTop: '0.25rem' }}>
                  Request early access →
                </button>
                <p style={{ color: '#334155', fontSize: '0.74rem', margin: '0.25rem 0 0', textAlign: 'center' }}>No spam. No commitment. We reach out personally.</p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '2.25rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.03em' }}>Recruit<span style={{ color: '#6366f1' }}>AI</span></span>
        <div style={{ display: 'flex', gap: '1.75rem', flexWrap: 'wrap' }}>
          {[['#features','Features'],['#how-it-works','How it works'],['#compare','Compare'],['#contact','Contact']].map(([href, label]) => (
            <a key={href} href={href} className="nav-link" style={{ color: '#334155', fontSize: '0.82rem', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
        </div>
        <Link href="/pipeline" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', borderRadius: '0.45rem', padding: '0.38rem 0.95rem', fontSize: '0.78rem', fontWeight: 700, textDecoration: 'none' }}>
          Platform access →
        </Link>
      </footer>

      {showDemo && <DemoModal onClose={() => setShowDemo(false)} />}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please enter your email and password.'); return }
    setLoading(true)
    // Simulate auth delay — prototype uses demo credentials only
    await new Promise(r => setTimeout(r, 900))
    if (email === 'sarah@recruitai.com' && password === 'demo123') {
      if (typeof window !== 'undefined') {
        localStorage.setItem('recruiter', JSON.stringify({ name: 'Sarah Thompson', email, company: 'RecruitAI', role: 'Senior Recruiter' }))
      }
      router.push('/pipeline')
    } else {
      setError('Invalid credentials. Use the demo account below.')
      setLoading(false)
    }
  }

  const fillDemo = () => { setEmail('sarah@recruitai.com'); setPassword('demo123'); setError('') }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: focused === field ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === field ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '0.5rem',
    padding: '0.8rem 1rem',
    color: '#f8fafc',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s, background 0.15s',
  })

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorative orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em', marginBottom: '0.4rem' }}>
            Recruit<span style={{ color: '#6366f1' }}>AI</span>
          </div>
          <div style={{ color: '#475569', fontSize: '0.85rem' }}>Intelligent recruitment platform</div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '1.25rem',
          padding: '2.25rem',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
        }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 0.3rem', color: '#f1f5f9' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1.75rem' }}>
            Sign in to your recruiter dashboard
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                placeholder="sarah@recruitai.com"
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={inputStyle('email')}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Password</label>
                <span style={{ fontSize: '0.72rem', color: '#475569', cursor: 'pointer' }}>Forgot password?</span>
              </div>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
                style={inputStyle('password')}
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '0.4rem', padding: '0.6rem 0.9rem',
                color: '#f87171', fontSize: '0.8rem',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '0.6rem', padding: '0.85rem',
                color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s',
                marginTop: '0.25rem',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.35)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '1.25rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '0.75rem',
          padding: '1rem 1.25rem',
        }}>
          <div style={{ fontSize: '0.72rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Demo Account
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              <div>sarah@recruitai.com</div>
              <div style={{ color: '#475569' }}>demo123</div>
            </div>
            <button onClick={fillDemo} style={{
              background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
              color: '#a5b4fc', borderRadius: '0.4rem', padding: '0.35rem 0.75rem',
              fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
            }}>
              Use demo
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: '#1e293b', fontSize: '0.72rem', marginTop: '1.5rem' }}>
          © 2026 RecruitAI · Prototype v0.9
        </p>
      </div>
    </div>
  )
}

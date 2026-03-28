'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type RecruiterSession = { name: string; email: string; company: string; role: string }

export default function RecruiterBadge() {
  const router = useRouter()
  const [recruiter, setRecruiter] = useState<RecruiterSession | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('recruiter')
      if (raw) setRecruiter(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  const signOut = () => {
    localStorage.removeItem('recruiter')
    router.push('/login')
  }

  if (!recruiter) {
    return (
      <a href="/login" style={{
        fontSize: '0.78rem', color: '#475569', textDecoration: 'none',
        padding: '0.35rem 0.85rem', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.4rem', whiteSpace: 'nowrap',
      }}>
        Sign in
      </a>
    )
  }

  const initials = recruiter.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
      <div style={{
        width: '30px', height: '30px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 800, color: '#fff', flexShrink: 0,
      }}>
        {initials}
      </div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f1f5f9' }}>{recruiter.name}</div>
        <div style={{ fontSize: '0.68rem', color: '#475569' }}>{recruiter.company}</div>
      </div>
      <button onClick={signOut} style={{
        background: 'transparent', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0.35rem', padding: '0.25rem 0.6rem',
        fontSize: '0.7rem', color: '#475569', cursor: 'pointer', marginLeft: '0.25rem',
      }}>
        Sign out
      </button>
    </div>
  )
}

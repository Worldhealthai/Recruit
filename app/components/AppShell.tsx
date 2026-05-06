'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { type ReactNode } from 'react'

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Dashboard',    icon: '◎' },
  { href: '/candidates', label: 'Candidates',   icon: '◈' },
  { href: '/jobs',       label: 'Jobs',         icon: '▤' },
  { href: '/pipeline',   label: 'Pipeline',     icon: '⇌' },
  { href: '/screening',  label: 'AI Screening', icon: '◉', accent: true },
  { href: '/placements', label: 'Placements',   icon: '✓' },
]

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0a0f1e', color: '#f8fafc',
      fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: '#0f172a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        padding: '1.25rem 0.85rem',
        display: 'flex', flexDirection: 'column', gap: '0.2rem',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.25rem 0.5rem 1.25rem',
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '0.4rem', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 900, fontSize: '0.85rem',
            boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
          }}>R</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#f8fafc' }}>Recruit</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em', color: '#818cf8' }}>AI</span>
          </div>
        </div>

        {/* Nav items */}
        {NAV_LINKS.map(item => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.55rem 0.7rem',
              background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
              borderRadius: '0.4rem',
              color: isActive ? '#a5b4fc' : '#94a3b8',
              fontSize: '0.82rem', fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                e.currentTarget.style.color = '#cbd5e1'
              }
            }}
            onMouseLeave={e => {
              if (!isActive) {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#94a3b8'
              }
            }}
            >
              <span style={{
                color: isActive ? '#a5b4fc' : item.accent ? '#8b5cf6' : '#64748b',
                fontSize: '0.95rem', width: 16, textAlign: 'center',
              }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
            </Link>
          )
        })}

        <div style={{ flex: 1 }} />

        {/* Pro Plan widget */}
        <div style={{
          padding: '0.85rem',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: '0.5rem', marginTop: '1rem',
        }}>
          <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, marginBottom: '0.2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Pro Plan</div>
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.4, marginBottom: '0.5rem' }}>3,240 / 5,000 AI screens used</div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '65%', background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
          </div>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  )
}

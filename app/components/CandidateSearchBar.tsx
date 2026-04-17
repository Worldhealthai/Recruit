'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useRef } from 'react'

type Chip = { keys: string[]; label: string }

function buildChips(sp: ReturnType<typeof useSearchParams>): Chip[] {
  const chips: Chip[] = []

  const title = sp.get('title')
  if (title) chips.push({ keys: ['title'], label: `${title}` })

  const company = sp.get('company')
  if (company) chips.push({ keys: ['company'], label: `@ ${company}` })

  const ind = sp.get('industry')
  if (ind) {
    const list = ind.split(',').filter(Boolean)
    chips.push({ keys: ['industry'], label: list.length === 1 ? list[0] : `${list.length} industries` })
  }

  const dep = sp.get('department')
  if (dep) {
    const list = dep.split(',').filter(Boolean)
    chips.push({ keys: ['department'], label: list.length === 1 ? list[0] : `${list.length} depts` })
  }

  const sen = sp.get('seniority')
  if (sen) {
    const list = sen.split(',').filter(Boolean)
    chips.push({ keys: ['seniority'], label: list.length === 1 ? list[0].replace(/_/g, ' ') : `${list.length} levels` })
  }

  const av = sp.get('availability')
  if (av) {
    const list = av.split(',').filter(Boolean)
    chips.push({ keys: ['availability'], label: list.length === 1 ? list[0].replace(/_/g, ' ') : `${list.length} statuses` })
  }

  const sk = sp.get('skills')
  if (sk) {
    const list = sk.split(',').filter(Boolean)
    chips.push({ keys: ['skills'], label: list.length === 1 ? list[0] : `${list.length} skills` })
  }

  const country = sp.get('country')
  if (country) chips.push({ keys: ['country'], label: country })

  const location = sp.get('location')
  if (location) chips.push({ keys: ['location'], label: `📍 ${location}` })

  const region = sp.get('region')
  if (region) chips.push({ keys: ['region'], label: region })

  if (sp.get('remote') === '1') chips.push({ keys: ['remote'], label: 'Remote' })
  if (sp.get('relocation') === '1') chips.push({ keys: ['relocation'], label: 'Relocation' })

  const minExp = sp.get('min_exp')
  const maxExp = sp.get('max_exp')
  if (minExp || maxExp) chips.push({ keys: ['min_exp', 'max_exp'], label: `${minExp || '0'}–${maxExp || '∞'}y exp` })

  const maxNotice = sp.get('max_notice')
  if (maxNotice) chips.push({ keys: ['max_notice'], label: maxNotice === '0' ? 'Immediate' : `≤${maxNotice}d notice` })

  const minSal = sp.get('min_salary')
  const maxSal = sp.get('max_salary')
  if (minSal || maxSal) {
    const from = minSal ? `£${Math.round(Number(minSal) / 1000)}k` : ''
    const to = maxSal ? `£${Math.round(Number(maxSal) / 1000)}k` : ''
    chips.push({
      keys: ['min_salary', 'max_salary'],
      label: from && to ? `${from}–${to}` : from ? `${from}+` : `up to ${to}`,
    })
  }

  return chips
}

const chipStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
  background: '#111111', color: '#ffffff',
  borderRadius: '999px',
  padding: '0.22rem 0.5rem 0.22rem 0.75rem', fontSize: '0.73rem', fontWeight: 500,
  whiteSpace: 'nowrap',
}

const chipBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
  padding: '0 0.15rem', fontSize: '1rem', lineHeight: 1,
}

export default function CandidateSearchBar({ totalResults }: { totalResults: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') ?? '')
  const [aiParsing, setAiParsing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(v: string) {
    setValue(v)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const p = new URLSearchParams(searchParams.toString())
      if (v) p.set('q', v)
      else p.delete('q')
      router.push(`${pathname}?${p.toString()}`)
    }, 320)
  }

  async function handleAiParse() {
    if (!value.trim() || aiParsing) return
    setAiParsing(true)
    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: value }),
      })
      const filters = await res.json()
      const p = new URLSearchParams()
      // Map AI result fields to URL params, handle arrays
      for (const [key, val] of Object.entries(filters)) {
        if (val === undefined || val === null || val === '') continue
        if (Array.isArray(val)) p.set(key, (val as string[]).join(','))
        else p.set(key, String(val))
      }
      // Clear the text search if we got structured filters
      if (Object.keys(filters).length > 0 && !filters.q) {
        setValue('')
      }
      router.push(`${pathname}?${p.toString()}`)
    } catch {
      // silently fall back to plain search
    } finally {
      setAiParsing(false)
    }
  }

  function removeChip(keys: string[]) {
    const p = new URLSearchParams(searchParams.toString())
    keys.forEach(k => p.delete(k))
    router.push(`${pathname}?${p.toString()}`)
  }

  function clearAll() {
    setValue('')
    router.push(pathname)
  }

  const chips = buildChips(searchParams)
  const hasAny = value.length > 0 || chips.length > 0

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative' }}>
        {/* Search icon */}
        <div style={{
          position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)',
          color: '#c0c8d4', pointerEvents: 'none', display: 'flex',
        }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        <input
          type="text"
          value={value}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAiParse() }}
          placeholder='Try "senior sales executive London" or "BDM open to work"…'
          className="search-input"
          style={{
            width: '100%', height: '52px',
            padding: '0 13rem 0 2.9rem',
            background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.65)',
            borderRadius: '0.75rem',
            color: '#111111', fontSize: '0.93rem',
            outline: 'none', boxSizing: 'border-box',
            boxShadow: '0 2px 12px rgba(99,102,241,0.07)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
          }}
        />

        {/* Right side: AI button + count */}
        <div style={{
          position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          {value.trim() && (
            <button
              onClick={handleAiParse}
              disabled={aiParsing}
              title="Let AI parse your query into smart filters"
              style={{
                background: aiParsing ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.25)',
                color: '#6366f1',
                borderRadius: '6px', padding: '0.28rem 0.65rem',
                fontSize: '0.72rem', fontWeight: 700, cursor: aiParsing ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                whiteSpace: 'nowrap',
              }}
            >
              {aiParsing ? (
                <>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '2px solid #6366f1', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                  Parsing…
                </>
              ) : (
                <>✦ AI Search</>
              )}
            </button>
          )}
          <span style={{ color: '#c0c8d4', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
            {totalResults.toLocaleString()} candidates
          </span>
        </div>
      </div>

      {/* Hint when empty */}
      {!hasAny && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['Sales Executive London', 'Senior BDM open to work', 'Finance Director 10+ years', 'Marketing Manager remote'].map(hint => (
            <button key={hint} onClick={() => { setValue(hint); setTimeout(handleAiParse, 50) }} style={{
              background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.08)',
              color: '#6b7280', borderRadius: '999px', padding: '0.18rem 0.65rem',
              fontSize: '0.72rem', cursor: 'pointer', backdropFilter: 'blur(8px)',
            }}>
              {hint}
            </button>
          ))}
        </div>
      )}

      {/* Active filter chips */}
      {hasAny && (
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '0.6rem' }}>
          {value && (
            <span style={chipStyle}>
              &ldquo;{value}&rdquo;
              <button style={chipBtnStyle} onClick={() => handleChange('')}>×</button>
            </span>
          )}
          {chips.map((chip, i) => (
            <span key={i} style={chipStyle}>
              {chip.label}
              <button style={chipBtnStyle} onClick={() => removeChip(chip.keys)}>×</button>
            </span>
          ))}
          <button
            onClick={clearAll}
            style={{
              background: 'none', border: '1px solid rgba(0,0,0,0.12)',
              color: '#6b7280', borderRadius: '999px',
              padding: '0.22rem 0.7rem', fontSize: '0.72rem', cursor: 'pointer',
            }}
          >
            Clear all
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

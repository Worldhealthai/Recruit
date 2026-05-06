'use client'

import { useState } from 'react'
import Link from 'next/link'
import CandidateDrawer from './CandidateDrawer'

interface Skill { skill: { name: string } }
interface Company { name: string; industry?: string | null }
interface Experience { start_date: Date | null; department: string | null }

export interface CandidateRow {
  id: string
  first_name: string
  last_name: string
  current_title: string
  current_department: string | null
  email: string | null
  phone: string | null
  linkedin_url: string | null
  location_city: string
  location_country: string
  salary_expectation_min: unknown
  salary_expectation_max: unknown
  years_experience: number | null
  notice_period_days: number | null
  availability_status: string
  seniority_level: string
  summary: string | null
  source: string
  is_remote_open: boolean
  is_relocation_open: boolean
  skills: Skill[]
  current_company: Company | null
  experiences: Experience[]
}

const SOURCE_META: Record<string, { label: string; color: string }> = {
  LINKEDIN:  { label: 'LinkedIn',   color: '#0A66C2' },
  INDEED:    { label: 'Indeed',     color: '#2164f3' },
  IMPORTED:  { label: 'CV-Library', color: '#0d7a3e' },
  REFERRAL:  { label: 'Referral',   color: '#8b5cf6' },
  WEBSITE:   { label: 'Website',    color: '#059669' },
  MANUAL:    { label: 'Manual',     color: '#64748b' },
  GLASSDOOR: { label: 'Glassdoor',  color: '#0caa41' },
  OTHER:     { label: 'Other',      color: '#475569' },
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f97316']

function nameColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function availDot(status: string) {
  if (status === 'ACTIVELY_LOOKING') return { color: '#22c55e', label: 'Active' }
  if (status === 'OPEN_TO_OFFERS')   return { color: '#f59e0b', label: 'Open' }
  if (status === 'PASSIVE')          return { color: '#64748b', label: 'Passive' }
  if (status === 'NOT_LOOKING')      return { color: '#475569', label: 'Not looking' }
  return { color: '#ef4444', label: 'Unavailable' }
}

function yearsFrom(date: Date | null | undefined): number | null {
  if (!date) return null
  return Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24 * 365))
}

function toNum(v: unknown): number | null {
  if (v == null) return null
  const n = Number(v)
  return isNaN(n) ? null : n
}

export default function CandidateCardList({ candidates }: { candidates: CandidateRow[] }) {
  const [drawerCandidate, setDrawerCandidate] = useState<CandidateRow | null>(null)

  const statPill: React.CSSProperties = {
    background: 'rgba(255,255,255,0.06)', borderRadius: '0.25rem',
    padding: '0.1rem 0.42rem', fontSize: '0.7rem', color: '#94a3b8',
  }

  const drawerData = drawerCandidate ? {
    id: drawerCandidate.id,
    first_name: drawerCandidate.first_name,
    last_name: drawerCandidate.last_name,
    current_title: drawerCandidate.current_title,
    email: drawerCandidate.email,
    phone: drawerCandidate.phone,
    linkedin_url: drawerCandidate.linkedin_url,
    location_city: drawerCandidate.location_city,
    location_country: drawerCandidate.location_country,
    salary_expectation_min: toNum(drawerCandidate.salary_expectation_min),
    salary_expectation_max: toNum(drawerCandidate.salary_expectation_max),
    years_experience: drawerCandidate.years_experience,
    availability_status: drawerCandidate.availability_status,
    seniority_level: drawerCandidate.seniority_level,
    summary: drawerCandidate.summary,
    skills: drawerCandidate.skills,
    current_company: drawerCandidate.current_company ?? null,
  } : null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {candidates.map((c) => {
          const color       = nameColor(c.first_name + c.last_name)
          const initials    = `${c.first_name[0]}${c.last_name[0]}`.toUpperCase()
          const avail       = availDot(c.availability_status)
          const currentExp  = c.experiences[0] ?? null
          const yrsInRole   = currentExp ? yearsFrom(currentExp.start_date) : null
          const dept        = c.current_department ?? currentExp?.department ?? null
          const industry    = c.current_company?.industry ?? null
          const topSkills   = c.skills.slice(0, 5)
          const extraSkills = c.skills.length - topSkills.length
          const salMin      = toNum(c.salary_expectation_min) != null ? Math.round(toNum(c.salary_expectation_min)! / 1000) : null
          const salMax      = toNum(c.salary_expectation_max) != null ? Math.round(toNum(c.salary_expectation_max)! / 1000) : null
          const srcMeta     = SOURCE_META[c.source] ?? SOURCE_META.OTHER
          const glowColor   = avail.color === '#22c55e' ? `0 0 8px ${avail.color}` : 'none'

          return (
            <div
              key={c.id}
              onClick={() => setDrawerCandidate(c)}
              className="candidate-card"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.75rem',
                padding: '1rem 1.25rem',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>

                {/* Avatar */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                  background: `${color}20`, border: `1.5px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.82rem', color, letterSpacing: '-0.02em',
                }}>
                  {initials}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>

                  {/* Row 1: name + seniority + availability */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.15rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.93rem', color: '#f1f5f9', letterSpacing: '-0.01em' }}>
                      {c.first_name} {c.last_name}
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      {c.seniority_level.replace(/_/g, ' ')}
                    </span>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: avail.color, boxShadow: glowColor }} />
                      <span style={{ fontSize: '0.68rem', color: avail.color, fontWeight: 600 }}>{avail.label}</span>
                    </span>
                  </div>

                  {/* Row 2: title · company · industry */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.2rem', marginBottom: dept ? '0.08rem' : '0.4rem' }}>
                    {c.current_title && (
                      <span style={{ fontSize: '0.83rem', color: '#cbd5e1', fontWeight: 500 }}>{c.current_title}</span>
                    )}
                    {c.current_company && (
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>· {c.current_company.name}</span>
                    )}
                    {industry && (
                      <span style={{ fontSize: '0.76rem', color: '#475569' }}>· {industry}</span>
                    )}
                  </div>

                  {dept && (
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>{dept}</div>
                  )}

                  {c.summary && (
                    <div style={{
                      fontSize: '0.78rem', color: '#64748b', lineHeight: 1.55,
                      display: '-webkit-box', WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      marginBottom: '0.55rem',
                    }}>
                      {c.summary}
                    </div>
                  )}

                  {topSkills.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.2rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                      {topSkills.map(cs => (
                        <span key={cs.skill.name} style={{
                          background: 'rgba(99,102,241,0.1)', color: '#a5b4fc',
                          border: '1px solid rgba(99,102,241,0.2)',
                          borderRadius: '0.2rem', padding: '0.1rem 0.42rem',
                          fontSize: '0.68rem', fontWeight: 500,
                        }}>
                          {cs.skill.name}
                        </span>
                      ))}
                      {extraSkills > 0 && (
                        <span style={{ fontSize: '0.68rem', color: '#475569', alignSelf: 'center' }}>+{extraSkills}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {c.years_experience != null && <span style={statPill}>{c.years_experience}y exp</span>}
                      {yrsInRole != null && <span style={statPill}>{yrsInRole}y in role</span>}
                      {c.notice_period_days != null && (
                        <span style={statPill}>
                          {c.notice_period_days === 0 ? 'Immediate' : `${c.notice_period_days}d notice`}
                        </span>
                      )}
                      {salMin != null && (
                        <span style={statPill}>
                          £{salMin}k{salMax && salMax !== salMin ? `–£${salMax}k` : '+'}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      {(c.location_city || c.location_country) && (
                        <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          📍 {c.location_city || c.location_country}
                        </span>
                      )}
                      {c.is_remote_open && (
                        <span style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.2rem', padding: '0.06rem 0.35rem', fontSize: '0.65rem', fontWeight: 600 }}>
                          Remote
                        </span>
                      )}
                      <span style={{ background: `${srcMeta.color}18`, color: srcMeta.color, border: `1px solid ${srcMeta.color}35`, borderRadius: '0.2rem', padding: '0.06rem 0.38rem', fontSize: '0.65rem', fontWeight: 700 }}>
                        {srcMeta.label}
                      </span>
                      <Link
                        href={`/candidates/${c.id}`}
                        onClick={e => e.stopPropagation()}
                        style={{ fontSize: '0.65rem', color: '#475569', textDecoration: 'none', padding: '0.06rem 0.38rem', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.2rem' }}
                      >
                        View →
                      </Link>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )
        })}
      </div>

      {drawerData && (
        <CandidateDrawer
          candidate={drawerData}
          onClose={() => setDrawerCandidate(null)}
        />
      )}
    </>
  )
}

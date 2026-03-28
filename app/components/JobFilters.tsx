'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

// Comprehensive UK industry list
export const UK_INDUSTRIES = [
  'Accountancy & Finance',
  'Advertising & PR',
  'Aerospace & Defence',
  'Agriculture & Farming',
  'Architecture',
  'Arts & Entertainment',
  'Automotive',
  'Banking & Investment',
  'Broadcasting & Media',
  'Building & Construction',
  'Charity & Non-Profit',
  'Chemical & Pharmaceutical',
  'Civil Service & Government',
  'Consulting',
  'Customer Service',
  'Data & Analytics',
  'Education & Training',
  'Energy & Utilities',
  'Engineering & Manufacturing',
  'Environmental & Sustainability',
  'Events & Conferences',
  'Fashion & Apparel',
  'Financial Services',
  'Fintech',
  'Food & Beverage',
  'Food Tech',
  'Gaming & Esports',
  'Healthcare & NHS',
  'Hospitality & Hotels',
  'HR & Recruitment',
  'Insurance',
  'IT & Technology',
  'Legal',
  'Logistics & Transport',
  'Management Consulting',
  'Marketing & Digital',
  'Media & Publishing',
  'Property & Real Estate',
  'Retail',
  'Retail & E-commerce',
  'Sales',
  'Security',
  'Social Care',
  'Sports & Leisure',
  'Supply Chain',
  'Tech Startup',
  'Telecommunications',
  'Travel & Tourism',
  'Veterinary & Animal Care',
  'Wholesale & Distribution',
]

// UK job functions / categories
export const JOB_FUNCTIONS = [
  'Administration & Secretarial',
  'Architecture & Design',
  'Business Development',
  'Buying & Merchandising',
  'Customer Service',
  'Data & Analytics',
  'Engineering & Technical',
  'Events & Hospitality',
  'Finance & Accounting',
  'Healthcare & Medical',
  'HR & People',
  'IT & Technology',
  'Legal & Compliance',
  'Logistics & Operations',
  'Management & Leadership',
  'Marketing & Communications',
  'Product & UX',
  'Project Management',
  'Research & Development',
  'Sales & Account Management',
  'Science & Research',
  'Security',
  'Social Care & Charity',
  'Teaching & Training',
  'Trades & Construction',
]

const WORK_MODES = [
  { value: 'REMOTE', label: 'Remote', color: '#22c55e' },
  { value: 'HYBRID', label: 'Hybrid', color: '#3b82f6' },
  { value: 'ONSITE', label: 'On-site', color: '#f59e0b' },
]

const EMPLOYMENT_TYPES = [
  { value: 'FULL_TIME',  label: 'Full-time' },
  { value: 'PART_TIME',  label: 'Part-time' },
  { value: 'CONTRACT',   label: 'Contract' },
  { value: 'FREELANCE',  label: 'Freelance' },
  { value: 'INTERNSHIP', label: 'Internship' },
]

const SENIORITY = [
  { value: 'INTERN',         label: 'Intern' },
  { value: 'JUNIOR',         label: 'Junior' },
  { value: 'MID',            label: 'Mid-Level' },
  { value: 'SENIOR',         label: 'Senior' },
  { value: 'LEAD',           label: 'Lead' },
  { value: 'MANAGER',        label: 'Manager' },
  { value: 'SENIOR_MANAGER', label: 'Senior Manager' },
  { value: 'DIRECTOR',       label: 'Director' },
  { value: 'VP',             label: 'VP' },
  { value: 'C_SUITE',        label: 'C-Suite / Executive' },
]

const URGENCY = [
  { value: 'IMMEDIATE', label: 'Immediate', color: '#ef4444' },
  { value: 'HIGH',       label: 'High Priority', color: '#f59e0b' },
  { value: 'NORMAL',     label: 'Normal', color: '#64748b' },
  { value: 'LOW',        label: 'Low', color: '#475569' },
]

const UK_CITIES = [
  'London','Manchester','Birmingham','Leeds','Glasgow','Edinburgh',
  'Bristol','Cardiff','Liverpool','Newcastle','Sheffield','Nottingham',
  'Leicester','Southampton','Oxford','Cambridge','Brighton','Reading',
  'Coventry','Derby','Portsmouth','Plymouth','Exeter','Norwich','York',
  'Nationwide',
]

function FilterSection({ label, open, onToggle, children, count }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode; count?: number
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: open ? '1rem' : 0 }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.75rem 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#f1f5f9', fontSize: '0.85rem', fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {label}
          {(count ?? 0) > 0 && (
            <span style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc', borderRadius: '999px', padding: '0.05rem 0.45rem', fontSize: '0.7rem', fontWeight: 700 }}>
              {count}
            </span>
          )}
        </span>
        <span style={{ color: '#475569', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

function CheckPill({ label, checked, color, onChange }: {
  label: string; checked: boolean; color?: string; onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.18rem 0' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        style={{ accentColor: color ?? '#6366f1', width: '14px', height: '14px', cursor: 'pointer', flexShrink: 0 }}
      />
      <span style={{ fontSize: '0.82rem', color: checked ? (color ?? '#a5b4fc') : '#94a3b8' }}>{label}</span>
    </label>
  )
}

function parseList(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : []
}

export default function JobFilters({ totalResults }: { totalResults: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    industry: true, function: true, workMode: true, employmentType: false,
    seniority: true, salary: true, location: true, urgency: false, extras: false,
  })

  const toggleSection = useCallback((key: string) => {
    setOpenSections(p => ({ ...p, [key]: !p[key] }))
  }, [])

  const get = (key: string) => searchParams.get(key)
  const getList = (key: string) => parseList(searchParams.get(key))

  const update = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === '') params.delete(k)
      else params.set(k, v)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const toggleListItem = (key: string, value: string) => {
    const current = getList(key)
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    update({ [key]: next.join(',') || null })
  }

  const hasFilters = Array.from(searchParams.entries()).length > 0
  const clearAll = () => router.push(pathname)

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.75rem', padding: '1.25rem', position: 'sticky', top: '80px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Filters</div>
          <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.1rem' }}>{totalResults} jobs found</div>
        </div>
        {hasFilters && (
          <button onClick={clearAll} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#f87171', borderRadius: '0.3rem', padding: '0.2rem 0.6rem',
            fontSize: '0.72rem', cursor: 'pointer', fontWeight: 600,
          }}>
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Search job title..."
          defaultValue={get('q') ?? ''}
          onChange={e => update({ q: e.target.value || null })}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.4rem', padding: '0.5rem 0.75rem', color: '#f8fafc',
            fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <FilterSection label="Industry" open={openSections.industry} onToggle={() => toggleSection('industry')} count={getList('industry').length}>
        <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {UK_INDUSTRIES.map(ind => (
            <CheckPill key={ind} label={ind}
              checked={getList('industry').includes(ind)}
              onChange={() => toggleListItem('industry', ind)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Job Function" open={openSections.function} onToggle={() => toggleSection('function')} count={getList('function').length}>
        <div style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '0.25rem' }}>
          {JOB_FUNCTIONS.map(fn => (
            <CheckPill key={fn} label={fn}
              checked={getList('function').includes(fn)}
              onChange={() => toggleListItem('function', fn)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Work Mode" open={openSections.workMode} onToggle={() => toggleSection('workMode')} count={getList('work_mode').length}>
        {WORK_MODES.map(m => (
          <CheckPill key={m.value} label={m.label} color={m.color}
            checked={getList('work_mode').includes(m.value)}
            onChange={() => toggleListItem('work_mode', m.value)} />
        ))}
      </FilterSection>

      <FilterSection label="Employment Type" open={openSections.employmentType} onToggle={() => toggleSection('employmentType')} count={getList('employment_type').length}>
        {EMPLOYMENT_TYPES.map(t => (
          <CheckPill key={t.value} label={t.label}
            checked={getList('employment_type').includes(t.value)}
            onChange={() => toggleListItem('employment_type', t.value)} />
        ))}
      </FilterSection>

      <FilterSection label="Seniority" open={openSections.seniority} onToggle={() => toggleSection('seniority')} count={getList('seniority').length}>
        {SENIORITY.map(s => (
          <CheckPill key={s.value} label={s.label}
            checked={getList('seniority').includes(s.value)}
            onChange={() => toggleListItem('seniority', s.value)} />
        ))}
      </FilterSection>

      <FilterSection label="Salary (£ per year)" open={openSections.salary} onToggle={() => toggleSection('salary')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input type="number" placeholder="Min" step={5000}
              defaultValue={get('salary_min') ?? ''}
              onChange={e => update({ salary_min: e.target.value || null })}
              style={{ width: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem', padding: '0.4rem 0.5rem', color: '#f8fafc', fontSize: '0.8rem', outline: 'none' }}
            />
            <span style={{ color: '#475569', fontSize: '0.8rem' }}>–</span>
            <input type="number" placeholder="Max" step={5000}
              defaultValue={get('salary_max') ?? ''}
              onChange={e => update({ salary_max: e.target.value || null })}
              style={{ width: '90px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem', padding: '0.4rem 0.5rem', color: '#f8fafc', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
          {/* Quick ranges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {[
              { label: 'Under £30K', min: '', max: '30000' },
              { label: '£30–60K', min: '30000', max: '60000' },
              { label: '£60–100K', min: '60000', max: '100000' },
              { label: '£100K+', min: '100000', max: '' },
            ].map(r => (
              <button key={r.label} onClick={() => update({ salary_min: r.min || null, salary_max: r.max || null })}
                style={{
                  background: (get('salary_min') === (r.min || null) && get('salary_max') === (r.max || null)) ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem',
                  padding: '0.2rem 0.5rem', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer',
                }}>
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection label="Location" open={openSections.location} onToggle={() => toggleSection('location')}>
        <select
          value={get('location') ?? ''}
          onChange={e => update({ location: e.target.value || null })}
          style={{
            width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.4rem', padding: '0.45rem 0.6rem', color: get('location') ? '#f8fafc' : '#64748b',
            fontSize: '0.82rem', outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="">Any location in UK</option>
          {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Urgency" open={openSections.urgency} onToggle={() => toggleSection('urgency')} count={getList('urgency').length}>
        {URGENCY.map(u => (
          <CheckPill key={u.value} label={u.label} color={u.color}
            checked={getList('urgency').includes(u.value)}
            onChange={() => toggleListItem('urgency', u.value)} />
        ))}
      </FilterSection>

      <FilterSection label="Extras" open={openSections.extras} onToggle={() => toggleSection('extras')}>
        <CheckPill label="Visa Sponsorship Available" checked={get('visa') === '1'} color="#22c55e"
          onChange={v => update({ visa: v ? '1' : null })} />
        <CheckPill label="Equity Offered" checked={get('equity') === '1'} color="#f59e0b"
          onChange={v => update({ equity: v ? '1' : null })} />
        <CheckPill label="Posted in Last 7 Days" checked={get('recent') === '1'} color="#3b82f6"
          onChange={v => update({ recent: v ? '1' : null })} />
      </FilterSection>
    </div>
  )
}

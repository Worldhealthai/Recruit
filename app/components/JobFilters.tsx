'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

export const UK_INDUSTRIES = [
  // Finance & Professional
  'Accountancy & Finance',
  'Actuarial',
  'Banking & Investment',
  'Financial Services',
  'Fintech',
  'Insurance',
  'Independent Financial Advice',
  'Private Equity & Venture Capital',
  'Tax & Audit',
  'Wealth Management',
  // Technology
  'IT & Technology',
  'Cybersecurity',
  'Data & Analytics',
  'DevOps & Cloud',
  'SaaS',
  'Software Development',
  'Tech Startup',
  'Telecommunications',
  'Consumer Electronics',
  'Space Technology',
  'Gaming & Esports',
  'Food Tech',
  'Robotics & Automation',
  // Marketing & Media
  'Advertising & PR',
  'Broadcasting & Media',
  'Content & Publishing',
  'Creative & Design',
  'Digital Agency',
  'Film & Television Production',
  'Journalism & Editorial',
  'Marketing & Digital',
  'Media & Publishing',
  'Music & Audio',
  'Photography & Videography',
  'Print & Signage',
  'Public Relations',
  // Healthcare & Life Sciences
  'Biotech & Life Sciences',
  'Chemical & Pharmaceutical',
  'Dental & Oral Health',
  'Healthcare & NHS',
  'Medical Devices',
  'Mental Health & Wellbeing',
  'Nursing & Care',
  'Optometry & Vision Care',
  'Physiotherapy & Rehabilitation',
  'Social Care',
  'Veterinary & Animal Care',
  // Construction & Property
  'Architecture',
  'Building & Construction',
  'Civil Engineering',
  'Interior Design',
  'Property & Real Estate',
  'Property Development',
  'Facilities Management',
  'Rail & Infrastructure',
  'Spatial Planning & Urban Design',
  // Retail & Consumer
  'Beauty & Cosmetics',
  'E-commerce',
  'Fashion & Apparel',
  'FMCG',
  'Jewellery & Luxury Goods',
  'Pet Care',
  'Retail',
  'Retail & E-commerce',
  'Textiles & Clothing',
  'Wholesale & Distribution',
  // Hospitality & Events
  'Events & Conferences',
  'Food & Beverage',
  'Hospitality & Hotels',
  'Sports & Leisure',
  'Tourism & Heritage',
  'Travel & Tourism',
  // Legal & Compliance
  'Legal',
  'Compliance & Regulatory',
  'Intellectual Property',
  'Paralegal & Legal Support',
  // HR & Recruitment
  'HR & Recruitment',
  'Executive Search',
  'Payroll & Benefits',
  'Training & Development',
  'Outsourcing & BPO',
  // Logistics & Operations
  'Logistics & Transport',
  'Maritime & Shipping',
  'Supply Chain',
  'Warehousing & Distribution',
  'Aviation & Aerospace',
  'Automotive',
  // Public Sector & Charity
  'Charity & Non-Profit',
  'Civil Service & Government',
  'Defence & Military',
  'Education & Training',
  'Higher Education',
  'Policy & Government Affairs',
  'Public Affairs & Lobbying',
  'Social Enterprise',
  // Engineering & Industry
  'Aerospace & Defence',
  'Agriculture & Farming',
  'Chemical Engineering',
  'Electrical Engineering',
  'Engineering & Manufacturing',
  'Environmental & Sustainability',
  'Forestry & Timber',
  'Mining & Quarrying',
  'Nuclear Energy',
  'Oil & Gas',
  'Packaging',
  'Renewable Energy',
  'Waste Management & Recycling',
  'Water & Environment',
  // Consulting & Management
  'Business Process Outsourcing',
  'Consulting',
  'Change Management',
  'Management Consulting',
  'Research & Consultancy',
  // Other
  'Arts & Entertainment',
  'Franchising',
  'Import & Export',
  'Sales',
  'Security',
  'Start-up & Scale-up',
  'Translation & Localisation',
].sort()

export const JOB_FUNCTIONS = [
  // Tech & Engineering
  'Administration & Secretarial',
  'Animation & VFX',
  'Architecture & Design',
  'Audit & Risk',
  'Broadcasting & Journalism',
  'Buying & Merchandising',
  'Change Management',
  'Clinical & Medical Research',
  'Commercial & Contracts',
  'Construction Management',
  'Copywriting & Editorial',
  'Corporate Finance',
  'Customer Service',
  'Customer Success',
  'Data & Analytics',
  'DevOps & Infrastructure',
  'Digital Transformation',
  'Engineering & Technical',
  'Environmental & Sustainability',
  'Events & Hospitality',
  'Executive Assistant',
  'Film & TV Production',
  'Finance & Accounting',
  'Franchise & Licensing',
  'Graphic Design',
  'Healthcare & Medical',
  'HR & People',
  'Insurance & Underwriting',
  'Interior Design',
  'Investment & Asset Management',
  'IT & Technology',
  'IT Support & Helpdesk',
  'Legal & Compliance',
  'Logistics & Operations',
  'Management & Leadership',
  'Marine & Maritime',
  'Marketing & Communications',
  'Mental Health & Counselling',
  'Oil & Gas Operations',
  'Paramedical & Allied Health',
  'Payroll & Compensation',
  'Photography & Media',
  'Policy & Government Affairs',
  'Procurement & Sourcing',
  'Product & UX',
  'Project Management',
  'Property Development',
  'Quality Assurance & Testing',
  'Rail & Transport Operations',
  'Recruitment & Talent',
  'Renewable Energy',
  'Research & Development',
  'Revenue Management',
  'Sales & Account Management',
  'Science & Research',
  'Security',
  'Social Care & Charity',
  'Software Architecture',
  'Sports Management',
  'Supply Chain & Procurement',
  'Tax & Treasury',
  'Teaching & Training',
  'Technical Writing',
  'Trades & Construction',
  'Travel & Tourism Management',
  'UX Research',
  'Veterinary & Animal Care',
  'Warehousing & Distribution',
  'Wealth Management',
  'Business Development',
].sort()

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

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0.3rem',
  padding: '0.35rem 0.6rem',
  color: '#f8fafc',
  fontSize: '0.75rem',
  outline: 'none',
  boxSizing: 'border-box',
  marginBottom: '0.5rem',
}

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

function SearchableChecklist({ items, selected, onToggle, placeholder }: {
  items: string[]
  selected: string[]
  onToggle: (v: string) => void
  placeholder: string
}) {
  const [q, setQ] = useState('')
  const filtered = q ? items.filter(i => i.toLowerCase().includes(q.toLowerCase())) : items
  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        value={q}
        onChange={e => setQ(e.target.value)}
        style={searchInputStyle}
      />
      {selected.length > 0 && !q && (
        <div style={{ marginBottom: '0.4rem' }}>
          {selected.map(s => (
            <span key={s} onClick={() => onToggle(s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.35)', borderRadius: '999px',
              padding: '0.1rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer',
              marginRight: '0.3rem', marginBottom: '0.3rem',
            }}>
              {s} ×
            </span>
          ))}
        </div>
      )}
      <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#475569', fontSize: '0.78rem', padding: '0.5rem 0' }}>No results for &ldquo;{q}&rdquo;</div>
        ) : (
          filtered.map(item => (
            <CheckPill key={item} label={item}
              checked={selected.includes(item)}
              onChange={() => onToggle(item)} />
          ))
        )}
      </div>
      <div style={{ color: '#334155', fontSize: '0.68rem', marginTop: '0.3rem' }}>
        {filtered.length} of {items.length} shown
      </div>
    </>
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

      {/* Keyword search */}
      <div style={{ marginBottom: '0.75rem' }}>
        <input
          type="text"
          placeholder="Search job title or company..."
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
        <SearchableChecklist
          items={UK_INDUSTRIES}
          selected={getList('industry')}
          onToggle={v => toggleListItem('industry', v)}
          placeholder={`Search ${UK_INDUSTRIES.length} industries…`}
        />
      </FilterSection>

      <FilterSection label="Job Function" open={openSections.function} onToggle={() => toggleSection('function')} count={getList('function').length}>
        <SearchableChecklist
          items={JOB_FUNCTIONS}
          selected={getList('function')}
          onToggle={v => toggleListItem('function', v)}
          placeholder={`Search ${JOB_FUNCTIONS.length} functions…`}
        />
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
            {[
              { label: 'Under £20K', min: '', max: '20000' },
              { label: '£20–30K', min: '20000', max: '30000' },
              { label: '£30–50K', min: '30000', max: '50000' },
              { label: '£50–80K', min: '50000', max: '80000' },
              { label: '£80–120K', min: '80000', max: '120000' },
              { label: '£120K+', min: '120000', max: '' },
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

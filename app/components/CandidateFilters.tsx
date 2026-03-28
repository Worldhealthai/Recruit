'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

const AVAILABILITY = [
  { value: 'ACTIVELY_LOOKING', label: 'Actively Looking', color: '#22c55e' },
  { value: 'OPEN_TO_OFFERS',   label: 'Open to Offers',  color: '#f59e0b' },
  { value: 'PASSIVE',          label: 'Passive',          color: '#64748b' },
  { value: 'NOT_LOOKING',      label: 'Not Looking',      color: '#475569' },
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

// 130+ skills organised by domain for the search experience
export const ALL_SKILLS = [
  // Software Engineering
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Kotlin', 'Swift', 'C#', 'C++', 'Rust',
  'PHP', 'Ruby', 'Scala', 'Perl', 'R', 'MATLAB',
  // Frontend
  'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind CSS', 'SASS',
  'React Native', 'Flutter',
  // Backend & APIs
  'Node.js', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Laravel', 'Rails', 'Express',
  'GraphQL', 'REST APIs', 'gRPC', 'Microservices',
  // Data & Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Cassandra', 'DynamoDB',
  'SQL', 'NoSQL', 'dbt', 'Airflow', 'Kafka', 'Spark', 'Hadoop',
  // Cloud & Infrastructure
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'Helm',
  'CI/CD', 'GitHub Actions', 'Jenkins', 'Linux', 'Bash',
  // Data Science & AI
  'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'PyTorch', 'TensorFlow',
  'scikit-learn', 'Data Analysis', 'Power BI', 'Tableau', 'Looker', 'Databricks',
  // Product & Delivery
  'Product Management', 'Agile', 'Scrum', 'PRINCE2', 'Jira', 'Confluence',
  'OKRs', 'Roadmapping', 'A/B Testing', 'User Research', 'Figma', 'Sketch',
  // Marketing & Digital
  'SEO', 'PPC', 'Google Ads', 'Meta Ads', 'Content Marketing', 'Email Marketing',
  'CRM', 'HubSpot', 'Salesforce', 'Marketo', 'Google Analytics', 'Social Media',
  'Brand Management', 'PR', 'Copywriting', 'Podcast Production',
  // Finance & Accounting
  'Financial Modelling', 'Excel (Advanced)', 'SAP', 'Oracle Financials',
  'Management Accounts', 'Financial Reporting', 'Budgeting & Forecasting',
  'Tax Compliance', 'Audit', 'Payroll',
  // HR & People
  'HR Management', 'Talent Acquisition', 'L&D', 'HRIS', 'Workday',
  'Employee Relations', 'Compensation & Benefits', 'TUPE', 'Organisational Design',
  // Legal & Compliance
  'Contract Law', 'GDPR', 'Compliance', 'Legal Research', 'Due Diligence',
  'Employment Law', 'Corporate Law', 'IP Law', 'Regulatory Affairs', 'AML / KYC',
  // Retail & Buying
  'Buying & Merchandising', 'Category Management', 'Range Planning',
  'Supplier Negotiation', 'Stock Management', 'Visual Merchandising', 'Ecommerce Trading',
  // Events & Hospitality
  'Event Management', 'Event Production', 'Hospitality Management',
  'Food & Beverage', 'Revenue Management', 'Opera PMS', 'Ungerboeck',
  // Construction & Engineering
  'AutoCAD', 'Revit', 'BIM', 'Quantity Surveying', 'Construction Management',
  'Project Engineering', 'Health & Safety (IOSH)', 'CDM Regulations',
  // Healthcare & Life Sciences
  'Nursing', 'Clinical Research', 'GCP', 'Pharmacovigilance', 'Medidata Rave',
  'CDISC / SDTM', 'Medical Coding', 'Physiotherapy', 'Mental Health (MHFA)',
  // Media & Creative
  'Broadcast Production', 'Video Editing', 'Adobe Premiere', 'After Effects',
  'Photoshop', 'Illustrator', 'InDesign', 'Final Cut Pro', 'Motion Graphics',
  // Logistics & Operations
  'Supply Chain Management', 'Warehouse Management', 'SAP WM', 'Lean / Six Sigma',
  'Demand Planning', 'Procurement', 'Fleet Management', 'Last-Mile Delivery',
  // Soft Skills & Certifications
  'People Management', 'Stakeholder Management', 'Executive Presentations',
  'Business Analysis', 'Change Management', 'AWS Certified', 'CISSP', 'CFA',
  'CIMA', 'CIPD', 'MRICS', 'Driving Licence (Full UK)', 'Forklift Licence',
].sort()

const UK_CITIES = [
  'London','Manchester','Birmingham','Leeds','Glasgow','Edinburgh',
  'Bristol','Cardiff','Liverpool','Newcastle','Sheffield','Nottingham',
  'Leicester','Southampton','Oxford','Cambridge','Brighton','Reading',
  'Coventry','Derby','Portsmouth','Plymouth','Exeter','Norwich','York',
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

function FilterSection({ label, open, onToggle, children }: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode
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
        {label}
        <span style={{ color: '#475569', fontSize: '0.75rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ paddingBottom: '0.25rem' }}>{children}</div>}
    </div>
  )
}

function CheckPill({ label, checked, color, onChange }: {
  label: string; checked: boolean; color?: string; onChange: (v: boolean) => void
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.2rem 0' }}>
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
      <div style={{ maxHeight: '220px', overflowY: 'auto', paddingRight: '0.25rem' }}>
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
        {selected.length > 0 && ` · ${selected.length} selected`}
      </div>
    </>
  )
}

function parseList(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : []
}

export default function CandidateFilters({ totalResults }: { totalResults: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    availability: true, seniority: true, skills: true, location: true,
    experience: false, prefs: true, notice: false,
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
          <div style={{ color: '#475569', fontSize: '0.75rem', marginTop: '0.1rem' }}>{totalResults} candidates</div>
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
          placeholder="Search name or job title..."
          defaultValue={get('q') ?? ''}
          onChange={e => update({ q: e.target.value || null })}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '0.4rem', padding: '0.5rem 0.75rem', color: '#f8fafc',
            fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      <FilterSection label="Availability" open={openSections.availability} onToggle={() => toggleSection('availability')}>
        {AVAILABILITY.map(a => (
          <CheckPill key={a.value} label={a.label} color={a.color}
            checked={getList('availability').includes(a.value)}
            onChange={() => toggleListItem('availability', a.value)} />
        ))}
      </FilterSection>

      <FilterSection label="Seniority" open={openSections.seniority} onToggle={() => toggleSection('seniority')}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {SENIORITY.map(s => (
            <CheckPill key={s.value} label={s.label}
              checked={getList('seniority').includes(s.value)}
              onChange={() => toggleListItem('seniority', s.value)} />
          ))}
        </div>
      </FilterSection>

      <FilterSection label={`Skills${getList('skills').length ? ` (${getList('skills').length})` : ''}`} open={openSections.skills} onToggle={() => toggleSection('skills')}>
        <SearchableChecklist
          items={ALL_SKILLS}
          selected={getList('skills')}
          onToggle={v => toggleListItem('skills', v)}
          placeholder={`Search ${ALL_SKILLS.length} skills…`}
        />
      </FilterSection>

      <FilterSection label="Work Preferences" open={openSections.prefs} onToggle={() => toggleSection('prefs')}>
        <CheckPill label="Remote open" checked={get('remote') === '1'} color="#22c55e"
          onChange={v => update({ remote: v ? '1' : null })} />
        <CheckPill label="Open to relocation" checked={get('relocation') === '1'} color="#3b82f6"
          onChange={v => update({ relocation: v ? '1' : null })} />
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
          <option value="">Any location</option>
          {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </FilterSection>

      <FilterSection label="Experience (years)" open={openSections.experience} onToggle={() => toggleSection('experience')}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input type="number" placeholder="Min" min={0} max={40}
            defaultValue={get('min_exp') ?? ''}
            onChange={e => update({ min_exp: e.target.value || null })}
            style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem', padding: '0.4rem 0.5rem', color: '#f8fafc', fontSize: '0.8rem', outline: 'none' }}
          />
          <span style={{ color: '#475569', fontSize: '0.8rem' }}>to</span>
          <input type="number" placeholder="Max" min={0} max={40}
            defaultValue={get('max_exp') ?? ''}
            onChange={e => update({ max_exp: e.target.value || null })}
            style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.3rem', padding: '0.4rem 0.5rem', color: '#f8fafc', fontSize: '0.8rem', outline: 'none' }}
          />
          <span style={{ color: '#475569', fontSize: '0.75rem' }}>yrs</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
          {[
            { label: '0–2 yrs', min: '0', max: '2' },
            { label: '3–5 yrs', min: '3', max: '5' },
            { label: '6–10 yrs', min: '6', max: '10' },
            { label: '10+ yrs', min: '10', max: '' },
          ].map(r => (
            <button key={r.label} onClick={() => update({ min_exp: r.min || null, max_exp: r.max || null })}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '0.3rem', padding: '0.2rem 0.5rem', color: '#94a3b8',
                fontSize: '0.72rem', cursor: 'pointer',
              }}>
              {r.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection label="Notice Period" open={openSections.notice} onToggle={() => toggleSection('notice')}>
        {[
          { value: '0', label: 'Immediate / Available now' },
          { value: '14', label: 'Up to 2 weeks' },
          { value: '30', label: 'Up to 1 month' },
          { value: '60', label: 'Up to 2 months' },
          { value: '90', label: 'Up to 3 months' },
        ].map(n => (
          <CheckPill key={n.value} label={n.label}
            checked={get('max_notice') === n.value}
            onChange={v => update({ max_notice: v ? n.value : null })} />
        ))}
      </FilterSection>
    </div>
  )
}

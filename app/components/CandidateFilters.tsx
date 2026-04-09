'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────────────────

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

const INDUSTRIES = [
  'Technology & Software', 'Financial Services', 'Banking', 'Insurance',
  'Asset Management', 'Private Equity', 'Venture Capital', 'Consulting',
  'Legal', 'Accounting & Audit', 'Healthcare', 'Pharmaceuticals',
  'Life Sciences', 'Biotech', 'Medical Devices', 'Retail', 'Ecommerce',
  'FMCG', 'Food & Beverage', 'Fashion & Apparel', 'Luxury Goods',
  'Media & Entertainment', 'Publishing', 'Marketing & Advertising',
  'PR & Communications', 'Real Estate', 'Property Management',
  'Construction', 'Architecture & Design', 'Engineering',
  'Manufacturing', 'Automotive', 'Aerospace & Defence', 'Energy',
  'Oil & Gas', 'Renewables & Cleantech', 'Utilities', 'Logistics',
  'Supply Chain', 'Transport & Shipping', 'Travel & Hospitality',
  'Education', 'EdTech', 'Recruitment & Staffing', 'HR & People',
  'Charity & Non-Profit', 'Government & Public Sector', 'Defence',
  'Sports & Fitness', 'Gaming', 'Cryptocurrency & Blockchain', 'Other',
].sort()

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design & UX', 'Data & Analytics',
  'DevOps & Infrastructure', 'Security & Compliance', 'QA & Testing',
  'Sales', 'Business Development', 'Account Management', 'Revenue Operations',
  'Marketing', 'Growth', 'Brand', 'Content', 'SEO & PPC', 'PR',
  'Finance', 'FP&A', 'Accounting', 'Tax', 'Treasury', 'Audit',
  'HR & People', 'Talent Acquisition', 'L&D', 'Compensation & Benefits',
  'Legal', 'Compliance & Risk', 'Contracts',
  'Operations', 'Supply Chain', 'Procurement', 'Logistics',
  'Customer Success', 'Customer Support', 'Implementation',
  'Strategy & Consulting', 'General Management', 'Executive / C-Suite',
  'Research & Development', 'Clinical', 'Medical Affairs',
  'Buying & Merchandising', 'Category Management', 'Retail Operations',
  'Real Estate', 'Construction', 'Facilities',
].sort()

const COUNTRIES = [
  'United Kingdom', 'United States', 'Germany', 'France', 'Netherlands',
  'Ireland', 'Spain', 'Italy', 'Canada', 'Australia', 'Singapore',
  'United Arab Emirates', 'India', 'South Africa', 'Other',
]

const UK_REGIONS = [
  'Greater London', 'South East', 'South West', 'East of England',
  'East Midlands', 'West Midlands', 'Yorkshire and the Humber',
  'North West', 'North East', 'Scotland', 'Wales', 'Northern Ireland',
]

const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh',
  'Bristol', 'Cardiff', 'Liverpool', 'Newcastle', 'Sheffield', 'Nottingham',
  'Leicester', 'Southampton', 'Oxford', 'Cambridge', 'Brighton', 'Reading',
  'Coventry', 'Derby', 'Portsmouth', 'Plymouth', 'Exeter', 'Norwich', 'York',
  'Milton Keynes', 'Luton', 'Swindon', 'Aberdeen', 'Dundee',
]

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
  // Construction & Engineering
  'AutoCAD', 'Revit', 'BIM', 'Quantity Surveying', 'Construction Management',
  'Project Engineering', 'Health & Safety (IOSH)', 'CDM Regulations',
  // Healthcare & Life Sciences
  'Nursing', 'Clinical Research', 'GCP', 'Pharmacovigilance', 'Medical Coding',
  'Physiotherapy', 'Mental Health (MHFA)',
  // Media & Creative
  'Video Editing', 'Adobe Premiere', 'After Effects', 'Photoshop', 'Illustrator',
  'InDesign', 'Final Cut Pro', 'Motion Graphics',
  // Logistics & Operations
  'Supply Chain Management', 'Warehouse Management', 'Lean / Six Sigma',
  'Demand Planning', 'Procurement', 'Fleet Management',
  // Soft Skills & Certs
  'People Management', 'Stakeholder Management', 'Executive Presentations',
  'Business Analysis', 'Change Management', 'AWS Certified', 'CISSP', 'CFA',
  'CIMA', 'CIPD', 'MRICS', 'Driving Licence (Full UK)',
].sort()

// ── Style helpers ─────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.4rem',
  padding: '0.5rem 0.7rem',
  color: '#f8fafc',
  fontSize: '0.8rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const miniInputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '0.3rem',
  padding: '0.35rem 0.5rem',
  color: '#f8fafc',
  fontSize: '0.75rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.4rem',
  padding: '0.45rem 0.6rem',
  color: '#f8fafc',
  fontSize: '0.8rem',
  outline: 'none',
  cursor: 'pointer',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({ label, open, onToggle, count, children }: {
  label: string; open: boolean; onToggle: () => void
  count?: number; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.7rem 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#f1f5f9', fontSize: '0.82rem', fontWeight: 600,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {label}
          {count != null && count > 0 && (
            <span style={{ background: '#6366f1', color: '#fff', borderRadius: '999px', padding: '0 0.4rem', fontSize: '0.62rem', fontWeight: 700 }}>
              {count}
            </span>
          )}
        </span>
        <span style={{ color: '#334155', fontSize: '0.65rem' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ paddingBottom: '0.85rem' }}>{children}</div>}
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
        style={{ accentColor: color ?? '#6366f1', width: '13px', height: '13px', cursor: 'pointer', flexShrink: 0 }}
      />
      {color && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, flexShrink: 0 }} />}
      <span style={{ fontSize: '0.8rem', color: checked ? '#f1f5f9' : '#64748b' }}>{label}</span>
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
        type="text" placeholder={placeholder} value={q}
        onChange={e => setQ(e.target.value)}
        style={{ ...miniInputStyle, width: '100%', marginBottom: '0.45rem' }}
      />
      {selected.length > 0 && !q && (
        <div style={{ marginBottom: '0.45rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {selected.map(s => (
            <span key={s} onClick={() => onToggle(s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              background: 'rgba(99,102,241,0.18)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.35)', borderRadius: '999px',
              padding: '0.1rem 0.5rem', fontSize: '0.68rem', cursor: 'pointer',
            }}>
              {s} ×
            </span>
          ))}
        </div>
      )}
      <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '0.2rem' }}>
        {filtered.length === 0
          ? <div style={{ color: '#475569', fontSize: '0.75rem', padding: '0.4rem 0' }}>No results for &ldquo;{q}&rdquo;</div>
          : filtered.map(item => (
            <CheckPill key={item} label={item}
              checked={selected.includes(item)}
              onChange={() => onToggle(item)} />
          ))
        }
      </div>
      <div style={{ color: '#334155', fontSize: '0.66rem', marginTop: '0.25rem' }}>
        {filtered.length} shown{selected.length > 0 && ` · ${selected.length} selected`}
      </div>
    </>
  )
}

function parseList(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : []
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CandidateFilters({ totalResults }: { totalResults: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState<Record<string, boolean>>({
    profile: true,
    availability: true,
    skills: true,
    location: true,
    experience: false,
    salary: false,
  })

  const toggle = useCallback((key: string) => {
    setOpen(p => ({ ...p, [key]: !p[key] }))
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

  const toggleList = (key: string, value: string) => {
    const cur = getList(key)
    const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
    update({ [key]: next.join(',') || null })
  }

  const activeCount = Array.from(searchParams.entries()).length
  const clearAll = () => router.push(pathname)

  // Active filter counts per section
  const profileCount = [get('q'), get('title'), get('company'), getList('industry').length > 0, getList('department').length > 0, getList('seniority').length > 0].filter(Boolean).length
  const locationCount = [get('country'), get('location'), get('region'), get('remote'), get('relocation')].filter(Boolean).length
  const expCount = [get('min_exp'), get('max_exp'), get('max_notice')].filter(Boolean).length
  const salaryCount = [get('min_salary'), get('max_salary')].filter(Boolean).length

  return (
    <aside style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '0.875rem',
      padding: '1.1rem',
      position: 'sticky',
      top: '76px',
      maxHeight: 'calc(100vh - 100px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>Advanced Search</div>
          <div style={{ color: '#475569', fontSize: '0.72rem', marginTop: '0.1rem' }}>{totalResults} candidates</div>
        </div>
        {activeCount > 0 && (
          <button onClick={clearAll} style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', borderRadius: '0.35rem', padding: '0.22rem 0.6rem',
            fontSize: '0.7rem', cursor: 'pointer', fontWeight: 600,
          }}>
            Clear {activeCount}
          </button>
        )}
      </div>

      {/* ── Professional Profile ── */}
      <FilterSection label="Professional Profile" open={open.profile} onToggle={() => toggle('profile')} count={profileCount}>
        {/* Keyword */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Keyword</label>
          <input
            type="text" placeholder="Name, title, company…"
            defaultValue={get('q') ?? ''}
            onChange={e => update({ q: e.target.value || null })}
            style={inputStyle}
          />
        </div>

        {/* Current job title */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Current Job Title</label>
          <input
            type="text" placeholder="e.g. Senior Engineer"
            defaultValue={get('title') ?? ''}
            onChange={e => update({ title: e.target.value || null })}
            style={inputStyle}
          />
        </div>

        {/* Current employer */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Current Employer</label>
          <input
            type="text" placeholder="e.g. Google, HSBC…"
            defaultValue={get('company') ?? ''}
            onChange={e => update({ company: e.target.value || null })}
            style={inputStyle}
          />
        </div>

        {/* Industry */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Current Industry</label>
          <SearchableChecklist
            items={INDUSTRIES}
            selected={getList('industry')}
            onToggle={v => toggleList('industry', v)}
            placeholder={`Search ${INDUSTRIES.length} industries…`}
          />
        </div>

        {/* Department */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Department / Function</label>
          <SearchableChecklist
            items={DEPARTMENTS}
            selected={getList('department')}
            onToggle={v => toggleList('department', v)}
            placeholder={`Search departments…`}
          />
        </div>

        {/* Seniority */}
        <div>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Seniority Level</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.05rem' }}>
            {SENIORITY.map(s => (
              <CheckPill key={s.value} label={s.label}
                checked={getList('seniority').includes(s.value)}
                onChange={() => toggleList('seniority', s.value)} />
            ))}
          </div>
        </div>
      </FilterSection>

      {/* ── Availability ── */}
      <FilterSection label="Availability" open={open.availability} onToggle={() => toggle('availability')} count={getList('availability').length}>
        {AVAILABILITY.map(a => (
          <CheckPill key={a.value} label={a.label} color={a.color}
            checked={getList('availability').includes(a.value)}
            onChange={() => toggleList('availability', a.value)} />
        ))}
      </FilterSection>

      {/* ── Skills ── */}
      <FilterSection label="Skills" open={open.skills} onToggle={() => toggle('skills')} count={getList('skills').length}>
        <SearchableChecklist
          items={ALL_SKILLS}
          selected={getList('skills')}
          onToggle={v => toggleList('skills', v)}
          placeholder={`Search ${ALL_SKILLS.length} skills…`}
        />
      </FilterSection>

      {/* ── Location & Mobility ── */}
      <FilterSection label="Location & Mobility" open={open.location} onToggle={() => toggle('location')} count={locationCount}>
        {/* Country */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Country</label>
          <select
            value={get('country') ?? ''}
            onChange={e => update({ country: e.target.value || null })}
            style={{ ...selectStyle, color: get('country') ? '#f8fafc' : '#64748b' }}
          >
            <option value="">Any country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* City */}
        <div style={{ marginBottom: '0.5rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>City</label>
          <select
            value={get('location') ?? ''}
            onChange={e => update({ location: e.target.value || null })}
            style={{ ...selectStyle, color: get('location') ? '#f8fafc' : '#64748b' }}
          >
            <option value="">Any city</option>
            {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Region */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.25rem' }}>Region / County</label>
          <select
            value={get('region') ?? ''}
            onChange={e => update({ region: e.target.value || null })}
            style={{ ...selectStyle, color: get('region') ? '#f8fafc' : '#64748b' }}
          >
            <option value="">Any region</option>
            {UK_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {/* Work preferences */}
        <div style={{ paddingTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>Work Arrangement</label>
          <CheckPill label="Open to remote" checked={get('remote') === '1'} color="#22c55e"
            onChange={v => update({ remote: v ? '1' : null })} />
          <CheckPill label="Open to relocation" checked={get('relocation') === '1'} color="#3b82f6"
            onChange={v => update({ relocation: v ? '1' : null })} />
        </div>
      </FilterSection>

      {/* ── Experience & Notice ── */}
      <FilterSection label="Experience & Notice" open={open.experience} onToggle={() => toggle('experience')} count={expCount}>
        {/* Total years */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>Total Years of Experience</label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
            <input type="number" placeholder="Min" min={0} max={40}
              defaultValue={get('min_exp') ?? ''}
              onChange={e => update({ min_exp: e.target.value || null })}
              style={{ ...miniInputStyle, width: '68px' }}
            />
            <span style={{ color: '#334155', fontSize: '0.75rem' }}>–</span>
            <input type="number" placeholder="Max" min={0} max={40}
              defaultValue={get('max_exp') ?? ''}
              onChange={e => update({ max_exp: e.target.value || null })}
              style={{ ...miniInputStyle, width: '68px' }}
            />
            <span style={{ color: '#475569', fontSize: '0.72rem' }}>yrs</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
            {[
              { label: '0–2', min: '0', max: '2' },
              { label: '3–5', min: '3', max: '5' },
              { label: '6–10', min: '6', max: '10' },
              { label: '10+', min: '10', max: '' },
            ].map(r => {
              const active = get('min_exp') === r.min && get('max_exp') === (r.max || null)
              return (
                <button key={r.label} onClick={() => update({ min_exp: r.min || null, max_exp: r.max || null })}
                  style={{
                    background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    color: active ? '#a5b4fc' : '#64748b',
                    borderRadius: '0.3rem', padding: '0.18rem 0.55rem',
                    fontSize: '0.72rem', cursor: 'pointer',
                  }}>
                  {r.label} yrs
                </button>
              )
            })}
          </div>
        </div>

        {/* Notice period */}
        <div>
          <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>Max Notice Period</label>
          {[
            { value: '0',  label: 'Immediate / Available now' },
            { value: '14', label: 'Up to 2 weeks' },
            { value: '30', label: 'Up to 1 month' },
            { value: '60', label: 'Up to 2 months' },
            { value: '90', label: 'Up to 3 months' },
          ].map(n => (
            <CheckPill key={n.value} label={n.label}
              checked={get('max_notice') === n.value}
              onChange={v => update({ max_notice: v ? n.value : null })} />
          ))}
        </div>
      </FilterSection>

      {/* ── Salary ── */}
      <FilterSection label="Salary Expectation" open={open.salary} onToggle={() => toggle('salary')} count={salaryCount}>
        <label style={{ fontSize: '0.68rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>Annual (£)</label>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input type="number" placeholder="Min" step={5000}
            defaultValue={get('min_salary') ?? ''}
            onChange={e => update({ min_salary: e.target.value || null })}
            style={{ ...miniInputStyle, width: '90px' }}
          />
          <span style={{ color: '#334155', fontSize: '0.75rem' }}>–</span>
          <input type="number" placeholder="Max" step={5000}
            defaultValue={get('max_salary') ?? ''}
            onChange={e => update({ max_salary: e.target.value || null })}
            style={{ ...miniInputStyle, width: '90px' }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {[
            { label: '<£40k',  max: '40000' },
            { label: '£40–60k', min: '40000', max: '60000' },
            { label: '£60–80k', min: '60000', max: '80000' },
            { label: '£80–100k', min: '80000', max: '100000' },
            { label: '£100k+',  min: '100000' },
          ].map(r => {
            const active = get('min_salary') === (r.min ?? null) && get('max_salary') === (r.max ?? null)
            return (
              <button key={r.label} onClick={() => update({ min_salary: r.min ?? null, max_salary: r.max ?? null })}
                style={{
                  background: active ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? '#4ade80' : '#64748b',
                  borderRadius: '0.3rem', padding: '0.18rem 0.55rem',
                  fontSize: '0.72rem', cursor: 'pointer',
                }}>
                {r.label}
              </button>
            )
          })}
        </div>
      </FilterSection>
    </aside>
  )
}

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
  'Accounting & Audit', 'Aerospace & Defence', 'Architecture & Design',
  'Asset Management', 'Automotive', 'Banking', 'Biotech', 'Charity & Non-Profit',
  'Consulting', 'Construction', 'Cryptocurrency & Blockchain', 'Defence',
  'Ecommerce', 'EdTech', 'Education', 'Energy', 'Engineering', 'Fashion & Apparel',
  'Financial Services', 'FMCG', 'Food & Beverage', 'Gaming', 'Government & Public Sector',
  'Healthcare', 'HR & People', 'Insurance', 'Legal', 'Life Sciences',
  'Logistics', 'Luxury Goods', 'Manufacturing', 'Marketing & Advertising',
  'Media & Entertainment', 'Medical Devices', 'Oil & Gas', 'Other',
  'Pharmaceuticals', 'PR & Communications', 'Private Equity', 'Property Management',
  'Publishing', 'Real Estate', 'Recruitment & Staffing', 'Renewables & Cleantech',
  'Retail', 'Sports & Fitness', 'Supply Chain', 'Technology & Software',
  'Transport & Shipping', 'Travel & Hospitality', 'Utilities', 'Venture Capital',
]

const DEPARTMENTS = [
  'Account Management', 'Accounting', 'Audit', 'Brand', 'Business Development',
  'Buying & Merchandising', 'Category Management', 'Clinical', 'Compensation & Benefits',
  'Compliance & Risk', 'Construction', 'Content', 'Contracts', 'Customer Success',
  'Customer Support', 'Data & Analytics', 'Design & UX', 'DevOps & Infrastructure',
  'Engineering', 'Executive / C-Suite', 'Facilities', 'Finance', 'FP&A',
  'General Management', 'Growth', 'HR & People', 'Implementation', 'L&D',
  'Legal', 'Logistics', 'Marketing', 'Medical Affairs', 'Operations', 'PR',
  'Product', 'Procurement', 'QA & Testing', 'Real Estate', 'Research & Development',
  'Retail Operations', 'Revenue Operations', 'Sales', 'Security & Compliance',
  'SEO & PPC', 'Strategy & Consulting', 'Supply Chain', 'Talent Acquisition',
  'Tax', 'Treasury',
]

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
  'TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Kotlin', 'Swift', 'C#', 'C++', 'Rust',
  'PHP', 'Ruby', 'Scala', 'R', 'MATLAB',
  'React', 'Vue', 'Angular', 'Next.js', 'Svelte', 'HTML', 'CSS', 'Tailwind CSS',
  'React Native', 'Flutter',
  'Node.js', 'Django', 'FastAPI', 'Flask', 'Spring Boot', 'Laravel', 'Rails',
  'GraphQL', 'REST APIs', 'gRPC', 'Microservices',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
  'SQL', 'dbt', 'Airflow', 'Kafka', 'Spark',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Linux',
  'Machine Learning', 'Deep Learning', 'NLP', 'PyTorch', 'TensorFlow',
  'scikit-learn', 'Data Analysis', 'Power BI', 'Tableau', 'Looker', 'Databricks',
  'Product Management', 'Agile', 'Scrum', 'Jira', 'Figma',
  'SEO', 'PPC', 'Google Ads', 'Meta Ads', 'HubSpot', 'Salesforce', 'Google Analytics',
  'Financial Modelling', 'Excel (Advanced)', 'SAP', 'Management Accounts',
  'HR Management', 'Talent Acquisition', 'Workday', 'CIPD',
  'Contract Law', 'GDPR', 'Compliance', 'Employment Law', 'AML / KYC',
  'Buying & Merchandising', 'Category Management', 'Supplier Negotiation',
  'AutoCAD', 'Revit', 'BIM', 'Quantity Surveying', 'Construction Management',
  'Nursing', 'Clinical Research', 'GCP', 'Pharmacovigilance',
  'Video Editing', 'Adobe Premiere', 'After Effects', 'Photoshop', 'Figma',
  'Supply Chain Management', 'Lean / Six Sigma', 'Procurement',
  'People Management', 'Stakeholder Management', 'Business Analysis', 'Change Management',
  'CFA', 'CIMA', 'MRICS', 'AWS Certified', 'CISSP',
].sort()

// ── Style constants ───────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '6px',
  padding: '0.45rem 0.65rem',
  color: '#e2e8f0',
  fontSize: '0.8rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const miniInputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '5px',
  padding: '0.35rem 0.5rem',
  color: '#e2e8f0',
  fontSize: '0.76rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#14141c',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: '6px',
  padding: '0.45rem 0.6rem',
  color: '#e2e8f0',
  fontSize: '0.8rem',
  outline: 'none',
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  color: '#3d4a60',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  display: 'block',
  marginBottom: '0.3rem',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function FilterSection({ label, open, onToggle, count, children }: {
  label: string; open: boolean; onToggle: () => void
  count?: number; children: React.ReactNode
}) {
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0.65rem 0', background: 'transparent', border: 'none', cursor: 'pointer',
          color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          {label}
          {count != null && count > 0 && (
            <span style={{
              background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
              borderRadius: '999px', padding: '0 0.4rem',
              fontSize: '0.6rem', fontWeight: 700,
            }}>
              {count}
            </span>
          )}
        </span>
        <span style={{ color: '#2d3748', fontSize: '0.75rem', fontWeight: 500 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div style={{ paddingBottom: '0.9rem' }}>{children}</div>}
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
        style={{ accentColor: '#6366f1', width: '13px', height: '13px', cursor: 'pointer', flexShrink: 0 }}
      />
      {color && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, flexShrink: 0 }} />}
      <span style={{ fontSize: '0.79rem', color: checked ? '#e2e8f0' : '#4b5a70' }}>{label}</span>
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
        style={{ ...miniInputStyle, width: '100%', marginBottom: '0.4rem' }}
      />
      {selected.length > 0 && !q && (
        <div style={{ marginBottom: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.2rem' }}>
          {selected.map(s => (
            <span key={s} onClick={() => onToggle(s)} style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: '999px',
              padding: '0.1rem 0.5rem', fontSize: '0.67rem', cursor: 'pointer',
            }}>
              {s} ×
            </span>
          ))}
        </div>
      )}
      <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
        {filtered.length === 0
          ? <div style={{ color: '#3d4a60', fontSize: '0.75rem', padding: '0.35rem 0' }}>No results</div>
          : filtered.map(item => (
            <CheckPill key={item} label={item}
              checked={selected.includes(item)}
              onChange={() => onToggle(item)} />
          ))
        }
      </div>
      {selected.length > 0 && (
        <div style={{ color: '#3d4a60', fontSize: '0.65rem', marginTop: '0.2rem' }}>
          {selected.length} selected
        </div>
      )}
    </>
  )
}

function parseList(v: string | null): string[] {
  return v ? v.split(',').filter(Boolean) : []
}

// ── Main component ────────────────────────────────────────────────────────────

export default function CandidateFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [open, setOpen] = useState<Record<string, boolean>>({
    profile: true,
    availability: true,
    skills: false,
    location: false,
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

  // Count active filters per section (excluding q)
  const profileCount = [get('title'), get('company'), getList('industry').length > 0, getList('department').length > 0, getList('seniority').length > 0].filter(Boolean).length
  const locationCount = [get('country'), get('location'), get('region'), get('remote'), get('relocation')].filter(Boolean).length
  const expCount = [get('min_exp'), get('max_exp'), get('max_notice')].filter(Boolean).length
  const salaryCount = [get('min_salary'), get('max_salary')].filter(Boolean).length

  // Active count excludes `q` (handled by the search bar)
  const activeCount = Array.from(searchParams.entries()).filter(([k]) => k !== 'q').length

  const clearFilters = () => {
    const p = new URLSearchParams(searchParams.toString())
    Array.from(p.keys()).filter(k => k !== 'q').forEach(k => p.delete(k))
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <aside style={{
      background: 'rgba(255,255,255,0.025)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '12px',
      padding: '1rem 1.1rem',
      position: 'sticky',
      top: '72px',
      maxHeight: 'calc(100vh - 96px)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', paddingBottom: '0.9rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#3d4a60', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Filters
        </span>
        {activeCount > 0 && (
          <button onClick={clearFilters} style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.09)',
            color: '#4b5a70', borderRadius: '5px',
            padding: '0.18rem 0.55rem', fontSize: '0.69rem', cursor: 'pointer',
          }}>
            Clear {activeCount}
          </button>
        )}
      </div>

      {/* ── Professional Profile ── */}
      <FilterSection label="Profile" open={open.profile} onToggle={() => toggle('profile')} count={profileCount}>
        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>Job Title</label>
          <input
            type="text" placeholder="e.g. Senior Engineer"
            defaultValue={get('title') ?? ''}
            onChange={e => update({ title: e.target.value || null })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>Employer</label>
          <input
            type="text" placeholder="e.g. Google, HSBC…"
            defaultValue={get('company') ?? ''}
            onChange={e => update({ company: e.target.value || null })}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>Industry</label>
          <SearchableChecklist
            items={INDUSTRIES}
            selected={getList('industry')}
            onToggle={v => toggleList('industry', v)}
            placeholder="Search industries…"
          />
        </div>

        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>Department</label>
          <SearchableChecklist
            items={DEPARTMENTS}
            selected={getList('department')}
            onToggle={v => toggleList('department', v)}
            placeholder="Search departments…"
          />
        </div>

        <div>
          <label style={labelStyle}>Seniority</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.02rem' }}>
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
      <FilterSection label="Location" open={open.location} onToggle={() => toggle('location')} count={locationCount}>
        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>Country</label>
          <select value={get('country') ?? ''} onChange={e => update({ country: e.target.value || null })} style={selectStyle}>
            <option value="">Any country</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '0.55rem' }}>
          <label style={labelStyle}>City</label>
          <select value={get('location') ?? ''} onChange={e => update({ location: e.target.value || null })} style={selectStyle}>
            <option value="">Any city</option>
            {UK_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '0.7rem' }}>
          <label style={labelStyle}>Region</label>
          <select value={get('region') ?? ''} onChange={e => update({ region: e.target.value || null })} style={selectStyle}>
            <option value="">Any region</option>
            {UK_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.6rem' }}>
          <label style={labelStyle}>Work Arrangement</label>
          <CheckPill label="Open to remote" checked={get('remote') === '1'} color="#22c55e"
            onChange={v => update({ remote: v ? '1' : null })} />
          <CheckPill label="Open to relocation" checked={get('relocation') === '1'} color="#818cf8"
            onChange={v => update({ relocation: v ? '1' : null })} />
        </div>
      </FilterSection>

      {/* ── Experience & Notice ── */}
      <FilterSection label="Experience & Notice" open={open.experience} onToggle={() => toggle('experience')} count={expCount}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label style={labelStyle}>Years of Experience</label>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
            <input type="number" placeholder="Min" min={0} max={40}
              defaultValue={get('min_exp') ?? ''}
              onChange={e => update({ min_exp: e.target.value || null })}
              style={{ ...miniInputStyle, width: '64px' }}
            />
            <span style={{ color: '#2d3748', fontSize: '0.75rem' }}>–</span>
            <input type="number" placeholder="Max" min={0} max={40}
              defaultValue={get('max_exp') ?? ''}
              onChange={e => update({ max_exp: e.target.value || null })}
              style={{ ...miniInputStyle, width: '64px' }}
            />
            <span style={{ color: '#3d4a60', fontSize: '0.72rem' }}>yrs</span>
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
                <button key={r.label}
                  onClick={() => update({ min_exp: r.min || null, max_exp: r.max || null })}
                  style={{
                    background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                    border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.09)'}`,
                    color: active ? '#a5b4fc' : '#4b5a70',
                    borderRadius: '5px', padding: '0.18rem 0.5rem',
                    fontSize: '0.71rem', cursor: 'pointer',
                  }}>
                  {r.label}y
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Max Notice Period</label>
          {[
            { value: '0',  label: 'Immediate' },
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
      <FilterSection label="Salary" open={open.salary} onToggle={() => toggle('salary')} count={salaryCount}>
        <label style={labelStyle}>Annual (£)</label>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.5rem' }}>
          <input type="number" placeholder="Min" step={5000}
            defaultValue={get('min_salary') ?? ''}
            onChange={e => update({ min_salary: e.target.value || null })}
            style={{ ...miniInputStyle, width: '85px' }}
          />
          <span style={{ color: '#2d3748', fontSize: '0.75rem' }}>–</span>
          <input type="number" placeholder="Max" step={5000}
            defaultValue={get('max_salary') ?? ''}
            onChange={e => update({ max_salary: e.target.value || null })}
            style={{ ...miniInputStyle, width: '85px' }}
          />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {[
            { label: '<£40k',    max: '40000' },
            { label: '£40–60k',  min: '40000', max: '60000' },
            { label: '£60–80k',  min: '60000', max: '80000' },
            { label: '£80–100k', min: '80000', max: '100000' },
            { label: '£100k+',   min: '100000' },
          ].map(r => {
            const active = get('min_salary') === (r.min ?? null) && get('max_salary') === (r.max ?? null)
            return (
              <button key={r.label}
                onClick={() => update({ min_salary: r.min ?? null, max_salary: r.max ?? null })}
                style={{
                  background: active ? 'rgba(99,102,241,0.18)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.09)'}`,
                  color: active ? '#a5b4fc' : '#4b5a70',
                  borderRadius: '5px', padding: '0.18rem 0.5rem',
                  fontSize: '0.71rem', cursor: 'pointer',
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

'use client'

import { useState } from 'react'
import { ALL_SKILLS } from '../components/CandidateFilters'

// ── Types ──────────────────────────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | 5

interface Experience {
  company_name: string; title: string; start_date: string
  end_date: string; is_current: boolean; description: string
}
interface Education {
  institution: string; degree: string; field_of_study: string
  grade: string; start_year: string; end_year: string
}

// ── Shared styles ──────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem',
  padding: '0.5rem 0.7rem', color: '#f8fafc', fontSize: '0.85rem',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
}
const label: React.CSSProperties = {
  fontSize: '0.65rem', color: '#64748b', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.3rem',
}
const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.75rem', padding: '1.25rem',
}

const SENIORITY = ['INTERN','JUNIOR','MID','SENIOR','LEAD','MANAGER','SENIOR_MANAGER','DIRECTOR','VP','C_SUITE']
const AVAILABILITY = ['ACTIVELY_LOOKING','OPEN_TO_OFFERS','PASSIVE','NOT_LOOKING']
const COUNTRIES = ['United Kingdom','United States','Germany','France','Netherlands','Ireland','Spain','Canada','Australia','Singapore','Other']
const REGIONS = ['Greater London','South East','South West','East of England','East Midlands','West Midlands','Yorkshire and the Humber','North West','North East','Scotland','Wales','Northern Ireland','Other']

// ── Main component ─────────────────────────────────────────────────────────
export default function ApplyPage() {
  const [step, setStep] = useState<Step>(1)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [skillSearch, setSkillSearch] = useState('')

  // Form state
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    linkedin_url: '', github_url: '', portfolio_url: '',
    current_title: '', current_company_name: '', current_department: '',
    seniority_level: 'MID', years_experience: '', availability_status: 'OPEN_TO_OFFERS',
    notice_period_days: '', summary: '',
    location_city: '', location_country: 'United Kingdom', region: 'Greater London',
    is_remote_open: false, is_relocation_open: false,
    salary_expectation_min: '', salary_expectation_max: '',
  })
  const [skills, setSkills] = useState<string[]>([])
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [education, setEducation] = useState<Education[]>([])

  const set = (k: string, v: string | boolean) => setForm(p => ({ ...p, [k]: v }))

  // ── Step validation ────────────────────────────────────────────────────
  function canAdvance() {
    if (step === 1) return form.first_name && form.last_name && form.email
    if (step === 2) return form.current_title && form.location_city
    return true
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  async function submit() {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, skills, experiences, education }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    } finally {
      setSaving(false)
    }
  }

  // ── Experience helpers ─────────────────────────────────────────────────
  function addExp() {
    setExperiences(p => [...p, { company_name:'', title:'', start_date:'', end_date:'', is_current:false, description:'' }])
  }
  function setExp(i: number, k: keyof Experience, v: string | boolean) {
    setExperiences(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e))
  }
  function removeExp(i: number) { setExperiences(p => p.filter((_, idx) => idx !== i)) }

  // ── Education helpers ──────────────────────────────────────────────────
  function addEdu() {
    setEducation(p => [...p, { institution:'', degree:'', field_of_study:'', grade:'', start_year:'', end_year:'' }])
  }
  function setEdu(i: number, k: keyof Education, v: string) {
    setEducation(p => p.map((e, idx) => idx === i ? { ...e, [k]: v } : e))
  }
  function removeEdu(i: number) { setEducation(p => p.filter((_, idx) => idx !== i)) }

  // ── Skill toggle ───────────────────────────────────────────────────────
  function toggleSkill(s: string) {
    setSkills(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])
  }

  const filteredSkills = skillSearch
    ? ALL_SKILLS.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
    : ALL_SKILLS

  // ── Success screen ─────────────────────────────────────────────────────
  if (done) return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "system-ui,-apple-system,sans-serif" }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '1.75rem' }}>✓</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>You&apos;re in the database!</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
          Your profile has been added to RecruitAI. A recruiter will be in touch if there&apos;s a match.
        </p>
      </div>
    </div>
  )

  // ── Shell ──────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#f8fafc', fontFamily: "system-ui,-apple-system,sans-serif", padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '2rem' }}>
          <div style={{ width: 28, height: 28, borderRadius: '0.4rem', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '0.85rem' }}>R</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>Recruit<span style={{ color: '#818cf8' }}>AI</span></span>
          <span style={{ color: '#334155', fontSize: '0.85rem' }}>· Join the talent pool</span>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            {['About You', 'Your Role', 'Skills', 'Experience', 'Review'].map((s, i) => (
              <div key={s} style={{ fontSize: '0.65rem', fontWeight: 600, color: step === i + 1 ? '#a5b4fc' : step > i + 1 ? '#4ade80' : '#334155', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {step > i + 1 ? '✓ ' : ''}{s}
              </div>
            ))}
          </div>
          <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${((step - 1) / 4) * 100}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: 999, transition: 'width 0.3s ease' }} />
          </div>
        </div>

        {/* ── Step 1: About You ── */}
        {step === 1 && (
          <div style={card}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>About you</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div><label style={label}>First Name *</label><input style={inp} value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="Jane" /></div>
              <div><label style={label}>Last Name *</label><input style={inp} value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Smith" /></div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}><label style={label}>Email *</label><input style={inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" /></div>
            <div style={{ marginBottom: '0.75rem' }}><label style={label}>Phone</label><input style={inp} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+44 7700 900000" /></div>
            <div style={{ marginBottom: '0.75rem' }}><label style={label}>LinkedIn URL</label><input style={inp} value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/username" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div><label style={label}>GitHub</label><input style={inp} value={form.github_url} onChange={e => set('github_url', e.target.value)} placeholder="https://github.com/..." /></div>
              <div><label style={label}>Portfolio</label><input style={inp} value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://..." /></div>
            </div>
          </div>
        )}

        {/* ── Step 2: Your Role ── */}
        {step === 2 && (
          <div style={card}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>Your role & location</h2>
            <div style={{ marginBottom: '0.75rem' }}><label style={label}>Current Title *</label><input style={inp} value={form.current_title} onChange={e => set('current_title', e.target.value)} placeholder="Senior Sales Manager" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div><label style={label}>Current Company</label><input style={inp} value={form.current_company_name} onChange={e => set('current_company_name', e.target.value)} placeholder="Acme Ltd" /></div>
              <div><label style={label}>Department</label><input style={inp} value={form.current_department} onChange={e => set('current_department', e.target.value)} placeholder="Sales" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={label}>Seniority</label>
                <select style={{ ...inp }} value={form.seniority_level} onChange={e => set('seniority_level', e.target.value)}>
                  {SENIORITY.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div><label style={label}>Years Experience</label><input style={inp} type="number" min="0" max="50" value={form.years_experience} onChange={e => set('years_experience', e.target.value)} placeholder="5" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={label}>Availability</label>
                <select style={{ ...inp }} value={form.availability_status} onChange={e => set('availability_status', e.target.value)}>
                  {AVAILABILITY.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div><label style={label}>Notice Period (days)</label><input style={inp} type="number" min="0" value={form.notice_period_days} onChange={e => set('notice_period_days', e.target.value)} placeholder="30" /></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div><label style={label}>City *</label><input style={inp} value={form.location_city} onChange={e => set('location_city', e.target.value)} placeholder="London" /></div>
              <div>
                <label style={label}>Country</label>
                <select style={{ ...inp }} value={form.location_country} onChange={e => set('location_country', e.target.value)}>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={label}>Region</label>
              <select style={{ ...inp }} value={form.region} onChange={e => set('region', e.target.value)}>
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div><label style={label}>Salary Min (£)</label><input style={inp} type="number" value={form.salary_expectation_min} onChange={e => set('salary_expectation_min', e.target.value)} placeholder="60000" /></div>
              <div><label style={label}>Salary Max (£)</label><input style={inp} type="number" value={form.salary_expectation_max} onChange={e => set('salary_expectation_max', e.target.value)} placeholder="80000" /></div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.75rem' }}>
              {[['is_remote_open', 'Open to remote'], ['is_relocation_open', 'Open to relocation']].map(([k, lbl]) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.82rem', color: '#94a3b8' }}>
                  <input type="checkbox" checked={form[k as keyof typeof form] as boolean} onChange={e => set(k, e.target.checked)} style={{ accentColor: '#6366f1', width: 14, height: 14 }} />
                  {lbl}
                </label>
              ))}
            </div>
            <div>
              <label style={label}>Summary / About</label>
              <textarea style={{ ...inp, resize: 'vertical' }} rows={4} value={form.summary} onChange={e => set('summary', e.target.value)} placeholder="Brief overview of your experience and what you're looking for..." />
            </div>
          </div>
        )}

        {/* ── Step 3: Skills ── */}
        {step === 3 && (
          <div style={card}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.5rem' }}>Skills</h2>
            <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: '1rem' }}>Select all that apply — {skills.length} selected</p>
            <input style={{ ...inp, marginBottom: '0.75rem' }} placeholder={`Search ${ALL_SKILLS.length} skills…`} value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
            {skills.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
                {skills.map(s => (
                  <span key={s} onClick={() => toggleSkill(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 999, padding: '0.15rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                    {s} ×
                  </span>
                ))}
              </div>
            )}
            <div style={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
              {filteredSkills.filter(s => !skills.includes(s)).map(s => (
                <span key={s} onClick={() => toggleSkill(s)} style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '0.15rem 0.65rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 4: Experience & Education ── */}
        {step === 4 && (
          <div>
            {/* Work experience */}
            <div style={{ ...card, marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Work experience</h2>
                <button onClick={addExp} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', borderRadius: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ Add role</button>
              </div>
              {experiences.length === 0 && <p style={{ color: '#475569', fontSize: '0.82rem' }}>No roles added yet — click &ldquo;Add role&rdquo; above (optional)</p>}
              {experiences.map((exp, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                    <button onClick={() => removeExp(i)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div><label style={label}>Job Title</label><input style={inp} value={exp.title} onChange={e => setExp(i, 'title', e.target.value)} placeholder="Sales Manager" /></div>
                    <div><label style={label}>Company</label><input style={inp} value={exp.company_name} onChange={e => setExp(i, 'company_name', e.target.value)} placeholder="Acme Ltd" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div><label style={label}>Start Date</label><input style={inp} type="month" value={exp.start_date} onChange={e => setExp(i, 'start_date', e.target.value)} /></div>
                    <div>
                      <label style={label}>End Date</label>
                      <input style={inp} type="month" value={exp.end_date} onChange={e => setExp(i, 'end_date', e.target.value)} disabled={exp.is_current} />
                    </div>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                    <input type="checkbox" checked={exp.is_current} onChange={e => setExp(i, 'is_current', e.target.checked)} style={{ accentColor: '#6366f1' }} /> Current role
                  </label>
                  <div><label style={label}>Description</label><textarea style={{ ...inp, resize: 'vertical' }} rows={2} value={exp.description} onChange={e => setExp(i, 'description', e.target.value)} placeholder="Key responsibilities and achievements..." /></div>
                </div>
              ))}
            </div>

            {/* Education */}
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Education</h2>
                <button onClick={addEdu} style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', borderRadius: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>+ Add</button>
              </div>
              {education.length === 0 && <p style={{ color: '#475569', fontSize: '0.82rem' }}>No education added yet (optional)</p>}
              {education.map((edu, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.5rem', padding: '0.85rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                    <button onClick={() => removeEdu(i)} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '0.75rem' }}>Remove</button>
                  </div>
                  <div style={{ marginBottom: '0.5rem' }}><label style={label}>Institution</label><input style={inp} value={edu.institution} onChange={e => setEdu(i, 'institution', e.target.value)} placeholder="University of London" /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div><label style={label}>Degree</label><input style={inp} value={edu.degree} onChange={e => setEdu(i, 'degree', e.target.value)} placeholder="BSc" /></div>
                    <div><label style={label}>Field of Study</label><input style={inp} value={edu.field_of_study} onChange={e => setEdu(i, 'field_of_study', e.target.value)} placeholder="Business" /></div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                    <div><label style={label}>Grade</label><input style={inp} value={edu.grade} onChange={e => setEdu(i, 'grade', e.target.value)} placeholder="2:1" /></div>
                    <div><label style={label}>Start Year</label><input style={inp} type="number" value={edu.start_year} onChange={e => setEdu(i, 'start_year', e.target.value)} placeholder="2016" /></div>
                    <div><label style={label}>End Year</label><input style={inp} type="number" value={edu.end_year} onChange={e => setEdu(i, 'end_year', e.target.value)} placeholder="2019" /></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 5: Review & Submit ── */}
        {step === 5 && (
          <div style={card}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>Review & submit</h2>
            {[
              { label: 'Name',         value: `${form.first_name} ${form.last_name}` },
              { label: 'Email',        value: form.email },
              { label: 'Phone',        value: form.phone || '—' },
              { label: 'Title',        value: form.current_title },
              { label: 'Company',      value: form.current_company_name || '—' },
              { label: 'Location',     value: `${form.location_city}, ${form.location_country}` },
              { label: 'Seniority',    value: form.seniority_level.replace(/_/g,' ') },
              { label: 'Availability', value: form.availability_status.replace(/_/g,' ') },
              { label: 'Salary',       value: form.salary_expectation_min ? `£${Number(form.salary_expectation_min).toLocaleString()} – £${Number(form.salary_expectation_max||form.salary_expectation_min).toLocaleString()}` : '—' },
              { label: 'Skills',       value: skills.length ? `${skills.length} selected` : '—' },
              { label: 'Experience',   value: `${experiences.length} role${experiences.length !== 1 ? 's' : ''}` },
              { label: 'Education',    value: `${education.length} entr${education.length !== 1 ? 'ies' : 'y'}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.55rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{row.label}</span>
                <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 500 }}>{row.value}</span>
              </div>
            ))}
            {error && (
              <div style={{ marginTop: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '0.5rem', color: '#f87171', fontSize: '0.82rem' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as Step)} style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
              ← Back
            </button>
          )}
          {step < 5 ? (
            <button
              onClick={() => canAdvance() && setStep(s => (s + 1) as Step)}
              disabled={!canAdvance()}
              style={{ flex: 2, background: canAdvance() ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.25)', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, cursor: canAdvance() ? 'pointer' : 'not-allowed', boxShadow: canAdvance() ? '0 4px 20px rgba(99,102,241,0.35)' : 'none' }}>
              Continue →
            </button>
          ) : (
            <button onClick={submit} disabled={saving} style={{ flex: 2, background: saving ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', border: 'none', color: '#fff', borderRadius: '0.5rem', padding: '0.65rem', fontSize: '0.85rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: saving ? 'none' : '0 4px 20px rgba(99,102,241,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {saving && <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
              {saving ? 'Submitting…' : 'Submit Profile'}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

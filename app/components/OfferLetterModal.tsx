'use client'

import { useState } from 'react'

type Props = {
  candidateName: string
  jobTitle: string
  companyName: string
  salary: number
  startDate: string
  onClose: () => void
}

export default function OfferLetterModal({ candidateName, jobTitle, companyName, salary, startDate, onClose }: Props) {
  const [signed, setSigned] = useState(false)
  const [sigName, setSigName] = useState('')
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const start = startDate ? new Date(startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  const handlePrint = () => window.print()

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '0.75rem', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        {/* Toolbar */}
        <div style={{ background: '#0f172a', borderRadius: '0.75rem 0.75rem 0 0', padding: '0.9rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#a5b4fc', fontWeight: 700, fontSize: '0.88rem' }}>Offer Letter</span>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button onClick={handlePrint} style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#a5b4fc', borderRadius: '0.35rem', padding: '0.3rem 0.8rem', fontSize: '0.78rem', cursor: 'pointer' }}>Print / Save PDF</button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
          </div>
        </div>

        {/* Letter content */}
        <div style={{ padding: '3rem 3.5rem', color: '#0f172a', fontFamily: 'Georgia, serif', fontSize: '0.95rem', lineHeight: 1.8 }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontWeight: 700, fontSize: '1.2rem', letterSpacing: '-0.02em', marginBottom: '0.2rem' }}>RecruitAI</div>
            <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Placed on behalf of {companyName}</div>
          </div>

          <div style={{ marginBottom: '2rem', color: '#475569', fontSize: '0.85rem' }}>{today}</div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 600 }}>Dear {candidateName},</div>
          </div>

          <p style={{ marginBottom: '1.25rem' }}>
            We are delighted to extend this formal offer of employment for the position of <strong>{jobTitle}</strong> at <strong>{companyName}</strong>.
          </p>

          <p style={{ marginBottom: '1.25rem' }}>
            Following a thorough selection process, we are confident that your skills and experience make you an excellent fit for this role and the team.
          </p>

          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '0.75rem' }}>Offer Summary</div>
            {[
              { label: 'Position', value: jobTitle },
              { label: 'Company', value: companyName },
              { label: 'Salary', value: `£${salary.toLocaleString()} per annum` },
              { label: 'Start Date', value: start },
              { label: 'Employment Type', value: 'Full-time, permanent' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', gap: '1rem', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                <span style={{ color: '#64748b', minWidth: '110px' }}>{r.label}</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.value}</span>
              </div>
            ))}
          </div>

          <p style={{ marginBottom: '1.25rem' }}>
            This offer is contingent on satisfactory completion of reference checks and any applicable background screening, as well as your right to work in the United Kingdom.
          </p>

          <p style={{ marginBottom: '2rem' }}>
            Please confirm your acceptance by signing below or by replying to this letter within <strong>5 business days</strong>. We look forward to welcoming you to the team.
          </p>

          <div style={{ marginBottom: '1rem', fontWeight: 600 }}>Yours sincerely,</div>
          <div style={{ color: '#475569', marginBottom: '2.5rem' }}>RecruitAI Placement Team</div>

          {/* E-signature section */}
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1.5rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '1rem' }}>
              Candidate Acceptance
            </div>

            {signed ? (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '0.4rem', padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, color: '#15803d', marginBottom: '0.25rem' }}>Signed by {sigName}</div>
                <div style={{ color: '#64748b', fontSize: '0.82rem' }}>{today}</div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: '0.3rem' }}>Type your full name to sign</label>
                  <input
                    type="text"
                    value={sigName}
                    onChange={e => setSigName(e.target.value)}
                    placeholder={candidateName}
                    style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '0.4rem', padding: '0.6rem 0.75rem', fontSize: '1.1rem', fontFamily: 'cursive', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={() => { if (sigName.trim()) setSigned(true) }}
                  disabled={!sigName.trim()}
                  style={{ background: sigName.trim() ? '#0f172a' : '#e2e8f0', color: sigName.trim() ? '#fff' : '#94a3b8', border: 'none', borderRadius: '0.4rem', padding: '0.6rem 1.25rem', fontSize: '0.85rem', fontWeight: 700, cursor: sigName.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
                >
                  Sign &amp; Accept
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

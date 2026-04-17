'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const ImportModal = dynamic(() => import('./ImportModal'), { ssr: false })

export default function ImportTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-primary"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
          background: '#111111', color: '#ffffff',
          border: 'none', borderRadius: '9px',
          padding: '0.55rem 1.1rem', fontSize: '0.83rem', fontWeight: 700,
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span>
        Import Candidates
      </button>

      {open && <ImportModal onClose={() => setOpen(false)} />}
    </>
  )
}

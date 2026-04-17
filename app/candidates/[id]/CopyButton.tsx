'use client'

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <button
      onClick={copy}
      style={{
        background: copied ? '#f0fdf4' : '#f3f4f6',
        border: copied ? '1px solid #bbf7d0' : 'none',
        color: copied ? '#16a34a' : '#374151',
        borderRadius: '6px', padding: '0.28rem 0.65rem',
        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
        flexShrink: 0, transition: 'all 0.15s',
      }}
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  )
}

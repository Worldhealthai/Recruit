const SOURCE_META: Record<string, { label: string; color: string }> = {
  LINKEDIN:  { label: 'LinkedIn',   color: '#0A66C2' },
  INDEED:    { label: 'Indeed',     color: '#003A9B' },
  IMPORTED:  { label: 'CV-Library', color: '#E8320A' },
  REFERRAL:  { label: 'Referral',   color: '#7c3aed' },
  WEBSITE:   { label: 'Website',    color: '#059669' },
  MANUAL:    { label: 'Manual',     color: '#6b7280' },
  GLASSDOOR: { label: 'Glassdoor',  color: '#0caa41' },
  OTHER:     { label: 'Other',      color: '#9ca3af' },
}

export default function SourceBadge({ source, profileUrl }: { source: string; profileUrl?: string | null }) {
  const meta = SOURCE_META[source] ?? SOURCE_META.OTHER

  const badge = (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: `${meta.color}12`, color: meta.color,
      border: `1px solid ${meta.color}28`,
      borderRadius: '6px', padding: '0.22rem 0.65rem',
      fontSize: '0.75rem', fontWeight: 700,
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
      {meta.label}
    </span>
  )

  if (profileUrl) {
    return (
      <a href={profileUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        {badge}
        <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.4rem' }}>View original ↗</span>
      </a>
    )
  }

  return badge
}

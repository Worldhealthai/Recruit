export default function EmptyState({ icon, message, hint }: { icon: string; message: string; hint?: string }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 2rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px dashed rgba(255,255,255,0.1)',
      borderRadius: '1rem',
      textAlign: 'center',
      gap: '0.75rem',
    }}>
      <span style={{ fontSize: '3rem' }}>{icon}</span>
      <p style={{ fontWeight: 600, color: '#cbd5e1', margin: 0 }}>{message}</p>
      {hint && <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>{hint}</p>}
    </div>
  )
}

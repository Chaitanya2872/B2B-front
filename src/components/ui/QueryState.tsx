interface QueryStateProps {
  title: string
  detail: string
  tone?: 'default' | 'danger'
}

export function QueryState({
  title,
  detail,
  tone = 'default',
}: QueryStateProps) {
  return (
    <div
      className="card"
      style={{
        padding: '1rem 1.1rem',
        borderColor: tone === 'danger' ? 'rgba(239, 68, 68, 0.35)' : undefined,
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.35rem' }}>{title}</strong>
      <p style={{ margin: 0, color: 'var(--text-muted)' }}>{detail}</p>
    </div>
  )
}

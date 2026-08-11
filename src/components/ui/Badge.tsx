import type { ReactNode } from 'react'

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'accent'

interface BadgeProps {
  tone?: Tone
  icon?: ReactNode
  children: ReactNode
}

const TONE_STYLES: Record<Tone, { bg: string; color: string }> = {
  neutral: { bg: 'var(--surface-hover)', color: 'var(--text-muted)' },
  success: { bg: 'var(--success-bg)', color: 'var(--success)' },
  warning: { bg: 'var(--warning-bg)', color: 'var(--warning)' },
  danger: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
  accent: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
}

export function Badge({ tone = 'neutral', icon, children }: BadgeProps) {
  const style = TONE_STYLES[tone]
  return (
    <span className="badge" style={{ background: style.bg, color: style.color }}>
      {icon}
      {children}
    </span>
  )
}

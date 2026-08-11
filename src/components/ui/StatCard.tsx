import type { LucideIcon } from 'lucide-react'
import './StatCard.css'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  accent?: string
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = '#2563eb',
}: StatCardProps) {
  return (
    <div className="stat-card card">
      <div
        className="stat-card-icon"
        style={{ color: accent, background: `${accent}1a` }}
      >
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
      {hint && <span className="stat-card-hint">{hint}</span>}
    </div>
  )
}

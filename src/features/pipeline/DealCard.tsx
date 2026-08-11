import { Building2, CalendarClock, CircleAlert, Landmark } from 'lucide-react'
import type { Deal } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import { ApprovalTrack } from '../../components/ui/ApprovalTrack'
import {
  formatCurrency,
  formatDate,
  formatStageLabel,
  timeAgo,
} from '../../utils/helpers'
import './pipeline.css'

const PRIORITY_COLOR: Record<Deal['priority'], string> = {
  high: 'var(--danger)',
  medium: 'var(--warning)',
  low: 'var(--text-faint)',
}

const RISK_TONE: Record<Deal['riskStatus'], string> = {
  healthy: 'var(--success)',
  attention: 'var(--warning)',
  overdue: 'var(--danger)',
  stalled: '#b45309',
  high_risk: '#7f1d1d',
}

interface DealCardProps {
  deal: Deal
  disabled?: boolean
  onSelect: () => void
  onDragStart: () => void
  onDragEnd: () => void
}

export function DealCard({
  deal,
  disabled = false,
  onSelect,
  onDragStart,
  onDragEnd,
}: DealCardProps) {
  const extraFields = Object.entries(deal.extraFields ?? {})

  return (
    <article
      className={`deal-card ${disabled ? 'deal-card--disabled' : ''}`}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="deal-card-top">
        <div className="deal-card-heading">
          <Building2
            size={14}
            strokeWidth={2}
            className="deal-card-heading-icon"
          />
          <span className="deal-card-company">{deal.company}</span>
        </div>
        <span
          className="deal-card-priority-dot"
          style={{ background: PRIORITY_COLOR[deal.priority] }}
          title={`${deal.priority} priority`}
        />
      </div>

      <p className="deal-card-product">{deal.product}</p>

      <div className="deal-card-value-row">
        <div className="deal-card-value">{formatCurrency(deal.value)}</div>
        <span className="deal-card-weighted">
          Weighted {formatCurrency(deal.weightedValue)}
        </span>
      </div>

      <div className="deal-card-badges">
        <span
          className="deal-card-badge"
          style={{ background: `${RISK_TONE[deal.riskStatus]}20`, color: RISK_TONE[deal.riskStatus] }}
        >
          <CircleAlert size={12} strokeWidth={2.2} />
          {formatStageLabel(deal.riskStatus)}
        </span>
        <span className="deal-card-badge">
          {deal.probabilityPercent}% probability
        </span>
        <span className="deal-card-badge">{deal.daysInStage} days in stage</span>
      </div>

      {(deal.nextActivity || deal.expectedClosureDate || deal.oemVendor) && (
        <div className="deal-card-insights">
          {deal.nextActivity && (
            <div className="deal-card-insight">
              <CalendarClock size={12} strokeWidth={2.2} />
              <span>
                {deal.nextActivity}
                {deal.nextActivityDueDate
                  ? ` by ${formatDate(deal.nextActivityDueDate)}`
                  : ''}
              </span>
            </div>
          )}
          {deal.expectedClosureDate && (
            <div className="deal-card-insight">
              <CircleAlert size={12} strokeWidth={2.2} />
              <span>Expected close {formatDate(deal.expectedClosureDate)}</span>
            </div>
          )}
          {deal.oemVendor && (
            <div className="deal-card-insight">
              <Landmark size={12} strokeWidth={2.2} />
              <span>OEM {deal.oemVendor}</span>
            </div>
          )}
        </div>
      )}

      {extraFields.length > 0 && (
        <div className="deal-card-extra-fields">
          {extraFields.map(([key, value]) => (
            <span key={key} className="deal-card-extra-chip" title={`${key}: ${value}`}>
              <strong>{key}</strong>: {value}
            </span>
          ))}
        </div>
      )}

      {deal.approvals.length > 0 && <ApprovalTrack steps={deal.approvals} />}

      <div className="deal-card-footer">
        <div className="deal-card-owner">
          <Avatar person={deal.accountManager} size={20} />
          <span>{deal.accountManager.name}</span>
        </div>
        <div className="deal-card-footer-actions">
          <span className="deal-card-time">{timeAgo(deal.updatedAt)}</span>
          <button
            type="button"
            className="deal-card-link"
            onClick={onSelect}
          >
            Open
          </button>
        </div>
      </div>
    </article>
  )
}

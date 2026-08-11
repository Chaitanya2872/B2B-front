import { CircleAlert } from 'lucide-react'
import type { Deal } from '../../types'
import { Avatar } from '../../components/ui/Avatar'
import {
  formatCurrency,
  formatDate,
  formatStageLabel,
} from '../../utils/helpers'
import './DealsTable.css'

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

interface DealsTableProps {
  deals: Deal[]
  onDealSelect: (deal: Deal) => void
}

export function DealsTable({ deals, onDealSelect }: DealsTableProps) {
  return (
    <div className="deals-table-wrap card">
      <table className="deals-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Contact</th>
            <th>Product</th>
            <th>Account manager</th>
            <th>Stage</th>
            <th>Value</th>
            <th>Priority</th>
            <th>Risk</th>
            <th>Expected closure</th>
          </tr>
        </thead>
        <tbody>
          {deals.length === 0 && (
            <tr>
              <td colSpan={9} className="deals-table-empty">
                No deals match these filters yet.
              </td>
            </tr>
          )}
          {deals.map((deal) => (
            <tr
              key={deal.id}
              className="deals-table-row"
              onClick={() => onDealSelect(deal)}
            >
              <td className="deals-table-company">{deal.company}</td>
              <td>{deal.contact}</td>
              <td>{deal.product}</td>
              <td>
                <div className="deals-table-owner">
                  <Avatar person={deal.accountManager} size={20} />
                  <span>{deal.accountManager.name}</span>
                </div>
              </td>
              <td>
                <span className="deals-table-stage">{deal.stageLabel}</span>
              </td>
              <td className="deals-table-value">
                {formatCurrency(deal.value)}
              </td>
              <td>
                <span
                  className="deals-table-priority"
                  style={{ color: PRIORITY_COLOR[deal.priority] }}
                >
                  {deal.priority}
                </span>
              </td>
              <td>
                <span
                  className="deals-table-badge"
                  style={{
                    background: `${RISK_TONE[deal.riskStatus]}20`,
                    color: RISK_TONE[deal.riskStatus],
                  }}
                >
                  <CircleAlert size={12} strokeWidth={2.2} />
                  {formatStageLabel(deal.riskStatus)}
                </span>
              </td>
              <td>
                {deal.expectedClosureDate
                  ? formatDate(deal.expectedClosureDate)
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

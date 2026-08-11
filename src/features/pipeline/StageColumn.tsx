import type { Deal, PipelineStage } from '../../types'
import { formatCompactCurrency, formatCurrency } from '../../utils/helpers'
import { DealCard } from './DealCard'
import './pipeline.css'

interface StageColumnProps {
  stage: PipelineStage
  deals: Deal[]
  onDealSelect: (deal: Deal) => void
  isDropTarget: boolean
  isBusy: boolean
  onDragDeal: (dealId: string) => void
  onDragEnd: () => void
  onDragEnter: () => void
  onDragLeave: () => void
  onDropDeal: () => void
}

export function StageColumn({
  stage,
  deals,
  onDealSelect,
  isDropTarget,
  isBusy,
  onDragDeal,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDropDeal,
}: StageColumnProps) {
  const total = deals.reduce((sum, deal) => sum + deal.value, 0)
  const weightedTotal = deals.reduce((sum, deal) => sum + deal.weightedValue, 0)

  return (
    <section
      className={`stage-column ${isDropTarget ? 'stage-column--drop-target' : ''}`}
      onDragOver={(event) => event.preventDefault()}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDropDeal}
    >
      <header className="stage-column-header">
        <div className="stage-column-title">
          <span className="stage-dot" style={{ background: stage.color }} />
          <span>{stage.name}</span>
          <span className="stage-count">{deals.length}</span>
        </div>
        <div className="stage-column-metrics">
          <strong>{formatCompactCurrency(total)}</strong>
          <span>{stage.probabilityPercent}% prob.</span>
        </div>
      </header>

      <div className="stage-column-subhead">
        <span>Weighted {formatCompactCurrency(weightedTotal)}</span>
        <span>SLA {stage.maxExpectedDurationDays} days</span>
      </div>

      <div className="stage-column-body">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            disabled={isBusy}
            onSelect={() => onDealSelect(deal)}
            onDragStart={() => onDragDeal(deal.id)}
            onDragEnd={onDragEnd}
          />
        ))}
        {deals.length === 0 && (
          <p className="stage-empty">
            Drop a deal here
            <span>{formatCurrency(total)}</span>
          </p>
        )}
      </div>
    </section>
  )
}

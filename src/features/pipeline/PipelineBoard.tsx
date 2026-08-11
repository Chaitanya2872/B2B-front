import { useMemo, useState } from 'react'
import type { Deal, PipelineStage } from '../../types'
import { useMoveDealStage } from '../../hooks/useCrm'
import { formatCompactCurrency } from '../../utils/helpers'
import { StageColumn } from './StageColumn'
import './pipeline.css'

interface PipelineBoardProps {
  deals: Deal[]
  stages: PipelineStage[]
  canMoveDeals: boolean
  onDealSelect: (deal: Deal) => void
}

export function PipelineBoard({
  deals,
  stages,
  canMoveDeals,
  onDealSelect,
}: PipelineBoardProps) {
  const moveDealStage = useMoveDealStage()
  const [draggingDealId, setDraggingDealId] = useState<string | null>(null)
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null)
  const [pendingMove, setPendingMove] = useState<{
    dealId: string
    targetStageId: string
  } | null>(null)

  const stageById = useMemo(
    () => Object.fromEntries(stages.map((stage) => [stage.id, stage])),
    [stages],
  )

  const boardDeals = useMemo(() => {
    if (!pendingMove) {
      return deals
    }

    const targetStage = stageById[pendingMove.targetStageId]
    if (!targetStage) {
      return deals
    }

    return deals.map((deal) =>
      deal.id === pendingMove.dealId
        ? {
            ...deal,
            stage: targetStage.id,
            stageLabel: targetStage.name,
            probabilityPercent: targetStage.probabilityPercent,
            weightedValue: Math.round(
              deal.value * (targetStage.probabilityPercent / 100),
            ),
            updatedAt: new Date().toISOString(),
          }
        : deal,
    )
  }, [deals, pendingMove, stageById])

  const summary = useMemo(() => {
    const totalValue = boardDeals.reduce((sum, deal) => sum + deal.value, 0)
    const weightedValue = boardDeals.reduce(
      (sum, deal) => sum + deal.weightedValue,
      0,
    )
    const stalledDeals = boardDeals.filter(
      (deal) => deal.riskStatus === 'stalled' || deal.riskStatus === 'overdue',
    ).length

    return {
      totalValue,
      weightedValue,
      stalledDeals,
      openDeals: boardDeals.length,
    }
  }, [boardDeals])

  async function handleDrop(targetStageId: string) {
    if (!canMoveDeals) {
      return
    }

    const deal = boardDeals.find((item) => item.id === draggingDealId)
    const targetStage = stageById[targetStageId]
    const currentStage = deal ? stageById[deal.stage] : undefined

    setHoveredStageId(null)
    setDraggingDealId(null)

    if (
      !deal ||
      !targetStage ||
      !currentStage ||
      deal.stage === targetStageId
    ) {
      return
    }

    const transition = currentStage.allowedNextStages.find(
      (item) => item.stageId === targetStageId,
    )

    if (!transition) {
      window.alert(
        `Move not allowed from ${currentStage.name} to ${targetStage.name}.`,
      )
      return
    }

    const confirmed = transition.confirmationRequired
      ? window.confirm(
          `Move ${deal.company} from ${currentStage.name} to ${targetStage.name}?`,
        )
      : true

    if (!confirmed) {
      return
    }

    setPendingMove({ dealId: deal.id, targetStageId })

    try {
      await moveDealStage.mutateAsync({
        dealId: deal.id,
        input: {
          targetStageId,
          confirmed: transition.confirmationRequired,
        },
      })
    } catch (error) {
      setPendingMove(null)
      const message =
        error instanceof Error ? error.message : 'Stage move failed.'
      window.alert(message)
      return
    }

    setPendingMove(null)
  }

  return (
    <div className="pipeline-shell">
      <section className="pipeline-summary-strip">
        <div className="pipeline-summary-card">
          <span className="pipeline-summary-label">Open deals</span>
          <strong>{summary.openDeals}</strong>
        </div>
        <div className="pipeline-summary-card">
          <span className="pipeline-summary-label">Pipeline value</span>
          <strong>{formatCompactCurrency(summary.totalValue)}</strong>
        </div>
        <div className="pipeline-summary-card">
          <span className="pipeline-summary-label">Weighted value</span>
          <strong>{formatCompactCurrency(summary.weightedValue)}</strong>
        </div>
        <div className="pipeline-summary-card pipeline-summary-card--alert">
          <span className="pipeline-summary-label">Stalled or overdue</span>
          <strong>{summary.stalledDeals}</strong>
        </div>
      </section>

      <div className="pipeline-board">
        {stages.map((stage) => (
          <StageColumn
            key={stage.id}
            stage={stage}
            deals={boardDeals.filter((deal) => deal.stage === stage.id)}
            onDealSelect={onDealSelect}
            canMoveDeals={canMoveDeals}
            isDropTarget={hoveredStageId === stage.id}
            isBusy={moveDealStage.isPending}
            onDragDeal={(dealId) => setDraggingDealId(dealId)}
            onDragEnd={() => {
              setDraggingDealId(null)
              setHoveredStageId(null)
            }}
            onDragEnter={() => setHoveredStageId(stage.id)}
            onDragLeave={() =>
              setHoveredStageId((current) =>
                current === stage.id ? null : current,
              )
            }
            onDropDeal={() => void handleDrop(stage.id)}
          />
        ))}
      </div>
    </div>
  )
}

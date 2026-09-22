import { useNavigate } from 'react-router-dom'
import { ArrowRight, Flame } from 'lucide-react'
import { useDashboardSummary, usePipelineStages } from '../../hooks/useCrm'
import { QueryState } from '../../components/ui/QueryState'
import { getQueryStateCopy } from '../../utils/queryState'
import './overview.css'

const ROW_HEIGHT = 34
const BAR_HEIGHT = 20
const CHART_LEFT = 96
const CHART_RIGHT = 34
const VALUE_COLUMN_GAP = 8
const WIDTH = 460
const RADIUS = 5
const LAST_VISIBLE_STAGE_ID = 'order'
const HOT_STAGE_ID = 'quotation'

function roundedRightBarPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  if (w <= 0) return ''
  const radius = Math.min(r, w, h / 2)
  return `M${x},${y} H${x + w - radius} A${radius},${radius} 0 0 1 ${x + w},${y + radius} V${y + h - radius} A${radius},${radius} 0 0 1 ${x + w - radius},${y + h} H${x} Z`
}

export function FunnelChart() {
  const navigate = useNavigate()
  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
  } = useDashboardSummary()
  const {
    data: allStages = [],
    isLoading: isStagesLoading,
    isError: isStagesError,
    error: stagesError,
  } = usePipelineStages()
  const errorState = getQueryStateCopy(summaryError ?? stagesError, {
    title: 'Stage funnel unavailable',
    detail: 'The CRM API could not load funnel data.',
  })

  if (isSummaryLoading || isStagesLoading) {
    return (
      <div className="chart-card card">
        <div className="chart-card-header">
          <h3>Stage Funnel</h3>
          <p>Loading open deals by stage</p>
        </div>
      </div>
    )
  }

  if (isSummaryError || isStagesError) {
    return (
      <QueryState
        title={errorState.title}
        detail={errorState.detail}
        tone="danger"
      />
    )
  }

  if (allStages.length === 0) {
    return (
      <div className="chart-card card">
        <div className="chart-card-header">
          <h3>Stage Funnel</h3>
          <p>No pipeline stages are configured yet</p>
        </div>
      </div>
    )
  }

  const lastVisibleIndex = allStages.findIndex(
    (stage) => stage.id === LAST_VISIBLE_STAGE_ID,
  )
  const stages =
    lastVisibleIndex === -1
      ? allStages
      : allStages.slice(0, lastVisibleIndex + 1)
  const counts = stages.map((stage) => summary?.funnelCounts[stage.id] ?? 0)
  const max = Math.max(1, ...counts)
  const totalOpenDeals = counts.reduce((sum, count) => sum + count, 0)
  const valueColumnWidth = String(max).length * 7 + VALUE_COLUMN_GAP
  const trackWidth = WIDTH - CHART_LEFT - CHART_RIGHT - valueColumnWidth
  const height = stages.length * ROW_HEIGHT

  const hotIndex = stages.findIndex((stage) => stage.id === HOT_STAGE_ID)
  const hotCount = hotIndex >= 0 ? counts[hotIndex] : 0
  const closingSoon = stages
    .slice(Math.max(0, hotIndex))
    .reduce(
      (sum, _stage, offset) => sum + counts[Math.max(0, hotIndex) + offset],
      0,
    )

  return (
    <div className="chart-card card">
      <div className="chart-card-header chart-card-header--row">
        <div>
          <h3>Stage Funnel</h3>
          <p>Open deals by conversion milestone</p>
        </div>
        <span className="chart-count-pill">{totalOpenDeals} Active Deals</span>
      </div>

      <svg
        className="funnel-chart"
        viewBox={`0 0 ${WIDTH} ${height}`}
        role="img"
        aria-label="Number of open deals at each pipeline stage"
      >
        {stages.map((stage, index) => {
          const count = counts[index]
          const barWidth = (count / max) * trackWidth
          const y = index * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2
          const isHot = stage.id === HOT_STAGE_ID && count > 0

          return (
            <g
              key={stage.id}
              className={count === 0 ? 'funnel-row funnel-row--muted' : 'funnel-row'}
            >
              {isHot && (
                <rect
                  x={2}
                  y={y - 6}
                  width={WIDTH - 4}
                  height={BAR_HEIGHT + 12}
                  rx={10}
                  className="funnel-hot-highlight"
                />
              )}
              <text
                x={CHART_LEFT - 12}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                className={isHot ? 'funnel-label funnel-label--hot' : 'funnel-label'}
              >
                {stage.shortLabel}
              </text>
              <rect
                x={CHART_LEFT}
                y={y}
                width={trackWidth}
                height={BAR_HEIGHT}
                rx={RADIUS}
                className="funnel-track"
              />
              {count > 0 && (
                <path
                  d={roundedRightBarPath(
                    CHART_LEFT,
                    y,
                    barWidth,
                    BAR_HEIGHT,
                    RADIUS,
                  )}
                  fill={isHot ? 'var(--accent)' : `var(--funnel-${index + 1})`}
                  className={isHot ? 'funnel-bar-hot' : undefined}
                />
              )}
              <text
                x={CHART_LEFT + trackWidth + VALUE_COLUMN_GAP}
                y={y + BAR_HEIGHT / 2 + 4}
                className={isHot ? 'funnel-value funnel-value--hot' : 'funnel-value'}
              >
                {count}
              </text>
            </g>
          )
        })}
      </svg>

      {hotCount > 0 && (
        <div className="funnel-hot-note">
          <Flame size={13} strokeWidth={2.2} />
          <span>{hotCount} quotation{hotCount === 1 ? '' : 's'} ready to close</span>
        </div>
      )}

      <div className="chart-card-footer">
        <span className="chart-card-footer-note">
          {closingSoon} deal{closingSoon === 1 ? '' : 's'} poised for immediate closing
        </span>
        <button
          type="button"
          className="chart-card-footer-link"
          onClick={() => navigate('/pipeline')}
        >
          Optimize Conversion
          <ArrowRight size={14} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  )
}

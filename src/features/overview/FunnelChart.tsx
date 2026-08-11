import { useDashboardSummary, usePipelineStages } from '../../hooks/useCrm'
import './overview.css'

const ROW_HEIGHT = 32
const BAR_HEIGHT = 18
const CHART_LEFT = 96
const CHART_RIGHT = 34
const VALUE_COLUMN_GAP = 8
const WIDTH = 460
const RADIUS = 4
const LAST_VISIBLE_STAGE_ID = 'order_placed'

function roundedRightBarPath(x: number, y: number, w: number, h: number, r: number) {
  if (w <= 0) return ''
  const radius = Math.min(r, w, h / 2)
  return `M${x},${y} H${x + w - radius} A${radius},${radius} 0 0 1 ${x + w},${y + radius} V${y + h - radius} A${radius},${radius} 0 0 1 ${x + w - radius},${y + h} H${x} Z`
}

export function FunnelChart() {
  const { data: summary } = useDashboardSummary()
  const { data: allStages = [] } = usePipelineStages()
  const lastVisibleIndex = allStages.findIndex((stage) => stage.id === LAST_VISIBLE_STAGE_ID)
  const stages = lastVisibleIndex === -1 ? allStages : allStages.slice(0, lastVisibleIndex + 1)
  const counts = stages.map((stage) => summary?.funnelCounts[stage.id] ?? 0)
  const max = Math.max(1, ...counts)
  const valueColumnWidth = String(max).length * 7 + VALUE_COLUMN_GAP
  const trackWidth = WIDTH - CHART_LEFT - CHART_RIGHT - valueColumnWidth
  const height = stages.length * ROW_HEIGHT

  return (
    <div className="chart-card card">
      <div className="chart-card-header">
        <h3>Stage funnel</h3>
        <p>Open deals at each stage right now</p>
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

          return (
            <g key={stage.id}>
              <text
                x={CHART_LEFT - 12}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                className="funnel-label"
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
                  d={roundedRightBarPath(CHART_LEFT, y, barWidth, BAR_HEIGHT, RADIUS)}
                  fill={`var(--funnel-${index + 1})`}
                />
              )}
              <text
                x={CHART_LEFT + trackWidth + VALUE_COLUMN_GAP}
                y={y + BAR_HEIGHT / 2 + 4}
                className="funnel-value"
              >
                {count}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

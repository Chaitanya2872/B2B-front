import { useState } from 'react'
import { useTrendPoints } from '../../hooks/useCrm'
import { formatCompactCurrency, formatCurrency } from '../../utils/helpers'
import './overview.css'

const WIDTH = 460
const HEIGHT = 200
const MARGIN = { top: 18, right: 50, bottom: 26, left: 8 }
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
const GRID_STEPS = 4
const BAR_MAX_WIDTH = 24
const BAR_RADIUS = 4

function niceStep(roughStep: number): number {
  const exponent = Math.floor(Math.log10(roughStep))
  const base = Math.pow(10, exponent)
  const fraction = roughStep / base
  const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10
  return niceFraction * base
}

function roundedTopBarPath(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return ''
  const radius = Math.min(r, w / 2, h)
  return `M${x},${y + h} V${y + radius} A${radius},${radius} 0 0 1 ${x + radius},${y} H${x + w - radius} A${radius},${radius} 0 0 1 ${x + w},${y + radius} V${y + h} Z`
}

export function TrendChart() {
  const { data } = useTrendPoints()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const points = data ?? []

  if (points.length === 0) {
    return (
      <div className="chart-card card">
      <div className="chart-card-header">
        <h3>Pipeline value trend</h3>
        <p>Trend will appear as live deals are created or imported</p>
      </div>
      </div>
    )
  }

  const rawMax = Math.max(...points.map((point) => point.value))
  const step = niceStep(rawMax / GRID_STEPS)
  const niceMax = Math.ceil(rawMax / step) * step

  const bandWidth = PLOT_WIDTH / points.length
  const barWidth = Math.min(BAR_MAX_WIDTH, bandWidth * 0.6)
  const xCenter = (index: number) => MARGIN.left + bandWidth * (index + 0.5)
  const yAt = (value: number) => MARGIN.top + PLOT_HEIGHT * (1 - value / niceMax)
  const baselineY = MARGIN.top + PLOT_HEIGHT

  const gridLines = Array.from({ length: GRID_STEPS + 1 }, (_, i) => {
    const value = (niceMax / GRID_STEPS) * i
    return { value, y: yAt(value) }
  })

  const lastIndex = points.length - 1
  const tickIndexes = new Set([0, Math.round(lastIndex / 2), lastIndex])

  const hovered = hoverIndex !== null ? points[hoverIndex] : null
  const tooltipWidth = 108
  const tooltipHalf = tooltipWidth / 2
  const hoverX = hoverIndex !== null ? xCenter(hoverIndex) : 0
  const hoverBarTop = hovered ? yAt(hovered.value) : 0
  const tooltipX = Math.min(WIDTH - tooltipWidth - 2, Math.max(2, hoverX - tooltipHalf))

  return (
    <div className="chart-card card">
      <div className="chart-card-header">
        <h3>Pipeline value trend</h3>
        <p>Weekly pipeline value from live CRM records</p>
      </div>

      <svg
        className="trend-chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Total pipeline value trend over the last 9 weeks"
      >
        {gridLines.map((line) => (
          <g key={line.value}>
            <line
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={line.y}
              y2={line.y}
              className="trend-gridline"
            />
            <text x={WIDTH - MARGIN.right + 6} y={line.y + 3} className="trend-axis-label">
              {formatCompactCurrency(line.value)}
            </text>
          </g>
        ))}

        {points.map((point, index) => {
          const barTop = yAt(point.value)
          const barHeight = baselineY - barTop
          const x = xCenter(index) - barWidth / 2
          const isHovered = hoverIndex === index

          return (
            <g key={point.label}>
              <rect
                x={x}
                y={barTop}
                width={barWidth}
                height={Math.max(0, barHeight)}
                rx={BAR_RADIUS}
                className={isHovered ? 'trend-bar trend-bar--hovered' : 'trend-bar'}
                style={roundedTopBarPath(x, barTop, barWidth, barHeight, BAR_RADIUS) ? undefined : undefined}
              />
              {index === lastIndex && (
                <text
                  x={xCenter(index)}
                  y={barTop - 10}
                  textAnchor="middle"
                  className="trend-end-label"
                >
                  {formatCompactCurrency(point.value)}
                </text>
              )}
              <text
                x={xCenter(index)}
                y={HEIGHT - 6}
                textAnchor="middle"
                className="trend-axis-label"
              >
                {tickIndexes.has(index) ? point.label : ''}
              </text>
              <rect
                x={MARGIN.left + bandWidth * index}
                y={MARGIN.top}
                width={bandWidth}
                height={PLOT_HEIGHT}
                fill="transparent"
                onPointerEnter={() => setHoverIndex(index)}
                onPointerLeave={() => setHoverIndex(null)}
                onFocus={() => setHoverIndex(index)}
                onBlur={() => setHoverIndex(null)}
                tabIndex={0}
                role="img"
                aria-label={`${point.label}: ${formatCurrency(point.value)}`}
              />
            </g>
          )
        })}

        {hoverIndex !== null && hovered && (
          <g transform={`translate(${tooltipX}, ${Math.max(0, hoverBarTop - 46)})`}>
            <rect width={tooltipWidth} height={36} rx={7} className="trend-tooltip-bg" />
            <text x={10} y={15} className="trend-tooltip-label">
              {hovered.label}
            </text>
            <text x={10} y={29} className="trend-tooltip-value">
              {formatCurrency(hovered.value)}
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

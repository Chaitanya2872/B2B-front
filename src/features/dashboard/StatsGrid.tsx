import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  Layers,
  TrendingUp,
} from 'lucide-react'
import { useDashboardSummary, useTrendPoints } from '../../hooks/useCrm'
import { QueryState } from '../../components/ui/QueryState'
import { formatCrore } from '../../utils/helpers'
import { getQueryStateCopy } from '../../utils/queryState'
import './dashboard.css'

const TREND_LOOKBACK = 4

export function StatsGrid() {
  const { data: summary, isLoading, isError, error } = useDashboardSummary()
  const { data: trendPoints = [] } = useTrendPoints()
  const errorState = getQueryStateCopy(error, {
    title: 'Dashboard unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  if (isError) {
    return (
      <QueryState
        title={errorState.title}
        detail={errorState.detail}
        tone="danger"
      />
    )
  }

  const lastIndex = trendPoints.length - 1
  const priorIndex = lastIndex - TREND_LOOKBACK
  const momChange =
    priorIndex >= 0 && trendPoints[priorIndex].value > 0
      ? ((trendPoints[lastIndex].value - trendPoints[priorIndex].value) /
          trendPoints[priorIndex].value) *
        100
      : null

  const totalValue = summary?.totalValue ?? 0
  const weightedValue = summary?.weightedPipelineValue ?? 0
  const winProbability =
    totalValue > 0 ? Math.round((weightedValue / totalValue) * 100) : 0
  const pendingApprovals = summary?.pendingApprovals ?? 0

  return (
    <div className="kpi-grid">
      <div className="kpi-tile">
        <div className="kpi-tile-head">
          <span className="kpi-tile-label">Total Pipeline</span>
          <span className="kpi-tile-icon">
            <TrendingUp size={17} strokeWidth={2} />
          </span>
        </div>
        <div className="kpi-tile-value">
          {isLoading ? '...' : formatCrore(totalValue)}
        </div>
        <div className="kpi-tile-foot">
          {momChange !== null && (
            <span
              className={`kpi-trend-pill${momChange < 0 ? ' kpi-trend-pill--down' : ''}`}
            >
              <ArrowUpRight size={11} strokeWidth={2.5} />
              {momChange >= 0 ? '+' : ''}
              {momChange.toFixed(1)}%
            </span>
          )}
          <span className="kpi-tile-hint">
            {momChange !== null
              ? 'vs 4 weeks ago'
              : 'Trend builds up over 4 weeks'}
          </span>
        </div>
      </div>

      <div className="kpi-tile">
        <div className="kpi-tile-head">
          <span className="kpi-tile-label">Weighted Forecast</span>
          <span className="kpi-tile-icon">
            <BarChart3 size={17} strokeWidth={2} />
          </span>
        </div>
        <div className="kpi-tile-value">
          {isLoading ? '...' : formatCrore(weightedValue)}
        </div>
        <div className="kpi-tile-foot">
          <span className="kpi-tile-strong">{winProbability}%</span>
          <span className="kpi-tile-hint">win probability</span>
        </div>
      </div>

      <div className="kpi-tile">
        <div className="kpi-tile-head">
          <span className="kpi-tile-label">Active Pipeline</span>
          <span className="kpi-tile-icon">
            <Layers size={17} strokeWidth={2} />
          </span>
        </div>
        <div className="kpi-tile-value">
          {isLoading ? '...' : `${summary?.openDeals ?? 0} Deals`}
        </div>
        <div className="kpi-tile-foot">
          <span className="kpi-tile-strong">{summary?.stalledDeals ?? 0}</span>
          <span className="kpi-tile-hint">stalled &gt; 14 days</span>
        </div>
      </div>

      <div className="kpi-tile">
        <div className="kpi-tile-head">
          <span className="kpi-tile-label">Pending Approvals</span>
          <span className="kpi-tile-icon">
            <ClipboardList size={17} strokeWidth={2} />
          </span>
        </div>
        <div className="kpi-tile-value">
          {isLoading ? '...' : `${pendingApprovals} Required`}
        </div>
        <div className="kpi-tile-foot">
          <span className="kpi-tile-hint">
            {pendingApprovals > 0
              ? 'Requires immediate signoff'
              : 'All caught up'}
          </span>
        </div>
      </div>
    </div>
  )
}

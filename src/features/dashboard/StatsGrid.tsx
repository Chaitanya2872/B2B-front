import { TrendingUp, Layers, CheckSquare, TriangleAlert } from 'lucide-react'
import { useDashboardSummary } from '../../hooks/useCrm'
import { StatCard } from '../../components/ui/StatCard'
import { QueryState } from '../../components/ui/QueryState'
import { formatCurrency } from '../../utils/helpers'
import { getQueryStateCopy } from '../../utils/queryState'
import './dashboard.css'

export function StatsGrid() {
  const { data: summary, isLoading, isError, error } = useDashboardSummary()
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

  return (
    <div className="stats-grid">
      <StatCard
        label="Pipeline value"
        value={isLoading ? '...' : formatCurrency(summary?.totalValue ?? 0)}
        icon={TrendingUp}
        accent="#1d4ed8"
      />
      <StatCard
        label="Weighted pipeline"
        value={
          isLoading
            ? '...'
            : formatCurrency(summary?.weightedPipelineValue ?? 0)
        }
        icon={TrendingUp}
        accent="#2563eb"
      />
      <StatCard
        label="Open deals"
        value={isLoading ? '...' : String(summary?.openDeals ?? 0)}
        icon={Layers}
        accent="#0ea5e9"
      />
      <StatCard
        label="Pending approvals"
        value={isLoading ? '...' : String(summary?.pendingApprovals ?? 0)}
        icon={CheckSquare}
        accent="#d97706"
      />
      <StatCard
        label="Stalled deals"
        value={isLoading ? '...' : String(summary?.stalledDeals ?? 0)}
        icon={TriangleAlert}
        accent="#b45309"
      />
    </div>
  )
}

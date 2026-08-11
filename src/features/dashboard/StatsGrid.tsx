import { TrendingUp, Layers, CheckSquare, TriangleAlert } from 'lucide-react'
import { useDashboardSummary } from '../../hooks/useCrm'
import { StatCard } from '../../components/ui/StatCard'
import { formatCurrency } from '../../utils/helpers'
import './dashboard.css'

export function StatsGrid() {
  const { data: summary } = useDashboardSummary()

  return (
    <div className="stats-grid">
      <StatCard
        label="Pipeline value"
        value={formatCurrency(summary?.totalValue ?? 0)}
        icon={TrendingUp}
        accent="#1d4ed8"
      />
      <StatCard
        label="Weighted pipeline"
        value={formatCurrency(summary?.weightedPipelineValue ?? 0)}
        icon={TrendingUp}
        accent="#2563eb"
      />
      <StatCard
        label="Open deals"
        value={String(summary?.openDeals ?? 0)}
        icon={Layers}
        accent="#0ea5e9"
      />
      <StatCard
        label="Pending approvals"
        value={String(summary?.pendingApprovals ?? 0)}
        icon={CheckSquare}
        accent="#d97706"
      />
      <StatCard
        label="Stalled deals"
        value={String(summary?.stalledDeals ?? 0)}
        icon={TriangleAlert}
        accent="#b45309"
      />
    </div>
  )
}

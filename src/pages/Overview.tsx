import { StatsGrid } from '../features/dashboard/StatsGrid'
import { FunnelChart } from '../features/overview/FunnelChart'
import { TrendChart } from '../features/overview/TrendChart'
import { ActivityFeed } from '../features/overview/ActivityFeed'
import './Overview.css'

export function Overview() {
  return (
    <div className="overview-page">
      <StatsGrid />

      <div className="overview-charts">
        <TrendChart />
        <FunnelChart />
      </div>

      <ActivityFeed />
    </div>
  )
}

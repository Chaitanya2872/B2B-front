import { StatsGrid } from '../features/dashboard/StatsGrid'
import { FunnelChart } from '../features/overview/FunnelChart'
import { TrendChart } from '../features/overview/TrendChart'
import { ActivityFeed } from '../features/overview/ActivityFeed'
import { PendingTasksCard } from '../features/overview/PendingTasksCard'
import './Overview.css'

export function Overview() {
  return (
    <div className="overview-page">
      <div className="overview-header">
        <div className="overview-heading">
          <h1>Overview</h1>
          <span className="overview-live-badge">
            <span className="overview-live-dot">
              <span className="overview-live-ping" />
              <span className="overview-live-core" />
            </span>
            Live Sync
          </span>
        </div>
        <p>Live pipeline metrics &amp; CRM deal movement across revenue streams.</p>
      </div>

      <StatsGrid />

      <div className="overview-charts">
        <TrendChart />
        <FunnelChart />
      </div>

      <div className="overview-charts overview-charts--bottom">
        <ActivityFeed />
        <PendingTasksCard />
      </div>
    </div>
  )
}

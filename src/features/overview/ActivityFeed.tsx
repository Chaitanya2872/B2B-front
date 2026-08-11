import { useActivityItems, usePipelineStages } from '../../hooks/useCrm'
import { formatStageLabel, timeAgo } from '../../utils/helpers'
import './overview.css'

export function ActivityFeed() {
  const { data: recent = [] } = useActivityItems()
  const { data: stages = [] } = usePipelineStages()

  return (
    <div className="chart-card card">
      <div className="chart-card-header">
        <h3>Recent activity</h3>
        <p>Latest stage movement across the pipeline</p>
      </div>

      <ul className="activity-list">
        {recent.map((deal) => {
          const stage = stages.find((item) => item.id === deal.stage)
          return (
            <li key={deal.id} className="activity-row">
              <span
                className="activity-dot"
                style={{ background: stage?.color }}
              />
              <div className="activity-body">
                <p>
                  <strong>{deal.company}</strong> is in{' '}
                  {stage?.name ?? formatStageLabel(deal.stage)}
                </p>
                <span>{timeAgo(deal.updatedAt)}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

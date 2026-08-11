import { useActivityItems, usePipelineStages } from '../../hooks/useCrm'
import { QueryState } from '../../components/ui/QueryState'
import { formatStageLabel, timeAgo } from '../../utils/helpers'
import { getQueryStateCopy } from '../../utils/queryState'
import './overview.css'

export function ActivityFeed() {
  const { data: recent = [], isLoading, isError, error } = useActivityItems()
  const { data: stages = [] } = usePipelineStages()
  const errorState = getQueryStateCopy(error, {
    title: 'Activity unavailable',
    detail: 'The CRM API could not load recent activity.',
  })

  if (isLoading) {
    return (
      <div className="chart-card card">
        <div className="chart-card-header">
          <h3>Recent activity</h3>
          <p>Loading latest stage movement</p>
        </div>
      </div>
    )
  }

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
    <div className="chart-card card">
      <div className="chart-card-header">
        <h3>Recent activity</h3>
        <p>Latest stage movement across the pipeline</p>
      </div>

      <ul className="activity-list">
        {recent.length === 0 && (
          <li className="activity-row">
            <div className="activity-body">
              <p>No recent B2B activity yet.</p>
            </div>
          </li>
        )}
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

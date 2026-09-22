import { useNavigate } from 'react-router-dom'
import { useActivityItems, usePipelineStages } from '../../hooks/useCrm'
import { QueryState } from '../../components/ui/QueryState'
import { useAppStore } from '../../store'
import { formatStageLabel, timeAgo } from '../../utils/helpers'
import { getQueryStateCopy } from '../../utils/queryState'
import './overview.css'

export function ActivityFeed() {
  const navigate = useNavigate()
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const { data: recent = [], isLoading, isError, error } = useActivityItems()
  const { data: stages = [] } = usePipelineStages()
  const errorState = getQueryStateCopy(error, {
    title: 'Activity unavailable',
    detail: 'The CRM API could not load recent activity.',
  })

  function viewDeal(company: string) {
    setSearchQuery(company)
    navigate('/pipeline')
  }

  if (isLoading) {
    return (
      <div className="chart-card card">
        <div className="chart-card-header">
          <h3>Recent Activity</h3>
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
      <div className="chart-card-header chart-card-header--row">
        <div>
          <h3>Recent Activity</h3>
          <p>Real-time movements across enterprise pipelines</p>
        </div>
        <button
          type="button"
          className="chart-card-header-link"
          onClick={() => navigate('/pipeline')}
        >
          View All Activity
        </button>
      </div>

      <ul className="activity-timeline">
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
              <span className="activity-node">
                <span
                  className="activity-node-dot"
                  style={{ background: stage?.color }}
                />
              </span>
              <div className="activity-body">
                <div className="activity-body-main">
                  <p>
                    <strong>{deal.company}</strong> is in{' '}
                    {stage?.name ?? formatStageLabel(deal.stage)}
                  </p>
                  <span>{timeAgo(deal.updatedAt)}</span>
                </div>
                <button
                  type="button"
                  className="activity-view-btn"
                  onClick={() => viewDeal(deal.company)}
                >
                  Deal Details
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

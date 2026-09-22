import { useNavigate } from 'react-router-dom'
import { ArrowRight, Clock } from 'lucide-react'
import { useApprovals } from '../../hooks/useCrm'
import { QueryState } from '../../components/ui/QueryState'
import {
  formatApprovalRole,
  formatCurrency,
  timeAgo,
} from '../../utils/helpers'
import { getQueryStateCopy } from '../../utils/queryState'
import './overview.css'

const MAX_TASKS = 3

export function PendingTasksCard() {
  const navigate = useNavigate()
  const { data: deals = [], isLoading, isError, error } = useApprovals()
  const errorState = getQueryStateCopy(error, {
    title: 'Tasks unavailable',
    detail: 'The CRM API could not load pending approvals.',
  })

  if (isLoading) {
    return (
      <div className="chart-card card">
        <div className="chart-card-header">
          <h3>Pending Tasks</h3>
          <p>Loading approvals awaiting signoff</p>
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

  const tasks = deals.slice(0, MAX_TASKS)

  return (
    <div className="chart-card card">
      <div className="chart-card-header chart-card-header--row">
        <div>
          <h3>Pending Tasks</h3>
          <p>High-priority approvals and actions</p>
        </div>
        {deals.length > 0 && (
          <span className="chart-count-badge">{deals.length}</span>
        )}
      </div>

      <div className="task-list">
        {tasks.length === 0 && (
          <p className="task-empty">
            All caught up &mdash; nothing is waiting on your review.
          </p>
        )}
        {tasks.map((deal) => {
          const pendingStep = deal.approvals.find(
            (step) => step.status === 'pending',
          )
          return (
            <div key={deal.id} className="task-item">
              <div className="task-item-icon">
                <Clock size={15} strokeWidth={2} />
              </div>
              <div className="task-item-body">
                <span className="task-item-title">
                  Approve {deal.product} for {deal.company}
                </span>
                <span className="task-item-meta">
                  {pendingStep
                    ? `Awaiting ${formatApprovalRole(pendingStep.role)}`
                    : 'Awaiting review'}{' '}
                  &middot; {formatCurrency(deal.value)} &middot; updated{' '}
                  {timeAgo(deal.updatedAt)}
                </span>
              </div>
              <button
                type="button"
                className="task-item-btn"
                onClick={() => navigate('/approvals')}
              >
                Review
              </button>
            </div>
          )
        })}
      </div>

      {deals.length > 0 && (
        <div className="chart-card-footer">
          <span className="chart-card-footer-note">
            {deals.length} task{deals.length === 1 ? '' : 's'} pending your
            review
          </span>
          <button
            type="button"
            className="chart-card-footer-link"
            onClick={() => navigate('/approvals')}
          >
            Manage Tasks
            <ArrowRight size={14} strokeWidth={2.2} />
          </button>
        </div>
      )}
    </div>
  )
}

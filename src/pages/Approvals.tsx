import { CheckCircle2 } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { ApprovalQueueItem } from '../features/approvals/ApprovalQueueItem'
import { useCurrentUser } from '../hooks/useAuth'
import { useApprovals } from '../hooks/useCrm'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import { getQueryStateCopy } from '../utils/queryState'
import './Approvals.css'

export function Approvals() {
  const { data: currentUser } = useCurrentUser()
  const { canReviewApprovals } = getPipelineActionPermissions(currentUser)
  const { data: deals = [], isLoading, isError, error } = useApprovals()
  const errorState = getQueryStateCopy(error, {
    title: 'Approvals unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  return (
    <div className="approvals-page">
      <div className="approvals-header">
        <h2>Approval queue</h2>
        <p>RSM, Finance, and Business Head approvals, signed off in order.</p>
      </div>

      {isLoading ? (
        <QueryState
          title="Loading approvals"
          detail="Fetching quotation and order approvals from the CRM API."
        />
      ) : isError ? (
        <QueryState
          title={errorState.title}
          detail={errorState.detail}
          tone="danger"
        />
      ) : deals.length === 0 ? (
        <div className="approvals-empty card">
          <CheckCircle2 size={22} strokeWidth={2} />
          <p>
            All caught up &mdash; no quotations or orders are waiting on
            approval.
          </p>
        </div>
      ) : (
        <div className="approvals-list">
          {deals.map((deal) => (
            <ApprovalQueueItem
              key={deal.id}
              deal={deal}
              currentUser={currentUser}
              canReviewApprovals={canReviewApprovals}
            />
          ))}
        </div>
      )}
    </div>
  )
}

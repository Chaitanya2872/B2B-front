import { useState } from 'react'
import { CheckCircle2, Search } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { ApprovalQueueItem } from '../features/approvals/ApprovalQueueItem'
import { useCurrentUser } from '../hooks/useAuth'
import { useApprovals } from '../hooks/useCrm'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import { getQueryStateCopy } from '../utils/queryState'
import './Approvals.css'

export function Approvals() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: currentUser } = useCurrentUser()
  const { canReviewApprovals } = getPipelineActionPermissions(currentUser)
  const { data: deals = [], isLoading, isError, error } = useApprovals()
  const errorState = getQueryStateCopy(error, {
    title: 'Approvals unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  const query = searchQuery.trim().toLowerCase()
  const filteredDeals = query
    ? deals.filter((deal) =>
        [deal.company, deal.product].some((field) =>
          field.toLowerCase().includes(query),
        ),
      )
    : deals

  return (
    <div className="approvals-page">
      <div className="approvals-header">
        <div>
          <div className="approvals-title-row">
            <h2>Approval queue</h2>
            {deals.length > 0 && (
              <span className="approvals-pending-badge">
                {deals.length} pending
              </span>
            )}
          </div>
          <p>RSM, Finance, and Business Head approvals, signed off in order.</p>
        </div>
        <div className="approvals-search-box">
          <Search size={14} strokeWidth={2} />
          <input
            type="text"
            placeholder="Search approvals..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
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
      ) : filteredDeals.length === 0 ? (
        <div className="approvals-empty card">
          <Search size={20} strokeWidth={2} />
          <p>No approvals match &ldquo;{searchQuery}&rdquo;.</p>
        </div>
      ) : (
        <div className="approvals-list">
          {filteredDeals.map((deal) => (
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

import { CheckCircle2 } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { ApprovalQueueItem } from '../features/approvals/ApprovalQueueItem'
import { useApprovals } from '../hooks/useCrm'
import './Approvals.css'

export function Approvals() {
  const { data: deals = [], isLoading, isError } = useApprovals()

  return (
    <div className="approvals-page">
      <div className="approvals-header">
        <h2>Approval queue</h2>
        <p>Solution &rarr; RSM &rarr; Finance &rarr; Business Head, signed off in order.</p>
      </div>

      {isLoading ? (
        <QueryState
          title="Loading approvals"
          detail="Fetching quotation and order approvals from the CRM API."
        />
      ) : isError ? (
        <QueryState
          title="Approvals unavailable"
          detail="The CRM API could not be reached. Start the backend and refresh."
          tone="danger"
        />
      ) : deals.length === 0 ? (
        <div className="approvals-empty card">
          <CheckCircle2 size={22} strokeWidth={2} />
          <p>All caught up &mdash; no quotations or orders are waiting on approval.</p>
        </div>
      ) : (
        <div className="approvals-list">
          {deals.map((deal) => (
            <ApprovalQueueItem key={deal.id} deal={deal} />
          ))}
        </div>
      )}
    </div>
  )
}

import type { Deal } from '../../types'
import { usePipelineStages, useUpdateApprovalStatus } from '../../hooks/useCrm'
import { Avatar } from '../../components/ui/Avatar'
import { ApprovalTrack } from '../../components/ui/ApprovalTrack'
import { getApiErrorMessage } from '../../services/api/client'
import type { CurrentUser } from '../../services/auth/auth'
import { canActOnApprovalRole } from '../../services/auth/permissions'
import {
  formatApprovalRole,
  formatCurrency,
  timeAgo,
} from '../../utils/helpers'
import './approvals.css'

interface ApprovalQueueItemProps {
  deal: Deal
  currentUser: CurrentUser | undefined
  canReviewApprovals: boolean
}

export function ApprovalQueueItem({
  deal,
  currentUser,
  canReviewApprovals,
}: ApprovalQueueItemProps) {
  const updateApproval = useUpdateApprovalStatus()
  const { data: stages = [] } = usePipelineStages()
  const stage = stages.find((item) => item.id === deal.stage)
  const pendingStep = deal.approvals.find((step) => step.status === 'pending')
  const canAct =
    pendingStep &&
    canReviewApprovals &&
    canActOnApprovalRole(currentUser, pendingStep.role)

  function updatePendingApproval(status: 'approved' | 'rejected') {
    if (!pendingStep || !canAct) {
      return
    }

    updateApproval.mutate({
      dealId: deal.id,
      role: pendingStep.role,
      status,
    })
  }

  return (
    <div className="approval-item card">
      <div className="approval-item-main">
        <div className="approval-item-heading">
          <span className="approval-item-company">{deal.company}</span>
          {stage && (
            <span
              className="badge"
              style={{ background: `${stage.color}22`, color: stage.color }}
            >
              {stage.name}
            </span>
          )}
        </div>
        <p className="approval-item-product">{deal.product}</p>
        <div className="approval-item-meta">
          <Avatar person={deal.accountManager} size={18} />
          <span>{deal.accountManager.name}</span>
          <span className="approval-item-dot">&middot;</span>
          <span>{formatCurrency(deal.value)}</span>
          <span className="approval-item-dot">&middot;</span>
          <span>{timeAgo(deal.updatedAt)}</span>
        </div>
      </div>

      <div className="approval-item-side">
        <ApprovalTrack steps={deal.approvals} />

        {pendingStep && (
          <div className="approval-item-action">
            <span className="approval-item-action-label">
              Awaiting <strong>{formatApprovalRole(pendingStep.role)}</strong>
            </span>
            {canAct ? (
              <div className="approval-item-action-buttons">
                <button
                  className="btn btn-success btn-sm"
                  disabled={updateApproval.isPending}
                  onClick={() => updatePendingApproval('approved')}
                >
                  Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  disabled={updateApproval.isPending}
                  onClick={() => updatePendingApproval('rejected')}
                >
                  Reject
                </button>
              </div>
            ) : (
              <span className="approval-item-action-label">
                Approval permission required.
              </span>
            )}
            {updateApproval.isError && (
              <span className="approval-item-error">
                {getApiErrorMessage(
                  updateApproval.error,
                  'Unable to update this approval.',
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

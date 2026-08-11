import { Check, Clock, X } from 'lucide-react'
import type { ApprovalStep } from '../../types'
import { formatApprovalRole } from '../../utils/helpers'
import './ApprovalTrack.css'

interface ApprovalTrackProps {
  steps: ApprovalStep[]
}

export function ApprovalTrack({ steps }: ApprovalTrackProps) {
  if (steps.length === 0) return null

  return (
    <div className="approval-track">
      {steps.map((step) => (
        <div
          key={step.role}
          className={`approval-step approval-step--${step.status}`}
          title={`${formatApprovalRole(step.role)}: ${step.status}`}
        >
          <span className="approval-step-icon">
            {step.status === 'approved' && <Check size={10} strokeWidth={3} />}
            {step.status === 'pending' && <Clock size={10} strokeWidth={2.5} />}
            {step.status === 'rejected' && <X size={10} strokeWidth={3} />}
          </span>
          <span className="approval-step-label">{formatApprovalRole(step.role)}</span>
        </div>
      ))}
    </div>
  )
}

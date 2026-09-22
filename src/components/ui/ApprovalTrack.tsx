import { Check, Clock, Minus, X } from 'lucide-react'
import type { ApprovalStep } from '../../types'
import { formatApprovalRole } from '../../utils/helpers'
import './ApprovalTrack.css'

interface ApprovalTrackProps {
  steps: ApprovalStep[]
}

export function ApprovalTrack({ steps }: ApprovalTrackProps) {
  if (steps.length === 0) return null

  let currentAssigned = false

  return (
    <div className="approval-track">
      {steps.map((step) => {
        const isCurrent = step.status === 'pending' && !currentAssigned
        if (isCurrent) {
          currentAssigned = true
        }
        const variant = isCurrent
          ? 'pending'
          : step.status === 'pending'
            ? 'upcoming'
            : step.status

        return (
          <div
            key={step.role}
            className={`approval-step approval-step--${variant}`}
            title={`${formatApprovalRole(step.role)}: ${
              variant === 'upcoming' ? 'not started' : step.status
            }`}
          >
            <span className="approval-step-icon">
              {step.status === 'approved' && (
                <Check size={10} strokeWidth={3} />
              )}
              {step.status === 'rejected' && <X size={10} strokeWidth={3} />}
              {step.status === 'pending' &&
                (isCurrent ? (
                  <Clock size={10} strokeWidth={2.5} />
                ) : (
                  <Minus size={10} strokeWidth={2.5} />
                ))}
            </span>
            <span className="approval-step-label">
              {formatApprovalRole(step.role)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

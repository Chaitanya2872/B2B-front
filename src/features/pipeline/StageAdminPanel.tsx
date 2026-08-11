import { useState } from 'react'
import { Settings2, X } from 'lucide-react'
import { useUpdatePipelineStage } from '../../hooks/useCrm'
import type { AllowedStageTransition, PipelineStage } from '../../types'
import { formatApprovalRole } from '../../utils/helpers'
import './PipelinePanels.css'

const FIELD_OPTIONS = [
  { id: 'company', label: 'Company' },
  { id: 'contact', label: 'Contact' },
  { id: 'product', label: 'Product' },
  { id: 'accountManager', label: 'Account manager' },
  { id: 'value', label: 'Value' },
  { id: 'expectedClosureDate', label: 'Expected closure date' },
  { id: 'nextActivity', label: 'Next activity' },
  { id: 'nextActivityDueDate', label: 'Next activity due date' },
  { id: 'oemVendor', label: 'OEM / vendor' },
] as const

const APPROVAL_OPTIONS = ['Solution', 'RSM', 'Finance', 'BusinessHead'] as const

interface StageAdminPanelProps {
  stages: PipelineStage[]
  onClose: () => void
}

export function StageAdminPanel({ stages, onClose }: StageAdminPanelProps) {
  const updatePipelineStage = useUpdatePipelineStage()
  const [drafts, setDrafts] = useState<Record<string, PipelineStage>>(
    Object.fromEntries(stages.map((stage) => [stage.id, structuredClone(stage)])),
  )

  async function handleSave(stageId: string) {
    const stage = drafts[stageId]
    if (!stage) {
      return
    }

    await updatePipelineStage.mutateAsync({
      stageId,
      input: {
        name: stage.name,
        shortLabel: stage.shortLabel,
        displayOrder: Number(stage.displayOrder),
        probabilityPercent: Number(stage.probabilityPercent),
        color: stage.color,
        maxExpectedDurationDays: Number(stage.maxExpectedDurationDays),
        mandatoryFields: stage.mandatoryFields,
        requiredApprovals: stage.requiredApprovals,
        allowedNextStages: stage.allowedNextStages,
      },
    })
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel drawer-panel--wide card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stage-admin-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h3 id="stage-admin-title">Pipeline stage settings</h3>
            <p>Manage probabilities, required fields, approvals, and allowed next moves.</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="drawer-content">
          {stages.map((stage) => {
            const draft = drafts[stage.id]
            if (!draft) {
              return null
            }

            return (
              <section key={stage.id} className="stage-admin-card">
                <div className="stage-admin-header">
                  <div className="stage-admin-title">
                    <span className="stage-dot" style={{ background: draft.color }} />
                    <div>
                      <h4>{stage.id}</h4>
                      <p>{draft.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    disabled={updatePipelineStage.isPending}
                    onClick={() => void handleSave(stage.id)}
                  >
                    <Settings2 size={14} strokeWidth={2.2} />
                    Save stage
                  </button>
                </div>

                <div className="deal-form">
                  <div className="field-row">
                    <label className="field">
                      <span>Display name</span>
                      <input
                        value={draft.name}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: { ...draft, name: event.target.value },
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Short label</span>
                      <input
                        value={draft.shortLabel}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: { ...draft, shortLabel: event.target.value },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <div className="field-row">
                    <label className="field">
                      <span>Order</span>
                      <input
                        type="number"
                        min="1"
                        value={draft.displayOrder}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: {
                              ...draft,
                              displayOrder: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Probability %</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={draft.probabilityPercent}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: {
                              ...draft,
                              probabilityPercent: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </label>

                    <label className="field">
                      <span>Max expected days</span>
                      <input
                        type="number"
                        min="1"
                        value={draft.maxExpectedDurationDays}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: {
                              ...draft,
                              maxExpectedDurationDays: Number(event.target.value),
                            },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <label className="field">
                    <span>Color</span>
                    <div className="field-inline">
                      <input
                        type="color"
                        value={draft.color}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: { ...draft, color: event.target.value },
                          }))
                        }
                      />
                      <input
                        value={draft.color}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [stage.id]: { ...draft, color: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </label>

                  <div className="field">
                    <span>Mandatory fields before exit or entry</span>
                    <div className="check-grid">
                      {FIELD_OPTIONS.map((field) => (
                        <label key={field.id} className="check-chip">
                          <input
                            type="checkbox"
                            checked={draft.mandatoryFields.includes(field.id)}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [stage.id]: {
                                  ...draft,
                                  mandatoryFields: toggleItem(
                                    draft.mandatoryFields,
                                    field.id,
                                    event.target.checked,
                                  ),
                                },
                              }))
                            }
                          />
                          <span>{field.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span>Approvals required before leaving this stage</span>
                    <div className="check-grid">
                      {APPROVAL_OPTIONS.map((role) => (
                        <label key={role} className="check-chip">
                          <input
                            type="checkbox"
                            checked={draft.requiredApprovals.includes(role)}
                            onChange={(event) =>
                              setDrafts((current) => ({
                                ...current,
                                [stage.id]: {
                                  ...draft,
                                  requiredApprovals: toggleItem(
                                    draft.requiredApprovals,
                                    role,
                                    event.target.checked,
                                  ),
                                },
                              }))
                            }
                          />
                          <span>{formatApprovalRole(role)}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <span>Allowed next stages</span>
                    <div className="transition-list">
                      {stages
                        .filter((candidate) => candidate.id !== stage.id)
                        .map((candidate) => {
                          const activeTransition = draft.allowedNextStages.find(
                            (item) => item.stageId === candidate.id,
                          )

                          return (
                            <div key={candidate.id} className="transition-item">
                              <label className="check-chip">
                                <input
                                  type="checkbox"
                                  checked={Boolean(activeTransition)}
                                  onChange={(event) =>
                                    setDrafts((current) => ({
                                      ...current,
                                      [stage.id]: {
                                        ...draft,
                                        allowedNextStages: toggleTransition(
                                          draft.allowedNextStages,
                                          candidate.id,
                                          event.target.checked,
                                        ),
                                      },
                                    }))
                                  }
                                />
                                <span>{candidate.name}</span>
                              </label>

                              <label className="check-chip check-chip--secondary">
                                <input
                                  type="checkbox"
                                  disabled={!activeTransition}
                                  checked={activeTransition?.confirmationRequired ?? false}
                                  onChange={(event) =>
                                    setDrafts((current) => ({
                                      ...current,
                                      [stage.id]: {
                                        ...draft,
                                        allowedNextStages: draft.allowedNextStages.map(
                                          (item) =>
                                            item.stageId === candidate.id
                                              ? {
                                                  ...item,
                                                  confirmationRequired:
                                                    event.target.checked,
                                                }
                                              : item,
                                        ),
                                      },
                                    }))
                                  }
                                />
                                <span>Needs confirmation</span>
                              </label>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}

          {updatePipelineStage.isError && (
            <p className="drawer-error">
              We couldn&apos;t save the stage configuration. Please review the inputs and try again.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

function toggleItem(values: string[], item: string, enabled: boolean) {
  if (enabled) {
    return values.includes(item) ? values : [...values, item]
  }

  return values.filter((value) => value !== item)
}

function toggleTransition(
  transitions: AllowedStageTransition[],
  stageId: string,
  enabled: boolean,
) {
  if (enabled) {
    return transitions.some((item) => item.stageId === stageId)
      ? transitions
      : [...transitions, { stageId, confirmationRequired: false }]
  }

  return transitions.filter((item) => item.stageId !== stageId)
}

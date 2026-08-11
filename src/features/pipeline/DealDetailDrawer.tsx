import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import {
  useDealStageHistory,
  useProducts,
  useUpdateDeal,
} from '../../hooks/useCrm'
import type { Deal } from '../../types'
import { getApiErrorMessage } from '../../services/api/client'
import { formatDate, formatStageLabel, timeAgo } from '../../utils/helpers'
import { buildDealUpdateInput } from './dealPayload'
import './PipelinePanels.css'

interface DealDetailDrawerProps {
  deal: Deal
  canEdit: boolean
  onClose: () => void
}

export function DealDetailDrawer({
  deal,
  canEdit,
  onClose,
}: DealDetailDrawerProps) {
  const updateDeal = useUpdateDeal()
  const { data: history = [] } = useDealStageHistory(deal.id)
  const { data: products = [] } = useProducts()
  const [formState, setFormState] = useState({
    company: deal.company,
    contact: deal.contact,
    product: deal.product,
    value: String(deal.value),
    accountManager: deal.accountManager.name,
    priority: deal.priority,
    expectedClosureDate: toDateTimeLocal(deal.expectedClosureDate),
    nextActivity: deal.nextActivity,
    nextActivityDueDate: toDateTimeLocal(deal.nextActivityDueDate),
    oemVendor: deal.oemVendor,
    extraFields: { ...(deal.extraFields ?? {}) },
  })
  const selectedProduct = products.find(
    (product) => product.name === formState.product,
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canEdit) {
      return
    }

    try {
      await updateDeal.mutateAsync({
        dealId: deal.id,
        input: buildDealUpdateInput(deal, {
          ...formState,
          expectedClosureDate: formState.expectedClosureDate
            ? new Date(formState.expectedClosureDate).toISOString()
            : '',
          nextActivityDueDate: formState.nextActivityDueDate
            ? new Date(formState.nextActivityDueDate).toISOString()
            : '',
        }),
      })
      onClose()
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside
        className="drawer-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="deal-detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <h3 id="deal-detail-title">{deal.company}</h3>
            <p>
              {deal.stageLabel} · {timeAgo(deal.updatedAt)}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form className="drawer-content" onSubmit={handleSubmit}>
          <section className="drawer-section">
            <div className="drawer-summary-grid">
              <div className="drawer-summary-card">
                <span>Stage</span>
                <strong>{deal.stageLabel}</strong>
              </div>
              <div className="drawer-summary-card">
                <span>Risk</span>
                <strong>{formatStageLabel(deal.riskStatus)}</strong>
              </div>
              <div className="drawer-summary-card">
                <span>Weighted value</span>
                <strong>{deal.weightedValue.toLocaleString('en-IN')}</strong>
              </div>
              <div className="drawer-summary-card">
                <span>Days in stage</span>
                <strong>{deal.daysInStage}</strong>
              </div>
            </div>
          </section>

          <section className="drawer-section">
            <div className="drawer-section-header">
              <h4>Deal details</h4>
              <p>Keep field quality high before moving stages.</p>
            </div>

            <fieldset
              className="deal-form deal-form-fieldset"
              disabled={!canEdit}
            >
              <label className="field">
                <span>Company</span>
                <input
                  value={formState.company}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      company: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Contact</span>
                <input
                  value={formState.contact}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      contact: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>Product</span>
                <input
                  list="drawer-catalog-products"
                  value={formState.product}
                  onChange={(event) =>
                    setFormState((current) => {
                      const matchingProduct = products.find(
                        (product) => product.name === event.target.value,
                      )

                      return {
                        ...current,
                        product: event.target.value,
                        oemVendor:
                          matchingProduct?.vendor && !current.oemVendor
                            ? matchingProduct.vendor
                            : current.oemVendor,
                      }
                    })
                  }
                />
                {selectedProduct && (
                  <small className="field-help">
                    {selectedProduct.category} · {selectedProduct.vendor}
                  </small>
                )}
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Value</span>
                  <input
                    type="number"
                    min="0"
                    value={formState.value}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        value: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>Priority</span>
                  <select
                    value={formState.priority}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        priority: event.target.value as Deal['priority'],
                      }))
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Account manager</span>
                <input
                  value={formState.accountManager}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      accountManager: event.target.value,
                    }))
                  }
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Expected closure</span>
                  <input
                    type="datetime-local"
                    value={formState.expectedClosureDate}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        expectedClosureDate: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field">
                  <span>Next activity due</span>
                  <input
                    type="datetime-local"
                    value={formState.nextActivityDueDate}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        nextActivityDueDate: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span>Next activity</span>
                <input
                  value={formState.nextActivity}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      nextActivity: event.target.value,
                    }))
                  }
                />
              </label>

              <label className="field">
                <span>OEM / vendor</span>
                <input
                  value={formState.oemVendor}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      oemVendor: event.target.value,
                    }))
                  }
                />
              </label>
            </fieldset>
          </section>

          {Object.keys(formState.extraFields).length > 0 && (
            <section className="drawer-section">
              <div className="drawer-section-header">
                <h4>Imported dynamic fields</h4>
                <p>
                  These came from Excel headers that are not part of the fixed
                  schema.
                </p>
              </div>
              <fieldset
                className="deal-form deal-form-fieldset"
                disabled={!canEdit}
              >
                {Object.entries(formState.extraFields).map(([key, value]) => (
                  <label key={key} className="field">
                    <span>{key}</span>
                    <input
                      value={value}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          extraFields: {
                            ...current.extraFields,
                            [key]: event.target.value,
                          },
                        }))
                      }
                    />
                  </label>
                ))}
              </fieldset>
            </section>
          )}

          <section className="drawer-section">
            <div className="drawer-section-header">
              <h4>Stage history</h4>
              <p>Most recent transitions for this deal.</p>
            </div>
            <div className="history-list">
              {history.length === 0 ? (
                <p className="history-empty">No recorded stage movement yet.</p>
              ) : (
                history.map((item, index) => (
                  <div
                    key={`${item.changedAt}-${index}`}
                    className="history-item"
                  >
                    <strong>
                      {formatStageLabel(item.fromStage)} to{' '}
                      {formatStageLabel(item.toStage)}
                    </strong>
                    <span>
                      {formatDate(item.changedAt)} · {item.changedBy}
                    </span>
                    {item.remarks && <p>{item.remarks}</p>}
                  </div>
                ))
              )}
            </div>
          </section>

          <div className="drawer-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Close
            </button>
            {canEdit ? (
              <button
                type="submit"
                className="btn btn-primary"
                disabled={updateDeal.isPending}
              >
                Save changes
              </button>
            ) : (
              <span className="permission-note">
                Deal management permission is required to save changes.
              </span>
            )}
          </div>

          {updateDeal.isError && (
            <p className="drawer-error">
              {getApiErrorMessage(
                updateDeal.error,
                'We could not save the deal. Check required fields and try again.',
              )}
            </p>
          )}
        </form>
        <datalist id="drawer-catalog-products">
          {products.map((product) => (
            <option key={product.id} value={product.name}>
              {product.category} · {product.vendor}
            </option>
          ))}
        </datalist>
      </aside>
    </div>
  )
}

function toDateTimeLocal(value: string) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

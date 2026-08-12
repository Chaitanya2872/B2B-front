import { useState, type FormEvent } from 'react'
import { Workflow, X } from 'lucide-react'
import { useAccounts, useConvertLead, usePipelineStages } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import type { Lead } from '../../types'
import '../pipeline/AddDealModal.css'
import '../pipeline/PipelinePanels.css'

interface ConvertLeadModalProps {
  lead: Lead
  onClose: () => void
  onConverted: () => void
}

export function ConvertLeadModal({
  lead,
  onClose,
  onConverted,
}: ConvertLeadModalProps) {
  const { data: accounts = [] } = useAccounts()
  const { data: stages = [] } = usePipelineStages()
  const convertLead = useConvertLead()

  const [accountName, setAccountName] = useState(lead.company)
  const [contactName, setContactName] = useState(lead.contactName)
  const [createOpportunity, setCreateOpportunity] = useState(true)
  const [product, setProduct] = useState('')
  const [value, setValue] = useState('')
  const [stageId, setStageId] = useState(stages[0]?.id ?? '')

  const canSubmit =
    accountName.trim().length > 0 &&
    (!createOpportunity || product.trim().length > 0)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    try {
      await convertLead.mutateAsync({
        leadId: lead.id,
        input: {
          accountName: accountName.trim(),
          contactName: contactName.trim() || undefined,
          createOpportunity,
          product: createOpportunity ? product.trim() : undefined,
          value: createOpportunity ? Number(value) || 0 : undefined,
          stageId: createOpportunity ? stageId || undefined : undefined,
        },
      })
      onConverted()
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="convert-lead-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="convert-lead-title">Convert lead</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form className="deal-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Account name</span>
            <input
              list="convert-lead-accounts"
              value={accountName}
              onChange={(event) => setAccountName(event.target.value)}
              autoFocus
            />
            <small className="field-help">
              Links to a matching existing account, or creates a new one.
            </small>
          </label>

          <label className="field">
            <span>Contact name</span>
            <input
              value={contactName}
              onChange={(event) => setContactName(event.target.value)}
            />
          </label>

          <label className="check-chip check-chip--secondary">
            <input
              type="checkbox"
              checked={createOpportunity}
              onChange={(event) => setCreateOpportunity(event.target.checked)}
            />
            Create an opportunity now
          </label>

          {createOpportunity && (
            <>
              <label className="field">
                <span>Product / requirement</span>
                <input
                  value={product}
                  onChange={(event) => setProduct(event.target.value)}
                  placeholder="e.g. Enterprise Wi-Fi Rollout"
                />
              </label>

              <div className="field-row">
                <label className="field">
                  <span>Estimated value (Rs)</span>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                  />
                </label>

                <label className="field">
                  <span>Starting stage</span>
                  <select
                    value={stageId}
                    onChange={(event) => setStageId(event.target.value)}
                  >
                    {stages.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSubmit || convertLead.isPending}
            >
              <Workflow size={15} strokeWidth={2.2} />
              {convertLead.isPending ? 'Converting...' : 'Convert lead'}
            </button>
          </div>

          {convertLead.isError && (
            <div className="form-error">
              {getApiErrorMessage(
                convertLead.error,
                'We could not convert this lead. Please check the fields and try again.',
              )}
            </div>
          )}
        </form>

        <datalist id="convert-lead-accounts">
          {accounts.map((account) => (
            <option key={account.id} value={account.name} />
          ))}
        </datalist>
      </div>
    </div>
  )
}

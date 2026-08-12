import { useState, type FormEvent } from 'react'
import {
  Briefcase,
  Building2,
  Gauge,
  Mail,
  Pencil,
  Phone,
  StickyNote,
  UserRound,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import { SidePanel } from '../../components/ui/SidePanel'
import { useCreateLead, useUpdateLead } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import type { Lead, LeadInput, LeadStatus } from '../../types'
import { formatStageLabel } from '../../utils/helpers'
import '../pipeline/AddDealModal.css'
import './leads.css'

const EMPTY_FORM: LeadInput = {
  company: '',
  contactName: '',
  email: '',
  phone: '',
  source: '',
  owner: '',
  score: 0,
  notes: '',
}

const EDITABLE_STATUSES: LeadStatus[] = [
  'new_lead',
  'contacted',
  'qualified',
  'unqualified',
  'lost',
]

function toInput(lead: Lead): LeadInput {
  return {
    company: lead.company,
    contactName: lead.contactName,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    owner: lead.owner,
    status: lead.status,
    score: lead.score,
    notes: lead.notes,
  }
}

function ViewRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: string
}) {
  return (
    <div className="side-panel-view-row">
      <span className="side-panel-view-icon">
        <Icon size={14} strokeWidth={2} />
      </span>
      <div className="side-panel-view-text">
        <span>{label}</span>
        <strong>{value || '—'}</strong>
      </div>
    </div>
  )
}

interface LeadPanelProps {
  lead: Lead | null
  canManage: boolean
  onClose: () => void
  onConvert: (lead: Lead) => void
}

export function LeadPanel({ lead, canManage, onClose, onConvert }: LeadPanelProps) {
  const createLead = useCreateLead()
  const updateLead = useUpdateLead()
  const [isEditing, setIsEditing] = useState(!lead)
  const [formState, setFormState] = useState<LeadInput>(
    lead ? toInput(lead) : EMPTY_FORM,
  )

  const mutation = lead ? updateLead : createLead
  const canSubmit = formState.company.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    const input: LeadInput = {
      company: formState.company.trim(),
      contactName: formState.contactName.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      source: formState.source.trim(),
      owner: formState.owner.trim(),
      status: formState.status,
      score: Math.max(0, Math.min(100, Number(formState.score) || 0)),
      notes: formState.notes.trim(),
    }

    try {
      if (lead) {
        await updateLead.mutateAsync({ leadId: lead.id, input })
        setIsEditing(false)
      } else {
        await createLead.mutateAsync(input)
        onClose()
      }
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  function handleCancel() {
    if (!lead) {
      onClose()
      return
    }
    setFormState(toInput(lead))
    setIsEditing(false)
  }

  if (!isEditing && lead) {
    const isConverted = lead.status === 'converted'
    return (
      <SidePanel
        title={lead.company}
        subtitle={[formatStageLabel(lead.status), lead.owner]
          .filter(Boolean)
          .join(' · ')}
        onClose={onClose}
        footer={
          canManage ? (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setIsEditing(true)}
              >
                <Pencil size={14} strokeWidth={2.4} />
                Edit lead
              </button>
              {!isConverted && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onConvert(lead)}
                >
                  <Workflow size={14} strokeWidth={2.4} />
                  Convert lead
                </button>
              )}
            </>
          ) : undefined
        }
      >
        <div className="side-panel-view">
          <ViewRow icon={Building2} label="Company" value={lead.company} />
          <ViewRow
            icon={UserRound}
            label="Contact name"
            value={lead.contactName}
          />
          <ViewRow icon={Mail} label="Email" value={lead.email} />
          <ViewRow icon={Phone} label="Phone" value={lead.phone} />
          <ViewRow icon={Briefcase} label="Source" value={lead.source} />
          <ViewRow icon={UserRound} label="Owner" value={lead.owner} />
          <ViewRow icon={Gauge} label="Score" value={String(lead.score)} />
          <ViewRow icon={StickyNote} label="Notes" value={lead.notes} />
        </div>
      </SidePanel>
    )
  }

  return (
    <SidePanel
      title={lead ? lead.company : 'Add lead'}
      subtitle={lead ? 'Update lead details.' : 'Capture a new possible buyer.'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            form="lead-panel-form"
            className="btn btn-primary"
            disabled={!canSubmit || mutation.isPending}
          >
            {lead ? 'Save changes' : 'Add lead'}
          </button>
        </>
      }
    >
      <form className="deal-form" onSubmit={handleSubmit} id="lead-panel-form">
        <label className="field">
          <span>Company</span>
          <input
            value={formState.company}
            autoFocus
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                company: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          <span>Contact name</span>
          <input
            value={formState.contactName}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                contactName: event.target.value,
              }))
            }
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={formState.email}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>Phone</span>
            <input
              value={formState.phone}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Source</span>
            <input
              list="lead-panel-sources"
              value={formState.source}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  source: event.target.value,
                }))
              }
            />
          </label>

          <label className="field">
            <span>Owner</span>
            <input
              value={formState.owner}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  owner: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <div className="field-row">
          <label className="field">
            <span>Status</span>
            <select
              value={formState.status ?? 'new_lead'}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  status: event.target.value as LeadStatus,
                }))
              }
            >
              {EDITABLE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatStageLabel(status)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Score (0-100)</span>
            <input
              type="number"
              min="0"
              max="100"
              value={formState.score}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  score: Number(event.target.value),
                }))
              }
            />
          </label>
        </div>

        <label className="field">
          <span>Notes</span>
          <textarea
            className="lead-notes-input"
            rows={3}
            value={formState.notes}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                notes: event.target.value,
              }))
            }
          />
        </label>

        {mutation.isError && (
          <div className="form-error">
            {getApiErrorMessage(
              mutation.error,
              'Unable to save the lead right now.',
            )}
          </div>
        )}
      </form>

      <datalist id="lead-panel-sources">
        <option value="Website enquiry" />
        <option value="Referral" />
        <option value="Cold call" />
        <option value="Event" />
        <option value="Inbound email" />
      </datalist>
    </SidePanel>
  )
}

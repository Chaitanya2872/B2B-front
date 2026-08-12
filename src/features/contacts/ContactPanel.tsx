import { useState, type FormEvent } from 'react'
import {
  Briefcase,
  Building2,
  Mail,
  Pencil,
  Phone,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { SidePanel } from '../../components/ui/SidePanel'
import { useAccounts, useCreateContact, useUpdateContact } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import type { Contact, ContactInput } from '../../types'
import '../pipeline/AddDealModal.css'

const EMPTY_FORM: ContactInput = {
  name: '',
  email: '',
  phone: '',
  title: '',
  accountName: '',
}

function toInput(contact: Contact): ContactInput {
  return {
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    title: contact.title,
    accountName: contact.accountName,
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

interface ContactPanelProps {
  contact: Contact | null
  canManage: boolean
  onClose: () => void
}

export function ContactPanel({
  contact,
  canManage,
  onClose,
}: ContactPanelProps) {
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const { data: accounts = [] } = useAccounts()
  const [isEditing, setIsEditing] = useState(!contact)
  const [formState, setFormState] = useState<ContactInput>(
    contact ? toInput(contact) : EMPTY_FORM,
  )

  const mutation = contact ? updateContact : createContact
  const canSubmit = formState.name.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    const input: ContactInput = {
      name: formState.name.trim(),
      email: formState.email.trim(),
      phone: formState.phone.trim(),
      title: formState.title.trim(),
      accountName: formState.accountName.trim(),
    }

    try {
      if (contact) {
        await updateContact.mutateAsync({ contactId: contact.id, input })
        setIsEditing(false)
      } else {
        await createContact.mutateAsync(input)
        onClose()
      }
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  function handleCancel() {
    if (!contact) {
      onClose()
      return
    }
    setFormState(toInput(contact))
    setIsEditing(false)
  }

  if (!isEditing && contact) {
    return (
      <SidePanel
        title={contact.name}
        subtitle={[contact.title, contact.accountName]
          .filter(Boolean)
          .join(' · ')}
        onClose={onClose}
        footer={
          canManage ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={14} strokeWidth={2.4} />
              Edit contact
            </button>
          ) : undefined
        }
      >
        <div className="side-panel-view">
          <ViewRow icon={UserRound} label="Contact name" value={contact.name} />
          <ViewRow icon={Briefcase} label="Title" value={contact.title} />
          <ViewRow
            icon={Building2}
            label="Account"
            value={contact.accountName}
          />
          <ViewRow icon={Mail} label="Email" value={contact.email} />
          <ViewRow icon={Phone} label="Phone" value={contact.phone} />
        </div>
      </SidePanel>
    )
  }

  return (
    <SidePanel
      title={contact ? contact.name : 'Add contact'}
      subtitle={
        contact
          ? 'Update contact details.'
          : 'Create a new contact and link it to an account.'
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            form="contact-panel-form"
            className="btn btn-primary"
            disabled={!canSubmit || mutation.isPending}
          >
            {contact ? 'Save changes' : 'Add contact'}
          </button>
        </>
      }
    >
      <form
        className="deal-form"
        onSubmit={handleSubmit}
        id="contact-panel-form"
      >
        <label className="field">
          <span>Contact name</span>
          <input
            value={formState.name}
            autoFocus
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          <span>Title</span>
          <input
            value={formState.title}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
        </label>

        <label className="field">
          <span>Account</span>
          <input
            list="contact-panel-accounts"
            value={formState.accountName}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                accountName: event.target.value,
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

        {mutation.isError && (
          <div className="form-error">
            {getApiErrorMessage(
              mutation.error,
              'Unable to save the contact right now.',
            )}
          </div>
        )}
      </form>

      <datalist id="contact-panel-accounts">
        {accounts.map((accountOption) => (
          <option key={accountOption.id} value={accountOption.name} />
        ))}
      </datalist>
    </SidePanel>
  )
}

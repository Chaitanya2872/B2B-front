import { useState, type FormEvent } from 'react'
import {
  Briefcase,
  Building2,
  Globe,
  MapPin,
  Pencil,
  Phone,
  UserRound,
  type LucideIcon,
} from 'lucide-react'
import { SidePanel } from '../../components/ui/SidePanel'
import { useCreateAccount, useUpdateAccount } from '../../hooks/useCrm'
import { getApiErrorMessage } from '../../services/api/client'
import type { Account, AccountInput } from '../../types'
import '../pipeline/AddDealModal.css'

const EMPTY_FORM: AccountInput = {
  name: '',
  industry: '',
  website: '',
  phone: '',
  address: '',
  accountManager: '',
}

function toInput(account: Account): AccountInput {
  return {
    name: account.name,
    industry: account.industry,
    website: account.website,
    phone: account.phone,
    address: account.address,
    accountManager: account.accountManager,
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

interface AccountPanelProps {
  account: Account | null
  canManage: boolean
  onClose: () => void
}

export function AccountPanel({
  account,
  canManage,
  onClose,
}: AccountPanelProps) {
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const [isEditing, setIsEditing] = useState(!account)
  const [formState, setFormState] = useState<AccountInput>(
    account ? toInput(account) : EMPTY_FORM,
  )

  const mutation = account ? updateAccount : createAccount
  const canSubmit = formState.name.trim().length > 0

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }

    const input: AccountInput = {
      name: formState.name.trim(),
      industry: formState.industry.trim(),
      website: formState.website.trim(),
      phone: formState.phone.trim(),
      address: formState.address.trim(),
      accountManager: formState.accountManager.trim(),
    }

    try {
      if (account) {
        await updateAccount.mutateAsync({ accountId: account.id, input })
        setIsEditing(false)
      } else {
        await createAccount.mutateAsync(input)
        onClose()
      }
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  function handleCancel() {
    if (!account) {
      onClose()
      return
    }
    setFormState(toInput(account))
    setIsEditing(false)
  }

  if (!isEditing && account) {
    return (
      <SidePanel
        title={account.name}
        subtitle={[account.industry, account.accountManager]
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
              Edit account
            </button>
          ) : undefined
        }
      >
        <div className="side-panel-view">
          <ViewRow icon={Building2} label="Account name" value={account.name} />
          <ViewRow icon={Briefcase} label="Industry" value={account.industry} />
          <ViewRow
            icon={UserRound}
            label="Account manager"
            value={account.accountManager}
          />
          <ViewRow icon={Phone} label="Phone" value={account.phone} />
          <ViewRow icon={Globe} label="Website" value={account.website} />
          <ViewRow icon={MapPin} label="Address" value={account.address} />
        </div>
      </SidePanel>
    )
  }

  return (
    <SidePanel
      title={account ? account.name : 'Add account'}
      subtitle={
        account
          ? 'Update account details.'
          : 'Create a new customer or prospect account.'
      }
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={handleCancel}>
            Cancel
          </button>
          <button
            type="submit"
            form="account-panel-form"
            className="btn btn-primary"
            disabled={!canSubmit || mutation.isPending}
          >
            {account ? 'Save changes' : 'Add account'}
          </button>
        </>
      }
    >
      <form
        className="deal-form"
        onSubmit={handleSubmit}
        id="account-panel-form"
      >
        <label className="field">
          <span>Account name</span>
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
          <span>Industry</span>
          <input
            value={formState.industry}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                industry: event.target.value,
              }))
            }
          />
        </label>

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

          <label className="field">
            <span>Website</span>
            <input
              value={formState.website}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  website: event.target.value,
                }))
              }
            />
          </label>
        </div>

        <label className="field">
          <span>Address</span>
          <input
            value={formState.address}
            onChange={(event) =>
              setFormState((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
          />
        </label>

        {mutation.isError && (
          <div className="form-error">
            {getApiErrorMessage(
              mutation.error,
              'Unable to save the account right now.',
            )}
          </div>
        )}
      </form>
    </SidePanel>
  )
}

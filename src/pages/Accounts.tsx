import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { useCurrentUser } from '../hooks/useAuth'
import {
  useAccounts,
  useCreateAccount,
  useDeleteAccount,
  useUpdateAccount,
} from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import type { Account, AccountInput } from '../types'
import { getQueryStateCopy } from '../utils/queryState'
import './Accounts.css'

const EMPTY_FORM: AccountInput = {
  name: '',
  industry: '',
  website: '',
  phone: '',
  address: '',
  accountManager: '',
}

export function Accounts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [formState, setFormState] = useState<AccountInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<AccountInput>(EMPTY_FORM)

  const { data: currentUser } = useCurrentUser()
  const { canManageAccounts } = getPipelineActionPermissions(currentUser)
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useAccounts(searchQuery)
  const createAccount = useCreateAccount()
  const updateAccount = useUpdateAccount()
  const deleteAccount = useDeleteAccount()

  const errorState = getQueryStateCopy(error, {
    title: 'Accounts unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })
  const canSubmit = formState.name.trim().length > 0

  async function handleCreateAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    try {
      await createAccount.mutateAsync({
        name: formState.name.trim(),
        industry: formState.industry.trim(),
        website: formState.website.trim(),
        phone: formState.phone.trim(),
        address: formState.address.trim(),
        accountManager: formState.accountManager.trim(),
      })
      setFormState(EMPTY_FORM)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  function startEdit(account: Account) {
    setEditingId(account.id)
    setEditState({
      name: account.name,
      industry: account.industry,
      website: account.website,
      phone: account.phone,
      address: account.address,
      accountManager: account.accountManager,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(EMPTY_FORM)
  }

  async function saveEdit(accountId: string) {
    if (!editState.name.trim()) {
      return
    }
    try {
      await updateAccount.mutateAsync({
        accountId,
        input: {
          name: editState.name.trim(),
          industry: editState.industry.trim(),
          website: editState.website.trim(),
          phone: editState.phone.trim(),
          address: editState.address.trim(),
          accountManager: editState.accountManager.trim(),
        },
      })
      cancelEdit()
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  async function handleDelete(account: Account) {
    const confirmed = window.confirm(`Remove account "${account.name}"?`)
    if (!confirmed) {
      return
    }
    try {
      await deleteAccount.mutateAsync(account.id)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="accounts-page">
      <div className="accounts-header">
        <div>
          <h2>Accounts</h2>
          <p>Manage customer and prospect organizations.</p>
        </div>
        <div className="search-box accounts-search">
          <input
            type="text"
            placeholder="Search accounts by name, industry or manager"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div
        className={`accounts-layout${
          canManageAccounts ? '' : ' accounts-layout--read-only'
        }`}
      >
        {canManageAccounts && (
          <section className="accounts-sidebar card">
            <div className="accounts-sidebar-header">
              <h3>Add account</h3>
              <p>Create a new customer or prospect account.</p>
            </div>

            <form className="deal-form" onSubmit={handleCreateAccount}>
              <label className="field">
                <span>Account name</span>
                <input
                  value={formState.name}
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

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || createAccount.isPending}
              >
                <Plus size={15} strokeWidth={2.4} />
                Add account
              </button>

              {createAccount.isError && (
                <p className="accounts-error">
                  {getApiErrorMessage(
                    createAccount.error,
                    'Unable to save account right now.',
                  )}
                </p>
              )}
            </form>
          </section>
        )}

        <section className="accounts-main">
          {(updateAccount.isError || deleteAccount.isError) && (
            <p className="accounts-error">
              {getApiErrorMessage(
                updateAccount.error ?? deleteAccount.error,
                'Unable to update accounts right now.',
              )}
            </p>
          )}

          {isLoading ? (
            <QueryState
              title="Loading accounts"
              detail="Fetching accounts from the CRM API."
            />
          ) : isError ? (
            <QueryState
              title={errorState.title}
              detail={errorState.detail}
              tone="danger"
            />
          ) : (
            <div className="accounts-table-wrap card">
              <table className="accounts-table">
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Industry</th>
                    <th>Account manager</th>
                    <th>Phone</th>
                    <th>Website</th>
                    {canManageAccounts && (
                      <th className="accounts-actions-col">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {accounts.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManageAccounts ? 6 : 5}
                        className="accounts-empty"
                      >
                        No accounts match these filters yet.
                      </td>
                    </tr>
                  )}
                  {accounts.map((account) =>
                    canManageAccounts && editingId === account.id ? (
                      <tr key={account.id} className="accounts-row-editing">
                        <td>
                          <input
                            className="accounts-inline-input"
                            value={editState.name}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            autoFocus
                          />
                        </td>
                        <td>
                          <input
                            className="accounts-inline-input"
                            value={editState.industry}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                industry: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="accounts-inline-input"
                            value={editState.accountManager}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                accountManager: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="accounts-inline-input"
                            value={editState.phone}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                phone: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="accounts-inline-input"
                            value={editState.website}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                website: event.target.value,
                              }))
                            }
                          />
                        </td>
                        {canManageAccounts && (
                          <td className="accounts-actions-col">
                            <div className="accounts-row-actions">
                              <button
                                type="button"
                                className="accounts-row-action-btn"
                                title="Save"
                                disabled={updateAccount.isPending}
                                onClick={() => saveEdit(account.id)}
                              >
                                <Check size={14} strokeWidth={2.4} />
                              </button>
                              <button
                                type="button"
                                className="accounts-row-action-btn"
                                title="Cancel"
                                onClick={cancelEdit}
                              >
                                <X size={14} strokeWidth={2.4} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ) : (
                      <tr key={account.id}>
                        <td className="accounts-name">{account.name}</td>
                        <td>{account.industry || '—'}</td>
                        <td>{account.accountManager || '—'}</td>
                        <td>{account.phone || '—'}</td>
                        <td>{account.website || '—'}</td>
                        {canManageAccounts && (
                          <td className="accounts-actions-col">
                            <div className="accounts-row-actions">
                              <button
                                type="button"
                                className="accounts-row-action-btn"
                                title="Edit"
                                onClick={() => startEdit(account)}
                              >
                                <Pencil size={14} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                className="accounts-row-action-btn accounts-row-action-btn--danger"
                                title="Delete"
                                disabled={deleteAccount.isPending}
                                onClick={() => handleDelete(account)}
                              >
                                <Trash2 size={14} strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

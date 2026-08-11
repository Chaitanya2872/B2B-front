import { useState } from 'react'
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { useCurrentUser } from '../hooks/useAuth'
import {
  useAccounts,
  useContacts,
  useCreateContact,
  useDeleteContact,
  useUpdateContact,
} from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import type { Contact, ContactInput } from '../types'
import { getQueryStateCopy } from '../utils/queryState'
import './Contacts.css'

const EMPTY_FORM: ContactInput = {
  name: '',
  email: '',
  phone: '',
  title: '',
  accountName: '',
}

export function Contacts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [formState, setFormState] = useState<ContactInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<ContactInput>(EMPTY_FORM)

  const { data: currentUser } = useCurrentUser()
  const { canManageContacts } = getPipelineActionPermissions(currentUser)
  const { data: accounts = [] } = useAccounts()
  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
  } = useContacts(searchQuery)
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()

  const errorState = getQueryStateCopy(error, {
    title: 'Contacts unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })
  const canSubmit = formState.name.trim().length > 0

  async function handleCreateContact(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) {
      return
    }
    try {
      await createContact.mutateAsync({
        name: formState.name.trim(),
        email: formState.email.trim(),
        phone: formState.phone.trim(),
        title: formState.title.trim(),
        accountName: formState.accountName.trim(),
      })
      setFormState(EMPTY_FORM)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  function startEdit(contact: Contact) {
    setEditingId(contact.id)
    setEditState({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      title: contact.title,
      accountName: contact.accountName,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditState(EMPTY_FORM)
  }

  async function saveEdit(contactId: string) {
    if (!editState.name.trim()) {
      return
    }
    try {
      await updateContact.mutateAsync({
        contactId,
        input: {
          name: editState.name.trim(),
          email: editState.email.trim(),
          phone: editState.phone.trim(),
          title: editState.title.trim(),
          accountName: editState.accountName.trim(),
        },
      })
      cancelEdit()
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  async function handleDelete(contact: Contact) {
    const confirmed = window.confirm(`Remove contact "${contact.name}"?`)
    if (!confirmed) {
      return
    }
    try {
      await deleteContact.mutateAsync(contact.id)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="contacts-page">
      <div className="contacts-header">
        <div>
          <h2>Contacts</h2>
          <p>Manage people at customer and prospect accounts.</p>
        </div>
        <div className="search-box contacts-search">
          <input
            type="text"
            placeholder="Search contacts by name, email or account"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div
        className={`contacts-layout${
          canManageContacts ? '' : ' contacts-layout--read-only'
        }`}
      >
        {canManageContacts && (
          <section className="contacts-sidebar card">
            <div className="contacts-sidebar-header">
              <h3>Add contact</h3>
              <p>Create a new contact and link it to an account.</p>
            </div>

            <form className="deal-form" onSubmit={handleCreateContact}>
              <label className="field">
                <span>Contact name</span>
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

              <label className="field">
                <span>Account</span>
                <input
                  list="contact-accounts"
                  value={formState.accountName}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      accountName: event.target.value,
                    }))
                  }
                />
              </label>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={!canSubmit || createContact.isPending}
              >
                <Plus size={15} strokeWidth={2.4} />
                Add contact
              </button>

              {createContact.isError && (
                <p className="contacts-error">
                  {getApiErrorMessage(
                    createContact.error,
                    'Unable to save contact right now.',
                  )}
                </p>
              )}
            </form>
          </section>
        )}

        <section className="contacts-main">
          {(updateContact.isError || deleteContact.isError) && (
            <p className="contacts-error">
              {getApiErrorMessage(
                updateContact.error ?? deleteContact.error,
                'Unable to update contacts right now.',
              )}
            </p>
          )}

          {isLoading ? (
            <QueryState
              title="Loading contacts"
              detail="Fetching contacts from the CRM API."
            />
          ) : isError ? (
            <QueryState
              title={errorState.title}
              detail={errorState.detail}
              tone="danger"
            />
          ) : (
            <div className="contacts-table-wrap card">
              <table className="contacts-table">
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Title</th>
                    <th>Account</th>
                    <th>Email</th>
                    <th>Phone</th>
                    {canManageContacts && (
                      <th className="contacts-actions-col">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 && (
                    <tr>
                      <td
                        colSpan={canManageContacts ? 6 : 5}
                        className="contacts-empty"
                      >
                        No contacts match these filters yet.
                      </td>
                    </tr>
                  )}
                  {contacts.map((contact) =>
                    canManageContacts && editingId === contact.id ? (
                      <tr key={contact.id} className="contacts-row-editing">
                        <td>
                          <input
                            className="contacts-inline-input"
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
                            className="contacts-inline-input"
                            value={editState.title}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                title: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="contacts-inline-input"
                            list="contact-accounts"
                            value={editState.accountName}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                accountName: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="contacts-inline-input"
                            type="email"
                            value={editState.email}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                email: event.target.value,
                              }))
                            }
                          />
                        </td>
                        <td>
                          <input
                            className="contacts-inline-input"
                            value={editState.phone}
                            onChange={(event) =>
                              setEditState((current) => ({
                                ...current,
                                phone: event.target.value,
                              }))
                            }
                          />
                        </td>
                        {canManageContacts && (
                          <td className="contacts-actions-col">
                            <div className="contacts-row-actions">
                              <button
                                type="button"
                                className="contacts-row-action-btn"
                                title="Save"
                                disabled={updateContact.isPending}
                                onClick={() => saveEdit(contact.id)}
                              >
                                <Check size={14} strokeWidth={2.4} />
                              </button>
                              <button
                                type="button"
                                className="contacts-row-action-btn"
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
                      <tr key={contact.id}>
                        <td className="contacts-name">{contact.name}</td>
                        <td>{contact.title || '—'}</td>
                        <td>{contact.accountName || '—'}</td>
                        <td>{contact.email || '—'}</td>
                        <td>{contact.phone || '—'}</td>
                        {canManageContacts && (
                          <td className="contacts-actions-col">
                            <div className="contacts-row-actions">
                              <button
                                type="button"
                                className="contacts-row-action-btn"
                                title="Edit"
                                onClick={() => startEdit(contact)}
                              >
                                <Pencil size={14} strokeWidth={2} />
                              </button>
                              <button
                                type="button"
                                className="contacts-row-action-btn contacts-row-action-btn--danger"
                                title="Delete"
                                disabled={deleteContact.isPending}
                                onClick={() => handleDelete(contact)}
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

      <datalist id="contact-accounts">
        {accounts.map((account) => (
          <option key={account.id} value={account.name} />
        ))}
      </datalist>
    </div>
  )
}

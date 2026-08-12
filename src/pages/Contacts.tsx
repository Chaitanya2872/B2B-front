import { useMemo, useState } from 'react'
import {
  Briefcase,
  Building2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { StatCard } from '../components/ui/StatCard'
import { useCurrentUser } from '../hooks/useAuth'
import { useContacts, useDeleteContact } from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import { ContactPanel } from '../features/contacts/ContactPanel'
import type { Contact } from '../types'
import { getQueryStateCopy } from '../utils/queryState'
import './Contacts.css'

export function Contacts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { data: currentUser } = useCurrentUser()
  const { canManageContacts } = getPipelineActionPermissions(currentUser)
  const {
    data: contacts = [],
    isLoading,
    isError,
    error,
  } = useContacts(searchQuery)
  const deleteContact = useDeleteContact()

  const errorState = getQueryStateCopy(error, {
    title: 'Contacts unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  const kpis = useMemo(() => {
    const linkedAccounts = new Set(
      contacts.map((contact) => contact.accountName).filter(Boolean),
    )
    const withEmail = contacts.filter((contact) => contact.email)
    const withPhone = contacts.filter((contact) => contact.phone)

    return {
      total: contacts.length,
      linkedAccounts: linkedAccounts.size,
      withEmail: withEmail.length,
      withPhone: withPhone.length,
    }
  }, [contacts])

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
        <div className="contacts-header-actions">
          <div className="search-box contacts-search">
            <Search size={15} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search contacts by name, email or account"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          {canManageContacts && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add contact
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total contacts"
          value={String(kpis.total)}
          icon={Users}
          accent="#2563eb"
        />
        <StatCard
          label="Linked accounts"
          value={String(kpis.linkedAccounts)}
          icon={Building2}
          accent="#0ea5e9"
        />
        <StatCard
          label="With email"
          value={String(kpis.withEmail)}
          icon={Mail}
          accent="#16a34a"
        />
        <StatCard
          label="With phone"
          value={String(kpis.withPhone)}
          icon={Phone}
          accent="#d97706"
        />
      </div>

      {deleteContact.isError && (
        <p className="contacts-error">
          {getApiErrorMessage(
            deleteContact.error,
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
                <th>
                  <span className="table-th">
                    <UserRound size={13} strokeWidth={2.2} />
                    Contact
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Briefcase size={13} strokeWidth={2.2} />
                    Title
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Building2 size={13} strokeWidth={2.2} />
                    Account
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Mail size={13} strokeWidth={2.2} />
                    Email
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Phone size={13} strokeWidth={2.2} />
                    Phone
                  </span>
                </th>
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
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="contacts-row"
                  onClick={() => setSelectedContact(contact)}
                >
                  <td className="contacts-name">{contact.name}</td>
                  <td>{contact.title || '—'}</td>
                  <td>{contact.accountName || '—'}</td>
                  <td>{contact.email || '—'}</td>
                  <td>{contact.phone || '—'}</td>
                  {canManageContacts && (
                    <td className="contacts-actions-col">
                      <button
                        type="button"
                        className="contacts-row-action-btn contacts-row-action-btn--danger"
                        title="Delete"
                        disabled={deleteContact.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleDelete(contact)
                        }}
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAddOpen && (
        <ContactPanel
          contact={null}
          canManage={canManageContacts}
          onClose={() => setIsAddOpen(false)}
        />
      )}
      {selectedContact && (
        <ContactPanel
          key={selectedContact.id}
          contact={selectedContact}
          canManage={canManageContacts}
          onClose={() => setSelectedContact(null)}
        />
      )}
    </div>
  )
}

import { useMemo, useState } from 'react'
import {
  Briefcase,
  Building2,
  Globe,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { StatCard } from '../components/ui/StatCard'
import { useCurrentUser } from '../hooks/useAuth'
import { useAccounts, useDeleteAccount } from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import { AccountPanel } from '../features/accounts/AccountPanel'
import type { Account } from '../types'
import { getQueryStateCopy } from '../utils/queryState'
import './Accounts.css'

export function Accounts() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)

  const { data: currentUser } = useCurrentUser()
  const { canManageAccounts } = getPipelineActionPermissions(currentUser)
  const {
    data: accounts = [],
    isLoading,
    isError,
    error,
  } = useAccounts(searchQuery)
  const deleteAccount = useDeleteAccount()

  const errorState = getQueryStateCopy(error, {
    title: 'Accounts unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  const kpis = useMemo(() => {
    const industries = new Set(
      accounts.map((account) => account.industry).filter(Boolean),
    )
    const withManager = accounts.filter((account) => account.accountManager)
    const withWebsite = accounts.filter((account) => account.website)

    return {
      total: accounts.length,
      industries: industries.size,
      withManager: withManager.length,
      withWebsite: withWebsite.length,
    }
  }, [accounts])

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
        <div className="accounts-header-actions">
          <div className="search-box accounts-search">
            <Search size={15} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search accounts by name, industry or manager"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          {canManageAccounts && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add account
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total accounts"
          value={String(kpis.total)}
          icon={Building2}
          accent="#2563eb"
        />
        <StatCard
          label="Industries covered"
          value={String(kpis.industries)}
          icon={Briefcase}
          accent="#0ea5e9"
        />
        <StatCard
          label="With account manager"
          value={String(kpis.withManager)}
          icon={UserRound}
          accent="#16a34a"
        />
        <StatCard
          label="With website"
          value={String(kpis.withWebsite)}
          icon={Globe}
          accent="#d97706"
        />
      </div>

      {deleteAccount.isError && (
        <p className="accounts-error">
          {getApiErrorMessage(
            deleteAccount.error,
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
                <th>
                  <span className="table-th">
                    <Building2 size={13} strokeWidth={2.2} />
                    Account
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Briefcase size={13} strokeWidth={2.2} />
                    Industry
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <UserRound size={13} strokeWidth={2.2} />
                    Account manager
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Phone size={13} strokeWidth={2.2} />
                    Phone
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Globe size={13} strokeWidth={2.2} />
                    Website
                  </span>
                </th>
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
              {accounts.map((account) => (
                <tr
                  key={account.id}
                  className="accounts-row"
                  onClick={() => setSelectedAccount(account)}
                >
                  <td className="accounts-name">{account.name}</td>
                  <td>{account.industry || '—'}</td>
                  <td>{account.accountManager || '—'}</td>
                  <td>{account.phone || '—'}</td>
                  <td>{account.website || '—'}</td>
                  {canManageAccounts && (
                    <td className="accounts-actions-col">
                      <button
                        type="button"
                        className="accounts-row-action-btn accounts-row-action-btn--danger"
                        title="Delete"
                        disabled={deleteAccount.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleDelete(account)
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
        <AccountPanel
          account={null}
          canManage={canManageAccounts}
          onClose={() => setIsAddOpen(false)}
        />
      )}
      {selectedAccount && (
        <AccountPanel
          key={selectedAccount.id}
          account={selectedAccount}
          canManage={canManageAccounts}
          onClose={() => setSelectedAccount(null)}
        />
      )}
    </div>
  )
}

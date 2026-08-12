import { useMemo, useState } from 'react'
import {
  Briefcase,
  Building2,
  Gauge,
  Plus,
  Search,
  Target,
  Trash2,
  UserRound,
  Workflow,
} from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { StatCard } from '../components/ui/StatCard'
import { useCurrentUser } from '../hooks/useAuth'
import { useDeleteLead, useLeads } from '../hooks/useCrm'
import { getApiErrorMessage } from '../services/api/client'
import { getPipelineActionPermissions } from '../services/auth/permissions'
import { LeadPanel } from '../features/leads/LeadPanel'
import { ConvertLeadModal } from '../features/leads/ConvertLeadModal'
import type { Lead, LeadStatus } from '../types'
import { formatStageLabel } from '../utils/helpers'
import { getQueryStateCopy } from '../utils/queryState'
import './Leads.css'

const STATUS_TONE: Record<LeadStatus, string> = {
  new_lead: 'var(--accent)',
  contacted: '#0ea5e9',
  qualified: 'var(--success)',
  unqualified: 'var(--text-faint)',
  converted: '#7c3aed',
  lost: 'var(--danger)',
}

export function Leads() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null)

  const { data: currentUser } = useCurrentUser()
  const { canManageLeads } = getPipelineActionPermissions(currentUser)
  const {
    data: leads = [],
    isLoading,
    isError,
    error,
  } = useLeads(searchQuery)
  const deleteLead = useDeleteLead()

  const errorState = getQueryStateCopy(error, {
    title: 'Leads unavailable',
    detail: 'The CRM API could not be reached. Start the backend and refresh.',
  })

  const kpis = useMemo(() => {
    return {
      total: leads.length,
      newLeads: leads.filter((lead) => lead.status === 'new_lead').length,
      qualified: leads.filter((lead) => lead.status === 'qualified').length,
      converted: leads.filter((lead) => lead.status === 'converted').length,
    }
  }, [leads])

  async function handleDelete(lead: Lead) {
    const confirmed = window.confirm(`Remove lead "${lead.company}"?`)
    if (!confirmed) {
      return
    }
    try {
      await deleteLead.mutateAsync(lead.id)
    } catch {
      // React Query keeps the error for the inline state below.
    }
  }

  return (
    <div className="leads-page">
      <div className="leads-header">
        <div>
          <h2>Leads</h2>
          <p>Track possible buyers before they become opportunities.</p>
        </div>
        <div className="leads-header-actions">
          <div className="search-box leads-search">
            <Search size={15} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search leads by company, contact or owner"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          {canManageLeads && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsAddOpen(true)}
            >
              <Plus size={15} strokeWidth={2.5} />
              Add lead
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total leads"
          value={String(kpis.total)}
          icon={Target}
          accent="#2563eb"
        />
        <StatCard
          label="New"
          value={String(kpis.newLeads)}
          icon={Briefcase}
          accent="#0ea5e9"
        />
        <StatCard
          label="Qualified"
          value={String(kpis.qualified)}
          icon={Gauge}
          accent="#16a34a"
        />
        <StatCard
          label="Converted"
          value={String(kpis.converted)}
          icon={Workflow}
          accent="#7c3aed"
        />
      </div>

      {deleteLead.isError && (
        <p className="leads-error">
          {getApiErrorMessage(
            deleteLead.error,
            'Unable to update leads right now.',
          )}
        </p>
      )}

      {isLoading ? (
        <QueryState
          title="Loading leads"
          detail="Fetching leads from the CRM API."
        />
      ) : isError ? (
        <QueryState
          title={errorState.title}
          detail={errorState.detail}
          tone="danger"
        />
      ) : (
        <div className="leads-table-wrap card">
          <table className="leads-table">
            <thead>
              <tr>
                <th>
                  <span className="table-th">
                    <Building2 size={13} strokeWidth={2.2} />
                    Company
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <UserRound size={13} strokeWidth={2.2} />
                    Contact
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <Briefcase size={13} strokeWidth={2.2} />
                    Source
                  </span>
                </th>
                <th>Status</th>
                <th>
                  <span className="table-th">
                    <Gauge size={13} strokeWidth={2.2} />
                    Score
                  </span>
                </th>
                <th>
                  <span className="table-th">
                    <UserRound size={13} strokeWidth={2.2} />
                    Owner
                  </span>
                </th>
                {canManageLeads && (
                  <th className="leads-actions-col">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td
                    colSpan={canManageLeads ? 7 : 6}
                    className="leads-empty"
                  >
                    No leads match these filters yet.
                  </td>
                </tr>
              )}
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  className="leads-row"
                  onClick={() => setSelectedLead(lead)}
                >
                  <td className="leads-company">{lead.company}</td>
                  <td>{lead.contactName || '—'}</td>
                  <td>{lead.source || '—'}</td>
                  <td>
                    <span
                      className="leads-badge"
                      style={{
                        background: `${STATUS_TONE[lead.status]}20`,
                        color: STATUS_TONE[lead.status],
                      }}
                    >
                      {formatStageLabel(lead.status)}
                    </span>
                  </td>
                  <td>{lead.score}</td>
                  <td>{lead.owner || '—'}</td>
                  {canManageLeads && (
                    <td className="leads-actions-col">
                      <button
                        type="button"
                        className="leads-row-action-btn leads-row-action-btn--danger"
                        title="Delete"
                        disabled={deleteLead.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          void handleDelete(lead)
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
        <LeadPanel
          lead={null}
          canManage={canManageLeads}
          onClose={() => setIsAddOpen(false)}
          onConvert={() => {}}
        />
      )}
      {selectedLead && (
        <LeadPanel
          key={selectedLead.id}
          lead={selectedLead}
          canManage={canManageLeads}
          onClose={() => setSelectedLead(null)}
          onConvert={(lead) => {
            setSelectedLead(null)
            setConvertingLead(lead)
          }}
        />
      )}
      {convertingLead && (
        <ConvertLeadModal
          lead={convertingLead}
          onClose={() => setConvertingLead(null)}
          onConverted={() => setConvertingLead(null)}
        />
      )}
    </div>
  )
}

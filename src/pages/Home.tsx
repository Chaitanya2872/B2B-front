import { useState } from 'react'
import { Plus, Search, Settings2, Upload } from 'lucide-react'
import { QueryState } from '../components/ui/QueryState'
import { useDeals, usePipelineStages } from '../hooks/useCrm'
import { useAppStore } from '../store'
import { PipelineBoard } from '../features/pipeline/PipelineBoard'
import { AddDealModal } from '../features/pipeline/AddDealModal'
import { ImportDealsModal } from '../features/pipeline/ImportDealsModal'
import { DealDetailDrawer } from '../features/pipeline/DealDetailDrawer'
import { StageAdminPanel } from '../features/pipeline/StageAdminPanel'
import type { Deal } from '../types'
import './Home.css'

export function Home() {
  const searchQuery = useAppStore((state) => state.searchQuery)
  const setSearchQuery = useAppStore((state) => state.setSearchQuery)
  const [isAddDealOpen, setIsAddDealOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isStageAdminOpen, setIsStageAdminOpen] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const { data: deals = [], isLoading, isError } = useDeals(searchQuery)
  const {
    data: stages = [],
    isLoading: isStagesLoading,
    isError: isStagesError,
  } = usePipelineStages()

  return (
    <div className="home-page">
      <div className="pipeline-toolbar">
        <div>
          <h2 className="pipeline-toolbar-title">Sales Pipeline</h2>
          <p className="pipeline-toolbar-subtitle">
            Suspect to payment collection &mdash; back-to-back model, no
            in-house inventory.
          </p>
        </div>
        <div className="pipeline-toolbar-actions">
          <div className="search-box">
            <Search size={15} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search company, product or account manager"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddDealOpen(true)}>
            <Plus size={15} strokeWidth={2.5} />
            Add deal
          </button>
          <button className="btn btn-ghost" onClick={() => setIsStageAdminOpen(true)}>
            <Settings2 size={15} strokeWidth={2.3} />
            Manage stages
          </button>
          <button className="btn btn-ghost" onClick={() => setIsImportOpen(true)}>
            <Upload size={15} strokeWidth={2.5} />
            Import Excel
          </button>
        </div>
      </div>

      {isLoading || isStagesLoading ? (
        <QueryState
          title="Loading pipeline"
          detail="Fetching the latest CRM deals from the custom backend."
        />
      ) : isError || isStagesError ? (
        <QueryState
          title="Pipeline unavailable"
          detail="The CRM API could not be reached. Start the backend and refresh."
          tone="danger"
        />
      ) : (
        <PipelineBoard deals={deals} stages={stages} onDealSelect={setSelectedDeal} />
      )}

      {isAddDealOpen && (
        <AddDealModal onClose={() => setIsAddDealOpen(false)} stages={stages} />
      )}
      {isImportOpen && (
        <ImportDealsModal onClose={() => setIsImportOpen(false)} stages={stages} />
      )}
      {isStageAdminOpen && (
        <StageAdminPanel onClose={() => setIsStageAdminOpen(false)} stages={stages} />
      )}
      {selectedDeal && (
        <DealDetailDrawer
          key={selectedDeal.id}
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
        />
      )}
    </div>
  )
}

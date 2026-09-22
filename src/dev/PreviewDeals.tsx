// TEMP: visual QA harness, not part of the app build. Deleted after review.
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { AppFooter } from '../components/layout/AppFooter'
import { Sidebar } from '../components/layout/Sidebar'
import { Home } from '../pages/Home'
import { crmKeys } from '../hooks/useCrm'
import { authKeys } from '../hooks/useAuth'
import type { Deal, PipelineStage, ProductCatalogItem } from '../types'
import '../layouts/MainLayout.css'
import '../index.css'

const stages: PipelineStage[] = [
  { id: 'suspect', name: 'Suspect', shortLabel: 'Suspect', displayOrder: 1, probabilityPercent: 10, color: '#8c7165', maxExpectedDurationDays: 14, mandatoryFields: [], requiredApprovals: [], allowedNextStages: [] },
  { id: 'prospect', name: 'Prospect', shortLabel: 'Prospect', displayOrder: 2, probabilityPercent: 25, color: '#e9782b', maxExpectedDurationDays: 14, mandatoryFields: [], requiredApprovals: [], allowedNextStages: [] },
  { id: 'quotation', name: 'Quotation', shortLabel: 'Quotation', displayOrder: 3, probabilityPercent: 55, color: '#e8640c', maxExpectedDurationDays: 21, mandatoryFields: [], requiredApprovals: ['RSM'], allowedNextStages: [] },
  { id: 'negotiation', name: 'Negotiate', shortLabel: 'Negotiate', displayOrder: 4, probabilityPercent: 75, color: '#c2410c', maxExpectedDurationDays: 14, mandatoryFields: [], requiredApprovals: [], allowedNextStages: [] },
  { id: 'order', name: 'Order', shortLabel: 'Order', displayOrder: 5, probabilityPercent: 95, color: '#9a3412', maxExpectedDurationDays: 7, mandatoryFields: [], requiredApprovals: [], allowedNextStages: [] },
]

const products: ProductCatalogItem[] = [
  { id: 'p1', name: 'Enterprise Wi-Fi Rollout', category: 'Networking', vendor: 'Cisco', sku: 'CIS-WIFI-01' },
]

function makeDeal(overrides: Partial<Deal>): Deal {
  return {
    id: overrides.id ?? 'd',
    company: 'Acme Corp',
    contact: 'Jane Doe',
    product: 'Enterprise License',
    accountManager: { name: 'Rahul S.', initials: 'RS' },
    stage: 'quotation',
    stageLabel: 'Quotation',
    value: 1200000,
    priority: 'high',
    updatedAt: new Date().toISOString(),
    expectedClosureDate: new Date(Date.now() + 10 * 86400000).toISOString(),
    nextActivity: '',
    nextActivityDueDate: '',
    oemVendor: '',
    riskStatus: 'healthy',
    probabilityPercent: 55,
    weightedValue: 660000,
    daysInStage: 5,
    approvals: [],
    extraFields: {},
    ...overrides,
  }
}

const deals: Deal[] = [
  makeDeal({ id: 'd1', company: 'Bharat Electronics Limited', contact: 'Ramesh Iyer', product: 'Enterprise Wi-Fi Rollout', stage: 'quotation', value: 12000000, priority: 'high' }),
]

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: Infinity, retry: false } },
})

queryClient.setQueryData(crmKeys.stages(), stages)
queryClient.setQueryData(crmKeys.deals(''), deals)
queryClient.setQueryData(crmKeys.products('', ''), products)
queryClient.setQueryData(authKeys.currentUser(), {
  id: 'u1',
  name: 'Rahul S.',
  email: 'rahul@example.com',
  roles: ['ROLE_MASTER'],
  permissions: [],
})

function Shell() {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed((c) => !c)} />
      <div className="app-main">
        <main className="app-content">
          <Home />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

export function PreviewDeals() {
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/pipeline']}>
        <Shell />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

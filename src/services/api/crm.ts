import { apiClient } from './client'
import type {
  ActivityItem,
  ApprovalRole,
  ApprovalStatus,
  ApprovalStep,
  DashboardSummary,
  Deal,
  DealUpdateInput,
  DealStageHistoryItem,
  ImportDealsResponse,
  PipelineStage,
  PipelineStageUpdateRequest,
  Priority,
  ProductCatalogItem,
  ProductCatalogSummary,
  StageMoveRequest,
  TrendPoint,
  WarrantyItem,
} from '../../types'

export interface NewDealInput {
  company: string
  contact: string
  product: string
  value: number
  accountManager: string
  priority: Priority
  stage: string
  expectedClosureDate?: string
  nextActivity?: string
  nextActivityDueDate?: string
  oemVendor?: string
}

export interface NewProductInput {
  name: string
  category: string
  vendor: string
  sku: string
}

export type RawApprovalStep = Omit<ApprovalStep, 'role'> & {
  role?: string | null
}

export type RawDeal = Omit<Deal, 'approvals' | 'extraFields'> & {
  approvals?: RawApprovalStep[] | null
  extraFields?: Record<string, string> | null
}

export type RawPipelineStage = Omit<PipelineStage, 'requiredApprovals'> & {
  requiredApprovals?: string[] | null
}

export function normalizeApprovalRole(role: string | null | undefined) {
  if (role === 'RSM' || role === 'Finance') return role
  if (role === 'BusinessHead' || role === 'Business Head')
    return 'Business Head'
  return null
}

export function normalizeApprovalStep(step: RawApprovalStep) {
  const role = normalizeApprovalRole(step.role)
  return role ? ({ ...step, role } satisfies ApprovalStep) : null
}

export function normalizeDeal(deal: RawDeal): Deal {
  return {
    ...deal,
    approvals: (deal.approvals ?? [])
      .map(normalizeApprovalStep)
      .filter((step): step is ApprovalStep => Boolean(step)),
    extraFields: deal.extraFields ?? {},
  }
}

export function normalizePipelineStage(stage: RawPipelineStage): PipelineStage {
  return {
    ...stage,
    requiredApprovals: (stage.requiredApprovals ?? [])
      .map(normalizeApprovalRole)
      .filter((role): role is ApprovalRole => Boolean(role)),
  }
}

export async function fetchDeals(search?: string) {
  const response = await apiClient.get<RawDeal[]>('/deals', {
    params: search ? { search } : undefined,
  })
  return response.data.map(normalizeDeal)
}

export async function fetchApprovals() {
  const response = await apiClient.get<RawDeal[]>('/approvals')
  return response.data.map(normalizeDeal)
}

export async function fetchPipelineStages() {
  const response = await apiClient.get<RawPipelineStage[]>('/pipeline/stages')
  return response.data.map(normalizePipelineStage)
}

export async function fetchProducts(params?: {
  category?: string
  vendor?: string
}) {
  const response = await apiClient.get<ProductCatalogItem[]>('/products', {
    params,
  })
  return response.data
}

export async function fetchProductSummary() {
  const response =
    await apiClient.get<ProductCatalogSummary>('/products/summary')
  return {
    categories: response.data.categories ?? [],
    vendors: response.data.vendors ?? [],
  }
}

export async function fetchWarrantyItems() {
  const response = await apiClient.get<WarrantyItem[]>('/warranty-items')
  return response.data
}

export async function fetchDashboardSummary() {
  const response = await apiClient.get<DashboardSummary>('/dashboard/summary')
  return response.data
}

export async function fetchTrendPoints() {
  const response = await apiClient.get<TrendPoint[]>('/dashboard/trend')
  return response.data
}

export async function fetchActivityItems() {
  const response = await apiClient.get<ActivityItem[]>('/dashboard/activity')
  return response.data
}

export async function createDeal(input: NewDealInput) {
  const response = await apiClient.post<RawDeal>('/deals', input)
  return normalizeDeal(response.data)
}

export async function createProduct(input: NewProductInput) {
  const response = await apiClient.post<ProductCatalogItem>('/products', input)
  return response.data
}

export async function updateProduct(productId: string, input: NewProductInput) {
  const response = await apiClient.put<ProductCatalogItem>(
    `/products/${productId}`,
    input,
  )
  return response.data
}

export async function deleteProduct(productId: string) {
  await apiClient.delete(`/products/${productId}`)
}

export async function updateDeal(dealId: string, input: DealUpdateInput) {
  const response = await apiClient.put<RawDeal>(`/deals/${dealId}`, input)
  return normalizeDeal(response.data)
}

export async function importDealsExcel(file: File, defaultStage: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('defaultStage', defaultStage)

  const response = await apiClient.post<ImportDealsResponse>(
    '/deals/import-excel',
    formData,
  )
  return response.data
}

export async function moveDealStage(dealId: string, input: StageMoveRequest) {
  const response = await apiClient.patch<RawDeal>(
    `/deals/${dealId}/stage`,
    input,
  )
  return normalizeDeal(response.data)
}

export async function updatePipelineStage(
  stageId: string,
  input: PipelineStageUpdateRequest,
) {
  const response = await apiClient.put<RawPipelineStage>(
    `/pipeline/stages/${stageId}`,
    input,
  )
  return normalizePipelineStage(response.data)
}

export async function fetchDealStageHistory(dealId: string) {
  const response = await apiClient.get<DealStageHistoryItem[]>(
    `/deals/${dealId}/stage-history`,
  )
  return response.data
}

export async function updateApprovalStatus(
  dealId: string,
  role: ApprovalRole,
  status: ApprovalStatus,
) {
  const response = await apiClient.patch<RawDeal>(
    `/deals/${dealId}/approvals`,
    {
      role,
      status,
    },
  )
  return normalizeDeal(response.data)
}

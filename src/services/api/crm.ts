import { apiClient } from './client'
import type {
  ActivityItem,
  ApprovalRole,
  ApprovalStatus,
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

export async function fetchDeals(search?: string) {
  const response = await apiClient.get<Deal[]>('/deals', {
    params: search ? { search } : undefined,
  })
  return response.data
}

export async function fetchApprovals() {
  const response = await apiClient.get<Deal[]>('/approvals')
  return response.data
}

export async function fetchPipelineStages() {
  const response = await apiClient.get<PipelineStage[]>('/pipeline/stages')
  return response.data
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
  const response = await apiClient.get<ProductCatalogSummary>('/products/summary')
  return response.data
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
  const response = await apiClient.post<Deal>('/deals', input)
  return response.data
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
  const response = await apiClient.put<Deal>(`/deals/${dealId}`, input)
  return response.data
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
  const response = await apiClient.patch<Deal>(`/deals/${dealId}/stage`, input)
  return response.data
}

export async function updatePipelineStage(
  stageId: string,
  input: PipelineStageUpdateRequest,
) {
  const response = await apiClient.put<PipelineStage>(
    `/pipeline/stages/${stageId}`,
    input,
  )
  return response.data
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
  const response = await apiClient.patch<Deal>(`/deals/${dealId}/approvals`, {
    role,
    status,
  })
  return response.data
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createDeal,
  createProduct,
  deleteProduct,
  fetchActivityItems,
  fetchApprovals,
  fetchDashboardSummary,
  fetchDealStageHistory,
  fetchDeals,
  fetchPipelineStages,
  fetchProducts,
  fetchProductSummary,
  importDealsExcel,
  moveDealStage,
  fetchTrendPoints,
  fetchWarrantyItems,
  type NewDealInput,
  type NewProductInput,
  updateDeal,
  updatePipelineStage,
  updateApprovalStatus,
  updateProduct,
} from '../services/api/crm'
import type {
  ApprovalRole,
  ApprovalStatus,
  Deal,
  DealUpdateInput,
  PipelineStageUpdateRequest,
  StageMoveRequest,
} from '../types'

export const crmKeys = {
  all: ['crm'] as const,
  deals: (search = '') => [...crmKeys.all, 'deals', search] as const,
  approvals: () => [...crmKeys.all, 'approvals'] as const,
  stages: () => [...crmKeys.all, 'stages'] as const,
  products: (category = '', vendor = '') =>
    [...crmKeys.all, 'products', category, vendor] as const,
  productSummary: () => [...crmKeys.all, 'product-summary'] as const,
  warranty: () => [...crmKeys.all, 'warranty'] as const,
  summary: () => [...crmKeys.all, 'summary'] as const,
  trend: () => [...crmKeys.all, 'trend'] as const,
  activity: () => [...crmKeys.all, 'activity'] as const,
  stageHistory: (dealId: string) => [...crmKeys.all, 'stage-history', dealId] as const,
}

export function useDeals(search?: string) {
  return useQuery({
    queryKey: crmKeys.deals(search),
    queryFn: () => fetchDeals(search),
  })
}

export function useApprovals() {
  return useQuery({
    queryKey: crmKeys.approvals(),
    queryFn: fetchApprovals,
  })
}

export function usePipelineStages() {
  return useQuery({
    queryKey: crmKeys.stages(),
    queryFn: fetchPipelineStages,
  })
}

export function useProducts(category?: string, vendor?: string) {
  return useQuery({
    queryKey: crmKeys.products(category, vendor),
    queryFn: () =>
      fetchProducts({
        category: category || undefined,
        vendor: vendor || undefined,
      }),
  })
}

export function useProductSummary() {
  return useQuery({
    queryKey: crmKeys.productSummary(),
    queryFn: fetchProductSummary,
  })
}

export function useWarrantyItems() {
  return useQuery({
    queryKey: crmKeys.warranty(),
    queryFn: fetchWarrantyItems,
  })
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: crmKeys.summary(),
    queryFn: fetchDashboardSummary,
  })
}

export function useTrendPoints() {
  return useQuery({
    queryKey: crmKeys.trend(),
    queryFn: fetchTrendPoints,
  })
}

export function useActivityItems() {
  return useQuery({
    queryKey: crmKeys.activity(),
    queryFn: fetchActivityItems,
  })
}

export function useDealStageHistory(dealId: string) {
  return useQuery({
    queryKey: crmKeys.stageHistory(dealId),
    queryFn: () => fetchDealStageHistory(dealId),
    enabled: Boolean(dealId),
  })
}

export function useCreateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NewDealInput) => createDeal(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useUpdateDeal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dealId,
      input,
    }: {
      dealId: string
      input: DealUpdateInput
    }) => updateDeal(dealId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useUpdateApprovalStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dealId,
      role,
      status,
    }: {
      dealId: string
      role: ApprovalRole
      status: ApprovalStatus
    }) => updateApprovalStatus(dealId, role, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string
      input: NewProductInput
    }) => updateProduct(productId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useImportDeals() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      defaultStage,
    }: {
      file: File
      defaultStage: string
    }) => importDealsExcel(file, defaultStage),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useMoveDealStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      dealId,
      input,
    }: {
      dealId: string
      input: StageMoveRequest
    }) => moveDealStage(dealId, input),
    onMutate: async ({ dealId, input }) => {
      await queryClient.cancelQueries({ queryKey: crmKeys.all })

      const previousDeals = queryClient.getQueriesData<Deal[]>({
        queryKey: [...crmKeys.all, 'deals'],
      })

      previousDeals.forEach(([queryKey, deals]) => {
        if (!deals) {
          return
        }

        queryClient.setQueryData<Deal[]>(
          queryKey,
          deals.map((deal) =>
            deal.id === dealId
              ? {
                  ...deal,
                  stage: input.targetStageId,
                  updatedAt: new Date().toISOString(),
                }
              : deal,
          ),
        )
      })

      return { previousDeals }
    },
    onError: (_error, _variables, context) => {
      context?.previousDeals.forEach(([queryKey, deals]) => {
        queryClient.setQueryData(queryKey, deals)
      })
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      stageId,
      input,
    }: {
      stageId: string
      input: PipelineStageUpdateRequest
    }) => updatePipelineStage(stageId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: crmKeys.all })
    },
  })
}

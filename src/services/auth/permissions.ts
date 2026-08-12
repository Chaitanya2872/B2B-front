import type { ApprovalRole } from '../../types'
import type { CurrentUser } from './auth'

export const B2B_PERMISSIONS = {
  MODULE_B2B: 'module.b2b',
  PAGE_B2B: 'page.b2b',
  DEALS_MANAGE: 'feature.b2b.deals.manage',
  PIPELINE_MANAGE: 'feature.b2b.pipeline.manage',
  PRODUCTS_MANAGE: 'feature.b2b.products.manage',
  APPROVALS_REVIEW: 'feature.b2b.approvals.review',
  ACCOUNTS_MANAGE: 'feature.b2b.accounts.manage',
  CONTACTS_MANAGE: 'feature.b2b.contacts.manage',
  LEADS_MANAGE: 'feature.b2b.leads.manage',
} as const

export const B2B_APPROVAL_ROLES = [
  'RSM',
  'Finance',
  'Business Head',
] as const satisfies readonly ApprovalRole[]

export const B2B_APPROVAL_ROLE_PERMISSIONS: Record<ApprovalRole, string> = {
  RSM: 'feature.b2b.approvals.rsm',
  Finance: 'feature.b2b.approvals.finance',
  'Business Head': 'feature.b2b.approvals.business-head',
}

export type B2BPermission =
  (typeof B2B_PERMISSIONS)[keyof typeof B2B_PERMISSIONS]

export function hasPermission(
  user: CurrentUser | null | undefined,
  permission: string,
) {
  if (!user) return false
  if (user.roles?.includes('ROLE_MASTER')) return true

  const permissions = user.permissions ?? []
  if (permissions.includes(permission)) return true

  const isB2BPermission =
    permission === B2B_PERMISSIONS.PAGE_B2B ||
    permission.startsWith('feature.b2b.')

  return isB2BPermission && permissions.includes(B2B_PERMISSIONS.MODULE_B2B)
}

export function canActOnApprovalRole(
  user: CurrentUser | null | undefined,
  role: ApprovalRole,
) {
  return (
    hasPermission(user, B2B_PERMISSIONS.APPROVALS_REVIEW) &&
    hasPermission(user, B2B_APPROVAL_ROLE_PERMISSIONS[role])
  )
}

export function getPipelineActionPermissions(
  user: CurrentUser | null | undefined,
) {
  return {
    canManageDeals: hasPermission(user, B2B_PERMISSIONS.DEALS_MANAGE),
    canManagePipeline: hasPermission(user, B2B_PERMISSIONS.PIPELINE_MANAGE),
    canManageProducts: hasPermission(user, B2B_PERMISSIONS.PRODUCTS_MANAGE),
    canReviewApprovals: hasPermission(user, B2B_PERMISSIONS.APPROVALS_REVIEW),
    canManageAccounts: hasPermission(user, B2B_PERMISSIONS.ACCOUNTS_MANAGE),
    canManageContacts: hasPermission(user, B2B_PERMISSIONS.CONTACTS_MANAGE),
    canManageLeads: hasPermission(user, B2B_PERMISSIONS.LEADS_MANAGE),
  }
}

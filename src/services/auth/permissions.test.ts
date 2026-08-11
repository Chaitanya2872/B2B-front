import { describe, expect, it } from 'vitest'
import type { CurrentUser } from './auth'
import {
  B2B_PERMISSIONS,
  canActOnApprovalRole,
  getPipelineActionPermissions,
  hasPermission,
} from './permissions'

function user(
  permissions: string[],
  roles: string[] = ['ROLE_USER'],
): CurrentUser {
  return {
    id: 'u-1',
    name: 'B2B User',
    email: 'user@example.com',
    roles,
    permissions,
  }
}

describe('B2B permission decisions', () => {
  it('exposes management actions only when feature permissions are present', () => {
    const readOnlyUser = user([B2B_PERMISSIONS.PAGE_B2B])

    expect(hasPermission(readOnlyUser, B2B_PERMISSIONS.PAGE_B2B)).toBe(true)
    expect(getPipelineActionPermissions(readOnlyUser)).toEqual({
      canManageDeals: false,
      canManagePipeline: false,
      canManageProducts: false,
      canReviewApprovals: false,
    })

    const manager = user([
      B2B_PERMISSIONS.PAGE_B2B,
      B2B_PERMISSIONS.DEALS_MANAGE,
      B2B_PERMISSIONS.PRODUCTS_MANAGE,
    ])

    expect(getPipelineActionPermissions(manager).canManageDeals).toBe(true)
    expect(getPipelineActionPermissions(manager).canManageProducts).toBe(true)
    expect(getPipelineActionPermissions(manager).canManagePipeline).toBe(false)
  })

  it('treats module.b2b as broad B2B access in the frontend guard', () => {
    const moduleUser = user([B2B_PERMISSIONS.MODULE_B2B])

    expect(hasPermission(moduleUser, B2B_PERMISSIONS.PAGE_B2B)).toBe(true)
    expect(hasPermission(moduleUser, B2B_PERMISSIONS.DEALS_MANAGE)).toBe(true)
  })

  it('requires the backend role-specific approval authority for approval buttons', () => {
    const reviewerOnly = user([
      B2B_PERMISSIONS.PAGE_B2B,
      B2B_PERMISSIONS.APPROVALS_REVIEW,
    ])
    const financeReviewer = user([
      B2B_PERMISSIONS.PAGE_B2B,
      B2B_PERMISSIONS.APPROVALS_REVIEW,
      'feature.b2b.approvals.finance',
    ])

    expect(canActOnApprovalRole(reviewerOnly, 'Finance')).toBe(false)
    expect(canActOnApprovalRole(financeReviewer, 'Finance')).toBe(true)
    expect(canActOnApprovalRole(financeReviewer, 'RSM')).toBe(false)
  })
})

import {
  LayoutDashboard,
  LayoutGrid,
  PackageSearch,
  CheckSquare,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { ApprovalRole } from '../types'
import { B2B_APPROVAL_ROLES } from '../services/auth/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/pipeline', label: 'Pipeline', icon: LayoutGrid },
  { to: '/products', label: 'Products', icon: PackageSearch },
  { to: '/approvals', label: 'Approvals', icon: CheckSquare },
  { to: '/warranty', label: 'Warranty & AMC', icon: ShieldCheck },
]

export const APPROVAL_FLOW: Record<
  'quotation' | 'order_placed',
  ApprovalRole[]
> = {
  quotation: [...B2B_APPROVAL_ROLES],
  order_placed: ['RSM', 'Finance'],
}

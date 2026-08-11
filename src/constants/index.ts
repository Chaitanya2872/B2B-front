import {
  LayoutDashboard,
  LayoutGrid,
  PackageSearch,
  CheckSquare,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { ApprovalRole } from '../types'

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

export const APPROVAL_FLOW: Record<'quotation' | 'order_placed', ApprovalRole[]> = {
  quotation: ['Solution', 'RSM', 'Finance', 'BusinessHead'],
  order_placed: ['RSM', 'Finance'],
}

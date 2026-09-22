import {
  Building2,
  LayoutDashboard,
  LayoutGrid,
  PackageSearch,
  CheckSquare,
  ShieldCheck,
  Users,
  type LucideIcon,
} from 'lucide-react'
import type { ApprovalRole } from '../types'
import { B2B_APPROVAL_ROLES } from '../services/auth/permissions'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  group: 'workspace' | 'management'
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, group: 'workspace' },
  { to: '/pipeline', label: 'Deals', icon: LayoutGrid, group: 'workspace' },
  { to: '/contacts', label: 'Contacts', icon: Users, group: 'workspace' },
  { to: '/accounts', label: 'Accounts', icon: Building2, group: 'workspace' },
  {
    to: '/products',
    label: 'Products',
    icon: PackageSearch,
    group: 'workspace',
  },
  {
    to: '/approvals',
    label: 'Approvals',
    icon: CheckSquare,
    group: 'management',
  },
  {
    to: '/warranty',
    label: 'Warranty & AMC',
    icon: ShieldCheck,
    group: 'management',
  },
]

export const APPROVAL_FLOW: Record<
  'quotation' | 'order_placed',
  ApprovalRole[]
> = {
  quotation: [...B2B_APPROVAL_ROLES],
  order_placed: ['RSM', 'Finance'],
}

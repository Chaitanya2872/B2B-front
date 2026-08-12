export type StageId = string

export type Priority = 'low' | 'medium' | 'high'

export type ApprovalRole = 'RSM' | 'Finance' | 'Business Head'

export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export type RiskStatus =
  'healthy' | 'attention' | 'overdue' | 'stalled' | 'high_risk'

export interface ApprovalStep {
  role: ApprovalRole
  status: ApprovalStatus
  actedByUserId?: string
  actedByName?: string
  actedByEmail?: string
  actedAt?: string
}

export interface Person {
  name: string
  initials: string
}

export interface Deal {
  id: string
  company: string
  contact: string
  product: string
  accountManager: Person
  stage: StageId
  stageLabel: string
  value: number
  priority: Priority
  updatedAt: string
  expectedClosureDate: string
  nextActivity: string
  nextActivityDueDate: string
  oemVendor: string
  riskStatus: RiskStatus
  probabilityPercent: number
  weightedValue: number
  daysInStage: number
  approvals: ApprovalStep[]
  extraFields: Record<string, string>
}

export type WarrantyStatus = 'active' | 'expiring' | 'expired'
export type AmcStatus = 'active' | 'due' | 'none'

export interface WarrantyItem {
  id: string
  company: string
  product: string
  serialNumber: string
  startDate: string
  endDate: string
  status: WarrantyStatus
  amcStatus: AmcStatus
}

export interface ProductCatalogItem {
  id: string
  name: string
  category: string
  vendor: string
  sku: string
}

export interface ProductCatalogSummary {
  categories: string[]
  vendors: string[]
}

export interface AllowedStageTransition {
  stageId: StageId
  confirmationRequired: boolean
}

export interface PipelineStage {
  id: StageId
  name: string
  shortLabel: string
  displayOrder: number
  probabilityPercent: number
  color: string
  maxExpectedDurationDays: number
  mandatoryFields: string[]
  requiredApprovals: ApprovalRole[]
  allowedNextStages: AllowedStageTransition[]
}

export interface TrendPoint {
  label: string
  value: number
}

export interface ActivityItem {
  id: string
  company: string
  stage: StageId
  updatedAt: string
}

export interface DashboardSummary {
  totalValue: number
  weightedPipelineValue: number
  openDeals: number
  pendingApprovals: number
  inDelivery: number
  stalledDeals: number
  funnelCounts: Record<string, number>
}

export interface StageMoveRequest {
  targetStageId: StageId
  remarks?: string
  confirmed?: boolean
}

export interface PipelineStageUpdateRequest {
  name: string
  shortLabel: string
  displayOrder: number
  probabilityPercent: number
  color: string
  maxExpectedDurationDays: number
  mandatoryFields: string[]
  requiredApprovals: ApprovalRole[]
  allowedNextStages: AllowedStageTransition[]
}

export interface DealUpdateInput {
  company: string
  contact: string
  product: string
  value: number
  accountManager: string
  priority: Priority
  expectedClosureDate: string
  nextActivity: string
  nextActivityDueDate: string
  oemVendor: string
  extraFields: Record<string, string>
}

export interface DealStageHistoryItem {
  fromStage: StageId
  toStage: StageId
  changedAt: string
  changedBy: string
  remarks?: string
}

export interface ImportDealsResponse {
  importedCount: number
  skippedRows: number
  detectedHeaders: string[]
  dynamicHeaders: string[]
}

export interface Account {
  id: string
  name: string
  industry: string
  website: string
  phone: string
  address: string
  accountManager: string
}

export interface AccountInput {
  name: string
  industry: string
  website: string
  phone: string
  address: string
  accountManager: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  title: string
  accountName: string
}

export interface ContactInput {
  name: string
  email: string
  phone: string
  title: string
  accountName: string
}

export type LeadStatus =
  'new_lead' | 'contacted' | 'qualified' | 'unqualified' | 'converted' | 'lost'

export interface Lead {
  id: string
  company: string
  contactName: string
  email: string
  phone: string
  source: string
  owner: string
  status: LeadStatus
  score: number
  notes: string
  createdAt: string
  updatedAt: string
  convertedAccountId: string | null
  convertedContactId: string | null
  convertedDealId: string | null
}

export interface LeadInput {
  company: string
  contactName: string
  email: string
  phone: string
  source: string
  owner: string
  status?: LeadStatus
  score: number
  notes: string
}

export interface ConvertLeadInput {
  accountName: string
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  createOpportunity: boolean
  product?: string
  value?: number
  stageId?: string
}

export interface ConvertLeadResult {
  leadId: string
  accountId: string
  accountName: string
  contactId: string | null
  contactName: string | null
  dealId: string | null
}

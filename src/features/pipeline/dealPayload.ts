import type { Deal, DealUpdateInput, Priority } from '../../types'

export interface DealEditValues {
  company: string
  contact: string
  product: string
  value: string
  accountManager: string
  priority: Priority
  expectedClosureDate: string
  nextActivity: string
  nextActivityDueDate: string
  oemVendor: string
  extraFields?: Record<string, string>
}

export function buildDealUpdateInput(
  deal: Deal,
  values: DealEditValues,
): DealUpdateInput {
  return {
    company: values.company,
    contact: values.contact,
    product: values.product,
    value: Number(values.value || 0),
    accountManager: values.accountManager,
    priority: values.priority,
    expectedClosureDate: values.expectedClosureDate,
    nextActivity: values.nextActivity,
    nextActivityDueDate: values.nextActivityDueDate,
    oemVendor: values.oemVendor,
    extraFields: {
      ...(deal.extraFields ?? {}),
      ...(values.extraFields ?? {}),
    },
  }
}

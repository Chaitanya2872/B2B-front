import { describe, expect, it } from 'vitest'
import { buildDealUpdateInput } from './dealPayload'
import type { Deal } from '../../types'

function dealWithExtraFields(extraFields: Record<string, string>): Deal {
  return {
    id: 'D-1',
    company: 'Original Co',
    contact: 'Original Contact',
    product: 'Original Requirement',
    accountManager: { name: 'Sales Manager', initials: 'SM' },
    stage: 'quotation',
    stageLabel: 'Quotation',
    value: 1000000,
    priority: 'high',
    updatedAt: '2026-08-11T00:00:00.000Z',
    expectedClosureDate: '',
    nextActivity: '',
    nextActivityDueDate: '',
    oemVendor: '',
    riskStatus: 'healthy',
    probabilityPercent: 55,
    weightedValue: 550000,
    daysInStage: 1,
    approvals: [],
    extraFields,
  }
}

describe('deal update payloads', () => {
  it('preserves imported reference and remarks extra fields during edits', () => {
    const input = buildDealUpdateInput(
      dealWithExtraFields({
        reference: 'REF-101',
        remarks: 'Imported workbook note',
        sourceSheet: 'August',
      }),
      {
        company: 'Updated Co',
        contact: 'Updated Contact',
        product: 'Updated Requirement',
        value: '2500000',
        accountManager: 'Updated Manager',
        priority: 'medium',
        expectedClosureDate: '',
        nextActivity: 'Follow up',
        nextActivityDueDate: '',
        oemVendor: 'Cisco',
        extraFields: {
          sourceSheet: 'September',
        },
      },
    )

    expect(input.extraFields).toEqual({
      reference: 'REF-101',
      remarks: 'Imported workbook note',
      sourceSheet: 'September',
    })
    expect(input.product).toBe('Updated Requirement')
    expect(input.value).toBe(2500000)
  })
})

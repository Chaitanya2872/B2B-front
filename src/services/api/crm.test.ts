import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios'
import {
  fetchDeals,
  importDealsExcel,
  normalizeDeal,
  updateApprovalStatus,
  updateDeal,
} from './crm'
import { apiClient } from './client'
import type { Deal, DealUpdateInput } from '../../types'

function response(config: InternalAxiosRequestConfig, data: unknown) {
  return {
    config,
    data,
    headers: {},
    status: 200,
    statusText: 'OK',
  }
}

function parsePayload(data: unknown) {
  return typeof data === 'string' ? JSON.parse(data) : data
}

function rawDeal(overrides: Partial<Deal> = {}) {
  return {
    id: 'D-1',
    company: 'Goa UWR',
    contact: 'Director',
    product: 'AI Ship Silencing',
    accountManager: { name: 'Sales Manager', initials: 'SM' },
    stage: 'quotation',
    stageLabel: 'Quotation',
    value: 1000000,
    priority: 'high',
    updatedAt: '2026-08-11T00:00:00.000Z',
    expectedClosureDate: '',
    nextActivity: '',
    nextActivityDueDate: '',
    oemVendor: 'Cisco',
    riskStatus: 'healthy',
    probabilityPercent: 55,
    weightedValue: 550000,
    daysInStage: 2,
    approvals: [],
    extraFields: {},
    ...overrides,
  } satisfies Deal
}

afterEach(() => {
  apiClient.defaults.adapter = undefined
  vi.restoreAllMocks()
})

describe('B2B CRM API functions', () => {
  it('loads deals with search and normalizes approval roles plus extra fields', async () => {
    apiClient.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('get')
      expect(config.url).toBe('/deals')
      expect(config.params).toEqual({ search: 'goa' })

      return response(config, [
        {
          ...rawDeal({
            extraFields: { reference: 'REF-7', remarks: 'Imported row' },
          }),
          approvals: [
            { role: 'Solution', status: 'pending' },
            { role: 'BusinessHead', status: 'pending' },
          ],
        },
      ])
    }) as AxiosAdapter

    const deals = await fetchDeals('goa')

    expect(deals).toHaveLength(1)
    expect(deals[0].approvals).toEqual([
      { role: 'Business Head', status: 'pending' },
    ])
    expect(deals[0].extraFields.reference).toBe('REF-7')
  })

  it('updates a deal with whole rupee values and preserved extra fields', async () => {
    const input: DealUpdateInput = {
      company: 'Goa UWR',
      contact: 'Director',
      product: 'Enterprise Wi-Fi',
      value: 2500000,
      accountManager: 'Sales Manager',
      priority: 'medium',
      expectedClosureDate: '',
      nextActivity: 'Review scope',
      nextActivityDueDate: '',
      oemVendor: 'Cisco',
      extraFields: { reference: 'REF-8', remarks: 'Keep this' },
    }
    let payload: unknown

    apiClient.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('put')
      expect(config.url).toBe('/deals/D-1')
      payload = parsePayload(config.data)
      return response(config, rawDeal({ product: input.product }))
    }) as AxiosAdapter

    await updateDeal('D-1', input)

    expect(payload).toMatchObject({
      product: 'Enterprise Wi-Fi',
      value: 2500000,
      extraFields: { reference: 'REF-8', remarks: 'Keep this' },
    })
  })

  it('posts Excel import as multipart form data with the default stage', async () => {
    const payloads: FormData[] = []

    apiClient.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('post')
      expect(config.url).toBe('/deals/import-excel')
      payloads.push(config.data as FormData)
      return response(config, {
        importedCount: 2,
        skippedRows: 1,
        detectedHeaders: ['company', 'solution', 'reference'],
        dynamicHeaders: ['reference'],
      })
    }) as AxiosAdapter

    const file = new File(['company,solution'], 'deals.xlsx')
    const result = await importDealsExcel(file, 'suspect')

    expect(result.importedCount).toBe(2)
    expect(payloads[0]?.get('file')).toBe(file)
    expect(payloads[0]?.get('defaultStage')).toBe('suspect')
  })

  it('sends only valid documented approval roles to approval actions', async () => {
    let payload: unknown

    apiClient.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('patch')
      expect(config.url).toBe('/deals/D-1/approvals')
      payload = parsePayload(config.data)
      return response(config, rawDeal())
    }) as AxiosAdapter

    await updateApprovalStatus('D-1', 'Business Head', 'approved')

    expect(payload).toEqual({
      role: 'Business Head',
      status: 'approved',
    })
  })

  it('drops legacy Solution approval steps during normalization', () => {
    const deal = normalizeDeal({
      ...rawDeal(),
      approvals: [
        { role: 'Solution', status: 'pending' },
        { role: 'RSM', status: 'approved' },
      ],
      extraFields: null,
    })

    expect(deal.approvals).toEqual([{ role: 'RSM', status: 'approved' }])
    expect(deal.extraFields).toEqual({})
  })
})

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrency(value: number): string {
  return inr.format(value)
}

export function timeAgo(date: string): string {
  return dayjs(date).fromNow()
}

export function formatDate(date: string): string {
  return dayjs(date).format('D MMM YYYY')
}

export function formatCompactCurrency(value: number): string {
  if (value >= 10000000) return `Rs ${+(value / 10000000).toFixed(1)}Cr`
  if (value >= 100000) return `Rs ${+(value / 100000).toFixed(1)}L`
  if (value >= 1000) return `Rs ${+(value / 1000).toFixed(1)}K`
  return `Rs ${value}`
}

export function formatStageLabel(stageId: string): string {
  return stageId
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatApprovalRole(role: string): string {
  if (role === 'BusinessHead') {
    return 'Business Head'
  }

  return role
}

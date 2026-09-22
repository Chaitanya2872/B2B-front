import {
  Cable,
  Camera,
  KeyRound,
  Network,
  Package,
  ShieldCheck,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

export function categoryIcon(category: string): LucideIcon {
  const value = category.toLowerCase()
  if (value.includes('wifi') || value.includes('wireless')) {
    return Wifi
  }
  if (
    value.includes('cctv') ||
    value.includes('camera') ||
    value.includes('surveillance')
  ) {
    return Camera
  }
  if (value.includes('access') || value.includes('lock')) {
    return KeyRound
  }
  if (value.includes('security')) {
    return ShieldCheck
  }
  if (value.includes('switch')) {
    return Network
  }
  if (
    value.includes('network') ||
    value.includes('cable') ||
    value.includes('structured')
  ) {
    return Cable
  }
  return Package
}

const VENDOR_AVATAR_COLORS = [
  '#e8640c',
  '#0ea5e9',
  '#16a34a',
  '#7c3aed',
  '#d97706',
  '#db2777',
  '#0891b2',
  '#65a30d',
]

export function vendorAvatarColor(vendor: string): string {
  let hash = 0
  for (let index = 0; index < vendor.length; index += 1) {
    hash = (hash * 31 + vendor.charCodeAt(index)) >>> 0
  }
  return VENDOR_AVATAR_COLORS[hash % VENDOR_AVATAR_COLORS.length]
}

export function vendorInitials(vendor: string): string {
  const parts = vendor.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return '?'
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function getVisiblePages(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }
  const pageSet = new Set(
    [1, total, current - 1, current, current + 1].filter(
      (page) => page >= 1 && page <= total,
    ),
  )
  const sorted = [...pageSet].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push('ellipsis')
    }
    result.push(page)
  })
  return result
}

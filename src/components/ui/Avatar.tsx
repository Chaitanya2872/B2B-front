import type { Person } from '../../types'
import './Avatar.css'

const PALETTE = [
  '#6c47ff',
  '#0ea5e9',
  '#f97316',
  '#16a34a',
  '#e11d48',
  '#8b5cf6',
  '#0891b2',
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

interface AvatarProps {
  person: Person
  size?: number
}

export function Avatar({ person, size = 28 }: AvatarProps) {
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: colorFor(person.name),
      }}
      title={person.name}
    >
      {person.initials}
    </div>
  )
}

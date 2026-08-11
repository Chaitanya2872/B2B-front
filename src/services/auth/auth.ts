export interface AuthUser {
  id: string
  name: string
  initials: string
  role: string
  identity: string
}

export interface AuthSession {
  token: string
  user: AuthUser
  rememberMe: boolean
  createdAt: string
}

export interface LoginCredentials {
  identity: string
  password: string
  rememberMe: boolean
}

const AUTH_STORAGE_KEY = 'acs-sales-os-auth-session'
const DEMO_LOGIN_DELAY_MS = 650

function getStorage(kind: 'local' | 'session') {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') {
    return false
  }

  const user = value as Partial<AuthUser>
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    typeof user.initials === 'string' &&
    typeof user.role === 'string' &&
    typeof user.identity === 'string'
  )
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AuthSession>
  return (
    typeof session.token === 'string' &&
    typeof session.rememberMe === 'boolean' &&
    typeof session.createdAt === 'string' &&
    isAuthUser(session.user)
  )
}

function parseSession(rawSession: string | null) {
  if (!rawSession) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(rawSession)
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

function toDisplayName(identity: string) {
  const baseName = identity.includes('@') ? identity.split('@')[0] : identity
  const words = baseName
    .replace(/[_-]+/g, '.')
    .split('.')
    .map((word) => word.trim())
    .filter(Boolean)

  if (!words.length) {
    return 'ACS User'
  }

  return words
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function toInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials || 'AU'
}

function createSession(identity: string, rememberMe: boolean): AuthSession {
  const normalizedIdentity = identity.trim()
  const name = toDisplayName(normalizedIdentity)

  return {
    token: `acs-demo-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    rememberMe,
    createdAt: new Date().toISOString(),
    user: {
      id: normalizedIdentity.toLowerCase(),
      name,
      initials: toInitials(name),
      role: 'Account Manager',
      identity: normalizedIdentity,
    },
  }
}

function persistSession(session: AuthSession) {
  const local = getStorage('local')
  const sessionStore = getStorage('session')
  const target = session.rememberMe ? local : sessionStore
  const other = session.rememberMe ? sessionStore : local

  other?.removeItem(AUTH_STORAGE_KEY)
  target?.setItem(AUTH_STORAGE_KEY, JSON.stringify(session))
}

export function getSession() {
  const sessionStore = getStorage('session')
  const local = getStorage('local')

  return (
    parseSession(sessionStore?.getItem(AUTH_STORAGE_KEY) ?? null) ??
    parseSession(local?.getItem(AUTH_STORAGE_KEY) ?? null)
  )
}

export function isAuthenticated() {
  return getSession() !== null
}

export async function login(credentials: LoginCredentials) {
  await new Promise((resolve) => setTimeout(resolve, DEMO_LOGIN_DELAY_MS))

  if (credentials.password === 'error') {
    throw new Error('Demo credentials rejected')
  }

  const session = createSession(credentials.identity, credentials.rememberMe)
  persistSession(session)
  return session
}

export function logout() {
  getStorage('local')?.removeItem(AUTH_STORAGE_KEY)
  getStorage('session')?.removeItem(AUTH_STORAGE_KEY)
}

import {
  apiClient,
  clearAuthTokens,
  ensureApiSession,
  getRefreshToken,
  hasStoredSession,
  rawApiClient,
  storeAuthTokens,
  toApiError,
} from '../api/client'

export interface CurrentUser {
  id: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt?: string
  refreshTokenExpiresAt?: string
  user: CurrentUser
}

export interface AuthSession extends AuthTokens {
  rememberMe: boolean
}

export interface LoginCredentials {
  identity: string
  password: string
  rememberMe: boolean
}

export function initialsFromName(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')

  return initials || 'AU'
}

export function displayRole(user: CurrentUser | null | undefined) {
  const role = user?.roles?.[0]
  if (!role) return 'B2B User'

  return role
    .replace(/^ROLE_/, '')
    .toLowerCase()
    .split('_')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ')
}

export function isAuthenticated() {
  return hasStoredSession()
}

export async function login(credentials: LoginCredentials) {
  try {
    const response = await rawApiClient.post<AuthTokens>('/auth/login', {
      email: credentials.identity.trim(),
      password: credentials.password,
    })
    storeAuthTokens(response.data, credentials.rememberMe)
    return { ...response.data, rememberMe: credentials.rememberMe }
  } catch (error) {
    throw toApiError(error, 'Email or password was not accepted.')
  }
}

export async function refresh() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw toApiError(
      new Error('No refresh token available.'),
      'No session found.',
    )
  }

  try {
    const response = await rawApiClient.post<AuthTokens>('/auth/refresh', {
      refreshToken,
    })
    storeAuthTokens(response.data)
    return response.data
  } catch (error) {
    throw toApiError(error, 'Unable to refresh the session.')
  }
}

export async function fetchCurrentUser() {
  try {
    await ensureApiSession()
    const response = await apiClient.get<CurrentUser>('/auth/me')
    return response.data
  } catch (error) {
    throw toApiError(error, 'Unable to load the current user.')
  }
}

export async function logout() {
  const refreshToken = getRefreshToken()

  try {
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken })
    }
  } finally {
    clearAuthTokens()
  }
}

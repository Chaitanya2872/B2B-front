import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'
import { API_BASE_URL } from './config'

const ACCESS_TOKEN_KEY = 'acs-sales-os.accessToken'
const REFRESH_TOKEN_KEY = 'acs-sales-os.refreshToken'
const AUTH_PERSISTENCE_KEY = 'acs-sales-os.authPersistence'

type PersistenceKind = 'local' | 'session'

interface TokenResponse {
  accessToken: string
  refreshToken?: string
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'validation'
  | 'conflict'
  | 'rateLimited'
  | 'server'
  | 'unknown'

export class ApiError extends Error {
  readonly status: number | null
  readonly kind: ApiErrorKind

  constructor(
    message: string,
    options: {
      status?: number | null
      kind?: ApiErrorKind
      cause?: unknown
    } = {},
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status ?? null
    this.kind = options.kind ?? classifyHttpStatus(this.status)
    if (options.cause !== undefined) {
      this.cause = options.cause
    }
  }
}

export class MissingSessionError extends ApiError {
  constructor() {
    super('No active session found.', { status: null, kind: 'unauthorized' })
    this.name = 'MissingSessionError'
  }
}

export function classifyHttpStatus(
  status: number | null | undefined,
): ApiErrorKind {
  if (status == null) return 'network'
  if (status === 401) return 'unauthorized'
  if (status === 403) return 'forbidden'
  if (status === 404) return 'notFound'
  if (status === 400 || status === 422) return 'validation'
  if (status === 409) return 'conflict'
  if (status === 429) return 'rateLimited'
  if (status >= 500) return 'server'
  return 'unknown'
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export const rawApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
})

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  withCredentials: false,
})

let ensureSessionPromise: Promise<void> | null = null
let refreshSessionPromise: Promise<void> | null = null
const sessionListeners = new Set<() => void>()

function getStorage(kind: PersistenceKind) {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

function getStoredPersistence(): PersistenceKind | null {
  const value =
    getStorage('local')?.getItem(AUTH_PERSISTENCE_KEY) ??
    getStorage('session')?.getItem(AUTH_PERSISTENCE_KEY)

  return value === 'local' || value === 'session' ? value : null
}

function getTokenLocation(key: string): PersistenceKind | null {
  if (getStorage('session')?.getItem(key)) return 'session'
  if (getStorage('local')?.getItem(key)) return 'local'
  return null
}

function readToken(key: string) {
  const preferred = getStoredPersistence()
  const primary = preferred ? getStorage(preferred)?.getItem(key) : null
  if (primary) return primary

  return (
    getStorage('session')?.getItem(key) ??
    getStorage('local')?.getItem(key) ??
    null
  )
}

export function getAccessToken() {
  return readToken(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return readToken(REFRESH_TOKEN_KEY)
}

export function hasStoredSession() {
  return Boolean(getAccessToken() || getRefreshToken())
}

function notifySessionChange() {
  for (const listener of [...sessionListeners]) {
    listener()
  }
}

export function subscribeToSession(listener: () => void) {
  sessionListeners.add(listener)
  return () => {
    sessionListeners.delete(listener)
  }
}

export function getSessionSnapshot() {
  return hasStoredSession()
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (
      event.key !== null &&
      event.key !== ACCESS_TOKEN_KEY &&
      event.key !== REFRESH_TOKEN_KEY &&
      event.key !== AUTH_PERSISTENCE_KEY
    ) {
      return
    }
    notifySessionChange()
  })
}

export function storeAuthTokens(
  tokens: Partial<TokenResponse>,
  rememberMe?: boolean,
) {
  const targetKind: PersistenceKind =
    rememberMe === undefined
      ? (getStoredPersistence() ??
        getTokenLocation(REFRESH_TOKEN_KEY) ??
        getTokenLocation(ACCESS_TOKEN_KEY) ??
        'session')
      : rememberMe
        ? 'local'
        : 'session'

  const target = getStorage(targetKind)
  const other = getStorage(targetKind === 'local' ? 'session' : 'local')
  if (!target) return

  const hadSession = hasStoredSession()

  other?.removeItem(ACCESS_TOKEN_KEY)
  other?.removeItem(REFRESH_TOKEN_KEY)
  other?.removeItem(AUTH_PERSISTENCE_KEY)
  target.setItem(AUTH_PERSISTENCE_KEY, targetKind)

  if (typeof tokens.accessToken === 'string' && tokens.accessToken) {
    target.setItem(ACCESS_TOKEN_KEY, tokens.accessToken)
  }
  if (typeof tokens.refreshToken === 'string' && tokens.refreshToken) {
    target.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken)
  }

  if (!hadSession && hasStoredSession()) {
    notifySessionChange()
  }
}

export function clearAuthTokens() {
  const hadSession = hasStoredSession()

  for (const kind of ['local', 'session'] as const) {
    const storage = getStorage(kind)
    storage?.removeItem(ACCESS_TOKEN_KEY)
    storage?.removeItem(REFRESH_TOKEN_KEY)
    storage?.removeItem(AUTH_PERSISTENCE_KEY)
  }

  if (hadSession) {
    notifySessionChange()
  }
}

export function isCredentialExchangeRoute(url?: string) {
  if (!url) return false
  const path = url.split('?')[0].replace(/\/+$/, '')
  return ['/auth/login', '/auth/refresh'].some(
    (route) => path === route || path.endsWith(route),
  )
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Something went wrong.',
) {
  const body = (error as { response?: { data?: unknown } })?.response?.data

  if (typeof body === 'string' && body.trim()) {
    return body
  }

  const responseMessage = (body as { message?: unknown } | undefined)?.message
  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

function getResponseStatus(error: unknown) {
  const status = (error as { response?: { status?: unknown } })?.response
    ?.status
  return typeof status === 'number' ? status : null
}

export function toApiError(error: unknown, fallback: string): ApiError {
  if (isApiError(error)) return error
  const status = getResponseStatus(error)
  return new ApiError(getApiErrorMessage(error, fallback), {
    status,
    kind: classifyHttpStatus(status),
    cause: error,
  })
}

export function isSessionFailure(error: unknown) {
  if (error instanceof MissingSessionError) return true
  if (isApiError(error)) return error.kind === 'unauthorized'
  return getResponseStatus(error) === 401
}

async function refreshSession() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new MissingSessionError()
  }

  try {
    const response = await rawApiClient.post<TokenResponse>('/auth/refresh', {
      refreshToken,
    })
    storeAuthTokens(response.data)
  } catch (error) {
    const status = getResponseStatus(error)
    if (status === 400 || status === 401 || status === 403) {
      throw new MissingSessionError()
    }
    throw error
  }
}

export async function ensureApiSession() {
  if (getAccessToken()) {
    return
  }

  if (ensureSessionPromise) {
    return ensureSessionPromise
  }

  ensureSessionPromise = (async () => {
    try {
      await refreshSession()
    } catch (error) {
      if (isSessionFailure(error)) {
        clearAuthTokens()
      }
      throw error
    } finally {
      ensureSessionPromise = null
    }
  })()

  return ensureSessionPromise
}

function withAuthHeader(config: InternalAxiosRequestConfig) {
  const token = getAccessToken()
  if (token) {
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = AxiosHeaders.from(config.headers)
    }
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
}

function sentAccessToken(config: InternalAxiosRequestConfig) {
  const header = AxiosHeaders.from(config.headers).get('Authorization')
  return typeof header === 'string'
    ? header.replace(/^Bearer\s+/i, '') || null
    : null
}

apiClient.interceptors.request.use((config) => withAuthHeader(config))

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const config = error.config as RetryConfig | undefined

    if (
      !config ||
      config._retry ||
      error.response?.status !== 401 ||
      isCredentialExchangeRoute(config.url)
    ) {
      return Promise.reject(toApiError(error, 'The API request failed.'))
    }

    config._retry = true

    try {
      if (getAccessToken() && getAccessToken() !== sentAccessToken(config)) {
        return apiClient(withAuthHeader(config))
      }

      if (!getRefreshToken()) {
        clearAuthTokens()
        return Promise.reject(toApiError(error, 'Your session has expired.'))
      }

      if (!refreshSessionPromise) {
        refreshSessionPromise = (async () => {
          try {
            await refreshSession()
          } catch (refreshError) {
            if (isSessionFailure(refreshError)) {
              clearAuthTokens()
            }
            throw refreshError
          } finally {
            refreshSessionPromise = null
          }
        })()
      }

      await refreshSessionPromise
      return apiClient(withAuthHeader(config))
    } catch (refreshError) {
      if (isSessionFailure(refreshError)) {
        clearAuthTokens()
      }
      return Promise.reject(
        toApiError(refreshError, 'Your session has expired.'),
      )
    }
  },
)

import { afterEach, describe, expect, it, vi } from 'vitest'
import { AxiosHeaders, type AxiosAdapter } from 'axios'

function createStorage() {
  const entries = new Map<string, string>()

  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => entries.set(key, value),
    removeItem: (key: string) => entries.delete(key),
    clear: () => entries.clear(),
    key: (index: number) => Array.from(entries.keys())[index] ?? null,
    get length() {
      return entries.size
    },
  } satisfies Storage
}

async function loadAuthModules() {
  vi.resetModules()
  vi.stubGlobal('window', {
    localStorage: createStorage(),
    sessionStorage: createStorage(),
    addEventListener: vi.fn(),
  })

  const client = await import('../api/client')
  const auth = await import('./auth')
  return { client, auth }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Identity Service login and token usage', () => {
  it('posts to /auth/login, stores returned tokens, and sends Bearer auth', async () => {
    const { client, auth } = await loadAuthModules()

    client.rawApiClient.defaults.adapter = vi.fn(async (config) => {
      expect(config.method).toBe('post')
      expect(config.url).toBe('/auth/login')
      expect(JSON.parse(String(config.data))).toEqual({
        email: 'rsm@example.com',
        password: 'secret-pass',
      })

      return {
        config,
        data: {
          accessToken: 'access-1',
          refreshToken: 'refresh-1',
          user: {
            id: 'u-1',
            name: 'Regional Manager',
            email: 'rsm@example.com',
            roles: ['ROLE_USER'],
            permissions: ['page.b2b'],
          },
        },
        headers: {},
        status: 200,
        statusText: 'OK',
      }
    }) satisfies AxiosAdapter

    const session = await auth.login({
      identity: 'rsm@example.com',
      password: 'secret-pass',
      rememberMe: true,
    })

    expect(session.user.email).toBe('rsm@example.com')
    expect(client.getAccessToken()).toBe('access-1')

    let authorizationHeader: string | null = null
    client.apiClient.defaults.adapter = vi.fn(async (config) => {
      const header = AxiosHeaders.from(config.headers).get('Authorization')
      authorizationHeader = typeof header === 'string' ? header : null

      return {
        config,
        data: [],
        headers: {},
        status: 200,
        statusText: 'OK',
      }
    }) satisfies AxiosAdapter

    await client.apiClient.get('/deals')

    expect(authorizationHeader).toBe('Bearer access-1')
  })
})

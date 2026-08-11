import { useEffect, useSyncExternalStore } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  clearAuthTokens,
  getRefreshToken,
  getSessionSnapshot,
  hasStoredSession,
  isSessionFailure,
  subscribeToSession,
} from '../services/api/client'
import {
  fetchCurrentUser,
  login,
  logout,
  type LoginCredentials,
} from '../services/auth/auth'

export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'me'] as const,
}

export function useCurrentUser(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? hasStoredSession()

  return useQuery({
    queryKey: authKeys.currentUser(),
    queryFn: fetchCurrentUser,
    enabled,
    staleTime: 5 * 60_000,
    retry: (failureCount, error) =>
      !isSessionFailure(error) && failureCount < 2,
  })
}

export function useStoredSession() {
  return useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    () => false,
  )
}

export function useSessionSync() {
  const queryClient = useQueryClient()

  useEffect(
    () =>
      subscribeToSession(() => {
        if (hasStoredSession()) return
        queryClient.removeQueries({ queryKey: authKeys.currentUser() })
      }),
    [queryClient],
  )
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginCredentials) => login(credentials),
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser(), session.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken()
      await logout()
      return refreshToken
    },
    onSettled: () => {
      clearAuthTokens()
      queryClient.clear()
    },
  })
}

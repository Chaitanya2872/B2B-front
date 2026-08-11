import { isApiError, isSessionFailure } from '../services/api/client'

interface QueryStateCopy {
  title: string
  detail: string
}

export function getQueryStateCopy(
  error: unknown,
  fallback: QueryStateCopy,
): QueryStateCopy {
  if (isSessionFailure(error)) {
    return {
      title: 'Session expired',
      detail: 'Sign in again to continue working with B2B data.',
    }
  }

  if (isApiError(error) && error.kind === 'forbidden') {
    return {
      title: 'Access denied',
      detail: 'Your account does not have permission for this B2B action.',
    }
  }

  if (isApiError(error) && error.message) {
    return {
      title: fallback.title,
      detail: error.message,
    }
  }

  return fallback
}

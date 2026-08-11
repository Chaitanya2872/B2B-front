import { useEffect, type ReactNode } from 'react'
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router-dom'
import { QueryState } from '../components/ui/QueryState'
import { MainLayout } from '../layouts/MainLayout'
import { Overview } from '../pages/Overview'
import { Home } from '../pages/Home'
import { Products } from '../pages/Products'
import { Approvals } from '../pages/Approvals'
import { WarrantyAmc } from '../pages/WarrantyAmc'
import { Login } from '../pages/Login'
import { clearAuthTokens, isSessionFailure } from '../services/api/client'
import { B2B_PERMISSIONS, hasPermission } from '../services/auth/permissions'
import {
  useCurrentUser,
  useSessionSync,
  useStoredSession,
} from '../hooks/useAuth'

function AuthStatusScreen({
  title,
  detail,
}: {
  title: string
  detail: string
}) {
  return (
    <main className="login-page">
      <section className="login-form-panel card" style={{ margin: 'auto' }}>
        <QueryState title={title} detail={detail} />
      </section>
    </main>
  )
}

function AuthUnreachableScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="login-page">
      <section className="login-form-panel card" style={{ margin: 'auto' }}>
        <QueryState
          title="Server unavailable"
          detail="Your session was not rejected, but the API did not respond."
          tone="danger"
        />
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: '1rem', width: '100%' }}
          onClick={onRetry}
        >
          Retry
        </button>
      </section>
    </main>
  )
}

function ProtectedRoutes() {
  const sessionPresent = useStoredSession()
  const currentUserQuery = useCurrentUser({ enabled: sessionPresent })
  const sessionRejected =
    currentUserQuery.isError && isSessionFailure(currentUserQuery.error)

  useSessionSync()

  useEffect(() => {
    if (sessionRejected) {
      clearAuthTokens()
    }
  }, [sessionRejected])

  if (!sessionPresent) {
    return <Navigate to="/login" replace />
  }

  if (currentUserQuery.isPending) {
    return (
      <AuthStatusScreen
        title="Signing you in"
        detail="Restoring your Identity Service session."
      />
    )
  }

  if (currentUserQuery.isError && !sessionRejected) {
    return (
      <AuthUnreachableScreen onRetry={() => void currentUserQuery.refetch()} />
    )
  }

  if (!currentUserQuery.data || sessionRejected) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const sessionPresent = useStoredSession()
  const currentUserQuery = useCurrentUser({ enabled: sessionPresent })
  const sessionRejected =
    currentUserQuery.isError && isSessionFailure(currentUserQuery.error)

  useEffect(() => {
    if (sessionRejected) {
      clearAuthTokens()
    }
  }, [sessionRejected])

  if (sessionPresent && currentUserQuery.isPending) {
    return (
      <AuthStatusScreen
        title="Checking your session"
        detail="Verifying your workspace access."
      />
    )
  }

  if (sessionPresent && currentUserQuery.isError && !sessionRejected) {
    return (
      <AuthUnreachableScreen onRetry={() => void currentUserQuery.refetch()} />
    )
  }

  if (currentUserQuery.data) {
    return <Navigate to="/" replace />
  }

  return <Login />
}

function RequireB2BPermission({ children }: { children: ReactNode }) {
  const currentUserQuery = useCurrentUser()
  const user = currentUserQuery.data

  if (currentUserQuery.isPending) {
    return (
      <QueryState
        title="Checking permissions"
        detail="Verifying your B2B workspace access."
      />
    )
  }

  if (currentUserQuery.isError && !isSessionFailure(currentUserQuery.error)) {
    return (
      <QueryState
        title="Server unavailable"
        detail="Your session was not rejected, but permissions could not be refreshed."
        tone="danger"
      />
    )
  }

  if (!user || !hasPermission(user, B2B_PERMISSIONS.PAGE_B2B)) {
    return (
      <QueryState
        title="B2B access denied"
        detail="Your account needs page.b2b or module.b2b to open this workspace."
        tone="danger"
      />
    )
  }

  return children
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <RequireB2BPermission>
                  <Overview />
                </RequireB2BPermission>
              }
            />
            <Route
              path="/pipeline"
              element={
                <RequireB2BPermission>
                  <Home />
                </RequireB2BPermission>
              }
            />
            <Route
              path="/products"
              element={
                <RequireB2BPermission>
                  <Products />
                </RequireB2BPermission>
              }
            />
            <Route
              path="/approvals"
              element={
                <RequireB2BPermission>
                  <Approvals />
                </RequireB2BPermission>
              }
            />
            <Route
              path="/warranty"
              element={
                <RequireB2BPermission>
                  <WarrantyAmc />
                </RequireB2BPermission>
              }
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

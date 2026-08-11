import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { Overview } from '../pages/Overview'
import { Home } from '../pages/Home'
import { Products } from '../pages/Products'
import { Approvals } from '../pages/Approvals'
import { WarrantyAmc } from '../pages/WarrantyAmc'
import { Login } from '../pages/Login'
import { isAuthenticated } from '../services/auth/auth'

function ProtectedRoutes() {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />
}

function PublicOnlyRoute() {
  return isAuthenticated() ? <Navigate to="/" replace /> : <Login />
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Overview />} />
            <Route path="/pipeline" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/warranty" element={<WarrantyAmc />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

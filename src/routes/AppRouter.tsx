import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { Overview } from '../pages/Overview'
import { Home } from '../pages/Home'
import { Products } from '../pages/Products'
import { Approvals } from '../pages/Approvals'
import { WarrantyAmc } from '../pages/WarrantyAmc'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Overview />} />
          <Route path="/pipeline" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/warranty" element={<WarrantyAmc />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

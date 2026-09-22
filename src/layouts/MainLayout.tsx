import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AppFooter } from '../components/layout/AppFooter'
import { Sidebar } from '../components/layout/Sidebar'
import './MainLayout.css'

export function MainLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((current) => !current)}
      />
      <div className="app-main">
        <main className="app-content">
          <Outlet />
        </main>
        <AppFooter />
      </div>
    </div>
  )
}

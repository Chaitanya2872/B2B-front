import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { NAV_ITEMS } from '../../constants'
import { useDashboardSummary } from '../../hooks/useCrm'
import { Avatar } from '../ui/Avatar'
import './Topbar.css'

export function Topbar() {
  const location = useLocation()
  const { data: summary } = useDashboardSummary()
  const pendingApprovals = summary?.pendingApprovals ?? 0

  const current = NAV_ITEMS.find((item) =>
    item.to === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.to),
  )

  return (
    <header className="topbar">
      <h1 className="topbar-title">{current?.label ?? 'Dashboard'}</h1>
      <div className="topbar-actions">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={18} strokeWidth={2} />
          {pendingApprovals > 0 && (
            <span className="topbar-icon-dot">{pendingApprovals}</span>
          )}
        </button>
        <Avatar person={{ name: 'Ravi Teja', initials: 'RT' }} size={30} />
      </div>
    </header>
  )
}

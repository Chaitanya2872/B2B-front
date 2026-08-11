import { NavLink } from 'react-router-dom'
import { Boxes } from 'lucide-react'
import { NAV_ITEMS } from '../../constants'
import { useDashboardSummary } from '../../hooks/useCrm'
import { Avatar } from '../ui/Avatar'
import './Sidebar.css'

export function Sidebar() {
  const { data: summary } = useDashboardSummary()
  const pendingApprovals = summary?.pendingApprovals ?? 0

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">
          <Boxes size={18} strokeWidth={2.2} />
        </span>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">ACS</span>
          <span className="sidebar-brand-sub">Sales OS</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const count = item.to === '/approvals' ? pendingApprovals : 0
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
              }
            >
              <Icon size={17} strokeWidth={2} />
              <span className="sidebar-link-label">{item.label}</span>
              {count > 0 && <span className="sidebar-link-count">{count}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-user">
        <Avatar person={{ name: 'Ravi Teja', initials: 'RT' }} size={32} />
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">Ravi Teja</span>
          <span className="sidebar-user-role">Account Manager</span>
        </div>
      </div>
    </aside>
  )
}

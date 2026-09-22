import { NavLink, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Hexagon, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../../constants'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useDashboardSummary } from '../../hooks/useCrm'
import { displayRole, initialsFromName } from '../../services/auth/auth'
import { Avatar } from '../ui/Avatar'
import './Sidebar.css'

const GROUP_LABELS = {
  workspace: 'Workspace',
  management: 'Management',
} as const

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const { data: summary } = useDashboardSummary()
  const logoutMutation = useLogout()
  const pendingApprovals = summary?.pendingApprovals ?? 0
  const person = {
    name: currentUser?.name ?? 'B2B User',
    initials: initialsFromName(currentUser?.name ?? 'B2B User'),
  }

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      <div className="sidebar-top">
        <div className="sidebar-header">
          <div className="sidebar-brand" title="Fawnix CRM">
            <span className="sidebar-brand-mark">
              <Hexagon size={18} strokeWidth={2.4} fill="currentColor" />
            </span>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-name">FAWNIX</span>
                <span className="sidebar-brand-sub">CRM</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="sidebar-toggle"
            onClick={onToggleCollapsed}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={16} strokeWidth={2.2} />
            ) : (
              <ChevronLeft size={16} strokeWidth={2.2} />
            )}
          </button>
        </div>

        {(['workspace', 'management'] as const).map((group) => (
          <div className="sidebar-group" key={group}>
            {!collapsed && (
              <span className="sidebar-group-label">
                {GROUP_LABELS[group]}
              </span>
            )}
            <nav className="sidebar-nav">
              {NAV_ITEMS.filter((item) => item.group === group).map(
                (item) => {
                  const Icon = item.icon
                  const count = item.to === '/approvals' ? pendingApprovals : 0
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.to === '/'}
                      title={item.label}
                      className={({ isActive }) =>
                        `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
                      }
                    >
                      <Icon size={18} strokeWidth={2} />
                      {!collapsed && (
                        <span className="sidebar-link-label">
                          {item.label}
                        </span>
                      )}
                      {!collapsed && count > 0 && (
                        <span className="sidebar-link-count">{count}</span>
                      )}
                    </NavLink>
                  )
                },
              )}
            </nav>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className={`sidebar-user${collapsed ? ' sidebar-user--collapsed' : ''}`}>
          <Avatar person={person} size={32} />
          {!collapsed && (
            <>
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{person.name}</span>
                <span className="sidebar-user-role">
                  {displayRole(currentUser)}
                </span>
              </div>
              <button
                type="button"
                className="sidebar-signout"
                aria-label="Sign out"
                title="Sign out"
                disabled={logoutMutation.isPending}
                onClick={() =>
                  logoutMutation.mutate(undefined, {
                    onSettled: () => navigate('/login', { replace: true }),
                  })
                }
              >
                <LogOut size={15} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  )
}

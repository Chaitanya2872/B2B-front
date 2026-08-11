import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, LogOut } from 'lucide-react'
import { NAV_ITEMS } from '../../constants'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useDashboardSummary } from '../../hooks/useCrm'
import { displayRole, initialsFromName } from '../../services/auth/auth'
import { Avatar } from '../ui/Avatar'
import './Topbar.css'

export function Topbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: currentUser } = useCurrentUser()
  const logoutMutation = useLogout()
  const { data: summary } = useDashboardSummary()
  const pendingApprovals = summary?.pendingApprovals ?? 0
  const person = {
    name: currentUser?.name ?? 'B2B User',
    initials: initialsFromName(currentUser?.name ?? 'B2B User'),
  }

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
        <Avatar person={person} size={30} />
        <button
          type="button"
          className="topbar-signout-btn"
          disabled={logoutMutation.isPending}
          title={displayRole(currentUser)}
          onClick={() => {
            logoutMutation.mutate(undefined, {
              onSettled: () => navigate('/login', { replace: true }),
            })
          }}
        >
          <LogOut size={15} strokeWidth={2} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}

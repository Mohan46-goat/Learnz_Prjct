import { Link, NavLink, useNavigate, Outlet, Navigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../App'
import { useContext, useEffect, useState } from 'react'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', section: 'Workspace' },
  { label: 'Users', to: '/users', roles: ['admin'], section: 'Workspace' },
  { label: 'Courses', to: '/courses', roles: ['admin'], section: 'Workspace' },
  { label: 'Batches', to: '/batches', roles: ['admin'], section: 'Workspace' },
  { label: 'Lessons', to: '/lessons', roles: ['instructor', 'student'], section: 'Teaching' },
  { label: 'Attendance', to: '/attendance', roles: ['instructor', 'student'], section: 'Teaching' },
  { label: 'Reports', to: '/reports', roles: ['admin'], section: 'Insights' },
  { label: 'Notifications', to: '/notifications', section: 'Insights' },
]

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'LH'
}

export default function Layout() {
  const { user, logout, api } = useContext(AuthContext)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const loadUnreadCount = async () => {
      try {
        const response = await api.get('/notifications')
        setUnreadCount((response.data.notifications || []).filter((notification) => !notification.is_read).length)
      } catch {
        setUnreadCount(0)
      }
    }

    loadUnreadCount()
    window.addEventListener('notifications-updated', loadUnreadCount)
    return () => window.removeEventListener('notifications-updated', loadUnreadCount)
  }, [api])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  if (!user) return <Navigate to="/login" replace />

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role))
  const currentItem = visibleItems.find((item) => location.pathname === item.to)

  return (
    <div className="app-shell">
      <aside className={`app-rail${menuOpen ? ' is-open' : ''}`}>
        <Link className="rail-brand" to="/dashboard" aria-label="LearnHub dashboard">
          <span className="brand-mark" aria-hidden="true">LH</span>
          <span className="brand-lockup">
            <strong>LearnHub</strong>
            <small>operations / 2026</small>
          </span>
        </Link>

        <nav className="rail-nav" aria-label="Primary navigation">
          <span className="nav-group-label">Navigate</span>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={closeMenu}
              className={({ isActive }) => `nav-item${isActive ? ' is-active' : ''}`}
            >
              <span>{item.label}</span>
              {item.to === '/notifications' && unreadCount > 0 && <span className="nav-notification-count" aria-label={`${unreadCount} unread notifications`}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="rail-footer">
          <div className="user-chip">
            <span className="avatar" aria-hidden="true">{getInitials(user.name)}</span>
            <span className="user-chip-copy">
              <strong>{user.name}</strong>
              <small>{user.role} access</small>
            </span>
          </div>
          <button className="rail-logout" onClick={handleLogout} type="button">
            Sign out <span aria-hidden="true">↗</span>
          </button>
        </div>
      </aside>

      {menuOpen && <button className="nav-scrim" type="button" aria-label="Close navigation" onClick={closeMenu} />}

      <div className="app-content">
        <header className="topbar">
          <button
            className="mobile-nav-toggle"
            type="button"
            aria-label="Open navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span /> <span />
          </button>
          <div className="breadcrumbs" aria-label="Breadcrumb">
            <span>LearnHub</span>
            <span aria-hidden="true">/</span>
            <strong>{currentItem?.label || 'Workspace'}</strong>
          </div>
          <div className="topbar-meta">
            <span className="status-dot"><span aria-hidden="true" />System operational</span>
            <span className="topbar-role">{user.role} workspace</span>
          </div>
        </header>

        <main className="container">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

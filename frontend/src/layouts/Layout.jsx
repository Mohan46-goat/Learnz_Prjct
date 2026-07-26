import { Link, useNavigate, Outlet, Navigate } from 'react-router-dom'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) return <Navigate to="/login" replace />

  return (
    <div>
      <nav className="navbar">
        <span style={{ fontWeight: 700, fontSize: 18 }}>LearnHub</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/dashboard">Dashboard</Link>

          {/* Admin only */}
          {user.role === 'admin' && (
            <>
              <Link to="/users">Users</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/batches">Batches</Link>
              <Link to="/reports">Reports</Link>
            </>
          )}

          {/* Instructor only */}
          {user.role === 'instructor' && (
            <Link to="/lessons">Lessons</Link>
          )}

          {/* Student only */}
          {user.role === 'student' && (
            <Link to="/lessons">My Lessons</Link>
          )}

          {/* Instructor + Student */}
          {(user.role === 'instructor' || user.role === 'student') && (
            <Link to="/attendance">Attendance</Link>
          )}

          <Link to="/notifications">Notifications</Link>

          <span style={{ marginLeft: 8, color: '#bbdefb', fontSize: 13 }}>
            {user.name} ({user.role})
          </span>

          <button onClick={handleLogout} style={{
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
            color: 'white', cursor: 'pointer', padding: '6px 12px', borderRadius: 4, marginLeft: 8
          }}>
            Logout
          </button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}

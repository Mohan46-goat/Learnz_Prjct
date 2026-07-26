import { useState } from 'react'
import { Link, useNavigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Layout() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div>
      <nav className="navbar">
        <span>LearnHub</span>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          {user.role === 'admin' && (
            <>
              <Link to="/users">Users</Link>
              <Link to="/courses">Courses</Link>
              <Link to="/batches">Batches</Link>
            </>
          )}
          <Link to="/lessons">Lessons</Link>
          <Link to="/attendance">Attendance</Link>
          <Link to="/notifications">Notifications</Link>
          {user.role === 'admin' && <Link to="/reports">Reports</Link>}
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
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
import { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../App'

export default function AdminDashboard() {
  const { user, api } = useContext(AuthContext)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, batchesRes, attendanceRes] = await Promise.all([
          api.get('/users'),
          api.get('/courses'),
          api.get('/batches'),
          api.get('/attendance'),
        ])
        const allUsers = usersRes.data.users || []
        const todayAtt = attendanceRes.data.attendance || []
        setStats({
          totalStudents: allUsers.filter(u => u.role === 'student').length,
          totalInstructors: allUsers.filter(u => u.role === 'instructor').length,
          totalCourses: (coursesRes.data.courses || []).length,
          totalBatches: (batchesRes.data.batches || []).length,
          todayPresent: todayAtt.filter(a => a.status === 'present').length,
          todayLate: todayAtt.filter(a => a.status === 'late').length,
          todayAbsent: todayAtt.filter(a => a.status === 'absent').length,
        })
      } catch (err) {
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return <div>Loading dashboard...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: 20 }}>Welcome back, {user?.name}.</p>

      <h3 style={{ marginBottom: 12 }}>Platform Overview</h3>
      <div className="stat-grid">
        <div className="stat-card"><h3>Students</h3><div className="value">{stats.totalStudents}</div></div>
        <div className="stat-card"><h3>Instructors</h3><div className="value">{stats.totalInstructors}</div></div>
        <div className="stat-card"><h3>Courses</h3><div className="value">{stats.totalCourses}</div></div>
        <div className="stat-card"><h3>Batches</h3><div className="value">{stats.totalBatches}</div></div>
      </div>

      <h3 style={{ marginBottom: 12, marginTop: 8 }}>All-Time Attendance</h3>
      <div className="stat-grid">
        <div className="stat-card"><h3>Present</h3><div className="value" style={{ color: '#2e7d32' }}>{stats.todayPresent}</div></div>
        <div className="stat-card"><h3>Late</h3><div className="value" style={{ color: '#e65100' }}>{stats.todayLate}</div></div>
        <div className="stat-card"><h3>Absent</h3><div className="value" style={{ color: '#c62828' }}>{stats.todayAbsent}</div></div>
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <h3>Quick Actions</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          <Link to="/users" className="btn btn-primary">Manage Users</Link>
          <Link to="/courses" className="btn btn-primary">Manage Courses</Link>
          <Link to="/batches" className="btn btn-primary">Manage Batches</Link>
          <Link to="/reports" className="btn btn-primary">View Reports</Link>
        </div>
      </div>
    </div>
  )
}

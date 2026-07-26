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
    <div className="dashboard-page dashboard-refresh">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow eyebrow-light">Command centre</span>
          <h1>Good to see you, {user?.name?.split(' ')[0] || 'Admin'}.</h1>
          <p>Your learning operation is in motion. Here is today’s live snapshot.</p>
        </div>
        <div className="dashboard-orbit"><span>{stats.totalStudents || 0}</span><small>learners</small></div>
      </section>

      <section className="insight-grid" aria-label="Platform overview">
        <Metric label="Active learners" value={stats.totalStudents} note="Across all cohorts" />
        <Metric label="Instructors" value={stats.totalInstructors} note="Teaching today" />
        <Metric label="Courses" value={stats.totalCourses} note="Learning pathways" />
        <Metric label="Batches" value={stats.totalBatches} note="Running cohorts" />
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-card attendance-summary">
          <div className="dashboard-card-head"><div><span className="eyebrow">Attendance pulse</span><h2>Session outcomes</h2></div><span className="live-pill">Live</span></div>
          <div className="attendance-stat-list">
            <Attendance label="Present" value={stats.todayPresent} tone="present" />
            <Attendance label="Late" value={stats.todayLate} tone="late" />
            <Attendance label="Absent" value={stats.todayAbsent} tone="absent" />
          </div>
        </div>
        <div className="dashboard-card quick-actions-card">
          <div className="dashboard-card-head"><div><span className="eyebrow">Shortcuts</span><h2>Keep moving</h2></div></div>
          <div className="quick-action-grid">
          <Link to="/users" className="btn btn-primary">Manage Users</Link>
          <Link to="/courses" className="btn btn-primary">Manage Courses</Link>
          <Link to="/batches" className="btn btn-primary">Manage Batches</Link>
          <Link to="/reports" className="btn btn-primary">View Reports</Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value, note }) { return <article className="insight-card"><span>{label}</span><strong>{value || 0}</strong><small>{note}</small></article> }
function Attendance({ label, value, tone }) { return <div className={`attendance-stat ${tone}`}><span>{label}</span><strong>{value || 0}</strong></div> }

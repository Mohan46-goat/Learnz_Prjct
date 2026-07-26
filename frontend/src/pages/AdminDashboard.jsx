import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, coursesRes, batchesRes, attendanceRes] = await Promise.all([
          axios.get('/api/users'),
          axios.get('/api/courses'),
          axios.get('/api/batches'),
          axios.get('/api/attendance?date=' + new Date().toISOString().split('T')[0]),
        ])

        const todayAttendance = attendanceRes.data.data || []
        setStats({
          totalStudents: usersRes.data.data.users?.filter((u) => u.role === 'student').length || 0,
          totalInstructors: usersRes.data.data.users?.filter((u) => u.role === 'instructor').length || 0,
          totalCourses: coursesRes.data.data?.length || 0,
          totalBatches: batchesRes.data.data?.length || 0,
          todayPresent: todayAttendance.filter((a) => a.status === 'present').length,
          todayLate: todayAttendance.filter((a) => a.status === 'late').length,
          todayAbsent: todayAttendance.filter((a) => a.status === 'absent').length,
        })
      } catch (err) {
        console.error('Failed to fetch stats', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><h3>Total Students</h3><div className="value">{stats.totalStudents}</div></div>
        <div className="stat-card"><h3>Total Instructors</h3><div className="value">{stats.totalInstructors}</div></div>
        <div className="stat-card"><h3>Total Courses</h3><div className="value">{stats.totalCourses}</div></div>
        <div className="stat-card"><h3>Total Batches</h3><div className="value">{stats.totalBatches}</div></div>
        <div className="stat-card"><h3>Today Present</h3><div className="value">{stats.todayPresent}</div></div>
        <div className="stat-card"><h3>Today Late</h3><div className="value">{stats.todayLate}</div></div>
        <div className="stat-card"><h3>Today Absent</h3><div className="value">{stats.todayAbsent}</div></div>
      </div>
    </div>
  )
}
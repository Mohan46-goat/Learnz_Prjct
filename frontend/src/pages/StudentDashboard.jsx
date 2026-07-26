import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function StudentDashboard() {
  const { user, api } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [todayLesson, setTodayLesson] = useState(null)
  const [attendanceStatus, setAttendanceStatus] = useState(null)
  const [percentage, setPercentage] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, lessonsRes, notifRes, myAttRes] = await Promise.all([
          api.get('/batches/my'),
          api.get('/lessons'),
          api.get('/notifications'),
          api.get('/attendance/my'),
        ])

        const today = new Date().toISOString().split('T')[0]
        const allLessons = lessonsRes.data.lessons || []
        const todayLessons = allLessons.filter((l) => l.lesson_date === today)
        const myRecords = myAttRes.data.attendance || []

        setBatches(batchesRes.data.batches || [])
        setTodayLesson(todayLessons[0] || null)
        setNotifications((notifRes.data.notifications || []).filter((n) => !n.is_read))

        if (todayLessons[0]) {
          const todayRecord = myRecords.find((r) => r.lesson_id == todayLessons[0].id)
          setAttendanceStatus(todayRecord?.status || null)
        }

        const total = myRecords.length
        const present = myRecords.filter((r) => r.status === 'present').length
        setPercentage(total > 0 ? Math.round((present / total) * 100) : 0)
      } catch (err) {
        console.error('Failed to fetch student data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <h1>Student Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><h3>My Batches</h3><div className="value">{batches.length}</div></div>
        <div className="stat-card"><h3>Attendance Percentage</h3><div className="value">{percentage}%</div></div>
        <div className="stat-card"><h3>Unread Notifications</h3><div className="value">{notifications.length}</div></div>
      </div>
      {todayLesson && (
        <div className="card">
          <h3>Today's Lesson</h3>
          <p><strong>{todayLesson.title}</strong></p>
          <p>{todayLesson.lesson_date} {todayLesson.start_time} - {todayLesson.end_time}</p>
          <p>Status: <strong>{attendanceStatus ? attendanceStatus.toUpperCase() : 'Not marked'}</strong></p>
        </div>
      )}
    </div>
  )
}
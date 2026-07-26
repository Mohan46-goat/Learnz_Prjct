import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function InstructorDashboard() {
  const { user, api } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [todayLesson, setTodayLesson] = useState(null)
  const [attendance, setAttendance] = useState({ present: 0, late: 0, absent: 0 })
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, lessonsRes, notifRes] = await Promise.all([
          api.get('/batches/my'),
          api.get('/lessons'),
          api.get('/notifications'),
        ])

        const today = new Date().toISOString().split('T')[0]
        const allLessons = lessonsRes.data.lessons || []
        const todayLessons = allLessons.filter((l) => l.lesson_date === today)

        setBatches(batchesRes.data.batches || [])
        setTodayLesson(todayLessons[0] || null)
        setNotifications((notifRes.data.notifications || []).filter((n) => !n.is_read))

        if (todayLessons[0]) {
          const attRes = await api.get('/attendance')
          const records = (attRes.data.attendance || []).filter((r) => r.lesson_id == todayLessons[0].id)
          setAttendance({
            present: records.filter((r) => r.status === 'present').length,
            late: records.filter((r) => r.status === 'late').length,
            absent: records.filter((r) => r.status === 'absent').length,
          })
        }
      } catch (err) {
        console.error('Failed to fetch instructor data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading dashboard...</div>

  return (
    <div>
      <h1>Instructor Dashboard</h1>
      <div className="stat-grid">
        <div className="stat-card"><h3>Assigned Batches</h3><div className="value">{batches.length}</div></div>
        <div className="stat-card"><h3>Today Present</h3><div className="value">{attendance.present}</div></div>
        <div className="stat-card"><h3>Today Late</h3><div className="value">{attendance.late}</div></div>
        <div className="stat-card"><h3>Today Absent</h3><div className="value">{attendance.absent}</div></div>
        <div className="stat-card"><h3>Unread Notifications</h3><div className="value">{notifications.length}</div></div>
      </div>
      {todayLesson && (
        <div className="card">
          <h3>Today's Lesson</h3>
          <p><strong>{todayLesson.title}</strong></p>
          <p>{todayLesson.lesson_date} {todayLesson.start_time} - {todayLesson.end_time}</p>
        </div>
      )}
    </div>
  )
}
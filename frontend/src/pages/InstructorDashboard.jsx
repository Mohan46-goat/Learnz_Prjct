import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function InstructorDashboard() {
  const { user } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [todayLesson, setTodayLesson] = useState(null)
  const [attendance, setAttendance] = useState({ present: 0, late: 0, absent: 0 })
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, todayRes, notifRes] = await Promise.all([
          axios.get('/api/batches'),
          axios.get('/api/lessons?date=' + new Date().toISOString().split('T')[0]),
          axios.get('/api/notifications?is_read=false&limit=10'),
        ])

        setBatches(batchesRes.data.data?.batches || [])
        setTodayLesson(todayRes.data.data?.lessons?.[0] || null)
        setNotifications(notifRes.data.data?.notifications || [])

        if (todayRes.data.data?.lessons?.[0]) {
          const attRes = await axios.get('/api/attendance?lesson_id=' + todayRes.data.data.lessons[0].id)
          const records = attRes.data.data?.attendance || []
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
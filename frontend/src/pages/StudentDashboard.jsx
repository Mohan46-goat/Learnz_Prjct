import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function StudentDashboard() {
  const { user } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [todayLesson, setTodayLesson] = useState(null)
  const [attendanceStatus, setAttendanceStatus] = useState(null)
  const [percentage, setPercentage] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [batchesRes, todayRes, notifRes, pctRes] = await Promise.all([
          axios.get('/api/batches'),
          axios.get('/api/lessons?date=' + new Date().toISOString().split('T')[0]),
          axios.get('/api/notifications?is_read=false&limit=10'),
          axios.get('/api/reports/percentage'),
        ])

        setBatches(batchesRes.data.data?.batches || [])
        setTodayLesson(todayRes.data.data?.lessons?.[0] || null)
        setNotifications(notifRes.data.data?.notifications || [])
        setPercentage(pctRes.data.data?.percentage || 0)

        if (todayRes.data.data?.lessons?.[0]) {
          const attRes = await axios.get('/api/attendance/my')
          const records = attRes.data.data?.attendance || []
          const todayRecord = records.find((r) => r.lesson_id === todayRes.data.data.lessons[0].id)
          setAttendanceStatus(todayRecord?.status || null)
        }
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
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
    <div className="dashboard-page dashboard-refresh">
      <section className="dashboard-welcome dashboard-welcome-student"><div><span className="eyebrow eyebrow-light">Learning space</span><h1>Make today count.</h1><p>{user?.name}, every session is a step forward.</p></div><div className="dashboard-orbit"><span>{percentage}%</span><small>attendance</small></div></section>
      <section className="insight-grid student-insights">
        <Metric label="My batches" value={batches.length} note="Learning now" />
        <Metric label="Attendance" value={`${percentage}%`} note="Your consistency" />
        <Metric label="New updates" value={notifications.length} note="Unread notifications" />
      </section>
      {todayLesson && (
        <div className="dashboard-card lesson-spotlight">
          <span className="eyebrow">Today’s lesson</span>
          <h2>{todayLesson.title}</h2>
          <p>{todayLesson.lesson_date} {todayLesson.start_time} - {todayLesson.end_time}</p>
          <p>Status: <strong>{attendanceStatus ? attendanceStatus.toUpperCase() : 'Not marked'}</strong></p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, note }) { return <article className="insight-card"><span>{label}</span><strong>{value || 0}</strong><small>{note}</small></article> }

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
    <div className="dashboard-page dashboard-refresh">
      <section className="dashboard-welcome dashboard-welcome-instructor"><div><span className="eyebrow eyebrow-light">Teaching studio</span><h1>Ready to guide the room?</h1><p>{user?.name}, your teaching day is organised and ready to go.</p></div><div className="dashboard-orbit"><span>{batches.length}</span><small>batches</small></div></section>
      <section className="insight-grid instructor-insights">
        <Metric label="Assigned batches" value={batches.length} note="Your cohorts" />
        <Metric label="Present today" value={attendance.present} note="Session check-ins" />
        <Metric label="Late today" value={attendance.late} note="Needs attention" />
        <Metric label="Unread updates" value={notifications.length} note="From your workspace" />
      </section>
      {todayLesson && (
        <div className="dashboard-card lesson-spotlight">
          <span className="eyebrow">Today’s lesson</span>
          <h2>{todayLesson.title}</h2>
          <p>{todayLesson.lesson_date} {todayLesson.start_time} - {todayLesson.end_time}</p>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, note }) { return <article className="insight-card"><span>{label}</span><strong>{value || 0}</strong><small>{note}</small></article> }

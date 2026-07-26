import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

const STATUS_LABELS = { present: 'Present', late: 'Late', absent: 'Absent' }

export default function Attendance() {
  const { user, api } = useContext(AuthContext)
  const [attendance, setAttendance] = useState([])
  const [lessons, setLessons] = useState([])
  const [batchStudents, setBatchStudents] = useState([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('present')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  const isStudent = user?.role === 'student'
  const isInstructor = user?.role === 'instructor'
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    fetchAttendance()
    if (!isAdmin) fetchLessons()
  }, [user])

  const fetchAttendance = async () => {
    try {
      const endpoint = isStudent ? '/attendance/my' : '/attendance'
      const res = await api.get(endpoint)
      setAttendance(res.data.attendance || [])
    } catch {
      setError('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const res = await api.get('/lessons')
      setLessons(res.data.lessons || [])
    } catch {}
  }

  const handleLessonChange = async (lessonId) => {
    setSelectedLesson(lessonId)
    setSelectedStudent('')
    setBatchStudents([])
    if (!lessonId || !isInstructor) return
    const lesson = lessons.find(l => String(l.id) === String(lessonId))
    if (!lesson?.batch_id) return
    try {
      const res = await api.get('/batches/' + lesson.batch_id + '/students')
      setBatchStudents(res.data.students || [])
    } catch {
      setError('Failed to load students for this lesson')
    }
  }

  const handleMark = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const studentId = isStudent ? user.id : parseInt(selectedStudent)
      await api.post('/attendance', {
        lesson_id: parseInt(selectedLesson),
        student_id: studentId,
        status: selectedStatus,
      })
      setSuccess('Attendance marked successfully!')
      setSelectedLesson('')
      setSelectedStudent('')
      setSelectedStatus('present')
      setBatchStudents([])
      fetchAttendance()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  if (loading) return (
    <div className="loading-state">
      <span className="loading-mark" />
      Loading attendance…
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-light">Tracking</span>
          <h1 className="page-title">Attendance</h1>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {!isAdmin && (
        <div className="card">
          <h3>{isStudent ? 'Mark My Attendance' : 'Mark Student Attendance'}</h3>
          <form onSubmit={handleMark}>
            <div className="form-group">
              <label>Lesson</label>
              <select
                value={selectedLesson}
                onChange={e => handleLessonChange(e.target.value)}
                required
              >
                <option value="">Select a lesson</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title} — {l.lesson_date} ({l.batch_name})
                  </option>
                ))}
              </select>
            </div>

            {isInstructor && (
              <div className="form-group">
                <label>Student</label>
                <select
                  value={selectedStudent}
                  onChange={e => setSelectedStudent(e.target.value)}
                  required
                  disabled={!selectedLesson || batchStudents.length === 0}
                >
                  <option value="">
                    {!selectedLesson
                      ? 'Select a lesson first'
                      : batchStudents.length === 0
                      ? 'No students enrolled in this batch'
                      : 'Select student'}
                  </option>
                  {batchStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Status</label>
              <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isInstructor && (!selectedLesson || !selectedStudent)}
            >
              Mark Attendance
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>{isStudent ? 'My Attendance History' : 'All Attendance Records'}</h3>
        {attendance.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Lesson</th>
                {!isStudent && <th>Student</th>}
                <th>Status</th>
                <th>Marked At</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.lesson_title || 'Lesson #' + a.lesson_id}</strong></td>
                  {!isStudent && <td>{a.student_name || 'Student #' + a.student_id}</td>}
                  <td>
                    <span className={`status-badge status-badge--${a.status}`}>
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </td>
                  <td className="text-muted">{a.marked_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

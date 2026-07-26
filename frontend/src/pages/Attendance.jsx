import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

const STATUS_COLORS = { present: '#2e7d32', late: '#e65100', absent: '#c62828' }

export default function Attendance() {
  const { user, api } = useContext(AuthContext)
  const [attendance, setAttendance] = useState([])
  const [lessons, setLessons] = useState([])
  const [students, setStudents] = useState([])
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
    fetchLessons()
    if (isInstructor || isAdmin) fetchStudents()
  }, [user])

  const fetchAttendance = async () => {
    try {
      const endpoint = isStudent ? '/attendance/my' : '/attendance'
      const res = await api.get(endpoint)
      setAttendance(res.data.attendance || [])
    } catch (err) {
      setError('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const res = await api.get('/lessons')
      setLessons(res.data.lessons || [])
    } catch (err) {}
  }

  const fetchStudents = async () => {
    try {
      const res = await api.get('/users')
      setStudents((res.data.users || []).filter(u => u.role === 'student'))
    } catch (err) {}
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
      fetchAttendance()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Attendance</h1>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Mark attendance form — shown to students and instructors */}
      {!isAdmin && (
        <div className="card">
          <h3>{isStudent ? 'Mark My Attendance' : 'Mark Student Attendance'}</h3>
          <form onSubmit={handleMark}>
            <div className="form-group">
              <label>Lesson</label>
              <select value={selectedLesson} onChange={e => setSelectedLesson(e.target.value)} required>
                <option value="">Select lesson</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title} — {l.lesson_date} ({l.batch_name})</option>
                ))}
              </select>
            </div>

            {/* Instructor picks the student; student marks themselves */}
            {isInstructor && (
              <div className="form-group">
                <label>Student</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
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
            <button type="submit" className="btn btn-primary">Mark Attendance</button>
          </form>
        </div>
      )}

      {/* Attendance records table */}
      <div className="card">
        <h3>{isStudent ? 'My Attendance History' : 'All Attendance Records'}</h3>
        {attendance.length === 0 ? (
          <p style={{ color: '#999' }}>No attendance records found.</p>
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
                  <td>{a.lesson_title || 'Lesson #' + a.lesson_id}</td>
                  {!isStudent && <td>{a.student_name || 'Student #' + a.student_id}</td>}
                  <td>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                      color: 'white', background: STATUS_COLORS[a.status] || '#666'
                    }}>
                      {a.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: 13, color: '#666' }}>{a.marked_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

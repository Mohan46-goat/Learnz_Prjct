import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function Attendance() {
  const { user } = useContext(AuthContext)
  const [attendance, setAttendance] = useState([])
  const [lessons, setLessons] = useState([])
  const [students, setStudents] = useState([])
  const [selectedLesson, setSelectedLesson] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('present')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAttendance()
    fetchLessons()
    if (user?.role === 'instructor') {
      fetchStudents()
    }
  }, [user])

  const fetchAttendance = async () => {
    try {
      const res = await axios.get('/api/attendance')
      setAttendance(res.data.data || [])
    } catch (err) {
      setError('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const fetchLessons = async () => {
    try {
      const res = await axios.get('/api/lessons')
      setLessons(res.data.data || [])
    } catch (err) {
      console.error('Failed to load lessons', err)
    }
  }

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/users?role=student')
      setStudents(res.data.data?.users || [])
    } catch (err) {
      console.error('Failed to load students', err)
    }
  }

  const handleMark = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/attendance', {
        lesson_id: selectedLesson,
        student_id: selectedStudent,
        status: selectedStatus,
      })
      fetchAttendance()
      setSelectedLesson('')
      setSelectedStudent('')
      setSelectedStatus('present')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark attendance')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Attendance</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="card">
        <h3>Mark Attendance</h3>
        <form onSubmit={handleMark}>
          <div className="form-group"><label>Lesson</label><select value={selectedLesson} onChange={(e) => setSelectedLesson(e.target.value)} required><option value="">Select Lesson</option>{lessons.map((l) => <option key={l.id} value={l.id}>{l.title} ({l.lesson_date})</option>)}</select></div>
          <div className="form-group"><label>Student</label><select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} required><option value="">Select Student</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="form-group"><label>Status</label><select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option></select></div>
          <button type="submit" className="btn btn-primary">Mark</button>
        </form>
      </div>
      <div className="card">
        <table className="table">
          <thead><tr><th>Lesson</th><th>Student</th><th>Status</th><th>Marked At</th></tr></thead>
          <tbody>
            {attendance.map((a) => (
              <tr key={a.id}>
                <td>{a.lesson_title || a.lesson_id}</td>
                <td>{a.student_name || a.student_id}</td>
                <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                <td>{a.marked_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
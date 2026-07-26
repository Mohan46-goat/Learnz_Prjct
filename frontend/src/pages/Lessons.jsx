import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

export default function Lessons() {
  const { user, api } = useContext(AuthContext)
  const [lessons, setLessons] = useState([])
  const [batches, setBatches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    batch_id: '', title: '', description: '',
    lesson_date: '', start_time: '09:00', end_time: '10:30',
    attendance_start_time: '09:00', attendance_end_time: '09:15'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const isInstructor = user?.role === 'instructor'

  useEffect(() => {
    fetchLessons()
    if (isInstructor) fetchMyBatches()
  }, [])

  const fetchLessons = async () => {
    try {
      const res = await api.get('/lessons')
      setLessons(res.data.lessons || [])
    } catch {
      setError('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBatches = async () => {
    try {
      const res = await api.get('/batches/my')
      setBatches(res.data.batches || [])
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/lessons', formData)
      setShowForm(false)
      setFormData({
        batch_id: '', title: '', description: '',
        lesson_date: '', start_time: '09:00', end_time: '10:30',
        attendance_start_time: '09:00', attendance_end_time: '09:15'
      })
      fetchLessons()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lesson')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lesson?')) return
    try {
      await api.delete('/lessons/' + id)
      fetchLessons()
    } catch {
      setError('Failed to delete lesson')
    }
  }

  const set = (key, val) => setFormData(prev => ({ ...prev, [key]: val }))

  if (loading) return (
    <div className="loading-state">
      <span className="loading-mark" />
      Loading lessons…
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-light">Teaching</span>
          <h1 className="page-title">Lessons</h1>
        </div>
        {isInstructor && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Create Lesson'}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isInstructor && (
        <div className="card">
          <h3>New Lesson</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Batch</label>
              <select value={formData.batch_id} onChange={e => set('batch_id', e.target.value)} required>
                <option value="">Select your batch</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.name} — {b.course_name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input value={formData.title} onChange={e => set('title', e.target.value)} required placeholder="e.g. Introduction to HTML" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={formData.description} onChange={e => set('description', e.target.value)} rows={3} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.lesson_date} onChange={e => set('lesson_date', e.target.value)} required />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Start Time</label>
                <input type="time" value={formData.start_time} onChange={e => set('start_time', e.target.value)} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="time" value={formData.end_time} onChange={e => set('end_time', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Attendance Opens</label>
                <input type="time" value={formData.attendance_start_time} onChange={e => set('attendance_start_time', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Attendance Closes</label>
                <input type="time" value={formData.attendance_end_time} onChange={e => set('attendance_end_time', e.target.value)} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Lesson</button>
          </form>
        </div>
      )}

      {lessons.length === 0 ? (
        <div className="card">
          <p>No lessons yet.{isInstructor ? ' Create your first lesson above.' : ''}</p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Batch</th>
                <th>Date</th>
                <th>Time</th>
                <th>Attendance Window</th>
                {isInstructor && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {lessons.map(l => (
                <tr key={l.id}>
                  <td>
                    <strong>{l.title}</strong>
                    {l.description && <div className="text-muted text-sm">{l.description}</div>}
                  </td>
                  <td>{l.batch_name}</td>
                  <td>{l.lesson_date}</td>
                  <td>{l.start_time} – {l.end_time}</td>
                  <td className="text-sm">{l.attendance_start_time} – {l.attendance_end_time}</td>
                  {isInstructor && (
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

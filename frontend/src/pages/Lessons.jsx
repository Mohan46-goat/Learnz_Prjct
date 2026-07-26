import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function Lessons() {
  const { user } = useContext(AuthContext)
  const [lessons, setLessons] = useState([])
  const [batches, setBatches] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ batch_id: '', title: '', description: '', lesson_date: '', start_time: '09:00', end_time: '10:30', attendance_start_time: '09:00', attendance_end_time: '09:15' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLessons()
    fetchBatches()
  }, [])

  const fetchLessons = async () => {
    try {
      const res = await axios.get('/api/lessons')
      setLessons(res.data.data || [])
    } catch (err) {
      setError('Failed to load lessons')
    } finally {
      setLoading(false)
    }
  }

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches')
      setBatches(res.data.data || [])
    } catch (err) {
      console.error('Failed to load batches', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/lessons', formData)
      setShowForm(false)
      setFormData({ batch_id: '', title: '', description: '', lesson_date: '', start_time: '09:00', end_time: '10:30', attendance_start_time: '09:00', attendance_end_time: '09:15' })
      fetchLessons()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lesson')
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/lessons/${id}`)
      fetchLessons()
    } catch (err) {
      setError('Failed to delete lesson')
    }
  }

  if (user?.role === 'student') {
    return <div className="card"><p>Access denied.</p></div>
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Lesson Management</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create Lesson'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Batch</label><select value={formData.batch_id} onChange={(e) => setFormData({ ...formData, batch_id: e.target.value })} required><option value="">Select Batch</option>{batches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div>
            <div className="form-group"><label>Title</label><input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <div className="form-group"><label>Date</label><input type="date" value={formData.lesson_date} onChange={(e) => setFormData({ ...formData, lesson_date: e.target.value })} required /></div>
            <div className="form-group"><label>Start Time</label><input type="time" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} /></div>
            <div className="form-group"><label>End Time</label><input type="time" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} /></div>
            <div className="form-group"><label>Attendance Start</label><input type="time" value={formData.attendance_start_time} onChange={(e) => setFormData({ ...formData, attendance_start_time: e.target.value })} /></div>
            <div className="form-group"><label>Attendance End</label><input type="time" value={formData.attendance_end_time} onChange={(e) => setFormData({ ...formData, attendance_end_time: e.target.value })} /></div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>Title</th><th>Batch</th><th>Date</th><th>Time</th><th>Actions</th></tr></thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id}>
                <td>{l.title}</td>
                <td>{l.batch_name || l.batch_id}</td>
                <td>{l.lesson_date}</td>
                <td>{l.start_time} - {l.end_time}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(l.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'
import axios from 'axios'

export default function Batches() {
  const { user } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ course_id: '', name: '', start_date: '', end_date: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches()
    fetchCourses()
  }, [])

  const fetchBatches = async () => {
    try {
      const res = await axios.get('/api/batches')
      setBatches(res.data.data || [])
    } catch (err) {
      setError('Failed to load batches')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses')
      setCourses(res.data.data || [])
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await axios.post('/api/batches', formData)
      setShowForm(false)
      setFormData({ course_id: '', name: '', start_date: '', end_date: '' })
      fetchBatches()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="card"><p>Access denied. Admin only.</p></div>
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Batch Management</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create Batch'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Course</label><select value={formData.course_id} onChange={(e) => setFormData({ ...formData, course_id: e.target.value })} required><option value="">Select Course</option>{courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Start Date</label><input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required /></div>
            <div className="form-group"><label>End Date</label><input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} required /></div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>Name</th><th>Course</th><th>Start Date</th><th>End Date</th><th>Status</th></tr></thead>
          <tbody>
            {batches.map((b) => (
              <tr key={b.id}>
                <td>{b.name}</td>
                <td>{b.course_name || b.course_id}</td>
                <td>{b.start_date}</td>
                <td>{b.end_date}</td>
                <td>{b.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
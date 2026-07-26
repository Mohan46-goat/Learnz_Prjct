import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Courses() {
  const { user, api } = useContext(AuthContext)
  const [courses, setCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses')
      setCourses(res.data.courses || [])
    } catch (err) {
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/courses', formData)
      setShowForm(false)
      setFormData({ name: '', description: '' })
      fetchCourses()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course')
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/courses/${id}`)
      fetchCourses()
    } catch (err) {
      setError('Failed to delete course')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="card"><p>Access denied. Admin only.</p></div>
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <header className="page-header">
        <div>
          <span className="eyebrow">Workspace / curriculum</span>
          <h1 className="page-title">Courses</h1>
          <p className="page-lede">Shape the learning paths that bring every batch together.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Course'}
        </button>
      </header>
      {error && <div className="alert alert-error">{error}</div>}
      {showForm && (
        <div className="card">
          <h3>New course</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} /></div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>Name</th><th>Description</th><th>Actions</th></tr></thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(c.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

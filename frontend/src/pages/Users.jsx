import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Users() {
  const { user, api } = useContext(AuthContext)
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student', status: 'active' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data.users || [])
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/users', formData)
      setShowForm(false)
      setFormData({ name: '', email: '', password: '', role: 'student', status: 'active' })
      fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user')
    }
  }

  const handleDeactivate = async (id) => {
    try {
      await api.patch(`/users/${id}/status`, { status: 'inactive' })
      fetchUsers()
    } catch (err) {
      setError('Failed to update user')
    }
  }

  if (user?.role !== 'admin') {
    return <div className="card"><p>Access denied. Admin only.</p></div>
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>User Management</h1>
      {error && <div className="alert alert-error">{error}</div>}
      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create User'}
      </button>
      {showForm && (
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label>Name</label><input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></div>
            <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required /></div>
            <div className="form-group"><label>Password</label><input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} /></div>
            <div className="form-group"><label>Role</label><select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div>
            <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
            <button type="submit" className="btn btn-primary">Create</button>
          </form>
        </div>
      )}
      <div className="card">
        <table className="table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  {u.status === 'active' && (
                    <button className="btn btn-danger" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
import { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../App'

export default function Batches() {
  const { user, api } = useContext(AuthContext)
  const [batches, setBatches] = useState([])
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [students, setStudents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ course_id: '', name: '', start_date: '', end_date: '' })
  const [expanded, setExpanded] = useState(null)
  const [batchDetails, setBatchDetails] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [bRes, cRes, uRes] = await Promise.all([
        api.get('/batches'),
        api.get('/courses'),
        api.get('/users'),
      ])
      setBatches(bRes.data.batches || [])
      setCourses(cRes.data.courses || [])
      const allUsers = uRes.data.users || []
      setInstructors(allUsers.filter(u => u.role === 'instructor'))
      setStudents(allUsers.filter(u => u.role === 'student'))
    } catch {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBatchDetail = async (batchId) => {
    try {
      const res = await api.get('/batches/' + batchId)
      setBatchDetails(prev => ({ ...prev, [batchId]: res.data.batch }))
    } catch {}
  }

  const toggleExpand = (batchId) => {
    if (expanded === batchId) { setExpanded(null); return }
    setExpanded(batchId)
    fetchBatchDetail(batchId)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/batches', formData)
      setShowForm(false)
      setFormData({ course_id: '', name: '', start_date: '', end_date: '' })
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch')
    }
  }

  const handleAssignInstructor = async (batchId, instructorId) => {
    if (!instructorId) return
    try {
      await api.post('/batches/' + batchId + '/assign-instructor', { instructor_id: parseInt(instructorId) })
      fetchBatchDetail(batchId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign instructor')
    }
  }

  const handleAddStudent = async (batchId, studentId) => {
    if (!studentId) return
    try {
      await api.post('/batches/' + batchId + '/add-student', { student_id: parseInt(studentId) })
      fetchBatchDetail(batchId)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add student')
    }
  }

  const handleRemoveStudent = async (batchId, studentId) => {
    try {
      await api.delete('/batches/' + batchId + '/remove-student/' + studentId)
      fetchBatchDetail(batchId)
    } catch {
      setError('Failed to remove student')
    }
  }

  if (user?.role !== 'admin') return <div className="card"><p>Access denied. Admin only.</p></div>
  if (loading) return (
    <div className="loading-state">
      <span className="loading-mark" />
      Loading batches…
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow eyebrow-light">Management</span>
          <h1 className="page-title">Batches</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Batch'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {showForm && (
        <div className="card">
          <h3>New Batch</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Course</label>
              <select value={formData.course_id} onChange={e => setFormData({ ...formData, course_id: e.target.value })} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Batch Name</label>
              <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. Batch A - Morning" />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Batch</button>
          </form>
        </div>
      )}

      {batches.length === 0 && !showForm && (
        <div className="card"><p>No batches yet. Create a course first, then create a batch.</p></div>
      )}

      {batches.map(batch => (
        <div key={batch.id} className="card">
          <div className="batch-row">
            <div className="batch-row-info">
              <strong>{batch.name}</strong>
              <span className="batch-course">{batch.course_name}</span>
              <span className="batch-dates">{batch.start_date} → {batch.end_date}</span>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => toggleExpand(batch.id)}>
              {expanded === batch.id ? 'Close' : 'Manage'}
            </button>
          </div>

          {expanded === batch.id && batchDetails[batch.id] && (
            <div className="batch-manage-panel">
              <BatchManagePanel
                batch={batchDetails[batch.id]}
                instructors={instructors}
                students={students}
                onAssignInstructor={(iid) => handleAssignInstructor(batch.id, iid)}
                onAddStudent={(sid) => handleAddStudent(batch.id, sid)}
                onRemoveStudent={(sid) => handleRemoveStudent(batch.id, sid)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function BatchManagePanel({ batch, instructors, students, onAssignInstructor, onAddStudent, onRemoveStudent }) {
  const [selInstructor, setSelInstructor] = useState('')
  const [selStudent, setSelStudent] = useState('')

  const assignedInstructors = batch.instructors || []
  const enrolledStudents = batch.students || []
  const assignedIds = assignedInstructors.map(i => i.id)
  const enrolledIds = enrolledStudents.map(s => s.id)

  const availableInstructors = instructors.filter(i => !assignedIds.includes(i.id))
  const availableStudents = students.filter(s => !enrolledIds.includes(s.id))

  return (
    <div className="manage-grid">
      <div className="manage-col">
        <h4>Instructors</h4>
        {assignedInstructors.length === 0
          ? <p className="text-muted text-sm">No instructor assigned yet.</p>
          : assignedInstructors.map(i => (
            <div key={i.id} className="member-row">
              <span>{i.name}</span>
              <span className="text-muted text-sm">{i.email}</span>
            </div>
          ))
        }
        {availableInstructors.length > 0 && (
          <div className="inline-action">
            <select
              className="inline-select"
              value={selInstructor}
              onChange={e => setSelInstructor(e.target.value)}
            >
              <option value="">Assign instructor…</option>
              {availableInstructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { onAssignInstructor(selInstructor); setSelInstructor('') }}
              disabled={!selInstructor}
            >
              Assign
            </button>
          </div>
        )}
      </div>

      <div className="manage-col">
        <h4>Students ({enrolledStudents.length})</h4>
        {enrolledStudents.length === 0
          ? <p className="text-muted text-sm">No students enrolled yet.</p>
          : enrolledStudents.map(s => (
            <div key={s.id} className="member-row">
              <span>{s.name} <span className="text-muted text-sm">{s.email}</span></span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => onRemoveStudent(s.id)}
              >
                Remove
              </button>
            </div>
          ))
        }
        {availableStudents.length > 0 && (
          <div className="inline-action">
            <select
              className="inline-select"
              value={selStudent}
              onChange={e => setSelStudent(e.target.value)}
            >
              <option value="">Add student…</option>
              {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { onAddStudent(selStudent); setSelStudent('') }}
              disabled={!selStudent}
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

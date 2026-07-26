import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

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

  useEffect(() => {
    fetchAll()
  }, [])

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
    } catch (err) {
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const fetchBatchDetail = async (batchId) => {
    try {
      const res = await api.get('/batches/' + batchId)
      setBatchDetails(prev => ({ ...prev, [batchId]: res.data.batch }))
    } catch (err) {}
  }

  const toggleExpand = (batchId) => {
    if (expanded === batchId) {
      setExpanded(null)
    } else {
      setExpanded(batchId)
      fetchBatchDetail(batchId)
    }
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
    } catch (err) {
      setError('Failed to remove student')
    }
  }

  if (user?.role !== 'admin') return <div className="card"><p>Access denied. Admin only.</p></div>
  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Batch Management</h1>
      {error && <div className="alert alert-error">{error}</div>}

      <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Create Batch'}
      </button>

      {showForm && (
        <div className="card" style={{ marginTop: 16 }}>
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
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{batch.name}</strong>
              <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>{batch.course_name}</span>
              <span style={{ marginLeft: 12, color: '#999', fontSize: 13 }}>{batch.start_date} → {batch.end_date}</span>
            </div>
            <button className="btn btn-primary" onClick={() => toggleExpand(batch.id)}>
              {expanded === batch.id ? 'Close' : 'Manage'}
            </button>
          </div>

          {expanded === batch.id && batchDetails[batch.id] && (
            <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
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
  const assignedInstructorIds = assignedInstructors.map(i => i.id)
  const enrolledStudentIds = enrolledStudents.map(s => s.id)

  const availableInstructors = instructors.filter(i => !assignedInstructorIds.includes(i.id))
  const availableStudents = students.filter(s => !enrolledStudentIds.includes(s.id))

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h4>Instructors</h4>
        {assignedInstructors.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No instructor assigned yet.</p>}
        {assignedInstructors.map(i => (
          <div key={i.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0' }}>
            {i.name} <span style={{ color: '#666', fontSize: 12 }}>{i.email}</span>
          </div>
        ))}
        {availableInstructors.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <select value={selInstructor} onChange={e => setSelInstructor(e.target.value)} style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">Assign instructor...</option>
              {availableInstructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { onAssignInstructor(selInstructor); setSelInstructor('') }}>Assign</button>
          </div>
        )}
      </div>

      <div>
        <h4>Students ({enrolledStudents.length})</h4>
        {enrolledStudents.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>No students enrolled yet.</p>}
        {enrolledStudents.map(s => (
          <div key={s.id} style={{ padding: '6px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{s.name} <span style={{ color: '#666', fontSize: 12 }}>{s.email}</span></span>
            <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: 12 }} onClick={() => onRemoveStudent(s.id)}>Remove</button>
          </div>
        ))}
        {availableStudents.length > 0 && (
          <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
            <select value={selStudent} onChange={e => setSelStudent(e.target.value)} style={{ flex: 1, padding: '6px 8px', border: '1px solid #ddd', borderRadius: 4 }}>
              <option value="">Add student...</option>
              {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button className="btn btn-primary" onClick={() => { onAddStudent(selStudent); setSelStudent('') }}>Add</button>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Reports() {
  const { user, api } = useContext(AuthContext)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async () => {
    try {
      const res = await api.get('/reports/daily')
      setReport(res.data.report || null)
    } catch (err) {
      setError('Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <h1>Reports</h1>
      {report && (
        <div className="card">
          <h3>Daily Attendance Report</h3>
          <table className="table">
            <thead><tr><th>Student</th><th>Status</th><th>Marked At</th></tr></thead>
            <tbody>
              {report.attendance?.map((a) => (
                <tr key={a.id}>
                  <td>{a.student_name || a.student_id}</td>
                  <td>{a.status}</td>
                  <td>{a.marked_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
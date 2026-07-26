import { useState, useEffect } from 'react'
import { AuthContext } from '../App'
import { useContext } from 'react'

export default function Notifications() {
  const { user, api } = useContext(AuthContext)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.notifications || [])
    } catch (err) {
      console.error('Failed to load notifications', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`)
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark as read', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h1>Notifications</h1>
      <div className="card">
        <button className="btn btn-primary" onClick={handleMarkAllRead}>Mark All as Read</button>
      </div>
      {notifications.map((n) => (
        <div key={n.id} className={`card ${n.is_read ? '' : 'unread'}`}>
          <h4>{n.title}</h4>
          <p>{n.message}</p>
          <small>{n.created_at}</small>
          {!n.is_read && (
            <button className="btn btn-primary" onClick={() => handleMarkRead(n.id)}>Mark as Read</button>
          )}
        </div>
      ))}
      {notifications.length === 0 && <div className="card"><p>No notifications.</p></div>}
    </div>
  )
}
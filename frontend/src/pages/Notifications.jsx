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
      window.dispatchEvent(new Event('notifications-updated'))
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
      await api.patch('/notifications')
      fetchNotifications()
    } catch (err) {
      console.error('Failed to mark all as read', err)
    }
  }

  if (loading) return <div className="loading-state"><span className="loading-mark" />Loading notifications...</div>

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  return (
    <div className="notifications-page">
      <header className="page-header notifications-header">
        <div>
          <span className="eyebrow">Workspace / updates</span>
          <h1 className="page-title">Notifications</h1>
          <p className="page-lede">The signals that need your attention, all in one calm space.</p>
        </div>
        {unreadCount > 0 && <button className="btn btn-primary" onClick={handleMarkAllRead}>Mark all read <span>{unreadCount}</span></button>}
      </header>

      {notifications.length > 0 && <div className="notification-summary"><span className="notification-summary-mark" /><p><strong>{unreadCount}</strong> unread {unreadCount === 1 ? 'update' : 'updates'} in your workspace</p></div>}

      {notifications.map((n) => (
        <article key={n.id} className={`notification-item${n.is_read ? ' is-read' : ''}`}>
          <div className="notification-card">
            <div className="notification-symbol" aria-hidden="true"><span>{n.is_read ? '✓' : '✦'}</span></div>
            <div className="notification-content">
              <div className="notification-title-row"><h2>{n.title}</h2>{!n.is_read && <span className="notification-new">New</span>}</div>
              <p>{n.message}</p>
              <time>{formatNotificationDate(n.created_at)}</time>
            </div>
            <div className="notification-actions">
              {!n.is_read && (
                <button className="notification-read-button" onClick={() => handleMarkRead(n.id)}>Mark as read <span aria-hidden="true">→</span></button>
              )}
            </div>
          </div>
        </article>
      ))}
      {notifications.length === 0 && <div className="notification-empty"><span>✦</span><h2>Nothing waiting for you</h2><p>You are all caught up. New updates will appear here.</p></div>}
    </div>
  )
}

function formatNotificationDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

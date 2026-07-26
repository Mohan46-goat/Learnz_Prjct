import { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthContext } from '../App'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useContext(AuthContext)

  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell">
      <section className="login-brand-panel" aria-label="LearnHub introduction">
        <div className="login-brand-top">
          <span className="brand-mark brand-mark-light" aria-hidden="true">LH</span>
          <span className="brand-wordmark">LearnHub</span>
        </div>
        <div className="login-brand-copy">
          <span className="eyebrow eyebrow-light">Learning, in full view.</span>
          <h1>Make every learning day count.</h1>
          <p>A considered workspace for the people who keep programmes moving, learners supported, and progress visible.</p>
        </div>
        <div className="login-brand-bottom">
          <span>Role-based learning operations</span>
          <span>Est. 2026</span>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-heading">
            <span className="eyebrow">Secure access</span>
            <h2>Welcome back.</h2>
            <p>Sign in to continue to your workspace.</p>
          </div>

          {error && <div className="alert alert-error" role="alert">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group login-field">
              <label htmlFor="login-email">Work email</label>
              <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
            </div>
            <div className="form-group login-field">
              <label htmlFor="login-password">Password</label>
              <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>
            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? 'Opening workspace...' : 'Enter workspace'}
              {!loading && <span aria-hidden="true">↗</span>}
            </button>
          </form>

          <p className="login-footnote">Your access is protected by the LearnHub operations team.</p>
        </div>
      </section>
    </div>
  )
}

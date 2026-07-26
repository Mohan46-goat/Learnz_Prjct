import { useState, useEffect, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import Users from './pages/Users'
import Courses from './pages/Courses'
import Batches from './pages/Batches'
import Lessons from './pages/Lessons'
import Attendance from './pages/Attendance'
import Notifications from './pages/Notifications'
import Reports from './pages/Reports'
import Layout from './layouts/Layout'

const AuthContext = createContext(null)

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const userData = response.data.data.user
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    await api.post('/auth/logout')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, api }}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={
            user?.role === 'admin' ? <AdminDashboard /> :
            user?.role === 'instructor' ? <InstructorDashboard /> :
            <StudentDashboard />
          } />
            <Route path="users" element={<Users />} />
            <Route path="courses" element={<Courses />} />
            <Route path="batches" element={<Batches />} />
            <Route path="lessons" element={<Lessons />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reports" element={<Reports />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  )
}

export { AuthContext }
export default App
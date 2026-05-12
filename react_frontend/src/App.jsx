import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

const App = () => {
  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <Router>
      <Routes>
        <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/user'} /> : <Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route 
          path="/user" 
          element={user && user.role === 'user' ? <UserDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route 
          path="/admin" 
          element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
        />
        
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  )
}

export default App

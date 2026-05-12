import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const UserDashboard = () => {
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/user/${user.user_id}`)
        if (response.data.status !== 'active') {
          alert('Your account has been blocked by admin... please contact the admin.')
          handleLogout()
          return
        }
        setProfile(response.data)
      } catch (err) {
        console.error('Failed to fetch profile')
      }
    }
    fetchProfile()
  }, [user.user_id])

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  if (!profile) return <div>Loading...</div>

  return (
    <div className="card shadow p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {profile.name}!</h2>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>
      <div className="row">
        <div className="col-md-4">
          {profile.profile_photo ? (
            <img 
              src={`data:image/jpeg;base64,${profile.profile_photo}`} 
              alt="Profile" 
              className="img-fluid rounded-circle shadow" 
              style={{ width: '200px', height: '200px', objectFit: 'cover' }}
            />
          ) : (
            <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center shadow" style={{ width: '200px', height: '200px' }}>
              No Photo
            </div>
          )}
        </div>
        <div className="col-md-8 text-start">
          <table className="table">
            <tbody>
              <tr><th>Email:</th><td>{profile.email}</td></tr>
              <tr><th>Address:</th><td>{profile.address}</td></tr>
              <tr><th>Contact:</th><td>{profile.contact_number}</td></tr>
              <tr><th>DOB:</th><td>{profile.dob}</td></tr>
              <tr><th>Status:</th><td><span className={`badge bg-${profile.status === 'active' ? 'success' : 'danger'}`}>{profile.status}</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard

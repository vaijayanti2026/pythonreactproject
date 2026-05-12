import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const AdminDashboard = () => {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const navigate = useNavigate()
  const admin = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users')
      setUsers(response.data)
    } catch (err) {
      console.error('Failed to fetch users')
    }
  }

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    try {
      await axios.put(`/api/user/${userId}/status`, { status: newStatus })
      fetchUsers()
    } catch (err) {
      alert('Failed to update status')
    }
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/user/${userId}`)
        fetchUsers()
      } catch (err) {
        alert('Failed to delete user')
      }
    }
  }

  const handleEditChange = (e) => {
    setEditingUser({ ...editingUser, [e.target.name]: e.target.value })
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`/api/user/${editingUser.user_id}`, editingUser)
      setEditingUser(null)
      fetchUsers()
      alert('User updated successfully!')
    } catch (err) {
      alert('Failed to update user')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    navigate('/login')
    window.location.reload()
  }

  return (
    <div className="admin-wrapper">
      {/* Vertical Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          ADMIN PANEL
        </div>
        <nav className="mt-3">
          <Link to="/admin" className="nav-link active">
             Users Management
          </Link>
          {/* <Link to="/admin" className="nav-link">
             Analytics
          </Link>
          <Link to="/admin" className="nav-link">
             Settings
          </Link> */}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Horizontal Navbar */}
        <div className="top-navbar">
          <div className="navbar-brand">
            <h4 className="m-0">User Overview</h4>
          </div>
          <div className="d-flex align-items-center">
            <span className="me-3 text-muted">Welcome, <strong>{admin?.name}</strong></span>
            <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* Content Body */}
        <div className="content-area">
          {editingUser ? (
            <div className="card user-card p-4">
              <h5>Edit User: {editingUser.name}</h5>
              <form onSubmit={handleUpdate}>
                <div className="row mt-3">
                  <div className="col-md-6 mb-3">
                    <label>Name</label>
                    <input name="name" className="form-control" value={editingUser.name} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Email</label>
                    <input name="email" className="form-control" value={editingUser.email} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Contact Number</label>
                    <input name="contact_number" className="form-control" value={editingUser.contact_number} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Address</label>
                    <input name="address" className="form-control" value={editingUser.address} onChange={handleEditChange} required />
                  </div>
                </div>
                <button type="submit" className="btn btn-success me-2">Update</button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
              </form>
            </div>
          ) : (
            <div className="card user-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="m-0">System Users</h5>
                <span className="badge bg-primary">
                  {users.filter(u => u.role !== 'admin').length} Users
                </span>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Photo</th>
                      <th>User Details</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.filter(u => u.role !== 'admin').map(user => (
                      <tr key={user.user_id}>
                        <td>{user.user_id}</td>
                        <td>
                          {user.profile_photo ? (
                            <img 
                              src={`data:image/jpeg;base64,${user.profile_photo}`} 
                              alt="Profile" 
                              className="rounded-circle" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: '40px', height: '40px', fontSize: '12px' }}>
                              N/A
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="fw-bold">{user.name}</div>
                          <small className="text-muted">{user.email}</small>
                        </td>
                        <td>
                          <div>{user.contact_number}</div>
                          <small className="text-muted">{user.dob}</small>
                        </td>
                        <td>
                          <span className={`badge ${user.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => setEditingUser(user)}
                          >
                            Edit
                          </button>
                          <button 
                            className={`btn btn-sm ${user.status === 'active' ? 'btn-outline-warning' : 'btn-success'} me-2`}
                            onClick={() => toggleStatus(user.user_id, user.status)}
                            style={{ width: '90px' }}
                          >
                            {user.status === 'active' ? 'Suspend' : 'Activate'}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(user.user_id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

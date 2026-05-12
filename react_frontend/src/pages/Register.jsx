import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    email: '',
    contact_number: '',
    dob: '',
    password: ''
  })
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    const data = new FormData()
    Object.keys(formData).forEach(key => data.append(key, formData[key]))
    if (file) data.append('profile_photo', file)

    try {
      const response = await axios.post('/api/register', data)
      if (response.data.success) {
        alert('Registration successful! Please login.')
        navigate('/login')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-6 card shadow p-4 mt-4">
          <h2 className="mb-4">Register</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleRegister}>
            <div className="row">
              <div className="col-md-6 mb-3 text-start">
                <label className="form-label">Full Name</label>
                <input name="name" className="form-control" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3 text-start">
                <label className="form-label">Email</label>
                <input type="email" name="email" className="form-control" onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3 text-start">
              <label className="form-label">Address</label>
              <textarea name="address" className="form-control" onChange={handleChange} required />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3 text-start">
                <label className="form-label">Contact</label>
                <input name="contact_number" className="form-control" onChange={handleChange} required />
              </div>
              <div className="col-md-6 mb-3 text-start">
                <label className="form-label">Date of Birth</label>
                <input type="date" name="dob" className="form-control" onChange={handleChange} required />
              </div>
            </div>
            <div className="mb-3 text-start">
              <label className="form-label">Profile Photo</label>
              <input type="file" className="form-control" onChange={handleFileChange} accept="image/*" />
            </div>
            <div className="mb-3 text-start">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-control" onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-success w-100 mb-3">Register</button>
          </form>
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}

export default Register

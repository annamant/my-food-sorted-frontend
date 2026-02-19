import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { login, register, API } from '../lib/api'
import './LoginForm.css'

export default function LoginForm({ email, setEmail, onSuccess, loading, setLoading }) {
  const [password, setPassword] = useState('')
  const { addToast } = useToast()

  function validate() {
    if (!email.trim() || !email.includes('@')) {
      addToast('Please enter a valid email address.', 'error')
      return false
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error')
      return false
    }
    return true
  }

  async function handleAuth(endpoint) {
    if (!validate()) return
    setLoading(true)
    try {
      const fn = endpoint === 'login' ? login : register
      const data = await fn(API, email, password)
      onSuccess(data)
      addToast(data.message || (endpoint === 'login' ? 'Logged in.' : 'Registered.'), 'success')
    } catch (err) {
      addToast(err.message || 'Something went wrong.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-form">
      <h2 className="login-form__title">Login / Register</h2>
      <div className="login-form__fields">
        <label className="login-form__label">
          <span className="login-form__labelText">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-form__input"
            autoComplete="email"
          />
        </label>
        <label className="login-form__label">
          <span className="login-form__labelText">Password</span>
          <input
            type="password"
            placeholder="Min 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-form__input"
            autoComplete={password ? 'current-password' : 'new-password'}
          />
        </label>
      </div>
      <div className="login-form__actions">
        <button
          type="button"
          onClick={() => handleAuth('login')}
          disabled={loading}
          className="btn btn--primary"
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => handleAuth('register')}
          disabled={loading}
          className="btn btn--secondary"
        >
          Register
        </button>
      </div>
    </div>
  )
}

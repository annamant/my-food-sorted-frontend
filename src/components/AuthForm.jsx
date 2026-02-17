import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import './AuthForm.css'

function AuthForm({
  API,
  loading,
  handleAuth,
  handleLogout,
  loggedInUserId,
  email: userEmail,
}) {
  const [email, setEmail] = useState('')
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

  function onAuth(endpoint) {
    if (!validate()) return
    handleAuth(endpoint, email, password)
  }

  if (loggedInUserId) {
    return (
      <div className="auth-form auth-form--logged-in">
        <div className="auth-form__logged-in">
          <p className="auth-form__user-info">
            Logged in as: <span className="auth-form__user-infoHighlight">{userEmail}</span>
            {' '}(User ID: <span className="auth-form__user-infoHighlight">{loggedInUserId}</span>)
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="btn btn--danger"
            aria-label="Log out"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <div className="auth-form__fields">
        <h2 className="auth-form__title">Login / Register</h2>
        <label className="auth-form__label">
          <span className="auth-form__labelText">Email</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-form__input"
            autoComplete="email"
          />
        </label>
        <label className="auth-form__label">
          <span className="auth-form__labelText">Password</span>
          <input
            type="password"
            placeholder="Password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-form__input"
            autoComplete="current-password"
          />
        </label>
        <div className="auth-form__actions">
          <button
            type="button"
            onClick={() => onAuth('login')}
            disabled={loading}
            className="btn btn--primary"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onAuth('register')}
            disabled={loading}
            className="btn btn--secondary"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}

export default AuthForm

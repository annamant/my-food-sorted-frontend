import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import './AuthForm.css'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

function AuthForm({ loading, handleAuth, handleLogout, loggedInUserId, email: userEmail }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const { addToast } = useToast()

  function validate() {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      addToast('Please enter a valid email address.', 'error')
      return false
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error')
      return false
    }
    return true
  }

  function onSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    handleAuth(mode, email.trim(), password)
  }

  if (loggedInUserId) {
    return (
      <div className="auth-form auth-form--logged-in">
        <div className="auth-form__logged-in">
          <p className="auth-form__user-info">
            Logged in as: <span className="auth-form__user-infoHighlight">{userEmail}</span>
            {' '}(User ID: <span className="auth-form__user-infoHighlight">{loggedInUserId}</span>)
          </p>
          <button type="button" onClick={handleLogout} className="btn btn--danger" aria-label="Log out">
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <form className="auth-form__fields" onSubmit={onSubmit} noValidate>
        <h2 className="auth-form__title">{mode === 'login' ? 'Login' : 'Register'}</h2>
        <label className="auth-form__label">
          <span className="auth-form__labelText">Email</span>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-form__input"
            autoComplete="email"
            required
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
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
          />
        </label>
        <div className="auth-form__actions">
          <button type="submit" disabled={loading} className="btn btn--primary">
            {mode === 'login' ? 'Login' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            disabled={loading}
            className="btn btn--secondary"
          >
            {mode === 'login' ? 'Create account' : 'Back to login'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AuthForm

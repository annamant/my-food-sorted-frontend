import { useEffect, useState } from 'react'
import { useToast } from '../context/ToastContext'
import './AuthForm.css'

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

function AuthForm({ loading, handleAuth, handleLogout, loggedInUserId, email: userEmail, initialMode = 'register' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState(initialMode)
  const [formError, setFormError] = useState('')
  const { addToast } = useToast()

  useEffect(() => {
    setMode(initialMode)
    setFormError('')
  }, [initialMode])

  function validate() {
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      const message = 'Please enter a valid email address.'
      setFormError(message)
      addToast(message, 'error')
      return false
    }
    if (password.length < 8) {
      const message = 'Password must be at least 8 characters long.'
      setFormError(message)
      addToast(message, 'error')
      return false
    }
    return true
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setFormError('')
    const result = await handleAuth(mode, email.trim(), password)
    if (!result?.ok) {
      const message = mode === 'register' && /already registered/i.test(result?.error || '')
        ? 'An account with this email already exists. Log in instead.'
        : result?.error || 'We could not complete that request. Please try again.'
      setFormError(message)
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setPassword('')
    setFormError('')
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
        <h2 className="auth-form__title">{mode === 'login' ? 'Welcome back' : 'Create your kitchen'}</h2>
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
          {formError && (
            <div className="auth-form__error" role="alert">
              <span>{formError}</span>
              {mode === 'register' && /already exists/i.test(formError) && (
                <button type="button" onClick={() => switchMode('login')}>Log in instead</button>
              )}
            </div>
          )}
          <button type="submit" disabled={loading} className="btn btn--primary">
            {mode === 'login' ? 'Log in' : 'Join free'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
            disabled={loading}
            className="btn btn--secondary"
          >
            {mode === 'login' ? 'Need an account? Join' : 'Already here? Log in'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AuthForm

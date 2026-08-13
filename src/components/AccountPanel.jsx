import { useState } from 'react'
import './AccountPanel.css'

function AccountPanel({ prefs, onChangePassword, loading, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const remaining =
    prefs?.message_quota != null && prefs?.message_count != null
      ? Math.max(0, prefs.message_quota - prefs.message_count)
      : null

  async function handleSubmit(e) {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.')
      return
    }

    setBusy(true)
    try {
      await onChangePassword({
        current_password: currentPassword,
        new_password: newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password updated.')
    } catch (err) {
      setError(err.message || 'Could not update password.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="account-panel" id="account">
      <div className="account-panel__header">
        <p className="account-panel__label">Account</p>
        <h2 className="account-panel__title">Your profile</h2>
        <p className="account-panel__subtitle">
          Manage your sign-in details. Household cooking notes live below.
        </p>
      </div>

      <dl className="account-panel__meta">
        <div>
          <dt>Email</dt>
          <dd>{prefs?.email || '—'}</dd>
        </div>
        {remaining != null && (
          <div>
            <dt>Messages left</dt>
            <dd>{remaining}</dd>
          </div>
        )}
      </dl>

      <form className="account-panel__form" onSubmit={handleSubmit}>
        <h3 className="account-panel__formTitle">Change password</h3>
        <label className="account-panel__field">
          <span>Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label className="account-panel__field">
          <span>New password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>
        <label className="account-panel__field">
          <span>Confirm new password</span>
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={8}
            required
          />
        </label>

        {error && <p className="account-panel__error">{error}</p>}
        {message && <p className="account-panel__success">{message}</p>}

        <div className="account-panel__actions">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={busy || loading}
          >
            {busy ? 'Updating…' : 'Update password'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onLogout}
          >
            Log out
          </button>
        </div>
      </form>
    </div>
  )
}

export default AccountPanel

import { useEffect, useState } from 'react'
import './AccountPage.css'

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'preferences', label: 'Preferences' },
  { id: 'billing', label: 'Billing', soon: true },
]

function ProfileSection({ prefs, onLogout }) {
  const remaining =
    prefs?.message_quota != null && prefs?.message_count != null
      ? Math.max(0, prefs.message_quota - prefs.message_count)
      : null

  return (
    <div className="account-section">
      <h2 className="account-section__title">Profile</h2>
      <p className="account-section__lead">
        Who you are in this kitchen.
      </p>
      <dl className="account-section__meta">
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
        <div>
          <dt>Household</dt>
          <dd>{prefs?.household_size ?? '—'} people</dd>
        </div>
        <div>
          <dt>Default budget</dt>
          <dd>
            {prefs?.default_budget != null ? `£${prefs.default_budget}` : '—'}
          </dd>
        </div>
        <div>
          <dt>Preferred shop</dt>
          <dd>
            {prefs?.preferred_retailer === 'sainsburys' ? 'Sainsbury’s' : 'Tesco'}
          </dd>
        </div>
      </dl>
      <button type="button" className="btn btn--ghost account-section__logout" onClick={onLogout}>
        Log out
      </button>
    </div>
  )
}

function SecuritySection({ onChangePassword, loading }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

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
    <div className="account-section">
      <h2 className="account-section__title">Security & login</h2>
      <p className="account-section__lead">
        Change the password for this kitchen.
      </p>

      <form className="account-section__form" onSubmit={handleSubmit}>
        <label className="account-section__field">
          <span>Current password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </label>
        <label className="account-section__field">
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
        <label className="account-section__field">
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

        {error && <p className="account-section__error">{error}</p>}
        {message && <p className="account-section__success">{message}</p>}

        <div className="account-section__actions">
          <button type="submit" className="btn btn--primary" disabled={busy || loading}>
            {busy ? 'Updating…' : 'Update password'}
          </button>
        </div>
      </form>
    </div>
  )
}

function PreferencesSection({ prefs, onSave, loading }) {
  const [dietary, setDietary] = useState('')
  const [allergies, setAllergies] = useState('')
  const [household, setHousehold] = useState(2)
  const [budget, setBudget] = useState('')
  const [retailer, setRetailer] = useState('tesco')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!prefs) return
    setDietary(prefs.dietary_preferences ?? '')
    setAllergies(prefs.allergies ?? '')
    setHousehold(prefs.household_size ?? 2)
    setBudget(prefs.default_budget != null ? String(prefs.default_budget) : '')
    setRetailer(prefs.preferred_retailer ?? 'tesco')
    setDirty(false)
  }, [prefs])

  const handleSave = () => {
    const budgetNum = budget.trim() === '' ? null : Number(budget)
    onSave({
      dietary_preferences: dietary,
      allergies,
      household_size: Number(household) || 1,
      default_budget: budgetNum != null && !Number.isNaN(budgetNum) ? budgetNum : null,
      preferred_retailer: retailer,
    })
    setDirty(false)
  }

  return (
    <div className="account-section">
      <h2 className="account-section__title">Preferences</h2>
      <p className="account-section__lead">
        Diet, allergies, household and budget — used whenever you compose.
      </p>

      <div className="account-section__grid">
        <label className="account-section__field">
          <span>Diet</span>
          <input
            type="text"
            value={dietary}
            onChange={(e) => { setDietary(e.target.value); setDirty(true) }}
            placeholder="e.g. vegetarian, halal, high protein"
          />
        </label>
        <label className="account-section__field">
          <span>Allergies</span>
          <input
            type="text"
            value={allergies}
            onChange={(e) => { setAllergies(e.target.value); setDirty(true) }}
            placeholder="e.g. nuts, shellfish, gluten"
          />
        </label>
        <label className="account-section__field">
          <span>Household size</span>
          <input
            type="number"
            min={1}
            max={20}
            value={household}
            onChange={(e) => { setHousehold(e.target.value); setDirty(true) }}
          />
        </label>
        <label className="account-section__field">
          <span>Weekly budget (£)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={budget}
            onChange={(e) => { setBudget(e.target.value); setDirty(true) }}
            placeholder="e.g. 60"
          />
        </label>
        <label className="account-section__field">
          <span>Preferred supermarket</span>
          <select
            value={retailer}
            onChange={(e) => { setRetailer(e.target.value); setDirty(true) }}
          >
            <option value="tesco">Tesco</option>
            <option value="sainsburys">Sainsbury&apos;s</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        className="btn btn--primary account-section__save"
        onClick={handleSave}
        disabled={loading || !dirty}
      >
        {loading ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  )
}

function BillingSection() {
  return (
    <div className="account-section">
      <h2 className="account-section__title">Billing</h2>
      <p className="account-section__lead">
        Plans and payment will live here. You’re on the free starter for now.
      </p>
      <div className="account-section__soon">
        <p className="account-section__soonTitle">Coming soon</p>
        <p className="account-section__soonBody">
          Subscriptions, invoices, and message packs — without leaving your account.
        </p>
      </div>
    </div>
  )
}

export default function AccountPage({
  prefs,
  onChangePassword,
  onSavePrefs,
  loading,
  onLogout,
  onOpenLibrary,
}) {
  const [section, setSection] = useState('profile')

  return (
    <div className="account-page">
      <header className="account-page__hero">
        <p className="account-page__label">Account</p>
        <h1 className="account-page__title">Your settings</h1>
        <p className="account-page__body">
          Profile, security, and cooking preferences — separate from the kitchen.
        </p>
      </header>

      <div className="account-page__layout">
        <aside className="account-page__aside" aria-label="Account sections">
          <nav className="account-page__menu">
            {SECTIONS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`account-page__menuItem ${section === item.id ? 'account-page__menuItem--active' : ''}`}
                onClick={() => setSection(item.id)}
              >
                <span>{item.label}</span>
                {item.soon && <span className="account-page__soonBadge">Soon</span>}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="account-page__libraryLink"
            onClick={onOpenLibrary}
          >
            ← Back to lists
          </button>
          <button
            type="button"
            className="account-page__logout"
            onClick={onLogout}
          >
            Log out
          </button>
        </aside>

        <div className="account-page__content">
          {section === 'profile' && <ProfileSection prefs={prefs} onLogout={onLogout} />}
          {section === 'security' && (
            <SecuritySection
              onChangePassword={onChangePassword}
              loading={loading}
            />
          )}
          {section === 'preferences' && (
            <PreferencesSection
              prefs={prefs}
              onSave={onSavePrefs}
              loading={loading}
            />
          )}
          {section === 'billing' && <BillingSection />}
        </div>
      </div>
    </div>
  )
}

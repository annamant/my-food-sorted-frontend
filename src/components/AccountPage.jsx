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
            {prefs?.preferred_retailer === 'sainsburys' ? 'Sainsbury’s'
              : prefs?.preferred_retailer === 'asda' ? 'Asda'
              : prefs?.preferred_retailer === 'ocado' ? 'Ocado'
              : 'Tesco'}
          </dd>
        </div>
        {prefs?.cooking_skill && (
          <div>
            <dt>Cooking skill</dt>
            <dd>
              {prefs.cooking_skill === 'beginner' ? 'Beginner'
                : prefs.cooking_skill === 'confident' ? 'Confident'
                : prefs.cooking_skill === 'advanced' ? 'Advanced'
                : '—'}
            </dd>
          </div>
        )}
        {prefs?.cuisines && (
          <div>
            <dt>Cuisines you like</dt>
            <dd>{prefs.cuisines}</dd>
          </div>
        )}
        {prefs?.max_cook_minutes != null && (
          <div>
            <dt>Max time per meal</dt>
            <dd>{prefs.max_cook_minutes} min</dd>
          </div>
        )}
        {prefs?.cooks_for && (
          <div>
            <dt>Cooks for</dt>
            <dd>{prefs.cooks_for}</dd>
          </div>
        )}
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
  const [cookingSkill, setCookingSkill] = useState('')
  const [cuisines, setCuisines] = useState('')
  const [maxCook, setMaxCook] = useState('')
  const [equipment, setEquipment] = useState('')
  const [cooksFor, setCooksFor] = useState('')
  const [ageRange, setAgeRange] = useState('')
  const [sex, setSex] = useState('')
  const [activity, setActivity] = useState('')
  const [weight, setWeight] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!prefs) return
    setDietary(prefs.dietary_preferences ?? '')
    setAllergies(prefs.allergies ?? '')
    setHousehold(prefs.household_size ?? 2)
    setBudget(prefs.default_budget != null ? String(prefs.default_budget) : '')
    setRetailer(prefs.preferred_retailer ?? 'tesco')
    setCookingSkill(prefs.cooking_skill ?? '')
    setCuisines(prefs.cuisines ?? '')
    setMaxCook(prefs.max_cook_minutes != null ? String(prefs.max_cook_minutes) : '')
    setEquipment(prefs.kitchen_equipment ?? '')
    setCooksFor(prefs.cooks_for ?? '')
    setAgeRange(prefs.age_range ?? '')
    setSex(prefs.sex ?? '')
    setActivity(prefs.activity_level ?? '')
    setWeight(prefs.weight_kg != null ? String(prefs.weight_kg) : '')
    setDirty(false)
  }, [prefs])

  const handleSave = () => {
    const budgetNum = budget.trim() === '' ? null : Number(budget)
    const maxCookNum = maxCook.trim() === '' ? null : Number(maxCook)
    onSave({
      dietary_preferences: dietary,
      allergies,
      household_size: Number(household) || 1,
      default_budget: budgetNum != null && !Number.isNaN(budgetNum) ? budgetNum : null,
      preferred_retailer: retailer,
      cooking_skill: cookingSkill || null,
      cuisines,
      max_cook_minutes: maxCookNum != null && !Number.isNaN(maxCookNum) ? maxCookNum : null,
      kitchen_equipment: equipment,
      cooks_for: cooksFor || null,
      age_range: ageRange || null,
      sex: sex || null,
      activity_level: activity || null,
      weight_kg: weight !== '' && !Number.isNaN(Number(weight)) ? Math.round(Number(weight) * 10) / 10 : null,
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
            <option value="asda">Asda</option>
            <option value="ocado">Ocado</option>
          </select>
        </label>
      </div>

      <h3 className="account-section__subtitle">Your cooking</h3>
      <div className="account-section__grid">
        <label className="account-section__field">
          <span>Cooking skill</span>
          <select
            value={cookingSkill}
            onChange={(e) => { setCookingSkill(e.target.value); setDirty(true) }}
          >
            <option value="">Not set</option>
            <option value="beginner">Beginner</option>
            <option value="confident">Confident</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="account-section__field">
          <span>Cuisines you like</span>
          <input
            type="text"
            value={cuisines}
            onChange={(e) => { setCuisines(e.target.value); setDirty(true) }}
            placeholder="e.g. Italian, Mexican, Thai"
          />
        </label>
        <label className="account-section__field">
          <span>Max minutes per meal</span>
          <input
            type="number"
            min={5}
            max={240}
            value={maxCook}
            onChange={(e) => { setMaxCook(e.target.value); setDirty(true) }}
            placeholder="e.g. 30"
          />
        </label>
        <label className="account-section__field">
          <span>Kitchen equipment</span>
          <input
            type="text"
            value={equipment}
            onChange={(e) => { setEquipment(e.target.value); setDirty(true) }}
            placeholder="e.g. oven, air fryer, slow cooker"
          />
        </label>
        <label className="account-section__field">
          <span>Who you cook for</span>
          <input
            type="text"
            value={cooksFor}
            onChange={(e) => { setCooksFor(e.target.value); setDirty(true) }}
            placeholder="e.g. just me, family of four"
          />
        </label>
      </div>

      <h3 className="account-section__subtitle">A bit about you</h3>
      <p className="account-section__hint">
        Optional. Helps size portions and pick realistic meals. No medical info, no medication.
      </p>
      <div className="account-section__grid">
        <label className="account-section__field">
          <span>Age range</span>
          <select
            value={ageRange}
            onChange={(e) => { setAgeRange(e.target.value); setDirty(true) }}
          >
            <option value="">Not set</option>
            <option value="under_18">Under 18</option>
            <option value="18_30">18–30</option>
            <option value="31_50">31–50</option>
            <option value="51_65">51–65</option>
            <option value="over_65">Over 65</option>
          </select>
        </label>
        <label className="account-section__field">
          <span>Sex</span>
          <select
            value={sex}
            onChange={(e) => { setSex(e.target.value); setDirty(true) }}
          >
            <option value="">Not set</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
        </label>
        <label className="account-section__field">
          <span>Activity level</span>
          <select
            value={activity}
            onChange={(e) => { setActivity(e.target.value); setDirty(true) }}
          >
            <option value="">Not set</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="active">Active</option>
            <option value="very_active">Very active</option>
          </select>
        </label>
        <label className="account-section__field">
          <span>Weight (kg)</span>
          <input
            type="number"
            min="30"
            max="300"
            step="0.1"
            value={weight}
            onChange={(e) => { setWeight(e.target.value); setDirty(true) }}
            placeholder="optional"
          />
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

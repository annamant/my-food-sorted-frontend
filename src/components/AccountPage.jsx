import AccountPanel from './AccountPanel'
import PrefsPanel from './PrefsPanel'
import './AccountPage.css'

export default function AccountPage({
  prefs,
  onChangePassword,
  onSavePrefs,
  loading,
  onLogout,
  onBack,
}) {
  return (
    <div className="account-page">
      <div className="account-page__intro">
        <button type="button" className="account-page__back" onClick={onBack}>
          ← Library
        </button>
        <p className="account-page__label">Account</p>
        <h1 className="account-page__title">Your profile</h1>
        <p className="account-page__body">
          Sign-in details, household preferences, and how you cook — kept here, off the kitchen floor.
        </p>
      </div>

      <section className="account-page__section">
        <AccountPanel
          prefs={prefs}
          onChangePassword={onChangePassword}
          loading={loading}
          onLogout={onLogout}
          embedded
        />
      </section>

      <section className="account-page__section">
        <PrefsPanel
          prefs={prefs}
          onSave={onSavePrefs}
          loading={loading}
        />
      </section>
    </div>
  )
}

import { useRef } from 'react'
import AuthForm from './AuthForm'
import './LandingPage.css'

function LogoMark({ size = 'md', tone = 'ink' }) {
  return (
    <div
      className={`logomark logomark--${size} logomark--${tone}`}
      aria-label="my food. SORTED."
    >
      <span className="logomark__top">my food.</span>
      <span className="logomark__bottom">SORTED.</span>
    </div>
  )
}

const STEPS = [
  {
    title: 'Brief what you want',
    body: 'Budget, calories, household, tastes — your requirements, nothing generic.',
  },
  {
    title: 'Compose with the kitchen',
    body: 'Ask for a classic recipe, invent something new, or shape a full week — written for your stove.',
  },
  {
    title: 'Keep it in your library',
    body: 'Save meals and weeks like playlists. Reopen them, cook again, or ask for something in the same spirit.',
  },
]

export default function LandingPage({ loading, handleAuth }) {
  const authRef = useRef(null)

  function scrollToAuth() {
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__navSpacer" aria-hidden="true" />
        <button type="button" className="btn landing__navCta" onClick={scrollToAuth}>
          Begin
        </button>
      </nav>

      <header className="landing__hero">
        <div className="landing__heroMedia" aria-hidden="true">
          <img
            className="landing__heroImg"
            src="https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&w=2400&q=80"
            alt=""
          />
          <div className="landing__heroShade" />
        </div>

        <div className="landing__heroContent">
          <LogoMark size="md" tone="light" />
          <h1 className="landing__headline">
            Your kitchen library.<br />
            <em>Composed for you.</em>
          </h1>
          <p className="landing__sub">
            Create recipes around budget, calories, and taste — or ask for a classic —
            then keep them in a library that grows with how you cook.
          </p>
          <div className="landing__heroCtas">
            <button type="button" className="btn landing__ctaPrimary" onClick={scrollToAuth}>
              Open your library
            </button>
            <span className="landing__ctaNote">Complimentary · moments to begin</span>
          </div>
        </div>
      </header>

      <section className="landing__steps" aria-labelledby="steps-heading">
        <p className="landing__stepsLabel">The method</p>
        <h2 id="steps-heading" className="landing__stepsTitle">
          Three quiet movements.
        </h2>
        <ol className="landing__stepsList">
          {STEPS.map((step, i) => (
            <li key={step.title} className="landing__step">
              <span className="landing__stepNum" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="landing__stepCopy">
                <h3 className="landing__stepTitle">{step.title}</h3>
                <p className="landing__stepBody">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="landing__authSection" ref={authRef}>
        <div className="landing__authInner">
          <p className="landing__authLabel">Your library</p>
          <h2 className="landing__authTitle">Start your collection.</h2>
          <p className="landing__authSub">Free to join. Ready in under a minute.</p>
          <AuthForm
            loading={loading}
            handleAuth={handleAuth}
            loggedInUserId={null}
            email=""
            handleLogout={() => {}}
          />
        </div>
      </section>

      <footer className="landing__footer">
        <LogoMark size="sm" tone="ink" />
        <p className="landing__footerNote">
          © {new Date().getFullYear()} my food. SORTED. — your recipes, kept.
        </p>
      </footer>
    </div>
  )
}

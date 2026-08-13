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
    title: 'Brief your week',
    body: 'Tastes, budget, household, and what you will and won’t cook — your requirements, nothing generic.',
  },
  {
    title: 'Open a composed week',
    body: 'Recipes, timing, and cost arrive like a weekly box of ideas — exceptional, and written for your kitchen.',
  },
  {
    title: 'Shop, then cook it yourself',
    body: 'Your list builds and opens at Tesco or Sainsbury’s. The plate is yours — made by you, at home.',
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
            Extraordinary weeks.<br />
            <em>Cooked in your kitchen.</em>
          </h1>
          <p className="landing__sub">
            Built from your requirements — then made by you. Recipes, timing, and a
            weekly shop, composed so home cooking feels restaurant-calibre.
          </p>
          <div className="landing__heroCtas">
            <button type="button" className="btn landing__ctaPrimary" onClick={scrollToAuth}>
              Start planning
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
          <p className="landing__authLabel">Your kitchen</p>
          <h2 className="landing__authTitle">Open your place at the table.</h2>
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
          © {new Date().getFullYear()} my food. SORTED. — cook as if it matters.
        </p>
      </footer>
    </div>
  )
}

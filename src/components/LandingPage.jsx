import { useEffect, useRef, useState } from 'react'
import AuthForm from './AuthForm'
import MealPlanDisplay from './MealPlanDisplay'
import { FEATURED_DISHES } from '../data/featuredDishes'
import { INSPIRATIONS } from '../data/inspirations'
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
    title: 'Ask for tonight',
    body: 'Search a dish you know, or create one with filters. Inspirations need a kitchen — join first.',
  },
  {
    title: 'Remix it for your life',
    body: 'Cheaper, lighter, more protein, or from the cupboard — without losing the dish.',
  },
  {
    title: 'Keep what you cook',
    body: 'Save it to your library. Reopen it next week. Share the version you actually made.',
  },
]

export default function LandingPage({
  loading,
  handleAuth,
  initialAuthMode = 'register',
  pendingInspiration,
  onPickInspiration,
}) {
  const authRef = useRef(null)
  const dishesRef = useRef(null)
  const inspireRef = useRef(null)
  const [openDish, setOpenDish] = useState(null)
  const [authMode, setAuthMode] = useState(initialAuthMode)

  useEffect(() => {
    setAuthMode(initialAuthMode)
  }, [initialAuthMode])

  useEffect(() => {
    if (!openDish) return
    function onKey(e) {
      if (e.key === 'Escape') setOpenDish(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openDish])

  function scrollToAuth(nextMode) {
    if (nextMode === 'login' || nextMode === 'register') setAuthMode(nextMode)
    setOpenDish(null)
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function scrollToInspirations() {
    inspireRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function scrollToDishes() {
    dishesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function pickInspiration(item) {
    onPickInspiration?.(item)
    scrollToAuth('register')
  }

  return (
    <div className="landing">
      <nav className="landing__nav">
        <span className="landing__navSpacer" aria-hidden="true" />
        <div className="landing__navActions">
          <button type="button" className="landing__navLogin" onClick={() => scrollToAuth('login')}>
            Log in
          </button>
          <button type="button" className="btn landing__navCta" onClick={() => scrollToAuth('register')}>
            Join
          </button>
        </div>
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
            What’s for<br />
            <em>dinner?</em>
          </h1>
          <p className="landing__sub">
            Real dishes you can cook tonight. Remix them for budget and
            wellbeing — then keep the version you actually make.
          </p>
          <div className="landing__heroCtas">
            <button type="button" className="btn landing__ctaPrimary" onClick={scrollToInspirations}>
              Choose an inspiration
            </button>
            <button type="button" className="btn landing__ctaGhost" onClick={scrollToDishes}>
              See tonight’s dishes
            </button>
          </div>
        </div>
      </header>

      <section className="landing__dishes" ref={dishesRef} aria-labelledby="dishes-heading">
        <p className="landing__dishesLabel">Tonight</p>
        <h2 id="dishes-heading" className="landing__dishesTitle">
          Three plates. Tap one and cook.
        </h2>
        <ul className="landing__dishGrid">
          {FEATURED_DISHES.map((dish) => (
            <li key={dish.id}>
              <button
                type="button"
                className="landing__dish"
                onClick={() => setOpenDish(dish)}
              >
                <span className="landing__dishMedia" aria-hidden="true">
                  <img src={dish.image} alt="" />
                </span>
                <span className="landing__dishCopy">
                  <span className="landing__dishEyebrow">{dish.eyebrow}</span>
                  <span className="landing__dishName">{dish.title}</span>
                  <span className="landing__dishBlurb">{dish.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing__inspire" ref={inspireRef} aria-labelledby="inspire-heading">
        <p className="landing__dishesLabel">Inspirations</p>
        <h2 id="inspire-heading" className="landing__dishesTitle">
          Choose an inspiration
        </h2>
        <p className="landing__inspireLead">
          A mood for the kitchen, not a recipe list. Tap one, then join or log in to search and create.
        </p>
        <ul className="landing__inspireGrid">
          {INSPIRATIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`landing__inspireTile ${pendingInspiration?.id === item.id ? 'landing__inspireTile--on' : ''}`}
                onClick={() => pickInspiration(item)}
              >
                <span className="landing__inspireMedia" aria-hidden="true">
                  <img src={item.image} alt="" />
                  <span className="landing__inspireShade" />
                  <span className="landing__inspireOnImage">
                    <span className="landing__inspireName">{item.title}</span>
                    <span className="landing__inspireBlurb">{item.blurb}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing__steps" aria-labelledby="steps-heading">
        <p className="landing__stepsLabel">How it works</p>
        <h2 id="steps-heading" className="landing__stepsTitle">
          Dinner first. The library comes after.
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
          <p className="landing__authLabel">
            {pendingInspiration ? 'Continue to the kitchen' : 'Keep what you cook'}
          </p>
          <h2 className="landing__authTitle">
            {pendingInspiration
              ? (authMode === 'login'
                ? `Log in to cook ${pendingInspiration.title}.`
                : `Join to cook ${pendingInspiration.title}.`)
              : (authMode === 'login' ? 'Welcome back.' : 'Join to save it.')}
          </h2>
          <p className="landing__authSub">
            {pendingInspiration
              ? 'Create an account or log in — then the kitchen opens with this inspiration.'
              : authMode === 'login'
                ? 'Log in, or enter Eve’s demo kitchen.'
                : 'Free. Under a minute. Remix and lists wait here.'}
          </p>
          <AuthForm
            loading={loading}
            handleAuth={handleAuth}
            loggedInUserId={null}
            email=""
            handleLogout={() => {}}
            initialMode={authMode}
          />
        </div>
      </section>

      <footer className="landing__footer">
        <LogoMark size="sm" tone="ink" />
        <p className="landing__footerNote">
          © {new Date().getFullYear()} my food. SORTED. — dinner, then the library.
        </p>
      </footer>

      {openDish && (
        <div className="landing__cook" role="dialog" aria-modal="true" aria-labelledby="cook-title">
          <div className="landing__cookPanel">
            <header className="landing__cookBar">
              <p id="cook-title" className="landing__cookEyebrow">{openDish.eyebrow}</p>
              <button type="button" className="btn btn--ghost" onClick={() => setOpenDish(null)}>
                Close
              </button>
            </header>
            <MealPlanDisplay mealPlan={openDish.mealPlan} readOnly alreadySaved />
            <div className="landing__cookKeep">
              <p>Like it? Join to save, remix, and take the list to the shop.</p>
              <button type="button" className="btn btn--primary" onClick={scrollToAuth}>
                Keep this in your library
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

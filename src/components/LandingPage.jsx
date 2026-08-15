import { useEffect, useRef, useState } from 'react'
import AuthForm from './AuthForm'
import MealPlanDisplay from './MealPlanDisplay'
import { FEATURED_DISHES } from '../data/featuredDishes'
import { INSPIRATIONS } from '../data/inspirations'
import { dishesForCollection } from '../data/catalog'
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
  const [shelf, setShelf] = useState(null)
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
    const dishes = dishesForCollection(item.id).map((d) => ({
      id: d.id,
      eyebrow: item.title,
      title: d.title,
      blurb: d.blurb,
      image: d.image,
      mealPlan: d.mealPlan,
    }))
    setShelf({ mood: item, dishes })
    onPickInspiration?.(item)
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
            Real dishes, already on the shelf. Tap one and cook. Save it when you want to keep it.
          </p>
          <div className="landing__heroCtas">
            <button type="button" className="btn landing__ctaPrimary" onClick={scrollToDishes}>
              Cook tonight
            </button>
            <button type="button" className="btn landing__ctaGhost" onClick={scrollToInspirations}>
              Browse classics
            </button>
          </div>
        </div>
      </header>

      <section className="landing__dishes" ref={dishesRef} aria-labelledby="dishes-heading">
        <p className="landing__dishesLabel">Already here</p>
        <h2 id="dishes-heading" className="landing__dishesTitle">
          Classics you can cook tonight.
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
          Tap a mood. The dishes are already there — no account to look.
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
        {shelf?.dishes?.length > 0 && (
          <div className="landing__shelf">
            <h3 className="landing__shelfTitle">{shelf.mood.title}</h3>
            <ul className="landing__dishGrid">
              {shelf.dishes.map((dish) => (
                <li key={dish.id}>
                  <button type="button" className="landing__dish" onClick={() => setOpenDish(dish)}>
                    <span className="landing__dishMedia" aria-hidden="true">
                      <img src={dish.image} alt="" />
                    </span>
                    <span className="landing__dishCopy">
                      <span className="landing__dishName">{dish.title}</span>
                      <span className="landing__dishBlurb">{dish.blurb}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
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
              : (authMode === 'login' ? 'Welcome back.' : 'Join to keep what you cook.')}
          </h2>
          <p className="landing__authSub">
            {pendingInspiration
              ? 'Create an account or log in — then the kitchen opens with this inspiration.'
              : authMode === 'login'
                ? 'Log in, or enter Eve’s demo kitchen.'
                : 'Free. Under a minute. Save, remix, take the list.'}
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
          © {new Date().getFullYear()} my food. SORTED. — dinner first.
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
              <p>Like it? Join to keep it, remix it, and take the shopping list.</p>
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

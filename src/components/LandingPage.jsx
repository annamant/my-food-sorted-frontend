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
    title: 'Find or ask for any recipe',
    body: 'Carbonara, a week of dinners, whatever you need — the kitchen already knows the classics.',
  },
  {
    title: 'Remix it for your life',
    body: 'Cut calories, cut cost, swap ingredients, or cook from what’s already in the cupboard.',
  },
  {
    title: 'Keep it in your library',
    body: 'Save recipes and lists like playlists — reopen them, cook again, or build a new mood week.',
  },
  {
    title: 'Share what you made',
    body: 'Make a recipe public, copy a link for Instagram, or let someone else cook your version.',
  },
]

const MOODS = [
  { title: 'Budget week', body: 'Good food when prices bite.' },
  { title: 'Wellbeing plate', body: 'Higher protein, lighter calories — still supper.' },
  { title: 'Use the fridge', body: 'Create from what you already bought.' },
  { title: 'Classics, remixed', body: 'Your carbonara. Your rules.' },
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
            <em>Built like Spotify.</em>
          </h1>
          <p className="landing__sub">
            Find any recipe, remix it for wellbeing and budget, save it as yours —
            then share the version you actually cook.
          </p>
          <div className="landing__heroCtas">
            <button type="button" className="btn landing__ctaPrimary" onClick={scrollToAuth}>
              Open your library
            </button>
            <span className="landing__ctaNote">Free to start · keep what you cook</span>
          </div>
        </div>
      </header>

      <section className="landing__moods" aria-labelledby="moods-heading">
        <p className="landing__moodsLabel">Lists for how you cook</p>
        <h2 id="moods-heading" className="landing__moodsTitle">
          Playlists for the stove.
        </h2>
        <ul className="landing__moodsList">
          {MOODS.map((mood) => (
            <li key={mood.title} className="landing__mood">
              <h3 className="landing__moodTitle">{mood.title}</h3>
              <p className="landing__moodBody">{mood.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="landing__steps" aria-labelledby="steps-heading">
        <p className="landing__stepsLabel">The method</p>
        <h2 id="steps-heading" className="landing__stepsTitle">
          Library first. Chat is the instrument.
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

      <section className="landing__sharePitch" aria-labelledby="share-heading">
        <p className="landing__shareLabel">Creators & friends</p>
        <h2 id="share-heading" className="landing__shareTitle">
          Your recipe can go public.
        </h2>
        <p className="landing__shareBody">
          Remixed a classic? Invented something from leftovers? Publish a link,
          post it to Instagram, or let someone save your version to their library.
        </p>
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
          © {new Date().getFullYear()} my food. SORTED. — your recipes, kept and shared.
        </p>
      </footer>
    </div>
  )
}

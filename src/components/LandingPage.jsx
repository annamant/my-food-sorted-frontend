import { useEffect, useRef, useState } from 'react'
import AuthForm from './AuthForm'
import './LandingPage.css'

function LogoMark() {
  return (
    <span className="landing-logo" aria-label="My Food Sorted">
      <span>my food.</span>
      <strong>SORTED.</strong>
    </span>
  )
}

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Find a recipe or start from your own idea',
    body: 'Pick a trusted recipe from the library, or tell the kitchen what you want to cook tonight.',
  },
  {
    step: '02',
    title: 'Personalise everything for your life',
    body: 'Set servings, budget, timing, pantry items, and dietary preferences so the plan fits you.',
  },
  {
    step: '03',
    title: 'Save, organise and shop in one flow',
    body: 'Keep recipes in collections, generate a shopping list, and open Tesco or Sainsbury’s directly.',
  },
]

const DIFFERENCE_POINTS = [
  'Most food tools make you adapt to their format. We do the opposite: the plan adapts to your life.',
  'You are not stuck scrolling and comparing recipes for ages, and you are not boxed into fixed meal-delivery menus.',
  'Our base starts with trusted classics and ingredient knowledge across cuisines, then reshapes them to your budget and preferences.',
]

const BENEFIT_POINTS = [
  'Choose once, get a practical plan fast',
  'Keep spend under control with budget-aware cooking',
  'Use your cupboard first and cut waste',
  'Walk into Tesco or Sainsbury’s with one clear list',
]

const TRUST_PROOF = [
  { value: '60 sec', label: 'to build your first plan' },
  { value: '£15-£40', label: 'typical weekly dinner budget range' },
  { value: '1 list', label: 'from plan straight to supermarket' },
]

const KNOWLEDGE_BASE_VISUALS = [
  {
    label: 'Italian classics',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Asian flavours',
    image: 'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Mediterranean',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Vegan',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Vegetarian',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Keto & low-carb',
    image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80',
  },
]

const VISUAL_STORY = [
  {
    title: 'Real ingredients',
    body: 'Fresh produce, pantry staples, and classics from every cuisine.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Happy cooking',
    body: 'A kitchen routine that feels easy, social, and sustainable.',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1400&q=80',
  },
  {
    title: 'Healthy outcomes',
    body: 'Balanced meals with clear nutrition and your personal constraints.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1400&q=80',
  },
]

const EXTRA_PREFERENCE_BADGES = [
  'High-protein',
  'Gluten-free',
  'Low-sugar',
  'Dairy-free',
  'Family-friendly',
  'Budget-first',
]

export default function LandingPage({
  loading,
  handleAuth,
  initialAuthMode = 'register',
}) {
  const authRef = useRef(null)
  const howRef = useRef(null)
  const [authMode, setAuthMode] = useState(initialAuthMode)

  useEffect(() => {
    setAuthMode(initialAuthMode)
  }, [initialAuthMode])

  function goToAuth(nextMode = 'register') {
    setAuthMode(nextMode)
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="landing">
      <header className="landing-header">
        <button
          type="button"
          className="landing-header__brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="My Food Sorted home"
        >
          <LogoMark />
        </button>
        <div className="landing-header__actions">
          <button type="button" className="landing-header__link" onClick={() => goToAuth('login')}>
            Log in
          </button>
          <button type="button" className="btn btn--primary" onClick={() => goToAuth('register')}>
            Join free
          </button>
        </div>
      </header>

      <main>
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <p className="landing-kicker">A new way to plan and eat</p>
            <h1>Stop searching. Stop being forced. Start eating better, your way.</h1>
            <p className="landing-lede">
              This is not a recipe library. This is not meal delivery.
              <br />
              You choose what you want. We turn trusted culinary knowledge into a personal plan, tailored to your budget,
              preferences, and week, then send you shopping with one combined list.
            </p>
            <div className="landing-hero__actions">
              <button type="button" className="btn btn--primary" onClick={() => goToAuth('register')}>
                Start free - build my plan
              </button>
              <button type="button" className="landing-hero__secondary" onClick={() => howRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                See how it works
              </button>
            </div>
            <p className="landing-hero__microcopy">
              Personal meal plan + budget + shopping list in under 60 seconds.
            </p>
          </div>
          <div className="landing-hero__image">
            <img
              src="https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1600&q=80"
              alt="Fresh healthy meal ingredients prepared in a bright kitchen"
            />
            <div>
              <strong>Personal plan</strong>
              <span>Budget, nutrition, timing, and taste aligned in one flow.</span>
            </div>
          </div>
        </section>

        <section className="landing-proof" aria-label="Why users trust this flow">
          {TRUST_PROOF.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section className="landing-story" aria-label="Visual story">
          {VISUAL_STORY.map((item) => (
            <article key={item.title}>
              <img src={item.image} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="landing-section" ref={howRef}>
          <p className="landing-kicker">How it works</p>
          <h2>Simple flow. Real outcomes.</h2>
          <div className="landing-steps">
            {HOW_IT_WORKS.map((item) => (
              <article key={item.step}>
                <span>{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section landing-section--split">
          <div>
            <p className="landing-kicker">Why we are different</p>
            <h2>Not search. Not delivery. Personal planning.</h2>
            <div className="landing-narrative">
              {DIFFERENCE_POINTS.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </div>
          <div>
            <p className="landing-kicker">What you get</p>
            <h2>Knowledge base in. Personal plan out.</h2>
            <div className="landing-knowledgeGrid" aria-label="Cuisine and dietary knowledge base">
              {KNOWLEDGE_BASE_VISUALS.map((item) => (
                <figure key={item.label}>
                  <img src={item.image} alt={item.label} />
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
            <ul className="landing-preferenceBadges" aria-label="Additional dietary preferences">
              {EXTRA_PREFERENCE_BADGES.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
            <div className="landing-benefits">
              {BENEFIT_POINTS.map((point) => (
                <p key={point}>{point}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-section landing-cta" ref={authRef}>
          <div className="landing-cta__copy">
            <p className="landing-kicker">Start now</p>
            <h2>Cook with a plan that matches your time, taste and budget.</h2>
            <p>
              Join free. Pick the food you actually want to eat. Personalise it. Save it. Shop it.
            </p>
          </div>
          <div className="landing-cta__auth">
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
      </main>
      <button type="button" className="landing-stickyCta" onClick={() => goToAuth('register')}>
        Start free
      </button>
    </div>
  )
}

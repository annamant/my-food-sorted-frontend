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
    title: 'Tell us what you fancy',
    body: 'Start with a craving, an ingredient, a cuisine, or simply ask the kitchen for inspiration.',
  },
  {
    step: '02',
    title: 'Personalise everything for your life',
    body: 'Set servings, budget, timing, pantry items, and dietary preferences so the plan fits you.',
  },
  {
    step: '03',
    title: 'Save, organise and shop in one flow',
    body: 'Save recipes to your collections, make them private or public, share them, then shop from one combined list.',
  },
  {
    step: '04',
    title: 'Build your own recipe books',
    body: 'Put the dishes you made or adapted into books you own. Keep a book private, share it, or publish it for anyone to cook from.',
  },
]

const KNOWLEDGE_BASE_VISUALS = [
  {
    label: 'Italian classics',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Asian flavours',
    image: 'https://images.unsplash.com/photo-1512003867696-6d5ce6835040?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Mediterranean',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
  },
]

const PRODUCT_JOURNEY = [
  {
    step: '01',
    title: 'Chat with My Food Sorted',
    body: 'Tell the kitchen what you fancy, how long you have, and what you can spend. It answers with a plan, not another search page.',
    kind: 'chat',
    chat: [
      { role: 'assistant', text: 'What are we cooking?' },
      { role: 'user', text: 'Something light. Salmon, 30 minutes, under £12.' },
      { role: 'assistant', text: 'Grilled salmon with lemon salad. I’ll write the recipe and your shop.' },
    ],
  },
  {
    step: '02',
    title: 'Happy cooking',
    body: 'This is the good bit: cooking with a plan, eating well, and using what you already have — so nothing is wasted.',
    kind: 'image',
    image: '/happy-cooking.jpg',
    alt: 'Someone smiling while cooking a fresh meal in a sunlit kitchen',
  },
  {
    step: '03',
    title: 'The finished dish',
    body: 'Dinner on the table: the meal you asked for, cooked your way.',
    kind: 'image',
    image: '/finished-dish-home.jpg',
    alt: 'A homemade salmon dinner on a kitchen table at home',
  },
]

const TRUST_PROOF = [
  { value: '60 sec', label: 'to build your first plan' },
  { value: '£15-£40', label: 'typical weekly dinner budget range' },
  { value: '1 list', label: 'from plan straight to supermarket' },
]

const QUERY_ANYTIME = ['Vegan', 'Vegetarian', 'Keto', 'Gluten-free', 'Budget', 'What’s in the cupboard']

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
          <button type="button" className="btn btn--primary landing-header__cta" onClick={() => goToAuth('register')}>
            Join free
          </button>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__media">
          <img
            src="/hero-summer-table.jpg"
            alt="A bright summer table with salad, grilled fish, vegetables and fresh sides"
            className="landing-hero__bg landing-hero__bg--a"
            fetchPriority="high"
          />
          <img
            src="/hero-summer-table-close.jpg"
            alt=""
            className="landing-hero__bg landing-hero__bg--b"
          />
          <span className="landing-hero__vignette" aria-hidden="true" />
          <span className="landing-hero__shimmer" aria-hidden="true" />
        </div>
        <div className="landing-hero__copy">
          <p className="landing-kicker">A new way to plan and eat</p>
          <h1>Your meals. Personalised your way.</h1>
          <p className="landing-hero__promise">
            Skip the endless recipe hunt and the meal-box subscription.
          </p>
          <p className="landing-lede">
            We draw on trusted culinary knowledge to create personalised meals around your tastes, budget and dietary needs,
            with one combined shopping list.
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
      </section>

      <section
        className="landing-planningBanner"
        aria-label="Plan one meal, a full day, a special occasion, or your whole week"
      >
        <div className="landing-planningBanner__track">
          <p>Plan one meal · Plan a full day · Plan a special occasion · Plan your whole week</p>
          <p aria-hidden="true">Plan one meal · Plan a full day · Plan a special occasion · Plan your whole week</p>
        </div>
      </section>

      <main>

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

        <section className="landing-proof" aria-label="Why users trust this flow">
          {TRUST_PROOF.map((item) => (
            <article key={item.label}>
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </article>
          ))}
        </section>

        <section className="landing-story" aria-label="From chat to table">
          <header className="landing-story__intro">
            <p className="landing-kicker">From chat to table</p>
            <h2>Chat. Cook. Eat.</h2>
          </header>
          <div className="landing-story__grid">
            {PRODUCT_JOURNEY.map((item) => (
              <article key={item.step}>
                {item.kind === 'chat' ? (
                  <div className="landing-story__chat">
                    <p className="landing-story__chatLabel">Your kitchen conversation</p>
                    {item.chat.map((line) => (
                      <p key={line.text} className={`landing-story__bubble landing-story__bubble--${line.role}`}>
                        <strong>{line.role === 'user' ? 'You' : 'Kitchen'}</strong>
                        <span>{line.text}</span>
                      </p>
                    ))}
                  </div>
                ) : (
                  <img src={item.image} alt={item.alt} />
                )}
                <div>
                  <span>{item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-book" aria-labelledby="recipe-books-title">
          <div className="landing-book__copy">
            <p className="landing-kicker">Your recipe books</p>
            <h2 id="recipe-books-title">Your cooking deserves a book.</h2>
            <p className="landing-lede">
              Keep the meals you created and the classics you made your own. Build a personal collection to revisit,
              share with someone, or publish for everyone.
            </p>
            <button type="button" className="btn btn--primary" onClick={() => goToAuth('register')}>
              Build my recipe book
            </button>
          </div>
          <div className="landing-book__spread" aria-label="Example recipe book">
            <div className="landing-book__cover">
              <p>My kitchen</p>
              <h3>The meals I love</h3>
              <span>A personal collection</span>
            </div>
            <div className="landing-book__pages">
              <p>Inside my collection</p>
              <ul>
                <li>
                  <strong>Lemon salmon &amp; summer vegetables</strong>
                  <span>My recipe</span>
                </li>
                <li>
                  <strong>Slow Sunday ragù</strong>
                  <span>My version</span>
                </li>
                <li>
                  <strong>Golden coconut dal</strong>
                  <span>My recipe</span>
                </li>
                <li>
                  <strong>Nonna’s lemon salad</strong>
                  <span>My version</span>
                </li>
              </ul>
              <div className="landing-book__share">
                <span>Share the book</span>
                <span>Publish it</span>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section landing-section--split">
          <div>
            <p className="landing-kicker">Why we are different</p>
            <h2>Your meals. Your recipe books.</h2>
            <div className="landing-difference">
              <p>No meal-box subscription. No endless recipe hunt. Your meals are personalised to you.</p>
              <p>Shop with our list, or have the supermarket deliver it.</p>
              <p>Save them into recipe books you actually own — keep them private, share them, or make them public.</p>
            </div>
          </div>
          <div>
            <p className="landing-kicker">What you get</p>
            <h2>Trusted culinary knowledge, ready when you are.</h2>
            <p className="landing-lede landing-lede--compact">
              A broad foundation of trusted classics across cuisines and diets sits underneath every answer. You get a meal
              made personal, without searching through the recipes yourself.
            </p>
            <div className="landing-knowledgeGrid" aria-label="Culinary knowledge base">
              {KNOWLEDGE_BASE_VISUALS.map((item) => (
                <figure key={item.label}>
                  <img src={item.image} alt={item.label} />
                  <figcaption>{item.label}</figcaption>
                </figure>
              ))}
            </div>
            <ul className="landing-preferenceBadges" aria-label="Ask about any of these">
              {QUERY_ANYTIME.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="landing-section landing-cta" ref={authRef}>
          <div className="landing-cta__copy">
            <p className="landing-kicker">Start now</p>
            <h2>Cook with a plan that matches your time, taste and budget.</h2>
            <p>
              Join free. Pick what you want to eat. Personalise it. Save it to your lists. Share it or make it public. Shop it.
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

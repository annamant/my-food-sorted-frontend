import { useEffect } from 'react'
import './AboutPage.css'

const PILLARS = [
  {
    title: 'Real recipes',
    body: 'Plans built from the bibles of each cuisine — the sources cooks actually trust — not invented dishes.',
  },
  {
    title: 'Plan your way',
    body: 'Compose tonight, or lay out the whole week. Save what worked into your own book and come back to it.',
  },
  {
    title: 'Shop your list',
    body: 'Send the ingredients straight to your supermarket. No meal box, no subscription, no waste.',
  },
]

export default function AboutPage({ onHome, onOpenKitchen, onBlog }) {
  useEffect(() => {
    document.title = 'Why we built this | My Food SORTED'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'My Food SORTED'
    }
  }, [])

  return (
    <div className="about">
      <header className="about__header">
        <button type="button" className="about__back" onClick={onHome}>
          ← Back
        </button>
        <p className="about__kicker">About</p>
        <h1 className="about__title">We built this to make cooking at home feel possible again.</h1>
        <p className="about__lede">
          My Food SORTED is a planner for people who want to cook real food, from real
          sources, without a subscription. Plan the week, save what worked, and shop
          your list straight to your supermarket.
        </p>
      </header>

      <section className="about__pillars">
        {PILLARS.map((item) => (
          <article key={item.title} className="about__pillar">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="about__letter">
        <p className="about__kicker">From the start</p>
        <h2>The problem we kept hitting.</h2>
        <p>
          Most meal planners assume you will eat anything, cook for an hour every night,
          and pay a weekly box. Real kitchens do not work like that. Some nights you want
          to cook, some nights you have five minutes, and most of us already have a
          supermarket we use.
        </p>
        <p>
          So we went back to the sources — the books each cuisine treats as its bible —
          and built a planner around them. You tell us what you like, what you avoid,
          how long you have, and who you cook for. We match recipes to your life, not
          the other way around.
        </p>
        <p>
          Save the meals that worked into your own book. The more you cook, the better the
          match gets — your journal learns what you actually enjoyed and brings it back.
        </p>
      </section>

      <section className="about__cta">
        <h2>Come plan with us.</h2>
        <p>Join free. Browse the library, plan tonight or the week, save your book, and shop your list.</p>
        {onOpenKitchen && (
          <button type="button" className="btn btn--primary" onClick={onOpenKitchen}>
            Start cooking
          </button>
        )}
      </section>

      {onBlog && (
        <footer className="about__footer">
          <button type="button" onClick={onBlog}>Read the blog</button>
        </footer>
      )}
    </div>
  )
}

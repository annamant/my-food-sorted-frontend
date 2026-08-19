import React from 'react'

// SEO-only landing content for bots/crawlers.
// This avoids CSS imports and browser-only behavior so it can be rendered via ReactDOMServer during build.

export default function LandingPageSeo() {
  return (
    <div className="landing">
      <header>
        <h1>Stop searching. Stop being forced. Start eating better, your way.</h1>
        <p>
          This is not a recipe library. This is not meal delivery.
          <br />
          You choose what you want. We turn trusted culinary knowledge into a personal plan, tailored to your budget,
          preferences, and week.
        </p>
        <p>Then you save it to your lists, share it or make it public, and shop with one combined list.</p>
        <p>Personal meal plan + budget + shopping list in under 60 seconds.</p>
      </header>

      <section aria-label="How it works">
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Find a recipe or start from your own idea</strong>
          </li>
          <li>
            <strong>Personalise everything for your life</strong>
          </li>
          <li>
            <strong>Save, organise and shop in one flow</strong>
          </li>
          <li>
            <strong>Build your own recipe books</strong>
          </li>
        </ol>
      </section>

      <section aria-label="Dietary filters">
        <h2>Ask about any of these</h2>
        <ul>
          <li>Vegan</li>
          <li>Vegetarian</li>
          <li>Keto</li>
          <li>Gluten-free</li>
          <li>Budget</li>
          <li>What’s in the cupboard</li>
        </ul>
      </section>
    </div>
  )
}


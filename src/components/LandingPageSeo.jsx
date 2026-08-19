import React from 'react'

// SEO-only landing content for bots/crawlers.
// This avoids CSS imports and browser-only behavior so it can be rendered via ReactDOMServer during build.

export default function LandingPageSeo() {
  return (
    <div className="landing">
      <header>
        <h1>Personalised meal planning, budget-friendly recipes, and one combined shopping list.</h1>
        <p>
          Build a meal plan around what you want to cook, how much you want to spend, and how your week actually works.
          <br />
          My Food Sorted turns trusted cooking knowledge into practical weekly planning with realistic budgets, dietary filters,
          and one shopping list you can actually use.
        </p>
        <p>Plan meals for your household, adjust for tastes and dietary needs, then shop from one combined list.</p>
        <p>Personal meal plan + budget recipes + shopping list in under 60 seconds.</p>
      </header>

      <section aria-label="How it works">
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Choose meals based on what you want to cook</strong>
          </li>
          <li>
            <strong>Set your budget, servings, timing, and dietary preferences</strong>
          </li>
          <li>
            <strong>Get a personalised meal plan with practical recipes</strong>
          </li>
          <li>
            <strong>Shop from one combined grocery list</strong>
          </li>
        </ol>
      </section>

      <section aria-label="Dietary filters">
        <h2>Plan around real-life constraints</h2>
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


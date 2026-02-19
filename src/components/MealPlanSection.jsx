import MealPlanCard from './MealPlanCard'
import './MealPlanSection.css'

function recipeKey(r, i) {
  return r.id ?? `${r.day_of_week}-${r.meal_slot}-${String(r.title).slice(0, 30)}-${i}`
}

export default function MealPlanSection({ mealPlan, onSavePlan, loading }) {
  if (!mealPlan?.recipes?.length) return null

  const recipes = mealPlan.recipes
  const planName = mealPlan.plan_name || 'Untitled'

  return (
    <section className="meal-plan-section" aria-labelledby="meal-plan-heading">
      <h2 id="meal-plan-heading" className="meal-plan-section__title">
        Meal Plan: {planName}
      </h2>
      <div className="meal-plan-section__list">
        {recipes.map((r, i) => (
          <MealPlanCard key={recipeKey(r, i)} recipe={r} index={i} />
        ))}
      </div>
      <button
        type="button"
        onClick={onSavePlan}
        disabled={loading}
        className="btn btn--primary"
      >
        Save Plan
      </button>
    </section>
  )
}

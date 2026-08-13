import './MealPlanDisplay.css'

function fmtPrice(p) {
  return (Number(p) || 0).toFixed(2)
}

function recipeKey(r, i) {
  return r.id ?? `${r.day_of_week}-${r.meal_slot}-${String(r.title).slice(0, 30)}-${i}`
}

function MealPlanDisplay({ mealPlan, savePlan, loading, alreadySaved }) {
  if (!mealPlan?.recipes?.length) return null

  return (
    <div className="meal-plan-display">
      <h2 className="meal-plan-display__title">
        {mealPlan.plan_name || 'This week’s plan'}
      </h2>
      <div className="meal-plan-display__list">
        {mealPlan.recipes.map((r, i) => (
          <div key={recipeKey(r, i)} className="meal-plan-display__card">
            <strong className="meal-plan-display__cardTitle">
              {r.day_of_week} – {r.meal_slot}: {r.title}
            </strong>
            <div className="meal-plan-display__cardMeta">
              £{fmtPrice(r.estimated_cost)} | {r.prep_time}min prep, {r.cook_time}min cook
              {(r.calories != null || r.protein != null || r.carbs != null || r.fat != null) && (
                <span>
                  {' '}· {[
                    r.calories != null ? `${r.calories} kcal` : null,
                    r.protein != null ? `P ${r.protein}g` : null,
                    r.carbs != null ? `C ${r.carbs}g` : null,
                    r.fat != null ? `F ${r.fat}g` : null,
                  ].filter(Boolean).join(' · ')}
                </span>
              )}
            </div>
            <p className="meal-plan-display__cardInstructions">{r.instructions}</p>
            <div className="meal-plan-display__cardIngredients">
              <span className="meal-plan-display__cardIngredientsLabel">Ingredients:</span>{' '}
              {(r.ingredients || [])
                .map((ing) => `${ing.ingredient_name} (${ing.quantity} ${ing.unit})`)
                .join(', ')}
            </div>
          </div>
        ))}
      </div>
      {alreadySaved ? (
        <p className="meal-plan-display__savedNote">Kept in your library</p>
      ) : (
        <button
          type="button"
          onClick={savePlan}
          disabled={loading}
          className="btn btn--primary meal-plan-display__saveBtn"
        >
          Keep this week
        </button>
      )}
    </div>
  )
}

export default MealPlanDisplay

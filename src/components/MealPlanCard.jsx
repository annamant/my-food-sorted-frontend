import './MealPlanCard.css'

function fmtPrice(p) {
  return (Number(p) ?? 0).toFixed(2)
}

function recipeKey(r, i) {
  return r.id ?? `${r.day_of_week}-${r.meal_slot}-${String(r.title).slice(0, 30)}-${i}`
}

function ingKey(ing, j) {
  return ing.id ?? `${ing.ingredient_name}-${j}`
}

export default function MealPlanCard({ recipe, index }) {
  const key = recipeKey(recipe, index)
  const ingredients = recipe.ingredients || []

  return (
    <article className="meal-plan-card" data-testid="meal-plan-card">
      <h3 className="meal-plan-card__title">
        {recipe.day_of_week} – {recipe.meal_slot}: {recipe.title}
      </h3>
      <p className="meal-plan-card__meta">
        £{fmtPrice(recipe.estimated_cost)} · {recipe.prep_time}min prep, {recipe.cook_time}min cook
      </p>
      <p className="meal-plan-card__instructions">{recipe.instructions}</p>
      <div className="meal-plan-card__ingredients">
        <strong className="meal-plan-card__ingredientsLabel">Ingredients: </strong>
        {ingredients.map((ing, j) => (
          <span key={ingKey(ing, j)} className="meal-plan-card__ingredient">
            {ing.ingredient_name} ({ing.quantity} {ing.unit})
            {j < ingredients.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    </article>
  )
}

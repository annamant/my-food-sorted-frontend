import './MealPlanDisplay.css'

function fmtPrice(p) {
  return (Number(p) || 0).toFixed(2)
}

function recipeKey(r, i) {
  return r.id ?? `${r.day_of_week}-${r.meal_slot}-${String(r.title).slice(0, 30)}-${i}`
}

/** Turn a wall of instruction text into readable steps. */
function instructionSteps(text) {
  if (!text || typeof text !== 'string') return []
  const trimmed = text.trim()
  if (!trimmed) return []

  const byNumber = trimmed
    .split(/(?=\b\d+[\).]\s)/)
    .map((s) => s.replace(/^\d+[\).]\s*/, '').trim())
    .filter(Boolean)
  if (byNumber.length > 1) return byNumber

  const byLine = trimmed
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
  if (byLine.length > 1) return byLine

  const bySentence = trimmed
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter(Boolean)
  return bySentence.length ? bySentence : [trimmed]
}

const REMIX_ACTIONS = [
  {
    id: 'cheaper',
    label: 'Make cheaper',
    promptFor: (title) =>
      `Remix “${title}” to cost less while staying satisfying. Deliver a full save-ready recipe.`,
  },
  {
    id: 'lighter',
    label: 'Lower calories',
    promptFor: (title) =>
      `Remix “${title}” to be lower calorie / lighter, still flavourful. Deliver a full save-ready recipe.`,
  },
  {
    id: 'protein',
    label: 'More protein',
    promptFor: (title) =>
      `Remix “${title}” for higher protein without blowing the budget. Deliver a full save-ready recipe.`,
  },
  {
    id: 'pantry',
    label: 'Use my cupboard',
    promptFor: (title) =>
      `Remix “${title}” to lean on the pantry items in my brief. Minimise new shopping. Deliver a full save-ready recipe.`,
  },
]

function MealPlanDisplay({
  mealPlan,
  savePlan,
  loading,
  alreadySaved,
  embedded,
  onShare,
  onUnshare,
  shareBusy,
  isPublic,
  shareUrl,
  readOnly,
  onRemix,
  onAddToList,
}) {
  if (!mealPlan?.recipes?.length) return null

  const recipeCount = mealPlan.recipes.length
  const title =
    mealPlan.plan_name ||
    (recipeCount === 1 ? mealPlan.recipes[0].title : 'Your composed plan')

  return (
    <div className={`meal-plan-display ${embedded ? 'meal-plan-display--embedded' : ''}`}>
      <header className="meal-plan-display__header">
        <p className="meal-plan-display__label">{readOnly ? 'Cook this' : 'Tonight'}</p>
        <h2 className="meal-plan-display__title">{title}</h2>
        {recipeCount > 1 && (
          <p className="meal-plan-display__count">{recipeCount} dishes in this list</p>
        )}
        {isPublic && shareUrl && (
          <p className="meal-plan-display__shareStatus">Public · {shareUrl}</p>
        )}
      </header>

      <div className="meal-plan-display__list">
        {mealPlan.recipes.map((r, i) => {
          const steps = instructionSteps(r.instructions)
          const ingredients = r.ingredients || []
          return (
            <article key={recipeKey(r, i)} className="meal-plan-display__card">
              {recipeCount > 1 && (
                <h3 className="meal-plan-display__cardTitle">{r.title}</h3>
              )}
              <p className="meal-plan-display__cardSlot">
                {[r.day_of_week, r.meal_slot].filter(Boolean).join(' · ')}
              </p>
              <div className="meal-plan-display__cardMeta">
                <span>£{fmtPrice(r.estimated_cost)}</span>
                <span>
                  {r.prep_time} min prep · {r.cook_time} min cook
                </span>
                {(r.calories != null || r.protein != null || r.carbs != null || r.fat != null) && (
                  <span>
                    {[
                      r.calories != null ? `${r.calories} kcal` : null,
                      r.protein != null ? `P ${r.protein}g` : null,
                      r.carbs != null ? `C ${r.carbs}g` : null,
                      r.fat != null ? `F ${r.fat}g` : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
              </div>

              {ingredients.length > 0 && (
                <div className="meal-plan-display__section">
                  <h4 className="meal-plan-display__sectionLabel">Ingredients</h4>
                  <ul className="meal-plan-display__ingredients">
                    {ingredients.map((ing, idx) => (
                      <li key={`${ing.ingredient_name}-${idx}`}>
                        <span className="meal-plan-display__ingName">{ing.ingredient_name}</span>
                        <span className="meal-plan-display__ingQty">
                          {ing.quantity} {ing.unit}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {steps.length > 0 && (
                <div className="meal-plan-display__section">
                  <h4 className="meal-plan-display__sectionLabel">Method</h4>
                  <ol className="meal-plan-display__steps">
                    {steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </article>
          )
        })}
      </div>

      {!readOnly && onRemix && (
        <div className="meal-plan-display__remix" aria-label="Remix this dish">
          {REMIX_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              className="meal-plan-display__remixBtn"
              disabled={loading}
              onClick={() => onRemix(action.promptFor(title), action.label)}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      {!readOnly && (
        <div className="meal-plan-display__actions">
          {alreadySaved ? (
            embedded ? null : (
              <p className="meal-plan-display__savedNote">
                Saved · add it to a recipe book, or shop the list below
              </p>
            )
          ) : (
            <button
              type="button"
              onClick={savePlan}
              disabled={loading || !savePlan}
              className="btn btn--primary meal-plan-display__saveBtn"
            >
              {loading ? 'Saving…' : 'Keep this recipe'}
            </button>
          )}

          {alreadySaved && onAddToList && (
            <button
              type="button"
              className="btn btn--ghost"
              disabled={loading}
              onClick={onAddToList}
            >
              Add to a recipe book
            </button>
          )}

          {alreadySaved && onShare && (
            <div className="meal-plan-display__shareActions">
              {isPublic ? (
                <>
                  <button
                    type="button"
                    className="btn btn--primary meal-plan-display__shareBtn"
                    disabled={shareBusy}
                    onClick={onShare}
                  >
                    {shareBusy ? 'Working…' : 'Share or publish again'}
                  </button>
                  {onUnshare && (
                    <button
                      type="button"
                      className="btn btn--ghost meal-plan-display__unshareBtn"
                      disabled={shareBusy}
                      onClick={onUnshare}
                    >
                      Make private
                    </button>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary meal-plan-display__shareBtn"
                  disabled={shareBusy}
                  onClick={onShare}
                >
                  {shareBusy ? 'Publishing…' : 'Share or publish'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MealPlanDisplay
export { REMIX_ACTIONS }

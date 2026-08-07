import './PlanLibrary.css'

function fmtPrice(p) {
  return (Number(p) || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

function PlanLibrary({ plans, activePlanId, onSelect, loading }) {
  return (
    <div className="plan-library">
      <div className="plan-library__header">
        <h2 className="plan-library__title">Your meal library</h2>
        <p className="plan-library__subtitle">Saved plans you can reopen anytime.</p>
      </div>

      {!plans?.length && !loading && (
        <p className="plan-library__empty">
          No saved plans yet. Chat a week of meals, then hit Save Plan.
        </p>
      )}

      {!!plans?.length && (
        <ul className="plan-library__list">
          {plans.map((plan) => {
            const active = activePlanId === plan.id
            return (
              <li key={plan.id}>
                <button
                  type="button"
                  className={`plan-library__item ${active ? 'plan-library__item--active' : ''}`}
                  onClick={() => onSelect(plan.id)}
                  disabled={loading}
                >
                  <span className="plan-library__itemName">{plan.plan_name || 'Untitled plan'}</span>
                  <span className="plan-library__itemMeta">
                    {plan.recipes_count ?? 0} recipes
                    {plan.servings != null ? ` · ${plan.servings} servings` : ''}
                    {plan.total_estimated_cost != null ? ` · £${fmtPrice(plan.total_estimated_cost)}` : ''}
                    {plan.created_at ? ` · ${fmtDate(plan.created_at)}` : ''}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PlanLibrary

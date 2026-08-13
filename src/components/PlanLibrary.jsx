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
    <div className="plan-library plan-library--hero">
      <div className="plan-library__header">
        <p className="plan-library__label">Library</p>
        <h2 className="plan-library__title">Your collection</h2>
        <p className="plan-library__subtitle">
          Saved recipes and weeks — reopen, cook again, or ask the kitchen for something in the same spirit.
        </p>
      </div>

      {!plans?.length && !loading && (
        <p className="plan-library__empty">
          Your library is empty. Compose a meal or a week below, then keep it here — like adding a playlist.
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

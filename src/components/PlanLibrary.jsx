import { useEffect, useRef } from 'react'
import MealPlanDisplay from './MealPlanDisplay'
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

function PlanLibrary({
  plans,
  activePlanId,
  onSelect,
  loading,
  expandedPlan,
  expandedLoading,
}) {
  const expandRef = useRef(null)

  useEffect(() => {
    if (activePlanId != null && expandedPlan && expandRef.current) {
      expandRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activePlanId, expandedPlan])

  return (
    <div className="plan-library plan-library--hero">
      <div className="plan-library__header">
        <p className="plan-library__label">Library</p>
        <h2 className="plan-library__title">Your collection</h2>
        <p className="plan-library__subtitle">
          Click a recipe to open and read it. Reopen, cook again, or ask the kitchen for something in the same spirit.
        </p>
      </div>

      {!plans?.length && !loading && (
        <p className="plan-library__empty">
          Your library is empty. Compose a meal or a week below, then save it here — like adding a playlist.
        </p>
      )}

      {!!plans?.length && (
        <ul className="plan-library__list">
          {plans.map((plan) => {
            const active = activePlanId === plan.id
            return (
              <li
                key={plan.id}
                className={`plan-library__row ${active ? 'plan-library__row--active' : ''}`}
              >
                <button
                  type="button"
                  className={`plan-library__item ${active ? 'plan-library__item--active' : ''}`}
                  onClick={() => onSelect(plan.id)}
                  disabled={loading}
                  aria-expanded={active}
                >
                  <span className="plan-library__itemTop">
                    <span className="plan-library__itemName">{plan.plan_name || 'Untitled recipe'}</span>
                    <span className="plan-library__chevron" aria-hidden="true">
                      {active ? 'Close' : 'Open'}
                    </span>
                  </span>
                  <span className="plan-library__itemMeta">
                    {plan.recipes_count ?? 0} {(plan.recipes_count ?? 0) === 1 ? 'recipe' : 'recipes'}
                    {plan.servings != null ? ` · ${plan.servings} servings` : ''}
                    {plan.total_estimated_cost != null ? ` · £${fmtPrice(plan.total_estimated_cost)}` : ''}
                    {plan.created_at ? ` · ${fmtDate(plan.created_at)}` : ''}
                  </span>
                </button>

                {active && (
                  <div className="plan-library__expand" ref={expandRef}>
                    {expandedLoading && !expandedPlan && (
                      <p className="plan-library__expandLoading">Opening recipe…</p>
                    )}
                    {expandedPlan && (
                      <MealPlanDisplay
                        mealPlan={expandedPlan}
                        alreadySaved
                        embedded
                      />
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default PlanLibrary

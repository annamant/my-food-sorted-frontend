import { useEffect, useState } from 'react'
import MealPlanDisplay from './MealPlanDisplay'
import './SharedRecipeView.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export default function SharedRecipeView({ slug, kind = 'recipe', onClose }) {
  const [plan, setPlan] = useState(null)
  const [list, setList] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const isList = kind === 'list'

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const path = isList
          ? `${API}/share/list/${encodeURIComponent(slug)}`
          : `${API}/share/${encodeURIComponent(slug)}`
        const res = await fetch(path)
        const text = await res.text()
        let data = {}
        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          throw new Error(isList ? 'Could not load this shared list.' : 'Could not load this shared recipe.')
        }
        if (!res.ok) throw new Error(data.error || data.message || 'Not found')
        if (cancelled) return
        if (isList) setList(data)
        else setPlan(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this share.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug, isList])

  return (
    <div className="shared-recipe">
      <header className="shared-recipe__header">
        <div className="shared-recipe__logo">
          <span className="shared-recipe__logoTop">my food.</span>
          <span className="shared-recipe__logoBottom">SORTED.</span>
        </div>
        {onClose && (
          <button type="button" className="btn btn--ghost shared-recipe__close" onClick={onClose}>
            Close
          </button>
        )}
      </header>

      <main className="shared-recipe__main">
        <p className="shared-recipe__eyebrow">
          {isList ? 'A list someone actually cooks' : 'Shared from someone’s kitchen'}
        </p>
        {loading && <p className="shared-recipe__status">{isList ? 'Opening list…' : 'Opening recipe…'}</p>}
        {error && <p className="shared-recipe__error">{error}</p>}
        {plan && (
          <MealPlanDisplay
            mealPlan={plan}
            alreadySaved
            readOnly
            isPublic
          />
        )}
        {list && (
          <div className="shared-recipe__list">
            <header className="shared-recipe__listHead">
              <h1 className="shared-recipe__listTitle">{list.title}</h1>
              {list.blurb && <p className="shared-recipe__listBlurb">{list.blurb}</p>}
              <p className="shared-recipe__listMeta">
                {list.tracks_count ?? list.dishes?.length ?? 0} dishes
              </p>
            </header>
            {(list.dishes || []).map((dish) => (
              <MealPlanDisplay
                key={dish.meal_plan_id}
                mealPlan={{
                  plan_name: dish.plan_name,
                  servings: dish.servings,
                  recipes: dish.recipes,
                }}
                alreadySaved
                readOnly
                isPublic
              />
            ))}
          </div>
        )}
        <p className="shared-recipe__ctaNote">
          Want your own books? Join, keep a dish, put it in a recipe book, share it or publish it.
        </p>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import MealPlanDisplay from './MealPlanDisplay'
import './SharedRecipeView.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

export default function SharedRecipeView({ slug, onClose }) {
  const [plan, setPlan] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API}/share/${encodeURIComponent(slug)}`)
        const text = await res.text()
        let data = {}
        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          throw new Error('Could not load this shared recipe.')
        }
        if (!res.ok) throw new Error(data.error || data.message || 'Recipe not found')
        if (!cancelled) setPlan(data)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load this shared recipe.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [slug])

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
        <p className="shared-recipe__eyebrow">Shared from someone’s library</p>
        {loading && <p className="shared-recipe__status">Opening recipe…</p>}
        {error && <p className="shared-recipe__error">{error}</p>}
        {plan && (
          <MealPlanDisplay
            mealPlan={plan}
            alreadySaved
            readOnly
            isPublic
          />
        )}
        <p className="shared-recipe__ctaNote">
          Want your own library of remixed recipes? Open the app and start a collection.
        </p>
      </main>
    </div>
  )
}

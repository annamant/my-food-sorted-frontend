import { useEffect, useState } from 'react'
import {
  FEEDBACK_OPTIONS,
  REPEAT_OPTIONS,
  feedbackKey,
  getMealFeedback,
  recordMealFeedback,
  syncMealFeedback,
} from '../data/mealFeedback'
import './MealFeedbackBar.css'

/**
 * "Did this work for you?" bar shown on saved meals.
 * Writes locally (instant) then syncs to the backend (best-effort).
 * Feeds the generalist matching engine's learning loop.
 */
function MealFeedbackBar({ planId, recipeTitle, day, slot, apiBase, accessToken, onToast }) {
  const key = feedbackKey({ planId, recipeTitle, day, slot })
  const [entry, setEntry] = useState(() => getMealFeedback(key))
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setEntry(getMealFeedback(key))
  }, [key])

  const record = async (patch) => {
    const next = recordMealFeedback({
      key,
      planId: planId ?? null,
      recipeTitle: recipeTitle || null,
      day: day || null,
      slot: slot || null,
      ...patch,
    })
    setEntry(next)
    if (apiBase && accessToken) {
      setBusy(true)
      const res = await syncMealFeedback(apiBase, accessToken)
      setBusy(false)
      if (!res.ok && onToast) onToast('Saved locally — will sync next time you log in.', 'info')
    }
  }

  if (!planId || !recipeTitle) return null

  return (
    <div className="meal-feedback-bar">
      <p className="meal-feedback-bar__label">Did this work for you?</p>
      <div className="meal-feedback-bar__row">
        {FEEDBACK_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`meal-feedback-bar__chip ${entry?.feedback === opt.id ? 'meal-feedback-bar__chip--active' : ''}`}
            disabled={busy}
            onClick={() => record({ feedback: opt.id })}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="meal-feedback-bar__row">
        {REPEAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`meal-feedback-bar__chip meal-feedback-bar__chip--repeat ${entry?.repeat === opt.id ? 'meal-feedback-bar__chip--active' : ''}`}
            disabled={busy}
            onClick={() => record({ repeat: opt.id })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MealFeedbackBar

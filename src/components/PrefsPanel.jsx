import { useEffect, useState } from 'react'
import './PrefsPanel.css'

function PrefsPanel({ prefs, onSave, loading }) {
  const [dietary, setDietary] = useState('')
  const [allergies, setAllergies] = useState('')
  const [household, setHousehold] = useState(2)
  const [budget, setBudget] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!prefs) return
    setDietary(prefs.dietary_preferences ?? '')
    setAllergies(prefs.allergies ?? '')
    setHousehold(prefs.household_size ?? 2)
    setBudget(prefs.default_budget != null ? String(prefs.default_budget) : '')
    setDirty(false)
  }, [prefs])

  const handleSave = () => {
    const budgetNum = budget.trim() === '' ? null : Number(budget)
    onSave({
      dietary_preferences: dietary,
      allergies,
      household_size: Number(household) || 1,
      default_budget: budgetNum != null && !Number.isNaN(budgetNum) ? budgetNum : null,
    })
    setDirty(false)
  }

  const remaining =
    prefs?.message_quota != null && prefs?.message_count != null
      ? Math.max(0, prefs.message_quota - prefs.message_count)
      : null

  return (
    <div className="prefs-panel">
      <div className="prefs-panel__header">
        <h2 className="prefs-panel__title">Household notes</h2>
        <p className="prefs-panel__subtitle">
          Diet, budget, household — used quietly whenever you compose.
          {remaining != null && (
            <span className="prefs-panel__quota"> · {remaining} messages left</span>
          )}
        </p>
      </div>

      <div className="prefs-panel__grid">
        <label className="prefs-panel__field">
          <span>Diet</span>
          <input
            type="text"
            value={dietary}
            onChange={(e) => { setDietary(e.target.value); setDirty(true) }}
            placeholder="e.g. vegetarian, halal, high protein"
          />
        </label>

        <label className="prefs-panel__field">
          <span>Allergies</span>
          <input
            type="text"
            value={allergies}
            onChange={(e) => { setAllergies(e.target.value); setDirty(true) }}
            placeholder="e.g. nuts, shellfish, gluten"
          />
        </label>

        <label className="prefs-panel__field">
          <span>Household size</span>
          <input
            type="number"
            min={1}
            max={20}
            value={household}
            onChange={(e) => { setHousehold(e.target.value); setDirty(true) }}
          />
        </label>

        <label className="prefs-panel__field">
          <span>Weekly budget (£)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={budget}
            onChange={(e) => { setBudget(e.target.value); setDirty(true) }}
            placeholder="e.g. 60"
          />
        </label>
      </div>

      <button
        type="button"
        className="btn btn--primary prefs-panel__save"
        onClick={handleSave}
        disabled={loading || !dirty}
      >
        {loading ? 'Saving…' : 'Save preferences'}
      </button>
    </div>
  )
}

export default PrefsPanel

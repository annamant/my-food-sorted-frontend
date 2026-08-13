import { useMemo, useState } from 'react'
import './MealBriefPanel.css'

const CUISINES = ['Italian', 'Asian', 'Japanese', 'Mexican', 'British', 'Indian', 'Mediterranean']
const METHODS = ['Stir-fry', 'Grilled', 'Baked', 'Boiled', 'Steamed', 'Roasted', 'One-pan', 'Air-fryer']
const PROTEINS = ['Chicken', 'Beef', 'Pork', 'Fish', 'Eggs', 'Tofu', 'Lamb', 'Vegetarian']
const PANTRY = ['Pasta', 'Rice', 'Noodles', 'Potatoes', 'Onion', 'Garlic', 'Olive oil', 'Soy sauce', 'Tinned tomatoes', 'Beans', 'Cheese', 'Eggs']
const MEAL_SLOTS = [
  { id: 'brunch', label: 'Brunch' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
]

function toggleInList(list, value) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

function ChipGroup({ label, options, selected, onChange }) {
  return (
    <fieldset className="meal-brief__group">
      <legend className="meal-brief__legend">{label}</legend>
      <div className="meal-brief__chips">
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.id
          const text = typeof opt === 'string' ? opt : opt.label
          const checked = selected.includes(value)
          return (
            <label key={value} className={`meal-brief__chip ${checked ? 'meal-brief__chip--on' : ''}`}>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChange(toggleInList(selected, value))}
              />
              <span>{text}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

const defaultBrief = {
  servings: 4,
  days: 1,
  meal_slots: ['brunch', 'dinner'],
  budget_per_day: 20,
  max_cook_minutes: 20,
  cuisines: [],
  cooking_methods: [],
  proteins: [],
  pantry: [],
  avoid: '',
  notes: '',
}

function MealBriefPanel({ brief, onChange, prefs }) {
  const [open, setOpen] = useState(true)
  const value = brief ?? defaultBrief

  const summary = useMemo(() => {
    const parts = [
      `${value.servings || '?'} people`,
      `${value.days || '?'} day(s)`,
      (value.meal_slots || []).join(' + ') || 'meals TBD',
      value.budget_per_day ? `£${value.budget_per_day}/day` : null,
      (value.cuisines || []).slice(0, 2).join(', ') || null,
    ].filter(Boolean)
    return parts.join(' · ')
  }, [value])

  const setField = (key, next) => onChange({ ...value, [key]: next })

  // Soft-fill servings from saved household prefs once if still default-ish
  const household = prefs?.household_size

  return (
    <div className="meal-brief">
      <button type="button" className="meal-brief__toggle" onClick={() => setOpen((v) => !v)}>
        <div>
          <h2 className="meal-brief__title">This brief</h2>
          <p className="meal-brief__subtitle">{summary}</p>
        </div>
        <span className="meal-brief__chevron">{open ? 'Hide' : 'Edit'}</span>
      </button>

      {open && (
        <div className="meal-brief__body">
          <p className="meal-brief__hint">
            Set budget, wellbeing goals, and cupboard stock — then find, remix, or invent. What you keep becomes a playlist for your stove.
          </p>

          <div className="meal-brief__row">
            <label className="meal-brief__field">
              <span>People</span>
              <input
                type="number"
                min={1}
                max={20}
                value={value.servings}
                onChange={(e) => setField('servings', Number(e.target.value) || 1)}
                placeholder={household ? String(household) : '4'}
              />
            </label>
            <label className="meal-brief__field">
              <span>Days</span>
              <input
                type="number"
                min={1}
                max={14}
                value={value.days}
                onChange={(e) => setField('days', Number(e.target.value) || 1)}
              />
            </label>
            <label className="meal-brief__field">
              <span>Budget / day (£)</span>
              <input
                type="number"
                min={0}
                step={1}
                value={value.budget_per_day}
                onChange={(e) => setField('budget_per_day', Number(e.target.value) || 0)}
              />
            </label>
            <label className="meal-brief__field">
              <span>Max cook time (mins)</span>
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={value.max_cook_minutes}
                onChange={(e) => setField('max_cook_minutes', Number(e.target.value) || 20)}
              />
            </label>
          </div>

          <ChipGroup
            label="Meals needed"
            options={MEAL_SLOTS}
            selected={value.meal_slots}
            onChange={(next) => setField('meal_slots', next)}
          />
          <ChipGroup
            label="Cuisines"
            options={CUISINES}
            selected={value.cuisines}
            onChange={(next) => setField('cuisines', next)}
          />
          <ChipGroup
            label="Cooking style"
            options={METHODS}
            selected={value.cooking_methods}
            onChange={(next) => setField('cooking_methods', next)}
          />
          <ChipGroup
            label="Proteins"
            options={PROTEINS}
            selected={value.proteins}
            onChange={(next) => setField('proteins', next)}
          />
          <ChipGroup
            label="Already in the cupboard"
            options={PANTRY}
            selected={value.pantry}
            onChange={(next) => setField('pantry', next)}
          />

          <label className="meal-brief__field meal-brief__field--wide">
            <span>Avoid / dislikes (kids hate quinoa, no garlic…)</span>
            <input
              type="text"
              value={value.avoid}
              onChange={(e) => setField('avoid', e.target.value)}
              placeholder="e.g. no garlic, no quinoa, mild spice only"
            />
          </label>

          <label className="meal-brief__field meal-brief__field--wide">
            <span>Anything else</span>
            <input
              type="text"
              value={value.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="e.g. light brunch, high protein, under 20 minutes"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export { defaultBrief }
export default MealBriefPanel

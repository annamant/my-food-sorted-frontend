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
  servings: 2,
  days: 1,
  meal_slots: ['dinner'],
  budget_per_day: 20,
  max_cook_minutes: 30,
  cuisines: [],
  cooking_methods: [],
  proteins: [],
  pantry: [],
  avoid: '',
  notes: '',
}

/** Human-readable brief block appended to create messages so the model must obey it. */
export function formatBriefForChat(brief) {
  const value = brief ?? defaultBrief
  const lines = []
  if (value.servings) lines.push(`- People / servings: ${value.servings}`)
  if (value.days) lines.push(`- Days: ${value.days}`)
  if (value.meal_slots?.length) lines.push(`- Meals only: ${value.meal_slots.join(', ')}`)
  if (value.budget_per_day) lines.push(`- Budget per day: £${value.budget_per_day}`)
  if (value.max_cook_minutes) lines.push(`- Max cook time: ${value.max_cook_minutes} mins`)
  if (value.cuisines?.length) lines.push(`- Cuisines: ${value.cuisines.join(', ')}`)
  if (value.cooking_methods?.length) lines.push(`- Methods: ${value.cooking_methods.join(', ')}`)
  if (value.proteins?.length) lines.push(`- Proteins REQUIRED (do not substitute): ${value.proteins.join(', ')}`)
  if (value.pantry?.length) lines.push(`- Pantry / already have: ${value.pantry.join(', ')}`)
  if (value.avoid?.trim()) lines.push(`- Avoid / FORBIDDEN: ${value.avoid.trim()}`)
  if (value.notes?.trim()) lines.push(`- Extra notes REQUIRED: ${value.notes.trim()}`)
  if (!lines.length) return ''
  return `My kitchen brief — follow exactly:\n${lines.join('\n')}`
}

function MealBriefPanel({ brief, onChange, prefs }) {
  const [more, setMore] = useState(false)
  const value = brief ?? defaultBrief

  const summary = useMemo(() => {
    const parts = [
      `${value.servings || '?'} people`,
      value.max_cook_minutes ? `${value.max_cook_minutes} mins` : null,
      value.avoid?.trim() ? `no ${value.avoid.trim()}` : null,
    ].filter(Boolean)
    return parts.join(' · ')
  }, [value])

  const setField = (key, next) => onChange({ ...value, [key]: next })
  const household = prefs?.household_size

  return (
    <div className="meal-brief meal-brief--bar">
      <div className="meal-brief__essentials">
        <label className="meal-brief__field">
          <span>Who’s eating</span>
          <input
            type="number"
            min={1}
            max={20}
            value={value.servings}
            onChange={(e) => setField('servings', Number(e.target.value) || 1)}
            placeholder={household ? String(household) : '2'}
          />
        </label>
        <label className="meal-brief__field">
          <span>How long</span>
          <input
            type="number"
            min={5}
            max={180}
            step={5}
            value={value.max_cook_minutes}
            onChange={(e) => setField('max_cook_minutes', Number(e.target.value) || 20)}
          />
        </label>
        <label className="meal-brief__field meal-brief__field--grow">
          <span>Anything we won’t eat</span>
          <input
            type="text"
            value={value.avoid}
            onChange={(e) => setField('avoid', e.target.value)}
            placeholder="no garlic, no shellfish…"
          />
        </label>
        <button
          type="button"
          className="meal-brief__moreBtn"
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
        >
          {more ? 'Less' : 'More'}
        </button>
      </div>

      <p className="meal-brief__summary">{summary}</p>

      {more && (
        <div className="meal-brief__body">
          <div className="meal-brief__row">
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
          </div>

          <ChipGroup
            label="Meals"
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
            <span>Must-use flavours</span>
            <input
              type="text"
              value={value.notes}
              onChange={(e) => setField('notes', e.target.value)}
              placeholder="lots of onions, extra crispy…"
            />
          </label>
        </div>
      )}
    </div>
  )
}

export { defaultBrief }
export default MealBriefPanel

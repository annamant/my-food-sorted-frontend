import { useState } from 'react'
import './MealBriefPanel.css'

const CUISINES = ['Italian', 'French', 'Asian', 'Japanese', 'Mexican', 'British', 'Indian', 'Mediterranean']
const METHODS = ['Stir-fry', 'Grilled', 'Baked', 'Boiled', 'Steamed', 'Roasted', 'One-pan', 'Air-fryer']
const PROTEINS = ['Chicken', 'Beef', 'Pork', 'Fish', 'Eggs', 'Tofu', 'Lamb', 'Vegetarian']
const PANTRY = ['Pasta', 'Rice', 'Noodles', 'Potatoes', 'Onion', 'Garlic', 'Olive oil', 'Soy sauce', 'Tinned tomatoes', 'Beans', 'Cheese', 'Eggs']
const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'brunch', label: 'Brunch' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'occasion', label: 'Special occasion' },
]

function toggleInList(list, value) {
  const current = Array.isArray(list) ? list : []
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
}

function TickGroup({ label, options, selected, onChange }) {
  const current = Array.isArray(selected) ? selected : []
  return (
    <fieldset className="meal-brief__group">
      <legend className="meal-brief__legend">{label}</legend>
      <div className="meal-brief__ticks" role="group" aria-label={label}>
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.id
          const text = typeof opt === 'string' ? opt : opt.label
          const checked = current.includes(value)
          return (
            <button
              key={value}
              type="button"
              role="checkbox"
              aria-checked={checked}
              className={`meal-brief__tick ${checked ? 'meal-brief__tick--on' : ''}`}
              onClick={() => onChange(toggleInList(current, value))}
            >
              <span className="meal-brief__box" aria-hidden="true" />
              <span>{text}</span>
            </button>
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

export function formatBriefForChat(brief) {
  const value = brief ?? defaultBrief
  const lines = []
  if (value.servings) lines.push(`- People / servings: ${value.servings}`)
  if (value.days) lines.push(`- Days: ${value.days}`)
  const slots = Array.isArray(value.meal_slots) ? value.meal_slots : []
  const slotLabels = slots
    .filter((id) => id !== 'occasion')
    .map((id) => MEAL_SLOTS.find((s) => s.id === id)?.label ?? id)
  if (slotLabels.length) lines.push(`- Meals only: ${slotLabels.join(', ')}`)
  if (slots.includes('occasion')) {
    lines.push('- This is a one-off special occasion (celebration, guests, a treat). Make it feel special — not a weeknight default. One standout dish, not a routine plate.')
  }
  if (value.budget_per_day) lines.push(`- Budget per day: £${value.budget_per_day}`)
  if (value.max_cook_minutes) lines.push(`- Max cook time: ${value.max_cook_minutes} mins`)
  if (value.cuisines?.length) lines.push(`- Cuisines: ${value.cuisines.join(', ')}`)
  if (value.cooking_methods?.length) lines.push(`- Methods: ${value.cooking_methods.join(', ')}`)
  if (value.proteins?.length) lines.push(`- Proteins REQUIRED (do not substitute): ${value.proteins.join(', ')}`)
  if (value.pantry?.length) lines.push(`- Pantry / already have: ${value.pantry.join(', ')}`)
  if (value.avoid?.trim()) lines.push(`- Avoid / FORBIDDEN: ${value.avoid.trim()}`)
  if (value.notes?.trim()) {
    lines.push(`- What they told the chef (follow exactly, this is the brief): ${value.notes.trim()}`)
  }
  if (!lines.length) return ''
  return `My kitchen brief — follow exactly:\n${lines.join('\n')}`
}

function MealBriefPanel({ brief, onChange, prefs, requireNotes = false }) {
  const value = brief ?? defaultBrief
  const setField = (key, next) => {
    onChange((prev) => {
      const base = prev && typeof prev === 'object' ? prev : defaultBrief
      return { ...defaultBrief, ...base, [key]: next }
    })
  }
  const household = prefs?.household_size
  const notesEmpty = !value.notes?.trim()
  const [more, setMore] = useState(requireNotes)

  return (
    <div className="meal-brief meal-brief--intake">
      <div className="meal-brief__essentials">
        <label className="meal-brief__field">
          <span>People</span>
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
          <span>Mins</span>
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
          <span>Won’t eat</span>
          <input
            type="text"
            value={value.avoid}
            onChange={(e) => setField('avoid', e.target.value)}
            placeholder="garlic, shellfish…"
          />
        </label>
        <button
          type="button"
          className="meal-brief__moreBtn"
          onClick={() => setMore((v) => !v)}
        >
          {more ? 'Less' : 'More'}
        </button>
      </div>

      {more && (
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
            <span>£ / day</span>
            <input
              type="number"
              min={0}
              step={1}
              value={value.budget_per_day}
              onChange={(e) => setField('budget_per_day', Number(e.target.value) || 0)}
            />
          </label>
        </div>
      )}

      {more && <div className="meal-brief__tickGrid">
        <TickGroup
          label="Meals"
          options={MEAL_SLOTS}
          selected={value.meal_slots}
          onChange={(next) => setField('meal_slots', next)}
        />
        <TickGroup
          label="Cuisines"
          options={CUISINES}
          selected={value.cuisines}
          onChange={(next) => setField('cuisines', next)}
        />
        <TickGroup
          label="Cooking style"
          options={METHODS}
          selected={value.cooking_methods}
          onChange={(next) => setField('cooking_methods', next)}
        />
        <TickGroup
          label="Proteins"
          options={PROTEINS}
          selected={value.proteins}
          onChange={(next) => setField('proteins', next)}
        />
        <TickGroup
          label="Cupboard"
          options={PANTRY}
          selected={value.pantry}
          onChange={(next) => setField('pantry', next)}
        />
      </div>}

      {(more || requireNotes) && <label className="meal-brief__instructions">
        <span className="meal-brief__instructionsTitle">
          Tell your chef
          {requireNotes && <em>The fun bit</em>}
        </span>
        <span className="meal-brief__instructionsHint">
          Don’t be polite. What’s in your head, what you fancy, what’s in the fridge, the night you’ve got, what you won’t eat — say the lot. The more you tell them, the better the recipe.
        </span>
        <textarea
          rows={5}
          value={value.notes}
          onChange={(e) => setField('notes', e.target.value)}
          placeholder="Friday, I want something messy and garlicky… leftover roast chicken in the fridge… keep it cheap… no cream… extra crispy…"
          required={requireNotes}
          aria-invalid={requireNotes && notesEmpty}
        />
      </label>}
    </div>
  )
}

export { defaultBrief }
export default MealBriefPanel

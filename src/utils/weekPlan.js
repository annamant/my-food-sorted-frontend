export const WEEKDAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const SLOT_ORDER = ['breakfast', 'brunch', 'lunch', 'dinner']

export function normalizeDay(day) {
  if (!day) return null
  const raw = String(day).trim()
  if (/^tonight$/i.test(raw)) return null
  const lower = raw.toLowerCase()
  const match = WEEKDAYS.find(
    (d) => d.toLowerCase() === lower || d.toLowerCase().startsWith(lower.slice(0, 3)),
  )
  return match || raw
}

export function normalizeSlot(slot) {
  return String(slot || '').trim().toLowerCase()
}

export function capitalizeSlot(slot) {
  const s = String(slot || '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function isWeekPlan(recipes, brief) {
  if (!recipes?.length) return false
  if (brief?.mode === 'week' || Number(brief?.days) > 1) return true

  const days = new Set(
    recipes.map((r) => normalizeDay(r.day_of_week)).filter(Boolean),
  )
  if (days.size > 1) return true

  if (recipes.length === 1) {
    const day = recipes[0].day_of_week
    if (!day || /^tonight$/i.test(String(day))) return false
  }

  const slots = new Set(recipes.map((r) => normalizeSlot(r.meal_slot)).filter(Boolean))
  return days.size === 1 && slots.size > 1 && recipes.length > 1
}

export function mealSlotsForPlan(recipes, briefSlots) {
  const fromBrief = Array.isArray(briefSlots) ? briefSlots.map(normalizeSlot).filter(Boolean) : []
  const fromRecipes = [...new Set(recipes.map((r) => normalizeSlot(r.meal_slot)).filter(Boolean))]

  const combined = fromBrief.length ? fromBrief : fromRecipes
  if (!combined.length) return ['dinner']

  const ordered = SLOT_ORDER.filter((s) => combined.includes(s))
  const extra = combined.filter((s) => !SLOT_ORDER.includes(s))
  return [...ordered, ...extra]
}

export function daysForPlan(recipes, briefDays, dayNames) {
  if (Array.isArray(dayNames) && dayNames.length) {
    return dayNames.map(normalizeDay).filter(Boolean)
  }

  const fromRecipes = []
  const seen = new Set()
  for (const recipe of recipes || []) {
    const day = normalizeDay(recipe.day_of_week)
    if (day && !seen.has(day)) {
      seen.add(day)
      fromRecipes.push(day)
    }
  }

  if (fromRecipes.length > 1) {
    return WEEKDAYS.filter((d) => seen.has(d)).concat(
      fromRecipes.filter((d) => !WEEKDAYS.includes(d)),
    )
  }

  const count = Number(briefDays) || 0
  if (count > 1) return WEEKDAYS.slice(0, Math.min(count, 7))
  if (fromRecipes.length === 1) return fromRecipes
  return WEEKDAYS
}

export function buildWeekGrid(recipes) {
  const grid = {}
  for (const recipe of recipes || []) {
    const day = normalizeDay(recipe.day_of_week)
    const slot = normalizeSlot(recipe.meal_slot)
    if (!day || !slot) continue
    if (!grid[day]) grid[day] = {}
    grid[day][slot] = recipe
  }
  return grid
}

export function recipeCellKey(recipe) {
  if (!recipe) return ''
  return `${normalizeDay(recipe.day_of_week)}-${normalizeSlot(recipe.meal_slot)}-${recipe.title}`
}

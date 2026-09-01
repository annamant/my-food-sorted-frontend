/**
 * Generalist Planning Profile (GPP)
 *
 * Resolves a planning profile for a generalist meal planner from user prefs
 * and the current meal brief. No body profile, no medication axis, no protein
 * target — those belong to the GLP-1 product (Protein Tailor).
 *
 * The profile is the input the matching engine scores recipes against.
 */

export const GPP_VERSION = '1.0.0'

const DEFAULT_MAX_COOK_MINUTES = 45
const DEFAULT_HOUSEHOLD = 2

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function toList(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean)
  if (typeof value === 'string') return value.split(/[,;]+/).map((v) => v.trim()).filter(Boolean)
  return []
}

/**
 * Resolve a planning profile from account prefs and/or a meal brief.
 *
 * prefs: user account preferences (dietary_preferences, allergies,
 *   household_size, default_budget, preferred_retailer).
 * mealBrief: the structured brief for this planning session (servings,
 *   days, cuisines, cooking_methods, proteins, pantry, avoid, max_cook_minutes,
 *   budget_per_day, notes, mode).
 */
export function resolvePlanningProfile({ prefs, mealBrief } = {}) {
  const p = prefs && typeof prefs === 'object' ? prefs : {}
  const b = mealBrief && typeof mealBrief === 'object' ? mealBrief : {}

  const dietary = toList(p.dietary_preferences).concat(toList(b.dietary_preferences))
  const cuisines = toList(b.cuisines)
  const methods = toList(b.cooking_methods)
  const proteins = toList(b.proteins)
  const pantry = toList(b.pantry)

  const avoidRaw = toList(p.allergies).concat(toList(b.avoid))
  const avoid = [...new Set(avoidRaw.map((s) => s.toLowerCase()))]

  const notes = String(b.notes || '').trim()

  const householdSize = Number(b.servings || p.household_size || DEFAULT_HOUSEHOLD)
  const budgetPerDay = Number(b.budget_per_day ?? p.default_budget) || null
  const maxCookMinutes = Number(b.max_cook_minutes) || DEFAULT_MAX_COOK_MINUTES

  return {
    dietary,
    cuisines,
    methods,
    proteins,
    pantry,
    avoid,
    notes,
    householdSize: clamp(householdSize, 1, 20),
    budgetPerDay,
    maxCookMinutes: clamp(maxCookMinutes, 5, 240),
  }
}

export { clamp }

/**
 * Generalist Suitability Score (GSS)
 *
 * Deterministic meal fit scoring for a generalist meal planner. Ranks
 * catalog dishes and chat options against a resolved planning profile.
 * Learns lightly from recent meal feedback. Not medical advice.
 */

import { resolvePlanningProfile } from './planningProfile'
import { buildOutcomeContext } from '../data/mealFeedback'

export const GSS_VERSION = '1.0.0'

const WEIGHTS = {
  preferenceFit: 35,
  practical: 30,
  variety: 20,
  appeal: 15,
}

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function loadOutcomeContext() {
  try {
    return buildOutcomeContext()
  } catch {
    return null
  }
}

function effectiveWeights(outcome) {
  return outcome?.weights || WEIGHTS
}

function rebalanceWeights(weights) {
  const sum =
    weights.preferenceFit + weights.practical + weights.variety + weights.appeal
  if (sum === 100) return weights
  const scale = 100 / sum
  return {
    preferenceFit: Math.round(weights.preferenceFit * scale),
    practical: Math.round(weights.practical * scale),
    variety: Math.round(weights.variety * scale),
    appeal: Math.max(0, 100 - Math.round(weights.preferenceFit * scale) - Math.round(weights.practical * scale) - Math.round(weights.variety * scale)),
  }
}

function titlesMatch(a, b) {
  if (!a || !b) return false
  return a === b || a.includes(b) || b.includes(a)
}

function inferTagsFromText(text) {
  const lower = String(text || '').toLowerCase()
  const tags = []
  if (/quick|no cook|fridge|10 min|15 min|fast|weeknight|easy/.test(lower)) {
    tags.push('quick')
  }
  if (/slow|roast|braise|90 min|2 hour|long/.test(lower)) {
    tags.push('slow')
  }
  if (/spicy|chilli|chili|hot|harissa|sriracha/.test(lower)) {
    tags.push('spicy')
  }
  if (/mild|creamy|comfort|gentle|soft/.test(lower)) {
    tags.push('mild')
  }
  return tags
}

export function mealFromCatalogDish(dish) {
  const recipe = dish?.mealPlan?.recipes?.[0] || {}
  const tags = [...(dish.collections || [])]
  return {
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    cookMinutes: (recipe.prep_time || 0) + (recipe.cook_time || 0),
    estimatedCost: recipe.estimated_cost ?? dish?.estimated_cost ?? null,
    tags,
    title: dish.title || '',
    blurb: dish.blurb || '',
    cuisines: dish.cuisines || [],
  }
}

export function mealFromChatOption(option) {
  const text = `${option.title || ''} ${option.description || ''}`
  return {
    calories: option.calories,
    protein: option.protein,
    carbs: option.carbs,
    fat: option.fat,
    cookMinutes:
      option.cook_time != null ? (option.prep_time || 0) + Number(option.cook_time) : null,
    estimatedCost: option.estimated_cost ?? null,
    tags: inferTagsFromText(text),
    title: option.title || '',
    blurb: option.description || '',
    cuisines: [],
  }
}

function matchesAny(value, list) {
  if (!value || !list?.length) return false
  const lower = String(value).toLowerCase()
  return list.some((item) => {
    const s = String(item).toLowerCase()
    return lower === s || lower.includes(s) || s.includes(lower)
  })
}

function hasAny(text, list) {
  if (!text || !list?.length) return false
  const lower = String(text).toLowerCase()
  return list.some((item) => lower.includes(String(item).toLowerCase()))
}

function scorePreferenceFit(meal, profile) {
  let score = 0.5
  const text = `${meal.title} ${meal.blurb}`.toLowerCase()

  if (profile.cuisines?.length) {
    const mealCuisines = [...(meal.cuisines || []), meal.tags || []].flat()
    const matched = profile.cuisines.some((c) =>
      matchesAny(c, mealCuisines) || hasAny(text, [c]),
    )
    if (matched) score += 0.3
    else score -= 0.1
  }

  if (profile.proteins?.length) {
    if (hasAny(text, profile.proteins)) score += 0.2
  }

  if (profile.pantry?.length) {
    if (hasAny(text, profile.pantry)) score += 0.15
  }

  if (profile.dietary?.length) {
    const diet = profile.dietary.join(' ').toLowerCase()
    if (/vegan/.test(diet) && hasAny(text, ['meat', 'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'cheese', 'egg', 'cream', 'butter', 'pancetta', 'bacon'])) {
      score -= 0.4
    } else if (/vegetarian/.test(diet) && hasAny(text, ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'pancetta', 'bacon', 'chorizo'])) {
      score -= 0.4
    } else if (/gluten/.test(diet) && hasAny(text, ['pasta', 'bread', 'flour', 'couscous', 'soy sauce', 'soy-sauce'])) {
      score -= 0.25
    }
  }

  return clamp(score, 0, 1)
}

function scorePractical(meal, profile) {
  let score = 0.7
  const text = `${meal.title} ${meal.blurb}`.toLowerCase()

  if (profile.avoid?.length) {
    let avoided = false
    for (const word of profile.avoid) {
      if (word && text.includes(word)) {
        score -= 0.5
        avoided = true
        break
      }
    }
    if (!avoided) score += 0.05
  }

  if (meal.cookMinutes != null && profile.maxCookMinutes > 0) {
    if (meal.cookMinutes <= profile.maxCookMinutes) score += 0.2
    else score -= clamp((meal.cookMinutes - profile.maxCookMinutes) / 40, 0, 0.4)
  }

  if ((meal.tags || []).includes('quick')) score += 0.08

  if (profile.budgetPerDay != null && meal.estimatedCost != null) {
    const perServing = Number(meal.estimatedCost)
    const perMealBudget = profile.budgetPerDay / (profile.householdSize > 0 ? 3 : 1)
    if (perServing <= perMealBudget) score += 0.1
    else if (perServing > perMealBudget * 1.5) score -= 0.15
  }

  return clamp(score, 0, 1)
}

function scoreVariety(meal, profile, planContext) {
  // Lower score for dishes similar to ones already in the plan.
  if (!planContext?.titles?.length) return 0.6
  const title = String(meal.title || '').toLowerCase()
  const similar = planContext.titles.some((t) => titlesMatch(title, t))
  return similar ? 0.3 : 0.7
}

function scoreAppeal(meal, outcome) {
  let score = 0.5
  if (!outcome) return score
  const title = String(meal.title || '').trim().toLowerCase()

  for (const row of outcome.likedTitles || []) {
    if (titlesMatch(title, row.title)) {
      score += 0.3
      break
    }
  }

  for (const row of outcome.penalizedTitles || []) {
    if (titlesMatch(title, row.title)) {
      score -= row.feedback === 'disliked' ? 0.3 : 0.2
      break
    }
  }

  return clamp(score, 0, 1)
}

function buildReasons(breakdown, profile, outcome) {
  const reasons = []
  if (breakdown.preferenceFit >= 25) reasons.push('Matches your tastes')
  else if (breakdown.preferenceFit >= 18) reasons.push('Fits your preferences')
  if (breakdown.practical >= 22) reasons.push('Fits your kitchen brief')
  if (breakdown.appeal >= 12 && outcome?.likedTitles?.length) reasons.push('Like dishes you enjoyed')
  if (breakdown.variety >= 14) reasons.push('Different from the rest of your week')
  if (reasons.length < 2) {
    if (breakdown.preferenceFit < 14) reasons.push('Outside your preferred cuisines')
    else if (breakdown.practical < 12) reasons.push('Longer or pricier than your brief')
    else reasons.push('A solid option')
  }
  return reasons.slice(0, 2)
}

/**
 * Score one meal against a planning profile. Returns 0 to 100 total plus breakdown.
 * planContext: optional { titles: string[] } of dishes already in the plan, for variety.
 * outcomeContext: optional precomputed outcome context (defaults to local feedback).
 */
export function scoreMeal(meal, profile, planContext, outcomeContext) {
  const outcome = outcomeContext === undefined ? loadOutcomeContext() : outcomeContext
  const weights = effectiveWeights(outcome)

  const preferenceFit = scorePreferenceFit(meal, profile) * weights.preferenceFit
  const practical = scorePractical(meal, profile) * weights.practical
  const variety = scoreVariety(meal, profile, planContext) * weights.variety
  const appeal = scoreAppeal(meal, outcome) * weights.appeal

  const breakdown = {
    preferenceFit: Math.round(preferenceFit),
    practical: Math.round(practical),
    variety: Math.round(variety),
    appeal: Math.round(appeal),
  }

  const total = clamp(
    breakdown.preferenceFit + breakdown.practical + breakdown.variety + breakdown.appeal,
    0,
    100,
  )

  return {
    total,
    breakdown,
    reasons: buildReasons(breakdown, profile, outcome),
    version: GSS_VERSION,
    outcomeAdjusted: Boolean(outcome?.active),
  }
}

export function formatFitLabel(total) {
  const rounded = Math.round(Number(total) || 0)
  return `${rounded}% fit for you`
}

export function resolveProfileContext(sources) {
  return resolvePlanningProfile(sources || {})
}

export function resolveOutcomeContext() {
  return loadOutcomeContext()
}

export function scoreCatalogDish(dish, profile, planContext, outcomeContext) {
  return scoreMeal(mealFromCatalogDish(dish), profile, planContext, outcomeContext)
}

export function scoreChatOption(option, profile, planContext, outcomeContext) {
  return scoreMeal(mealFromChatOption(option), profile, planContext, outcomeContext)
}

export function rankCatalogDishes(dishes, profile, planContext) {
  const resolved = profile?.cuisines != null || profile?.dietary != null
    ? profile
    : resolveProfileContext(profile || {})
  const outcome = loadOutcomeContext()
  return [...(dishes || [])]
    .map((dish) => ({
      ...dish,
      suitability: scoreCatalogDish(dish, resolved, planContext, outcome),
    }))
    .sort((a, b) => b.suitability.total - a.suitability.total)
}

export function rankChatOptions(options, profile, planContext) {
  const resolved = profile?.cuisines != null || profile?.dietary != null
    ? profile
    : resolveProfileContext(profile || {})
  const outcome = loadOutcomeContext()
  return [...(options || [])]
    .map((option) => ({
      ...option,
      suitability: scoreChatOption(option, resolved, planContext, outcome),
    }))
    .sort((a, b) => b.suitability.total - a.suitability.total)
}

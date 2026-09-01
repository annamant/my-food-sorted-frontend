/**
 * Week Plan Optimiser (WPO) — generalist MFS edition.
 *
 * Post-processes LLM week plans: fills gaps, reduces duplicates, balances the
 * week, and rewards shared ingredients. No protein targets, no GLP-1 logic.
 */

import { CATALOG } from '../data/catalog'
import {
  buildWeekGrid,
  daysForPlan,
  mealSlotsForPlan,
  normalizeDay,
  normalizeSlot,
  isWeekPlan,
} from '../utils/weekPlan'
import {
  scoreMeal,
  mealFromCatalogDish,
  resolveProfileContext,
  resolveOutcomeContext,
} from './suitabilityScore'

export const WPO_VERSION = '1.0.0'

const REPLACE_MARGIN = 8
const MAX_REPLACE_FRACTION = 0.34
const WEAK_SCORE = 55

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n))
}

function normalizeTitle(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
}

function mealFromRecipe(recipe) {
  const text = `${recipe.title || ''} ${recipe.instructions || ''}`
  return {
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    cookMinutes: (recipe.prep_time || 0) + (recipe.cook_time || 0),
    tags: [],
    title: recipe.title || '',
    blurb: text.slice(0, 120),
  }
}

function ingredientNames(recipe) {
  return new Set(
    (recipe?.ingredients || [])
      .map((i) => String(i.ingredient_name || '').trim().toLowerCase())
      .filter(Boolean),
  )
}

function overlapCount(a, b) {
  const setB = ingredientNames(b)
  let count = 0
  for (const name of ingredientNames(a)) {
    if (setB.has(name)) count += 1
  }
  return count
}

function catalogRecipeToCell(dish, day, slot) {
  const base = dish?.mealPlan?.recipes?.[0]
  if (!base) return null
  return {
    ...base,
    title: base.title || dish.title,
    day_of_week: day,
    meal_slot: slot,
    image: base.image || dish.image,
  }
}

function contextualScore(recipe, profile, ctx, outcome) {
  const base = scoreMeal(mealFromRecipe(recipe), profile, null, outcome)
  let adjust = 0

  const title = normalizeTitle(recipe.title)
  if (title !== ctx.slotTitle && ctx.usedTitles.has(title)) adjust -= 18
  if (ctx.prevTitle && title === ctx.prevTitle) adjust -= 12
  if (ctx.nextTitle && title === ctx.nextTitle) adjust -= 12

  if (ctx.sharedIngredients > 0) adjust += Math.min(10, ctx.sharedIngredients * 3)

  const cook = (recipe.prep_time || 0) + (recipe.cook_time || 0)
  if (profile.maxCookMinutes && ctx.dayCookMinutes + cook > profile.maxCookMinutes * 1.2) {
    adjust -= 8
  }

  return {
    ...base,
    contextualTotal: clamp(base.total + adjust, 0, 100),
  }
}

function buildCatalogCandidates(catalog, profile, usedTitles, outcome) {
  return (catalog || CATALOG)
    .map((dish) => ({
      dish,
      recipe: dish.mealPlan?.recipes?.[0],
      score: scoreMeal(mealFromCatalogDish(dish), profile, null, outcome).total,
    }))
    .filter((c) => c.recipe && !usedTitles.has(normalizeTitle(c.recipe.title)))
    .sort((a, b) => b.score - a.score)
}

function assignRecipesToGrid(recipes, days, slots) {
  const grid = {}
  const unplaced = []

  for (const recipe of recipes) {
    const day = normalizeDay(recipe.day_of_week)
    const slot = normalizeSlot(recipe.meal_slot)
    if (day && slot && days.includes(day) && slots.includes(slot) && !grid[`${day}|${slot}`]) {
      grid[`${day}|${slot}`] = { ...recipe, day_of_week: day, meal_slot: slot }
    } else {
      unplaced.push(recipe)
    }
  }

  for (const day of days) {
    for (const slot of slots) {
      const key = `${day}|${slot}`
      if (!grid[key] && unplaced.length) {
        const next = unplaced.shift()
        grid[key] = { ...next, day_of_week: day, meal_slot: slot }
      }
    }
  }

  return { grid, unplaced }
}

function gridToRecipes(grid, days, slots) {
  const recipes = []
  for (const day of days) {
    for (const slot of slots) {
      const cell = grid[`${day}|${slot}`]
      if (cell) recipes.push(cell)
    }
  }
  return recipes
}

function fillMissingCells(grid, days, slots, candidates, usedTitles) {
  const fills = []
  for (const day of days) {
    for (const slot of slots) {
      const key = `${day}|${slot}`
      if (grid[key]) continue

      const best = candidates.find(
        (c) => !usedTitles.has(normalizeTitle(c.recipe.title)),
      )
      if (!best) continue

      const cell = catalogRecipeToCell(best.dish, day, slot)
      if (!cell) continue

      grid[key] = cell
      usedTitles.add(normalizeTitle(cell.title))
      fills.push({ day, slot, title: cell.title })
      candidates.splice(candidates.indexOf(best), 1)
    }
  }
  return fills
}

function resolveDuplicateAdjacent(grid, days, slots, candidates, usedTitles) {
  const swaps = []

  for (let i = 0; i < days.length; i += 1) {
    const day = days[i]
    const prevDay = i > 0 ? days[i - 1] : null
    const nextDay = i < days.length - 1 ? days[i + 1] : null

    for (const slot of slots) {
      const key = `${day}|${slot}`
      const cell = grid[key]
      if (!cell) continue

      const title = normalizeTitle(cell.title)
      const prevTitle = prevDay ? normalizeTitle(grid[`${prevDay}|${slot}`]?.title) : null
      const nextTitle = nextDay ? normalizeTitle(grid[`${nextDay}|${slot}`]?.title) : null

      if (title !== prevTitle && title !== nextTitle) continue

      const replacement = candidates.find(
        (c) => {
          const t = normalizeTitle(c.recipe.title)
          return t !== title && t !== prevTitle && t !== nextTitle && !usedTitles.has(t)
        },
      )
      if (!replacement) continue

      const newCell = catalogRecipeToCell(replacement.dish, day, slot)
      if (!newCell) continue

      usedTitles.delete(title)
      usedTitles.add(normalizeTitle(newCell.title))
      grid[key] = newCell
      swaps.push({ day, slot, from: cell.title, to: newCell.title })
      candidates.splice(candidates.indexOf(replacement), 1)
    }
  }

  return swaps
}

function slotContext(grid, days, slots, day, slot, usedTitles, recipe, occupantTitle) {
  const dayIndex = days.indexOf(day)
  const prev = dayIndex > 0 ? grid[`${days[dayIndex - 1]}|${slot}`] : null
  const next = dayIndex >= 0 && dayIndex < days.length - 1 ? grid[`${days[dayIndex + 1]}|${slot}`] : null
  const dayCookMinutes = slots.reduce((sum, s) => {
    const cell = grid[`${day}|${s}`]
    if (!cell) return sum
    return sum + (cell.prep_time || 0) + (cell.cook_time || 0)
  }, 0)

  return {
    usedTitles,
    slotTitle:
      occupantTitle != null
        ? occupantTitle
        : recipe
          ? normalizeTitle(recipe.title)
          : null,
    prevTitle: prev ? normalizeTitle(prev.title) : null,
    nextTitle: next ? normalizeTitle(next.title) : null,
    sharedIngredients: prev && recipe ? overlapCount(recipe, prev) : 0,
    dayCookMinutes,
  }
}

function replaceWeakCells(grid, days, slots, candidates, profile, usedTitles, outcome) {
  const replacements = []
  const cells = []

  for (const day of days) {
    for (const slot of slots) {
      const cell = grid[`${day}|${slot}`]
      if (!cell) continue
      const ctx = slotContext(grid, days, slots, day, slot, usedTitles, cell)
      const scored = contextualScore(cell, profile, ctx, outcome)
      cells.push({ day, slot, cell, score: scored.contextualTotal })
    }
  }

  if (!cells.length || !candidates.length) return replacements

  cells.sort((a, b) => a.score - b.score)
  const maxReplace = Math.max(1, Math.floor(cells.length * MAX_REPLACE_FRACTION))
  const weak = cells.filter((row, i) => i < maxReplace || row.score < WEAK_SCORE)

  for (const row of weak) {
    if (replacements.length >= maxReplace) break

    const currentTitle = normalizeTitle(row.cell.title)
    const titlesWithoutCurrent = new Set(usedTitles)
    titlesWithoutCurrent.delete(currentTitle)

    let best = null
    let bestScore = row.score + REPLACE_MARGIN

    for (const candidate of candidates) {
      const candidateTitle = normalizeTitle(candidate.recipe.title)
      if (!candidateTitle || candidateTitle === currentTitle) continue
      if (titlesWithoutCurrent.has(candidateTitle)) continue

      const newCell = catalogRecipeToCell(candidate.dish, row.day, row.slot)
      if (!newCell) continue

      const trialTitles = new Set(titlesWithoutCurrent)
      trialTitles.add(candidateTitle)
      const ctx = slotContext(
        grid,
        days,
        slots,
        row.day,
        row.slot,
        trialTitles,
        newCell,
        currentTitle,
      )
      const scored = contextualScore(newCell, profile, ctx, outcome)
      if (scored.contextualTotal >= bestScore) {
        best = { candidate, newCell, score: scored.contextualTotal }
        bestScore = scored.contextualTotal
      }
    }

    if (!best) continue

    usedTitles.delete(currentTitle)
    usedTitles.add(normalizeTitle(best.newCell.title))
    grid[`${row.day}|${row.slot}`] = best.newCell
    candidates.splice(candidates.indexOf(best.candidate), 1)
    replacements.push({
      day: row.day,
      slot: row.slot,
      from: row.cell.title,
      to: best.newCell.title,
    })
  }

  return replacements
}

function weekCalorieBalance(recipes) {
  const values = recipes.map((r) => Number(r.calories) || 0).filter((c) => c > 0)
  if (!values.length) return null

  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const variance =
    values.reduce((sum, c) => sum + (c - avg) ** 2, 0) / values.length

  return {
    averageCalories: Math.round(avg),
    variance: Math.round(variance),
    balanced: variance <= 40000,
  }
}

function weekIngredientReuse(recipes) {
  const names = new Set()
  let reuse = 0
  for (const recipe of recipes) {
    for (const name of ingredientNames(recipe)) {
      if (names.has(name)) reuse += 1
      else names.add(name)
    }
  }
  return reuse
}

function expectedRecipeCount(brief) {
  const days = Number(brief?.days) || 1
  const slots = Array.isArray(brief?.meal_slots) ? brief.meal_slots.length : 1
  return Math.max(1, days * slots)
}

/**
 * Optimise a week meal plan after LLM generation.
 */
export function optimizeWeekPlan(mealPlan, { brief, profileSources, catalog = CATALOG } = {}) {
  const recipes = mealPlan?.recipes || []
  const briefCtx = {
    mode: brief?.mode,
    days: brief?.days,
    meal_slots: brief?.meal_slots,
    day_names: brief?.day_names,
  }

  if (!isWeekPlan(recipes, briefCtx) && !(Number(brief?.days) > 1)) {
    return { mealPlan, report: null }
  }

  const profile = resolveProfileContext(profileSources || {})
  const outcome = resolveOutcomeContext()
  const days = daysForPlan(recipes, brief?.days, brief?.day_names)
  const slots = mealSlotsForPlan(recipes, brief?.meal_slots)
  const expected = expectedRecipeCount(brief || { days: days.length, meal_slots: slots })

  const usedTitles = new Set(recipes.map((r) => normalizeTitle(r.title)))
  const { grid } = assignRecipesToGrid(recipes, days, slots)

  const candidates = buildCatalogCandidates(catalog, profile, usedTitles, outcome)
  const fills = fillMissingCells(grid, days, slots, candidates, usedTitles)
  const swaps = resolveDuplicateAdjacent(grid, days, slots, candidates, profile, usedTitles)
  const replacements = replaceWeakCells(
    grid,
    days,
    slots,
    candidates,
    profile,
    usedTitles,
    outcome,
  )

  const optimized = gridToRecipes(grid, days, slots)

  const contextualScores = optimized.map((recipe) => {
    const day = normalizeDay(recipe.day_of_week)
    const slot = normalizeSlot(recipe.meal_slot)
    const ctx = slotContext(grid, days, slots, day, slot, usedTitles, recipe)
    return contextualScore(recipe, profile, ctx, outcome)
  })

  const weekScore = contextualScores.length
    ? Math.round(contextualScores.reduce((s, c) => s + c.contextualTotal, 0) / contextualScores.length)
    : null

  const report = {
    version: WPO_VERSION,
    weekScore,
    fills,
    swaps,
    replacements,
    calorieBalance: weekCalorieBalance(optimized),
    ingredientReuse: weekIngredientReuse(optimized),
    mealCount: optimized.length,
    expectedMeals: expected,
  }

  return {
    mealPlan: {
      ...mealPlan,
      recipes: optimized,
      weekOptimization: report,
    },
    report,
  }
}

export { mealFromRecipe, buildWeekGrid }

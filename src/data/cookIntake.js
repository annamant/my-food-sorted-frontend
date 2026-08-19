export const COOK_PATHS = [
  {
    id: 'recipe',
    n: '01',
    title: 'Adapt a recipe',
    blurb: 'Start from a trusted dish, then make it yours.',
    opener: 'Which classic should we start from? Name the dish — carbonara, a stew, a curry, whatever you want to adapt.',
    placeholder: 'Carbonara, beef stew, a French chicken dish…',
  },
  {
    id: 'create',
    n: '02',
    title: 'Create your own',
    blurb: 'A flavour, a fridge raid, a mood — we’ll turn it into a meal.',
    opener: 'What do you fancy? A dish, a flavour, what’s in the fridge, or the night you’ve got.',
    placeholder: 'Beef stew, leftover chicken, something comforting…',
  },
  {
    id: 'week',
    n: '03',
    title: 'Plan a week',
    blurb: 'A few questions, then three week directions to choose from.',
    opener: 'Tell me about the week you want to plan — busy weeknights, batch cooking, feeding kids, eating lighter.',
    placeholder: 'Busy weeknights, batch cooking, dinners for two…',
  },
]

const ANYTHING_ELSE = {
  id: 'extra',
  prompt: 'Is there anything else you want me to take into account before I give you 3 options?',
  field: 'extra',
}

const DISH_QUESTIONS = [
  { id: 'servings', prompt: 'How many people are you cooking for?', field: 'servings' },
  { id: 'time', prompt: 'How much time do you have, in minutes?', field: 'max_cook_minutes' },
  { id: 'budget', prompt: 'What’s the rough budget for this meal, in pounds?', field: 'budget_per_day' },
  { id: 'avoid', prompt: 'Anything you cannot or do not want to eat? Say “none” if you’re open.', field: 'avoid' },
  ANYTHING_ELSE,
]

const WEEK_QUESTIONS = [
  { id: 'servings', prompt: 'How many people are you feeding?', field: 'servings' },
  { id: 'days', prompt: 'How many days should I plan for? 5 or 7 is typical.', field: 'days' },
  { id: 'slots', prompt: 'Which meals — breakfast, lunch, dinner, or just dinners?', field: 'meal_slots' },
  {
    id: 'cuisine_mode',
    prompt: 'You mentioned cuisines you like. For the whole week: do you want one cuisine all week, or mixed cuisines across the week?',
    field: 'cuisine_mode',
  },
  { id: 'budget', prompt: 'What’s the rough food budget for this plan, in pounds?', field: 'weekly_budget' },
  { id: 'avoid', prompt: 'Anything you cannot or do not want to eat? Say “none” if you’re open.', field: 'avoid' },
  ANYTHING_ELSE,
]

export function questionsForPath(path) {
  return path === 'week' ? WEEK_QUESTIONS : DISH_QUESTIONS
}

export function pathMeta(path) {
  return COOK_PATHS.find((item) => item.id === path) ?? COOK_PATHS[1]
}

export function looksLikeNo(text) {
  return /^(no|nope|none|nothing|n\/a|na|no thanks|that's all|thats all|all good|skip)$/i.test(String(text).trim())
}

function firstNumber(text) {
  const match = String(text).replace(/,/g, '').match(/(\d+(?:\.\d+)?)/)
  return match ? Number(match[1]) : null
}

function parseMinutes(text) {
  const n = firstNumber(text)
  if (n != null) return n
  const t = String(text).toLowerCase()
  if (/quick|fast|rush|weeknight/.test(t)) return 25
  if (/slow|weekend|no rush|all day/.test(t)) return 75
  return null
}

function parseMealSlots(text) {
  const t = String(text).toLowerCase()
  const slots = []
  if (/\bbreakfast/.test(t)) slots.push('breakfast')
  if (/\bbrunch/.test(t)) slots.push('brunch')
  if (/\blunch/.test(t)) slots.push('lunch')
  if (/\bdinner|\bsupper|\bevening/.test(t)) slots.push('dinner')
  if (!slots.length) {
    if (/\ball\b|\bevery meal|\bthree meals/.test(t)) return ['breakfast', 'lunch', 'dinner']
    return ['dinner']
  }
  return slots
}

function isFlexible(text) {
  return /doesn'?t matter|no budget|flexible|whatever|up to you|no limit/.test(String(text).toLowerCase())
}

export function applyIntakeAnswer(brief, question, rawAnswer) {
  const answer = String(rawAnswer || '').trim()
  const next = { ...(brief ?? {}) }

  switch (question.field) {
    case 'servings': {
      const n = firstNumber(answer)
      if (n) next.servings = Math.max(1, Math.min(20, Math.round(n)))
      break
    }
    case 'max_cook_minutes': {
      const n = parseMinutes(answer)
      if (n) next.max_cook_minutes = Math.max(5, Math.min(240, Math.round(n)))
      break
    }
    case 'budget_per_day': {
      if (isFlexible(answer) || looksLikeNo(answer)) {
        next.budget_per_day = 0
      } else {
        const n = firstNumber(answer)
        if (n != null) next.budget_per_day = n
      }
      break
    }
    case 'weekly_budget': {
      if (isFlexible(answer) || looksLikeNo(answer)) {
        next.budget_per_day = 0
      } else {
        const n = firstNumber(answer)
        if (n != null) {
          const days = next.days || 7
          next.budget_per_day = Math.round((n / days) * 100) / 100
        }
      }
      break
    }
    case 'days': {
      const n = firstNumber(answer)
      if (n) next.days = Math.max(1, Math.min(14, Math.round(n)))
      break
    }
    case 'meal_slots': {
      next.meal_slots = parseMealSlots(answer)
      break
    }
    case 'cuisine_mode': {
      if (looksLikeNo(answer)) break
      const lower = answer.toLowerCase()
      const mode = /(mixed|varied|different)/.test(lower)
        ? 'mixed cuisines across the week'
        : /(one|single|same|all week|whole week)/.test(lower)
          ? 'one cuisine all week'
          : answer
      next.notes = next.notes?.trim()
        ? `${next.notes.trim()}. Cuisine plan: ${mode}.`
        : `Cuisine plan: ${mode}.`
      break
    }
    case 'avoid': {
      next.avoid = looksLikeNo(answer) ? '' : answer
      break
    }
    case 'extra': {
      if (!looksLikeNo(answer)) {
        next.notes = next.notes?.trim()
          ? `${next.notes.trim()}. Also: ${answer}`
          : answer
      }
      break
    }
    default:
      break
  }

  return next
}

export function suggestInstruction(path) {
  if (path === 'recipe') {
    return 'Start from established, recognisable recipes from trusted cooking traditions. Do not invent novelty dishes.'
  }
  if (path === 'week') {
    return 'This is a WEEK PLAN. Suggest three distinct week themes/directions (not single dishes) that all fit the brief. Do not write full recipes yet. If the brief indicates “one cuisine all week”, keep each option within a single cuisine; if it indicates “mixed cuisines across the week”, each option should blend at least 2 of the cuisines they mentioned.'
  }
  return 'Create three original but practical home-cooking directions from this brief.'
}

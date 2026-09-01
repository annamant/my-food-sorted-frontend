function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function instructionSteps(text) {
  if (!text || typeof text !== 'string') return []
  const trimmed = text.trim()
  if (!trimmed) return []

  const byNumber = trimmed
    .split(/(?=\b\d+[\).]\s)/)
    .map((s) => s.replace(/^\d+[\).]\s*/, '').trim())
    .filter(Boolean)
  if (byNumber.length > 1) return byNumber

  const byLine = trimmed
    .split(/\n+/)
    .map((s) => s.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
  if (byLine.length > 1) return byLine

  return [trimmed]
}

function renderRecipe(recipe) {
  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : []
  const steps = instructionSteps(recipe.instructions)

  return `
    <article class="print-recipe">
      <h3>${escapeHtml(recipe.title)}</h3>
      ${recipe.meal_slot || recipe.day_of_week ? `<p class="print-meta">${escapeHtml([recipe.day_of_week, recipe.meal_slot].filter(Boolean).join(' · '))}</p>` : ''}
      ${ingredients.length ? `
        <h4>Ingredients</h4>
        <ul>${ingredients.map((ing) => `<li>${escapeHtml(ing.ingredient_name)}${ing.quantity != null ? `: ${escapeHtml(ing.quantity)} ${escapeHtml(ing.unit || '')}` : ''}</li>`).join('')}</ul>
      ` : ''}
      ${steps.length ? `
        <h4>Method</h4>
        <ol>${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      ` : ''}
    </article>
  `
}

function renderPlan(plan) {
  const recipes = Array.isArray(plan.recipes) ? plan.recipes : []
  return `
    <section class="print-plan">
      <h2>${escapeHtml(plan.plan_name || 'Saved meal')}</h2>
      ${recipes.map(renderRecipe).join('')}
    </section>
  `
}

function buildPrintHtml({ playlist, plans, brandName }) {
  const title = playlist?.title || 'My book'
  const printedAt = new Date().toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)} | ${escapeHtml(brandName)}</title>
    <style>
      body { font-family: Georgia, serif; color: #1a1018; margin: 2rem; line-height: 1.5; }
      h1 { font-size: 2rem; margin: 0 0 0.25rem; }
      .print-lede { color: #5c4a55; margin: 0 0 2rem; }
      .print-plan { break-inside: avoid-page; margin: 0 0 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #ddd; }
      .print-plan:last-child { border-bottom: 0; }
      .print-recipe { margin: 1rem 0 1.5rem; }
      .print-recipe h3 { margin: 0 0 0.35rem; font-size: 1.2rem; }
      .print-meta { margin: 0 0 0.75rem; color: #5c4a55; font-size: 0.95rem; }
      h4 { margin: 0.75rem 0 0.35rem; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.04em; }
      ul, ol { margin: 0.25rem 0 0; padding-left: 1.25rem; }
      li { margin: 0.2rem 0; }
      @media print { body { margin: 0.75in; } }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title)}</h1>
    <p class="print-lede">Printed from ${escapeHtml(brandName)} on ${escapeHtml(printedAt)}.</p>
    ${plans.map(renderPlan).join('')}
  </body>
</html>`
}

export async function printPlaylistBook({ playlist, fetchPlan, brandName }) {
  const tracks = playlist?.tracks ?? playlist?.items ?? []
  if (!tracks.length) return false

  const plans = []
  for (const track of tracks) {
    const planId = track.meal_plan_id ?? track.plan_id ?? track.id
    const plan = await fetchPlan(planId)
    if (plan) plans.push(plan)
  }
  if (!plans.length) return false

  const html = buildPrintHtml({ playlist, plans, brandName })
  const win = window.open('', '_blank', 'noopener,noreferrer')
  if (!win) return false

  win.document.open()
  win.document.write(html)
  win.document.close()
  win.focus()
  win.print()
  return true
}

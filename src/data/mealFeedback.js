/**
 * Meal outcome feedback for the generalist matching engine.
 * Stores locally and syncs to backend when available.
 *
 * Generalist vocabulary — no appetite/medication terms.
 *   feedback  — how the dish landed for the user (drives engine weights)
 *   repeat    — whether they'd cook it again (the "works" signal)
 */

export const FEEDBACK_STORAGE_KEY = 'mfsMealFeedback'

export const FEEDBACK_OPTIONS = [
  { id: 'liked', label: 'I liked it' },
  { id: 'disliked', label: 'Not for me' },
  { id: 'too_spicy', label: 'Too spicy' },
  { id: 'too_bland', label: 'Too bland' },
]

export const REPEAT_OPTIONS = [
  { id: 'would_repeat', label: 'I\'d cook this again' },
  { id: 'no_repeat', label: 'Probably not again' },
]

const FEEDBACK_IDS = new Set(FEEDBACK_OPTIONS.map((o) => o.id))
const REPEAT_IDS = new Set(REPEAT_OPTIONS.map((o) => o.id))

export function normalizeFeedbackId(id) {
  if (id == null || id === '') return null
  return FEEDBACK_IDS.has(id) ? id : null
}

export function normalizeRepeatId(id) {
  if (id == null || id === '') return null
  return REPEAT_IDS.has(id) ? id : null
}

function readAll() {
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeAll(entries) {
  try {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore quota */
  }
}

export function feedbackKey({ planId, recipeTitle, day, slot }) {
  return [planId || 'draft', recipeTitle || '', day || '', slot || ''].join('|')
}

export function getMealFeedback(key) {
  return readAll().find((e) => e.key === key) || null
}

function mergeEntry(prev, patch) {
  const feedback =
    patch.feedback !== undefined ? normalizeFeedbackId(patch.feedback) : prev.feedback || null
  const repeat =
    patch.repeat !== undefined ? normalizeRepeatId(patch.repeat) : prev.repeat || null
  return {
    ...prev,
    ...patch,
    feedback,
    repeat,
    recordedAt: Date.now(),
    synced: false,
  }
}

export function recordMealFeedback(entry) {
  const entries = readAll()
  const idx = entries.findIndex((e) => e.key === entry.key)
  const prev = idx >= 0 ? entries[idx] : {}
  const next = mergeEntry(prev, entry)
  if (idx >= 0) entries[idx] = next
  else entries.push(next)
  writeAll(entries)
  return next
}

export function listUnsyncedFeedback() {
  return readAll().filter((e) => !e.synced)
}

export function markFeedbackSynced(keys) {
  const set = new Set(keys)
  writeAll(readAll().map((e) => (set.has(e.key) ? { ...e, synced: true } : e)))
}

function recordedAtMs(entry) {
  return Number(entry?.recordedAt) || 0
}

function normalizeRemoteEntry(entry) {
  if (!entry?.key) return null
  return {
    key: String(entry.key),
    feedback: normalizeFeedbackId(entry.feedback),
    repeat: normalizeRepeatId(entry.repeat),
    planId: entry.planId ?? null,
    recipeTitle: entry.recipeTitle ?? null,
    day: entry.day ?? null,
    slot: entry.slot ?? null,
    calories: entry.calories ?? null,
    recordedAt: recordedAtMs(entry),
    synced: true,
  }
}

export function mergeFeedbackEntries(local, remote) {
  const byKey = new Map()
  for (const entry of local || []) {
    if (entry?.key) byKey.set(entry.key, { ...entry })
  }
  for (const raw of remote || []) {
    const entry = raw?.synced === true || raw?.key ? normalizeRemoteEntry(raw) || raw : raw
    if (!entry?.key) continue
    const existing = byKey.get(entry.key)
    if (!existing) {
      byKey.set(entry.key, { ...entry, synced: true })
      continue
    }
    const remoteAt = recordedAtMs(entry)
    const localAt = recordedAtMs(existing)
    if (remoteAt > localAt) {
      byKey.set(entry.key, { ...entry, synced: true })
    } else if (remoteAt === localAt) {
      byKey.set(entry.key, {
        ...existing,
        repeat: existing.repeat || entry.repeat || null,
        feedback: existing.feedback || entry.feedback || null,
        synced: existing.synced !== false,
      })
    }
  }
  return [...byKey.values()]
}

export function applyRemoteFeedback(entries) {
  const merged = mergeFeedbackEntries(readAll(), entries || [])
  writeAll(merged)
  return merged
}

export async function pullMealFeedback(apiBase, accessToken) {
  if (!apiBase || !accessToken) return { ok: false, reason: 'no_auth' }
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/meal-feedback`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return { ok: false, reason: 'api_error', status: res.status }
    const data = await res.json()
    const pulled = Array.isArray(data?.entries) ? data.entries : []
    applyRemoteFeedback(pulled)
    return { ok: true, pulled: pulled.length }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function syncMealFeedback(apiBase, accessToken) {
  if (!apiBase || !accessToken) return { ok: false, reason: 'no_auth' }
  const pending = listUnsyncedFeedback()
  if (!pending.length) return { ok: true, synced: 0 }
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, '')}/meal-feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ entries: pending }),
    })
    if (!res.ok) return { ok: false, reason: 'api_error', status: res.status }
    markFeedbackSynced(pending.map((e) => e.key))
    return { ok: true, synced: pending.length }
  } catch {
    return { ok: false, reason: 'network' }
  }
}

export async function hydrateMealFeedback(apiBase, accessToken) {
  const pulled = await pullMealFeedback(apiBase, accessToken)
  const pushed = await syncMealFeedback(apiBase, accessToken)
  return {
    ok: pulled.ok || pushed.ok,
    pulled: pulled.pulled || 0,
    synced: pushed.synced || 0,
  }
}

export function feedbackSummary() {
  const entries = readAll()
  const counts = {}
  for (const opt of FEEDBACK_OPTIONS) counts[opt.id] = 0
  for (const e of entries) {
    const id = normalizeFeedbackId(e.feedback)
    if (id && counts[id] != null) counts[id] += 1
  }
  return { total: entries.length, counts }
}

export function repeatSummary() {
  const entries = readAll()
  const counts = { would_repeat: 0, no_repeat: 0 }
  let withRepeat = 0
  for (const e of entries) {
    const id = normalizeRepeatId(e.repeat)
    if (!id) continue
    counts[id] += 1
    withRepeat += 1
  }
  const repeatRate = withRepeat > 0 ? counts.would_repeat / withRepeat : null
  return { total: withRepeat, counts, repeatRate }
}

export function listAllFeedback() {
  return readAll()
}

export function clearMealFeedback() {
  try {
    localStorage.removeItem(FEEDBACK_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

const RECENT_FEEDBACK_MS = 90 * 24 * 60 * 60 * 1000

/**
 * Summarise recent feedback for the matching engine's weight and appeal
 * adjustments. Returns null when there is nothing recent to learn from.
 */
export function buildOutcomeContext() {
  const entries = readAll().filter(
    (e) => e.recordedAt && Date.now() - Number(e.recordedAt) < RECENT_FEEDBACK_MS,
  )
  if (!entries.length) return null

  const counts = { liked: 0, disliked: 0, too_spicy: 0, too_bland: 0 }
  const likedTitles = []
  const penalizedTitles = []

  for (const entry of entries) {
    const id = normalizeFeedbackId(entry.feedback)
    if (id && counts[id] != null) counts[id] += 1
    const title = String(entry.recipeTitle || '').trim().toLowerCase()
    if (!title) continue
    if (id === 'liked') likedTitles.push({ title })
    if (id === 'disliked' || id === 'too_spicy' || id === 'too_bland') {
      penalizedTitles.push({ title, feedback: id })
    }
  }

  const negative = counts.disliked + counts.too_spicy + counts.too_bland
  const positive = counts.liked
  let weights = null

  if (positive >= 3 && negative <= 1) {
    // User has clear tastes — lean on appeal (what they've liked).
    weights = { preferenceFit: 30, practical: 25, variety: 15, appeal: 30 }
  } else if (negative >= 2) {
    // User has been unhappy — lean on preference fit and avoid repeats.
    weights = { preferenceFit: 38, practical: 30, variety: 22, appeal: 10 }
  }

  return {
    active: Boolean(weights || likedTitles.length || penalizedTitles.length),
    counts,
    likedTitles,
    penalizedTitles,
    weights,
    preferAppeal: positive >= 3 && negative <= 1,
  }
}

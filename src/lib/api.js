const API = import.meta.env.VITE_API_URL || ''

export { API }

/** Strip trailing slash so every caller can safely do `${base}/path`. */
function baseUrl(api) {
  return (api || '').replace(/\/$/, '')
}

async function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out. Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function parseJsonOrThrow(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    console.error(`Server returned non-JSON (status ${res.status}):`, text.slice(0, 200))
    throw new Error('Unexpected server response. Please try again.')
  }
}

export async function login(api, email, password) {
  const res = await fetchWithTimeout(`${baseUrl(api)}/login`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed')
  return data
}

export async function register(api, email, password) {
  const res = await fetchWithTimeout(`${baseUrl(api)}/register`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || data.message || 'Registration failed')
  return data
}

export async function sendChat(api, token, { user_message, conversation_id, user_id }) {
  const res = await fetchWithTimeout(
    `${baseUrl(api)}/chat`,
    {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ user_message, conversation_id, user_id }),
    },
    30000
  )
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function saveMealPlan(api, token, { user_id, plan_name, servings, recipes }) {
  const res = await fetchWithTimeout(`${baseUrl(api)}/meal-plan`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ user_id, plan_name, servings, recipes }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Save failed')
  return data
}

export async function getShoppingList(api, token, planId) {
  const res = await fetchWithTimeout(`${baseUrl(api)}/shopping-list/${planId}`, {
    headers: authHeaders(token),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

const ALLOWED_RETAILER_ORIGINS = ['https://www.tesco.com', 'https://www.sainsburys.co.uk']

export async function getAffiliateLink(api, token, { retailer, search_query }) {
  const res = await fetchWithTimeout(`${baseUrl(api)}/affiliate-link`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ retailer, search_query }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')

  try {
    const { origin } = new URL(data.url)
    if (!ALLOWED_RETAILER_ORIGINS.includes(origin)) {
      console.error('Unexpected affiliate URL origin:', origin)
      throw new Error('Invalid retailer URL received.')
    }
  } catch (err) {
    if (err.message === 'Invalid retailer URL received.') throw err
    throw new Error('Malformed retailer URL received.')
  }

  return data
}

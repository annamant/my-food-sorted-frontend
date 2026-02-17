const API = import.meta.env.VITE_API_URL || ''

export { API }

export async function parseJsonOrThrow(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw new Error(
      `Server returned non-JSON (status ${res.status}). Ensure backend is running. Response: ${text.slice(0, 200)}`
    )
  }
}

export function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function login(api, email, password) {
  const url = `${api ? api.replace(/\/$/, '') : ''}/login`
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    if (res.status === 404) {
      throw new Error(
        'Login endpoint not found (404). Start your backend on port 3000. If it uses /api/login, add .env with: VITE_API_URL=/api'
      )
    }
    throw new Error(
      `Server returned non-JSON (status ${res.status}). Ensure backend is running. Response: ${text.slice(0, 150)}`
    )
  }
  if (!res.ok) throw new Error(data.error || data.message || 'Authentication failed')
  return data
}

export async function register(api, email, password) {
  const url = `${api ? api.replace(/\/$/, '') : ''}/register`
  const res = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const text = await res.text()
  let data
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    if (res.status === 404) {
      throw new Error(
        'Register endpoint not found (404). Start your backend on port 3000. If it uses /api/register, add a .env file with: VITE_API_URL=/api'
      )
    }
    throw new Error(
      `Server returned non-JSON (status ${res.status}). Ensure backend is running. Response: ${text.slice(0, 150)}`
    )
  }
  if (!res.ok) throw new Error(data.error || data.message || 'Registration failed')
  return data
}

export async function sendChat(api, token, { user_message, conversation_id, user_id }) {
  const res = await fetch(`${api}/chat`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ user_message, conversation_id, user_id }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function saveMealPlan(api, token, { user_id, plan_name, servings, recipes }) {
  const res = await fetch(`${api}/meal-plan`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ user_id, plan_name, servings, recipes }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Save failed')
  return data
}

export async function getShoppingList(api, token, planId) {
  const res = await fetch(`${api}/shopping-list/${planId}`, {
    headers: authHeaders(token),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export async function getAffiliateLink(api, token, { retailer, search_query }) {
  const res = await fetch(`${api}/affiliate-link`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ retailer, search_query }),
  })
  const data = await parseJsonOrThrow(res)
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

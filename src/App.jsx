import { useState } from 'react'

// Use proxy when both run from monorepo (''), or backend URL when standalone
const API = import.meta.env.VITE_API_URL || ''
const USER_ID = 1

async function parseJsonOrThrow(res) {
  const text = await res.text()
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw new Error(`Server returned non-JSON (status ${res.status}). Ensure backend is running on port 3000. Response: ${text.slice(0, 200)}`)
  }
}
const CONV_ID = 'conv-1'

export default function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState(null)
  const [savedPlanId, setSavedPlanId] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)
  const [retailer, setRetailer] = useState('tesco')

  async function sendMessage() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_message: text,
          conversation_id: CONV_ID,
          user_id: USER_ID,
        }),
      })
      const data = await parseJsonOrThrow(res)
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: data.message },
      ])
      if (data.meal_plan) setMealPlan(data.meal_plan)
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: `Error: ${err.message}` },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function savePlan() {
    if (!mealPlan || !mealPlan.recipes?.length) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/meal-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: USER_ID,
          plan_name: mealPlan.plan_name || 'My Plan',
          servings: mealPlan.servings || 2,
          recipes: mealPlan.recipes,
        }),
      })
      const data = await parseJsonOrThrow(res)
      if (!res.ok) throw new Error(data.error || 'Save failed')
      setSavedPlanId(data.meal_plan_id)
      alert(`Plan saved (ID: ${data.meal_plan_id})`)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function generateShoppingList() {
    const planId = savedPlanId
    if (!planId) {
      alert('Save the meal plan first')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/shopping-list/${planId}`)
      const data = await parseJsonOrThrow(res)
      if (!res.ok) throw new Error(data.error || 'Request failed')
      setShoppingList(data)
    } catch (err) {
      alert(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  async function shopNow() {
    if (!shoppingList?.items?.length) {
      alert('Generate shopping list first')
      return
    }
    const searchQuery = shoppingList.items
      .map((i) => i.ingredient_name)
      .slice(0, 10)
      .join(' ')
    try {
      const res = await fetch(`${API}/affiliate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ retailer, search_query: searchQuery }),
      })
      const data = await parseJsonOrThrow(res)
      if (!res.ok) throw new Error(data.error || 'Request failed')
      window.open(data.url, '_blank')
    } catch (err) {
      alert(`Error: ${err.message}`)
    }
  }

  const byCategory = shoppingList?.items?.reduce((acc, item) => {
    const c = item.category || 'Other'
    if (!acc[c]) acc[c] = []
    acc[c].push(item)
    return acc
  }, {})

  return (
    <div style={{ padding: 16, maxWidth: 800, margin: '0 auto' }}>
      <h1>My Food SORTED</h1>

      <div>
        <h2>Chat</h2>
        <div style={{ border: '1px solid #ccc', padding: 8, minHeight: 200 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <strong>{m.role}:</strong> {m.content}
            </div>
          ))}
          {loading && <div>...</div>}
        </div>
        <div style={{ marginTop: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message"
            style={{ width: 300, padding: 4 }}
          />
          <button onClick={sendMessage} disabled={loading} style={{ marginLeft: 8 }}>
            Send
          </button>
        </div>
      </div>

      {mealPlan?.recipes?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2>Meal Plan: {mealPlan.plan_name || 'Untitled'}</h2>
          <div>
            {mealPlan.recipes.map((r, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid #ccc',
                  padding: 12,
                  marginBottom: 8,
                }}
              >
                <strong>{r.day_of_week} – {r.meal_slot}: {r.title}</strong>
                <div>£{r.estimated_cost?.toFixed(2)} | {r.prep_time}min prep, {r.cook_time}min cook</div>
                <div>{r.instructions}</div>
                <div>
                  Ingredients: {(r.ingredients || []).map((ing, j) => (
                    <span key={j}>
                      {ing.ingredient_name} ({ing.quantity} {ing.unit}){j < (r.ingredients?.length ?? 0) - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={savePlan} disabled={loading}>
            Save Plan
          </button>
        </div>
      )}

      {savedPlanId && (
        <div style={{ marginTop: 24 }}>
          <h2>Shopping List</h2>
          <button onClick={generateShoppingList} disabled={loading}>
            Generate Shopping List
          </button>
        </div>
      )}

      {shoppingList && (
        <div style={{ marginTop: 24 }}>
          <h2>Shopping List (Total: £{shoppingList.total_cost?.toFixed(2)})</h2>
          {byCategory && Object.entries(byCategory).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: 16 }}>
              <h3>{cat}</h3>
              <ul>
                {items.map((item, i) => (
                  <li key={i}>
                    {item.ingredient_name} – {item.quantity} {item.unit || ''} (£{item.estimated_price?.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <h3>Supermarket</h3>
            <button
              onClick={() => setRetailer('tesco')}
              style={{ marginRight: 8, fontWeight: retailer === 'tesco' ? 'bold' : 'normal' }}
            >
              Tesco
            </button>
            <button
              onClick={() => setRetailer('sainsburys')}
              style={{ marginRight: 8, fontWeight: retailer === 'sainsburys' ? 'bold' : 'normal' }}
            >
              Sainsbury's
            </button>
            <button onClick={shopNow}>Shop Now</button>
          </div>
        </div>
      )}
    </div>
  )
}

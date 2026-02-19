import { useState, useCallback } from 'react'
import { ToastProvider } from './context/ToastContext'
import ChatInterface from './components/ChatInterface'
import MealPlanDisplay from './components/MealPlanDisplay'
import ShoppingListDisplay from './components/ShoppingListDisplay'
import LandingPage from './components/LandingPage'
import './App.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

/** Parse JSON from response; on failure return {} and set a friendly error message. */
async function parseRes(res, fallbackError = 'Request failed') {
  const text = await res.text()
  let data = {}
  try {
    data = text ? JSON.parse(text) : {}
  } catch {
    if (res.status === 404) return { data: {}, error: 'Server not found. Is the backend running?' }
    if (res.status >= 500) return { data: {}, error: 'Server error. Please try again later.' }
    return { data: {}, error: fallbackError }
  }
  return { data, error: null }
}

/** Get a single string from common API error shapes: detail (string or array), message, error. */
function getErrorMsg(data, fallback = 'Something went wrong') {
  if (!data) return fallback
  const d = data.detail
  if (typeof d === 'string') return d
  if (Array.isArray(d) && d.length) return d[0]?.msg ?? d[0]?.message ?? String(d[0]) ?? fallback
  return data.message ?? data.error ?? fallback
}

function AppContent() {
  /* ── Auth ── */
  const [token,         setToken]         = useState(() => localStorage.getItem('token') ?? '')
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem('userId') ?? '')
  const [authEmail,     setAuthEmail]     = useState('')
  const [authPassword,  setAuthPassword]  = useState('')

  /* ── Chat ── */
  const [messages,     setMessages]     = useState([])
  const [input,        setInput]        = useState('')
  const [chatLoading,  setChatLoading]  = useState(false)

  /* ── Meal plan ── */
  const [mealPlan,     setMealPlan]     = useState(null)
  const [savedPlanId,  setSavedPlanId]  = useState(null)
  const [planLoading,  setPlanLoading]  = useState(false)

  /* ── Shopping list ── */
  const [shoppingList,  setShoppingList]  = useState(null)
  const [retailer,      setRetailer]      = useState('tesco')
  const [shopLoading,   setShopLoading]   = useState(false)

  const loading = chatLoading || planLoading || shopLoading

  /* ── Auth handler ── */
  const handleAuth = useCallback(async (endpoint, email, password) => {
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach server. Is the backend running?')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Authentication failed'))

      const accessToken = data.access_token ?? data.token
      const userId = data.user_id ?? data.userId
      if (!accessToken || userId == null) throw new Error('Invalid response from server')

      localStorage.setItem('token', accessToken)
      localStorage.setItem('userId', String(userId))
      setToken(accessToken)
      setLoggedInUserId(String(userId))
      setAuthEmail('')
      setAuthPassword('')
    } catch (err) {
      alert(err.message)
    }
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken('')
    setLoggedInUserId('')
    setMessages([])
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
  }, [])

  /* ── Chat ── */
  const sendMessage = useCallback(async () => {
    const text = input.trim()
    if (!text || chatLoading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setChatLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, conversation_history: messages }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Chat error'))

      const content = data.response ?? data.message ?? data.content ?? 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content }])
      if (data.meal_plan) setMealPlan(data.meal_plan)
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setChatLoading(false)
    }
  }, [input, chatLoading, token, messages])

  /* ── Save plan ── */
  const savePlan = useCallback(async () => {
    if (!mealPlan || planLoading) return
    setPlanLoading(true)
    try {
      const res = await fetch(`${API}/meal-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(mealPlan),
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Save failed'))
      const planId = data.id ?? data.meal_plan_id
      if (planId == null) throw new Error('No plan ID in response')
      setSavedPlanId(planId)
      alert(`Plan saved! ID: ${planId}`)
    } catch (err) {
      alert(err.message)
    } finally {
      setPlanLoading(false)
    }
  }, [mealPlan, planLoading, token])

  /* ── Shopping list ── */
  const generateShoppingList = useCallback(async () => {
    if (!savedPlanId || shopLoading) return
    setShopLoading(true)
    try {
      const res = await fetch(`${API}/shopping-lists/generate/${savedPlanId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Generate failed'))
      setShoppingList(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setShopLoading(false)
    }
  }, [savedPlanId, shopLoading, token])

  const shopNow = useCallback(async () => {
    if (!shoppingList || shopLoading) return
    setShopLoading(true)
    try {
      const listId = shoppingList.id ?? savedPlanId
      const res = await fetch(`${API}/shopping-lists/${listId}/shop?retailer=${retailer}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Shop failed'))
      const url = data.shopping_url ?? data.url
      if (url) window.open(url, '_blank', 'noopener,noreferrer')
    } catch (err) {
      alert(err.message)
    } finally {
      setShopLoading(false)
    }
  }, [shoppingList, savedPlanId, shopLoading, retailer, token])

  /* ── Render ── */
  if (!token) {
    return (
      <LandingPage
        loading={loading}
        handleAuth={handleAuth}
      />
    )
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__headerInner">
          <div className="app__logo">
            <span className="app__logoTop">my food.</span>
            <span className="app__logoBottom">SORTED.</span>
          </div>
          <div className="app__headerRight">
            <span className="app__userId">#{loggedInUserId}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn--ghost app__logoutBtn"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="app__main">
        <section className="app__chat">
          <ChatInterface
            messages={messages}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loading={chatLoading}
          />
        </section>

        {mealPlan && (
          <section className="app__panel">
            <MealPlanDisplay
              mealPlan={mealPlan}
              savePlan={savePlan}
              loading={planLoading}
            />
          </section>
        )}

        {savedPlanId && (
          <section className="app__panel">
            <ShoppingListDisplay
              shoppingList={shoppingList}
              savedPlanId={savedPlanId}
              generateShoppingList={generateShoppingList}
              shopNow={shopNow}
              retailer={retailer}
              setRetailer={setRetailer}
              loading={shopLoading}
            />
          </section>
        )}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

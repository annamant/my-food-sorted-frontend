import { useState, useEffect, useCallback } from 'react'
import { ToastProvider, useToast } from './context/ToastContext'
import {
  API,
  login,
  register,
  sendChat,
  saveMealPlan,
  getShoppingList,
  getAffiliateLink,
} from './lib/api'
import AuthForm from './components/AuthForm'
import ChatInterface from './components/ChatInterface'
import MealPlanDisplay from './components/MealPlanDisplay'
import ShoppingListDisplay from './components/ShoppingListDisplay'
import './App.css'

const CONV_ID = 'conv-1'

function makeMessage(role, content) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    content,
  }
}

/** Try to extract a meal plan from backend message (e.g. JSON in code block or raw JSON). */
function parseMealPlanFromMessage(message) {
  if (!message || typeof message !== 'string') return null
  const trimmed = message.trim()
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  const jsonStr = codeBlockMatch
    ? codeBlockMatch[1].trim()
    : trimmed.startsWith('{')
      ? trimmed
      : null
  if (!jsonStr) return null
  try {
    const parsed = JSON.parse(jsonStr)
    if (parsed?.recipes?.length) return parsed
    return null
  } catch {
    return null
  }
}

function AppContent() {
  const { addToast } = useToast()
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loggedInUserId, setLoggedInUserId] = useState(() => {
    const id = localStorage.getItem('userId')
    return id ? parseInt(id, 10) : null
  })
  const [email, setEmail] = useState(() => localStorage.getItem('userEmail') || '')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mealPlan, setMealPlan] = useState(null)
  const [savedPlanId, setSavedPlanId] = useState(null)
  const [shoppingList, setShoppingList] = useState(null)
  const [retailer, setRetailer] = useState('tesco')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('userId', String(loggedInUserId ?? ''))
      if (email) localStorage.setItem('userEmail', email)
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userEmail')
    }
  }, [token, loggedInUserId, email])

  const handleAuth = useCallback(
    async (endpoint, authEmail, authPassword) => {
      setLoading(true)
      try {
        const fn = endpoint === 'login' ? login : register
        const data = await fn(API, authEmail, authPassword)
        setToken(data.token)
        setLoggedInUserId(data.userId)
        setEmail(data.email ?? authEmail)
        setMessages([])
        setMealPlan(null)
        setSavedPlanId(null)
        setShoppingList(null)
        addToast(data.message || (endpoint === 'login' ? 'Logged in.' : 'Registered.'), 'success')
      } catch (err) {
        addToast(err.message || 'Authentication failed', 'error')
      } finally {
        setLoading(false)
      }
    },
    [addToast]
  )

  const handleLogout = useCallback(() => {
    setToken(null)
    setLoggedInUserId(null)
    setEmail('')
    setMessages([])
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    addToast('Logged out successfully', 'success')
  }, [addToast])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading || !token) return
    const text = input.trim()
    setInput('')
    setMessages((m) => [...m, makeMessage('user', text)])
    setLoading(true)
    try {
      const data = await sendChat(API, token, {
        user_message: text,
        conversation_id: CONV_ID,
        user_id: loggedInUserId,
      })
      // Backend sends full response in data.message and parsed JSON in data.meal_plan.
      // Show only the part of the message before the JSON block in chat.
      let chatResponse = (data.message || '').trim()
      if (data.meal_plan) {
        setMealPlan(data.meal_plan)
        const jsonStartIndex = chatResponse.indexOf('```json')
        if (jsonStartIndex !== -1) {
          chatResponse = chatResponse.substring(0, jsonStartIndex).trim()
        }
        if (!chatResponse) {
          chatResponse = 'Here is the meal plan you requested:'
        }
      } else {
        const planFromMessage = parseMealPlanFromMessage(data.message)
        if (planFromMessage) {
          setMealPlan(planFromMessage)
          const jsonStartIndex = chatResponse.indexOf('```json')
          if (jsonStartIndex !== -1) {
            chatResponse = chatResponse.substring(0, jsonStartIndex).trim()
          }
          if (!chatResponse) chatResponse = 'Here is the meal plan you requested:'
        }
      }
      setMessages((m) => [...m, makeMessage('assistant', chatResponse || "I couldn't generate a meal plan. Try asking again with more detail.")])
    } catch (err) {
      setMessages((m) => [...m, makeMessage('assistant', `Error: ${err.message}`)])
    } finally {
      setLoading(false)
    }
  }, [input, loading, token, loggedInUserId])

  const savePlan = useCallback(async () => {
    if (!mealPlan?.recipes?.length || !token) return
    setLoading(true)
    try {
      const data = await saveMealPlan(API, token, {
        user_id: loggedInUserId,
        plan_name: mealPlan.plan_name || 'My Plan',
        servings: mealPlan.servings || 2,
        recipes: mealPlan.recipes,
      })
      const planId = data.meal_plan_id ?? data.id
      setSavedPlanId(planId)
      addToast(`Plan saved (ID: ${planId})`, 'success')
    } catch (err) {
      addToast(err.message || 'Save failed', 'error')
    } finally {
      setLoading(false)
    }
  }, [mealPlan, token, loggedInUserId, addToast])

  const generateShoppingList = useCallback(async () => {
    if (!savedPlanId || !token) {
      addToast('Save the meal plan first', 'error')
      return
    }
    setLoading(true)
    try {
      const data = await getShoppingList(API, token, savedPlanId)
      setShoppingList(data)
      addToast('Shopping list generated', 'success')
    } catch (err) {
      addToast(err.message || 'Request failed', 'error')
    } finally {
      setLoading(false)
    }
  }, [savedPlanId, token, addToast])

  const shopNow = useCallback(async () => {
    if (!shoppingList?.items?.length || !token) {
      addToast('Generate shopping list first', 'error')
      return
    }
    const searchQuery = shoppingList.items
      .map((i) => i.ingredient_name)
      .slice(0, 10)
      .join(' ')
    try {
      const data = await getAffiliateLink(API, token, {
        retailer,
        search_query: searchQuery,
      })
      window.open(data.url, '_blank')
    } catch (err) {
      addToast(err.message || 'Request failed', 'error')
    }
  }, [shoppingList, token, retailer, addToast])

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">My Food SORTED</h1>
      </header>

      <main className="app__main">
        <AuthForm
          API={API}
          loading={loading}
          handleAuth={handleAuth}
          handleLogout={handleLogout}
          loggedInUserId={loggedInUserId}
          email={email}
        />
        {token && (
          <>
            <ChatInterface
              messages={messages}
              input={input}
              setInput={setInput}
              sendMessage={sendMessage}
              loading={loading}
            />
            {mealPlan?.recipes?.length > 0 && (
              <MealPlanDisplay mealPlan={mealPlan} savePlan={savePlan} loading={loading} />
            )}

            {savedPlanId && (
              <ShoppingListDisplay
                shoppingList={shoppingList}
                savedPlanId={savedPlanId}
                generateShoppingList={generateShoppingList}
                shopNow={shopNow}
                retailer={retailer}
                setRetailer={setRetailer}
                loading={loading}
              />
            )}
          </>
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

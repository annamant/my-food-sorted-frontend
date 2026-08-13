import { useState, useCallback, useEffect } from 'react'
import { ToastProvider, useToast } from './context/ToastContext'
import ChatInterface from './components/ChatInterface'
import MealPlanDisplay from './components/MealPlanDisplay'
import ShoppingListDisplay from './components/ShoppingListDisplay'
import PlanLibrary from './components/PlanLibrary'
import PrefsPanel from './components/PrefsPanel'
import AccountPanel from './components/AccountPanel'
import MealBriefPanel, { defaultBrief } from './components/MealBriefPanel'
import LandingPage from './components/LandingPage'
import SharedRecipeView from './components/SharedRecipeView'
import './App.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function getShareSlugFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const fromQuery = params.get('share') || params.get('s')
    if (fromQuery) return fromQuery.trim()
    const match = window.location.pathname.match(/^\/share\/([^/]+)\/?$/)
    return match ? decodeURIComponent(match[1]) : ''
  } catch {
    return ''
  }
}

function buildShareUrl(slug) {
  if (!slug) return ''
  const url = new URL(window.location.origin)
  url.searchParams.set('share', slug)
  return url.toString()
}

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
  const { addToast } = useToast()

  /* ── Public share view ── */
  const [shareSlug, setShareSlug] = useState(() => getShareSlugFromUrl())

  /* ── Auth ── */
  const [token,          setToken]          = useState(() => localStorage.getItem('token') ?? '')
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem('userId') ?? '')

  /* ── Chat ── */
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [chatLoading,   setChatLoading]   = useState(false)
  const [conversationId]                  = useState(() => crypto.randomUUID())

  /* ── Meal plan ── */
  const [mealPlan,    setMealPlan]    = useState(null)
  const [savedPlanId, setSavedPlanId] = useState(null)
  const [planLoading, setPlanLoading] = useState(false)
  const [savedPlans,  setSavedPlans]  = useState([])
  const [libraryLoading, setLibraryLoading] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const [activeShareMeta, setActiveShareMeta] = useState({ is_public: false, share_slug: null })

  /* ── Prefs ── */
  const [prefs, setPrefs] = useState(null)
  const [prefsLoading, setPrefsLoading] = useState(false)
  const [mealBrief, setMealBrief] = useState(() => ({ ...defaultBrief }))

  /* ── Shopping list ── */
  const [shoppingList, setShoppingList] = useState(null)
  const [shopLoading,  setShopLoading]  = useState(false)

  const loading = chatLoading || planLoading || shopLoading || prefsLoading || libraryLoading

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const closeSharedView = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('share')
    url.searchParams.delete('s')
    if (url.pathname.startsWith('/share/')) url.pathname = '/'
    window.history.replaceState({}, '', url.pathname + url.search)
    setShareSlug('')
  }, [])

  const loadPrefs = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const { data, error } = await parseRes(res, 'Cannot load preferences.')
      if (error || !res.ok) return
      setPrefs(data)
    } catch {
      // non-blocking
    }
  }, [token])

  const loadSavedPlans = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API}/meal-plans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      const { data, error } = await parseRes(res, 'Cannot load plans.')
      if (error || !res.ok) return
      setSavedPlans(data.plans ?? [])
    } catch {
      // non-blocking
    }
  }, [token])

  useEffect(() => {
    if (!token) return
    loadPrefs()
    loadSavedPlans()
  }, [token, loadPrefs, loadSavedPlans])

  useEffect(() => {
    if (prefs?.household_size && mealBrief.servings === defaultBrief.servings) {
      setMealBrief((prev) => ({ ...prev, servings: prefs.household_size }))
    }
  }, [prefs]) // eslint-disable-line react-hooks/exhaustive-deps

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
      loadPrefs(accessToken)
      loadSavedPlans(accessToken)
    } catch (err) {
      alert(err.message)
    }
  }, [loadPrefs, loadSavedPlans])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken('')
    setLoggedInUserId('')
    setMessages([])
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setSavedPlans([])
    setPrefs(null)
  }, [])

  const savePrefs = useCallback(async (nextPrefs) => {
    setPrefsLoading(true)
    try {
      const res = await fetch(`${API}/me`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(nextPrefs),
      })
      const { data, error } = await parseRes(res, 'Cannot save preferences.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Save failed'))
      setPrefs(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setPrefsLoading(false)
    }
  }, [authHeaders])

  /* ── Chat ── */
  const sendMessageText = useCallback(async (rawText) => {
    const text = String(rawText || '').trim()
    if (!text || chatLoading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setChatLoading(true)

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          user_message: text,
          conversation_id: conversationId,
          meal_brief: mealBrief,
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Chat error'))

      const content = data.message ?? data.response ?? data.content ?? 'No response.'
      setMessages(prev => [...prev, { role: 'assistant', content }])
      if (data.meal_plan) {
        setMealPlan(data.meal_plan)
        setSavedPlanId(null)
        setShoppingList(null)
        setActiveShareMeta({ is_public: false, share_slug: null })
      }
      loadPrefs()
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setChatLoading(false)
    }
  }, [chatLoading, authHeaders, conversationId, mealBrief, loadPrefs])

  const sendMessage = useCallback(() => sendMessageText(input), [sendMessageText, input])

  const handleRemix = useCallback((prompt) => {
    sendMessageText(prompt)
  }, [sendMessageText])

  /* ── Save plan ── */
  const savePlan = useCallback(async () => {
    if (!mealPlan || planLoading) return
    setPlanLoading(true)
    try {
      const res = await fetch(`${API}/meal-plan`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(mealPlan),
      })
      const { data, error } = await parseRes(res, 'Cannot reach server.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Save failed'))
      const planId = data.id ?? data.meal_plan_id
      if (planId == null) throw new Error('No plan ID in response')
      setSavedPlanId(planId)
      setActiveShareMeta({ is_public: false, share_slug: null })
      addToast('Added to your library', 'success')
      await loadSavedPlans()
    } catch (err) {
      alert(err.message)
    } finally {
      setPlanLoading(false)
    }
  }, [mealPlan, planLoading, authHeaders, loadSavedPlans, addToast])

  const openPlan = useCallback(async (planId) => {
    if (savedPlanId === planId) {
      setSavedPlanId(null)
      setShoppingList(null)
      setMealPlan(null)
      setActiveShareMeta({ is_public: false, share_slug: null })
      return
    }

    setLibraryLoading(true)
    setSavedPlanId(planId)
    try {
      const res = await fetch(`${API}/meal-plan/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, error } = await parseRes(res, 'Cannot load plan.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Load failed'))

      setMealPlan({
        plan_name: data.plan_name,
        servings: data.servings,
        recipes: data.recipes,
        is_public: data.is_public,
        share_slug: data.share_slug,
      })
      setActiveShareMeta({
        is_public: Boolean(data.is_public),
        share_slug: data.share_slug ?? null,
      })

      const listRes = await fetch(`${API}/shopping-list/${planId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const listParsed = await parseRes(listRes, 'Cannot load shopping list.')
      if (!listParsed.error && listRes.ok) {
        setShoppingList(listParsed.data)
      } else {
        setShoppingList(null)
      }
    } catch (err) {
      setSavedPlanId(null)
      alert(err.message)
    } finally {
      setLibraryLoading(false)
    }
  }, [token, savedPlanId])

  const publishAndCopyShare = useCallback(async (planId) => {
    if (!planId || shareBusy) return
    setShareBusy(true)
    try {
      const res = await fetch(`${API}/meal-plan/${planId}/share`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot create share link.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Share failed'))

      const slug = data.share_slug
      const url = buildShareUrl(slug)
      const caption =
        `Cooked this on my food. SORTED. — remixed for my kitchen.\n${url}`

      try {
        await navigator.clipboard.writeText(caption)
        addToast('Public link copied — paste it on Instagram or send to a friend', 'success')
      } catch {
        addToast(`Shared. Link: ${url}`, 'success')
      }

      setActiveShareMeta({ is_public: true, share_slug: slug })
      setMealPlan((prev) => (prev ? { ...prev, is_public: true, share_slug: slug } : prev))
      await loadSavedPlans()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, authHeaders, addToast, loadSavedPlans])

  const unsharePlan = useCallback(async (planId) => {
    if (!planId || shareBusy) return
    setShareBusy(true)
    try {
      const res = await fetch(`${API}/meal-plan/${planId}/unshare`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot update sharing.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not make private'))

      setActiveShareMeta((prev) => ({ ...prev, is_public: false }))
      setMealPlan((prev) => (prev ? { ...prev, is_public: false } : prev))
      addToast('Recipe is private again', 'success')
      await loadSavedPlans()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, authHeaders, addToast, loadSavedPlans])

  const changePassword = useCallback(async ({ current_password, new_password }) => {
    const res = await fetch(`${API}/me/password`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ current_password, new_password }),
    })
    const { data, error } = await parseRes(res, 'Cannot update password.')
    if (error) throw new Error(error)
    if (!res.ok) throw new Error(getErrorMsg(data, 'Password update failed'))
  }, [authHeaders])

  /* ── Shopping list ── */
  const generateShoppingList = useCallback(async () => {
    if (!savedPlanId || shopLoading) return
    setShopLoading(true)
    try {
      const res = await fetch(`${API}/shopping-list/${savedPlanId}/generate`, {
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

  const toggleShoppingItem = useCallback(async (item) => {
    if (item?.id == null) return
    const nextChecked = !item.checked
    setShoppingList((prev) => {
      if (!prev?.items) return prev
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i)),
      }
    })
    try {
      const res = await fetch(`${API}/shopping-list/items/${item.id}`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ checked: nextChecked }),
      })
      if (!res.ok) {
        // revert
        setShoppingList((prev) => {
          if (!prev?.items) return prev
          return {
            ...prev,
            items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)),
          }
        })
      }
    } catch {
      setShoppingList((prev) => {
        if (!prev?.items) return prev
        return {
          ...prev,
          items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: item.checked } : i)),
        }
      })
    }
  }, [authHeaders])

  const clearChecks = useCallback(async () => {
    if (!savedPlanId || shopLoading) return
    setShopLoading(true)
    try {
      const res = await fetch(`${API}/shopping-list/${savedPlanId}/clear-checks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, error } = await parseRes(res, 'Cannot clear checks.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Clear failed'))
      setShoppingList(data)
    } catch (err) {
      alert(err.message)
    } finally {
      setShopLoading(false)
    }
  }, [savedPlanId, shopLoading, token])

  /* ── Render ── */
  if (shareSlug) {
    return <SharedRecipeView slug={shareSlug} onClose={closeSharedView} />
  }

  if (!token) {
    return (
      <LandingPage
        loading={loading}
        handleAuth={handleAuth}
      />
    )
  }

  const activePlanFromLibrary = savedPlans.find((p) => p.id === savedPlanId)
  const libraryShareIsPublic = Boolean(
    activeShareMeta.is_public || activePlanFromLibrary?.is_public || mealPlan?.is_public
  )

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__headerInner">
          <div className="app__logo">
            <span className="app__logoTop">my food.</span>
            <span className="app__logoBottom">SORTED.</span>
          </div>
          <div className="app__headerRight">
            <a className="app__accountLink" href="#account">
              Account
            </a>
            <span className="app__userId">
              {prefs?.email || `#${loggedInUserId}`}
            </span>
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
        <div className="app__intro">
          <p className="app__introLabel">Your kitchen library</p>
          <h1 className="app__introTitle">Find. Remix. Keep. Share.</h1>
          <p className="app__introBody">
            Get any recipe, twist it for budget and wellbeing, save it to your collection,
            then share a public link — like Spotify, for the stove.
          </p>
        </div>

        <section className="app__panel app__panel--library">
          <PlanLibrary
            plans={savedPlans}
            activePlanId={savedPlanId}
            onSelect={openPlan}
            loading={libraryLoading}
            expandedPlan={
              savedPlanId != null && mealPlan
                ? {
                    ...mealPlan,
                    is_public: libraryShareIsPublic,
                    share_slug:
                      activeShareMeta.share_slug ||
                      activePlanFromLibrary?.share_slug ||
                      mealPlan.share_slug,
                  }
                : null
            }
            expandedLoading={libraryLoading}
            onRemix={handleRemix}
            onShare={publishAndCopyShare}
            onUnshare={unsharePlan}
            shareBusy={shareBusy}
            shareUrlFor={(plan) =>
              buildShareUrl(
                plan.share_slug || activeShareMeta.share_slug || mealPlan?.share_slug
              )
            }
          />
        </section>

        <section className="app__panel">
          <MealBriefPanel
            brief={mealBrief}
            onChange={setMealBrief}
            prefs={prefs}
          />
        </section>

        <section className="app__chat">
          <ChatInterface
            messages={messages}
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            loading={chatLoading}
            onQuickPrompt={sendMessageText}
          />
        </section>

        {mealPlan && savedPlanId == null && (
          <section className="app__panel">
            <MealPlanDisplay
              mealPlan={mealPlan}
              savePlan={savePlan}
              loading={planLoading || chatLoading}
              alreadySaved={false}
              onRemix={handleRemix}
            />
          </section>
        )}

        {savedPlanId && (
          <section className="app__panel app__panel--muted">
            <ShoppingListDisplay
              shoppingList={shoppingList}
              generateShoppingList={generateShoppingList}
              loading={shopLoading}
              onToggleItem={toggleShoppingItem}
              onClearChecks={clearChecks}
            />
          </section>
        )}

        <section className="app__panel">
          <AccountPanel
            prefs={prefs}
            onChangePassword={changePassword}
            loading={prefsLoading}
            onLogout={handleLogout}
          />
        </section>

        <section className="app__panel app__panel--muted">
          <PrefsPanel
            prefs={prefs}
            onSave={savePrefs}
            loading={prefsLoading}
          />
        </section>
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

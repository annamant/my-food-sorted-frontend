import { useState, useCallback, useEffect, useRef } from 'react'
import { ToastProvider, useToast } from './context/ToastContext'
import ChatInterface from './components/ChatInterface'
import MealPlanDisplay from './components/MealPlanDisplay'
import ShoppingListDisplay from './components/ShoppingListDisplay'
import PlanLibrary from './components/PlanLibrary'
import { defaultBrief, formatBriefForChat } from './components/MealBriefPanel'
import LandingPage from './components/LandingPage'
import SharedRecipeView from './components/SharedRecipeView'
import AccountPage from './components/AccountPage'
import KitchenHome from './components/KitchenHome'
import { INSPIRATION_FILTERS } from './data/inspirations'
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

  /* ── Navigation ── */
  const [view, setView] = useState('tonight') // 'tonight' | 'library' | 'account'
  const recipeRef = useRef(null)
  const pendingCoverRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  /* ── Auth ── */
  const [token,          setToken]          = useState(() => localStorage.getItem('token') ?? '')
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem('userId') ?? '')
  const [landingAuthMode, setLandingAuthMode] = useState('register')

  /* ── Chat ── */
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [chatLoading,   setChatLoading]   = useState(false)
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())

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
  const [cookMode, setCookMode] = useState('search') // 'search' | 'create'
  const [pendingInspiration, setPendingInspiration] = useState(null)

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

  const applyInspiration = useCallback((collection) => {
    if (!collection) return
    pendingCoverRef.current = collection.image || null
    const extras = INSPIRATION_FILTERS[collection.id]
    if (extras) {
      setMealBrief((prev) => {
        const next = { ...prev }
        if (extras.cuisines) {
          next.cuisines = [...new Set([...(prev.cuisines || []), ...extras.cuisines])]
        }
        if (extras.proteins) {
          next.proteins = [...new Set([...(prev.proteins || []), ...extras.proteins])]
        }
        if (extras.budget_per_day != null) next.budget_per_day = extras.budget_per_day
        if (extras.notes) {
          next.notes = prev.notes?.includes(extras.notes)
            ? prev.notes
            : [prev.notes, extras.notes].filter(Boolean).join(', ')
        }
        return next
      })
    }
    setCookMode('search')
    setInput(collection.label || collection.title)
    setView('tonight')
  }, [])

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
      if (pendingInspiration) {
        applyInspiration(pendingInspiration)
        setPendingInspiration(null)
      }
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [loadPrefs, loadSavedPlans, addToast, pendingInspiration, applyInspiration])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken('')
    setLoggedInUserId('')
    setMessages([])
    setInput('')
    setConversationId(crypto.randomUUID())
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setSavedPlans([])
    setPrefs(null)
    setView('tonight')
    setLandingAuthMode('login')
    setPendingInspiration(null)
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
      addToast(err.message, 'error')
    } finally {
      setPrefsLoading(false)
    }
  }, [authHeaders, addToast])

  /* ── Chat ── */
  const sendMessageText = useCallback(async (rawText, displayText, intent = 'search') => {
    const text = String(rawText || '').trim()
    if (!text || chatLoading) return

    const briefBlock = formatBriefForChat(mealBrief)
    const userMessage = briefBlock
      ? `${text}\n\n${briefBlock}\n\nDo not ask questions. Cook now. Obey the constraints above.`
      : `${text}\n\nDo not ask questions. Cook now.`

    const shown = String(displayText || text).trim()
    const userMsg = { role: 'user', content: shown }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setChatLoading(true)
    setView('tonight')

    requestAnimationFrame(() => {
      recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          user_message: userMessage,
          conversation_id: conversationId,
          meal_brief: mealBrief,
          intent,
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach the kitchen right now.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not cook that just now'))

      const content = data.message ?? data.response ?? data.content ?? ''
      if (content && !data.meal_plan) {
        setMessages(prev => [...prev, { role: 'assistant', content }])
      }
      if (data.meal_plan) {
        const cover = pendingCoverRef.current
        pendingCoverRef.current = null
        const plan = cover
          ? {
              ...data.meal_plan,
              image: data.meal_plan.image || cover,
              recipes: (data.meal_plan.recipes || []).map((r, i) =>
                i === 0 && !r.image ? { ...r, image: cover } : r
              ),
            }
          : data.meal_plan
        setMealPlan(plan)
        setSavedPlanId(null)
        setShoppingList(null)
        setActiveShareMeta({ is_public: false, share_slug: null })
      } else if (!content) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I could not build a recipe from that. Try another dish or mood.' }])
      }
      loadPrefs()
    } catch (err) {
      const friendly = /fetch|network|reach/i.test(err.message)
        ? 'The kitchen could not be reached. Try again in a moment.'
        : err.message
      setMessages(prev => [...prev, { role: 'assistant', content: friendly }])
      addToast(friendly, 'error')
    } finally {
      setChatLoading(false)
    }
  }, [chatLoading, authHeaders, conversationId, mealBrief, loadPrefs, addToast])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text) return
    if (mealPlan) {
      const title = mealPlan.plan_name || mealPlan.recipes?.[0]?.title || 'this dish'
      sendMessageText(
        `Remix “${title}”: ${text}. Deliver a full save-ready recipe. Do not ask questions.`,
        text,
        'tweak',
      )
      return
    }
    sendMessageText(
      `Search for this recipe: ${text}. One recipe, realistic UK cost and calories. Save-ready. Follow my filters. Do not ask questions.`,
      text,
      'search',
    )
  }, [sendMessageText, input, mealPlan])

  const handleCreate = useCallback(() => {
    if (chatLoading) return
    if (!mealBrief?.notes?.trim()) return
    sendMessageText(
      'Create one recipe from my filters and instructions. One strong dish, realistic UK cost and calories. Save-ready. Do not ask questions — cook now.',
      'Create',
      'create',
    )
  }, [chatLoading, sendMessageText, mealBrief])

  const clearChat = useCallback(() => {
    setMessages([])
    setInput('')
    setConversationId(crypto.randomUUID())
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setActiveShareMeta({ is_public: false, share_slug: null })
    setCookMode('search')
    pendingCoverRef.current = null
    addToast('Starting over', 'success')
  }, [addToast])

  const handleRemix = useCallback((prompt, label) => {
    sendMessageText(prompt, label ? `Tweak: ${label}` : 'Tweak this', 'tweak')
  }, [sendMessageText])

  const handleLandingInspiration = useCallback((collection) => {
    setPendingInspiration(collection)
    setLandingAuthMode('register')
  }, [])

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
      addToast(err.message, 'error')
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
      addToast(err.message, 'error')
    } finally {
      setLibraryLoading(false)
    }
  }, [token, savedPlanId, addToast])

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
      addToast(err.message, 'error')
    } finally {
      setShopLoading(false)
    }
  }, [savedPlanId, shopLoading, token, addToast])

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
      addToast(err.message, 'error')
    } finally {
      setShopLoading(false)
    }
  }, [savedPlanId, shopLoading, token, addToast])

  /* ── Render ── */
  if (shareSlug) {
    return <SharedRecipeView slug={shareSlug} onClose={closeSharedView} />
  }

  if (!token) {
    return (
      <LandingPage
        loading={loading}
        handleAuth={handleAuth}
        initialAuthMode={landingAuthMode}
        pendingInspiration={pendingInspiration}
        onPickInspiration={handleLandingInspiration}
      />
    )
  }

  const activePlanFromLibrary = savedPlans.find((p) => p.id === savedPlanId)
  const libraryShareIsPublic = Boolean(
    activeShareMeta.is_public || activePlanFromLibrary?.is_public || mealPlan?.is_public
  )

  const accountInitial = (prefs?.email || 'U').trim().charAt(0).toUpperCase()

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__headerInner">
          <button
            type="button"
            className="app__logoBtn"
            onClick={() => setView('tonight')}
            aria-label="What’s for dinner"
          >
            <span className="app__logo">
              <span className="app__logoTop">my food.</span>
              <span className="app__logoBottom">SORTED.</span>
            </span>
          </button>
          <div className="app__headerRight">
            <nav className="app__nav" aria-label="Main">
              <button
                type="button"
                className={`app__navItem ${view === 'tonight' ? 'app__navItem--active' : ''}`}
                onClick={() => setView('tonight')}
              >
                Tonight
              </button>
              <button
                type="button"
                className={`app__navItem ${view === 'library' ? 'app__navItem--active' : ''}`}
                onClick={() => setView('library')}
              >
                Library
              </button>
              <button
                type="button"
                className={`app__avatarBtn ${view === 'account' ? 'app__avatarBtn--active' : ''}`}
                onClick={() => setView('account')}
                aria-label="Open your account"
                title={prefs?.email || 'Account'}
              >
                <span className="app__avatar" aria-hidden="true">{accountInitial}</span>
              </button>
              <button
                type="button"
                className="btn btn--ghost app__logoutBtn"
                onClick={handleLogout}
              >
                Log out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="app__main">
        {view === 'account' ? (
          <AccountPage
            prefs={prefs}
            onChangePassword={changePassword}
            onSavePrefs={savePrefs}
            loading={prefsLoading}
            onLogout={handleLogout}
            onOpenLibrary={() => setView('library')}
          />
        ) : view === 'library' ? (
          <>
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
                onRemix={(prompt, label) => {
                  handleRemix(prompt, label)
                  setView('tonight')
                }}
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
          </>
        ) : (
          <>
            <KitchenHome hideHero={Boolean(mealPlan)}>
              <div ref={recipeRef} className="app__recipe">
                {chatLoading && !mealPlan && (
                  <p className="app__cooking" aria-live="polite">Cooking tonight’s dish…</p>
                )}

                {mealPlan && savedPlanId == null && (
                  <section className="app__panel">
                    <MealPlanDisplay
                      mealPlan={mealPlan}
                      savePlan={savePlan}
                      loading={planLoading || chatLoading}
                      alreadySaved={false}
                    />
                  </section>
                )}

                {mealPlan && savedPlanId != null && view === 'tonight' && (
                  <section className="app__panel">
                    <MealPlanDisplay
                      mealPlan={mealPlan}
                      alreadySaved
                      onShare={() => publishAndCopyShare(savedPlanId)}
                      onUnshare={() => unsharePlan(savedPlanId)}
                      shareBusy={shareBusy}
                      isPublic={libraryShareIsPublic}
                      shareUrl={buildShareUrl(
                        activeShareMeta.share_slug ||
                        activePlanFromLibrary?.share_slug ||
                        mealPlan.share_slug
                      )}
                    />
                  </section>
                )}

                <ChatInterface
                  messages={messages}
                  input={input}
                  setInput={setInput}
                  sendMessage={sendMessage}
                  loading={chatLoading}
                  onClearChat={clearChat}
                  mode={cookMode}
                  onModeChange={setCookMode}
                  hasRecipe={Boolean(mealPlan)}
                  brief={mealBrief}
                  onChangeBrief={setMealBrief}
                  prefs={prefs}
                  onCreate={handleCreate}
                />

                {savedPlanId && mealPlan && (
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
              </div>
            </KitchenHome>
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

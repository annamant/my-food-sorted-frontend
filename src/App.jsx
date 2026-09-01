import { useState, useCallback, useEffect, useRef } from 'react'
import { ToastProvider, useToast } from './context/ToastContext'
import ChatInterface from './components/ChatInterface'
import CompanionChat from './components/CompanionChat'
import MealPlanDisplay from './components/MealPlanDisplay'
import ShoppingListDisplay from './components/ShoppingListDisplay'
import PlanLibrary from './components/PlanLibrary'
import PlaylistPicker from './components/PlaylistPicker'
import { defaultBrief, formatBriefForChat } from './components/MealBriefPanel'
import { applyIntakeAnswer, pathMeta, questionsForPath, suggestInstruction } from './data/cookIntake'
import LandingPage from './components/LandingPage'
import SharedRecipeView from './components/SharedRecipeView'
import AccountPage from './components/AccountPage'
import { INSPIRATION_FILTERS } from './data/inspirations'
import { searchCatalog, dishesForCollection } from './data/catalog'
import { REMIX_ACTIONS } from './components/MealPlanDisplay'
import { hydrateMealFeedback } from './data/mealFeedback'
import { rankCatalogDishes, rankChatOptions, resolveProfileContext } from './algorithms/suitabilityScore'
import './App.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

function getShareFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const list = params.get('list')
    if (list) return { kind: 'list', slug: list.trim() }
    const fromQuery = params.get('share') || params.get('s')
    if (fromQuery) return { kind: 'recipe', slug: fromQuery.trim() }
    const listPath = window.location.pathname.match(/^\/share\/list\/([^/]+)\/?$/)
    if (listPath) return { kind: 'list', slug: decodeURIComponent(listPath[1]) }
    const match = window.location.pathname.match(/^\/share\/([^/]+)\/?$/)
    return match ? { kind: 'recipe', slug: decodeURIComponent(match[1]) } : null
  } catch {
    return null
  }
}

function buildShareUrl(slug, kind = 'recipe') {
  if (!slug) return ''
  const url = new URL(window.location.origin)
  // SEO-friendly share links use path-based routes so they can be routed/rendered
  // for crawlers/bots (instead of query params like ?list=...).
  url.search = ''
  url.hash = ''
  if (kind === 'list') url.pathname = `/share/list/${encodeURIComponent(slug)}`
  else url.pathname = `/share/${encodeURIComponent(slug)}`
  return url.toString()
}

async function shareOut(url, title) {
  const text = `${title}\n${url}`
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url })
      return 'shared'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled'
    }
  }
  await navigator.clipboard.writeText(text)
  return 'copied'
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
  const [shareFrom, setShareFrom] = useState(() => getShareFromUrl())

  /* ── Navigation ── */
  const [view, setView] = useState('tonight') // 'tonight' | 'library' | 'account'
  const recipeRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [view])

  /* ── Auth ── */
  const [token,          setToken]          = useState(() => localStorage.getItem('token') ?? '')
  const [loggedInUserId, setLoggedInUserId] = useState(() => localStorage.getItem('userId') ?? '')
  const [landingAuthMode, setLandingAuthMode] = useState('register')
  const [authLoading, setAuthLoading] = useState(false)

  /* ── Chat ── */
  const [messages,      setMessages]      = useState([])
  const [input,         setInput]         = useState('')
  const [chatLoading,   setChatLoading]   = useState(false)
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())
  const [cookStage, setCookStage] = useState('start')
  const [cookPath, setCookPath] = useState('')
  const [intakeStep, setIntakeStep] = useState(0)
  const [dishOptions, setDishOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState(null)
  // Preserve per-option tweak drafts so users can go back and keep editing.
  const [tweakDraftByOptionTitle, setTweakDraftByOptionTitle] = useState({})

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
  const [cookMode, setCookMode] = useState('search')
  const [pendingInspiration, setPendingInspiration] = useState(null)
  const [catalogHits, setCatalogHits] = useState([])
  const [catalogMiss, setCatalogMiss] = useState('')
  const [activeMood, setActiveMood] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [activePlaylist, setActivePlaylist] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerPlanId, setPickerPlanId] = useState(null)

  /* ── Shopping list ── */
  const [shoppingList, setShoppingList] = useState(null)
  const [shopLoading,  setShopLoading]  = useState(false)

  const loading = chatLoading || planLoading || shopLoading || prefsLoading || libraryLoading || authLoading

  const authHeaders = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }), [token])

  const clearSession = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    setToken('')
    setLoggedInUserId('')
    setMessages([])
    setInput('')
    setConversationId(crypto.randomUUID())
    setCookStage('start')
    setCookPath('')
    setIntakeStep(0)
    setDishOptions([])
    setSelectedOption(null)
    setTweakDraftByOptionTitle({})
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setSavedPlans([])
    setPlaylists([])
    setActivePlaylist(null)
    setPrefs(null)
    setView('tonight')
    setLandingAuthMode('login')
    setPendingInspiration(null)
  }, [])

  const expireSession = useCallback(() => {
    if (!localStorage.getItem('token')) return
    clearSession()
    addToast('Session ended — log in again to open your kitchen.', 'error')
  }, [clearSession, addToast])

  const closeSharedView = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('share')
    url.searchParams.delete('s')
    url.searchParams.delete('list')
    if (url.pathname.startsWith('/share/')) url.pathname = '/'
    window.history.replaceState({}, '', url.pathname + url.search)
    setShareFrom(null)
  }, [])

  const loadPrefs = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) {
        expireSession()
        return
      }
      const { data, error } = await parseRes(res, 'Cannot load preferences.')
      if (error || !res.ok) return
      setPrefs(data)
    } catch {
      // non-blocking
    }
  }, [token, expireSession])

  const loadSavedPlans = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API}/meal-plans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) {
        expireSession()
        return
      }
      const { data, error } = await parseRes(res, 'Cannot load plans.')
      if (error || !res.ok) return
      setSavedPlans(data.plans ?? [])
    } catch {
      // non-blocking
    }
  }, [token, expireSession])

  const loadPlaylists = useCallback(async (accessToken = token) => {
    if (!accessToken) return
    try {
      const res = await fetch(`${API}/playlists`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) {
        expireSession()
        return
      }
      const { data, error } = await parseRes(res, 'Cannot load lists.')
      if (error || !res.ok) return
      setPlaylists(data.playlists ?? [])
    } catch {
      // non-blocking
    }
  }, [token, expireSession])

  useEffect(() => {
    if (!token) return
    loadPrefs()
    loadSavedPlans()
    loadPlaylists()
    hydrateMealFeedback(API, token)
  }, [token, loadPrefs, loadSavedPlans, loadPlaylists])

  useEffect(() => {
    if (prefs?.household_size && mealBrief.servings === defaultBrief.servings) {
      setMealBrief((prev) => ({ ...prev, servings: prefs.household_size }))
    }
  }, [prefs]) // eslint-disable-line react-hooks/exhaustive-deps

  const applyInspiration = useCallback((collection) => {
    if (!collection) return
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
    setAuthLoading(true)
    try {
      const res = await fetch(`${API}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach the kitchen. Try again.')
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
      loadPlaylists(accessToken)
      if (pendingInspiration) {
        applyInspiration(pendingInspiration)
        setCatalogHits(dishesForCollection(pendingInspiration.id))
        setActiveMood(pendingInspiration.id)
        setPendingInspiration(null)
      }
      return { ok: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed'
      addToast(message, 'error')
      return { ok: false, error: message }
    } finally {
      setAuthLoading(false)
    }
  }, [loadPrefs, loadSavedPlans, loadPlaylists, addToast, pendingInspiration, applyInspiration])

  const handleLogout = useCallback(() => {
    clearSession()
  }, [clearSession])

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
        setMealPlan(data.meal_plan)
        setCookStage('recipe')
        setSavedPlanId(null)
        setShoppingList(null)
        setActiveShareMeta({ is_public: false, share_slug: null })
      } else if (!content) {
        setMessages(prev => [...prev, { role: 'assistant', content: 'I could not build a recipe from that. Try another dish or mood.' }])
        if (intent === 'finalize') setCookStage('tweak')
      }
      loadPrefs()
    } catch (err) {
      const friendly = /fetch|network|reach/i.test(err.message)
        ? 'The kitchen could not be reached. Try again in a moment.'
        : err.message
      setMessages(prev => [...prev, { role: 'assistant', content: friendly }])
      if (intent === 'finalize') setCookStage('tweak')
      addToast(friendly, 'error')
    } finally {
      setChatLoading(false)
    }
  }, [chatLoading, authHeaders, conversationId, mealBrief, loadPrefs, addToast])

  const beginCookFlow = useCallback((path) => {
    setCookPath(path)
    setCookStage('describe')
    setIntakeStep(0)
    setDishOptions([])
    setSelectedOption(null)
    setTweakDraftByOptionTitle({})
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setCatalogHits([])
    setCatalogMiss('')
    setInput('')
    setMealBrief({
      ...defaultBrief,
      servings: prefs?.household_size || defaultBrief.servings,
      days: path === 'week' ? 7 : 1,
      meal_slots: ['dinner'],
      avoid: '',
      notes: '',
      mode: path,
    })
    setMessages([{ role: 'assistant', content: pathMeta(path).opener }])
  }, [prefs])

  const requestDishOptions = useCallback(async (briefOverride) => {
    if (chatLoading) return
    const brief = briefOverride ?? mealBrief
    const idea = brief.notes?.trim() || 'I am open to ideas'
    const userMessage = `${suggestInstruction(cookPath)}\nWhat I want: ${idea}\nSuggest three options only. Obey the kitchen brief.`

    setChatLoading(true)
    setCookStage('suggesting')
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          user_message: userMessage,
          conversation_id: conversationId,
          meal_brief: brief,
          intent: 'suggest',
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach the kitchen right now.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not suggest dishes just now'))
      if (!Array.isArray(data.options) || data.options.length === 0) {
        throw new Error('The kitchen did not return any dish options. Please try again.')
      }
      const ranked = rankChatOptions(data.options.slice(0, 3), { prefs, mealBrief })
      setDishOptions(ranked)
      setTweakDraftByOptionTitle({})
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || 'Here are three directions that fit your kitchen.',
        },
      ])
      setCookStage('options')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not suggest dishes just now'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${message} Tell me anything you’d like to change, and I’ll try again.`,
        },
      ])
      setCookStage('ask')
      addToast(message, 'error')
    } finally {
      setChatLoading(false)
    }
  }, [chatLoading, mealBrief, cookPath, authHeaders, conversationId, addToast, prefs])

  const submitCookTurn = useCallback(() => {
    const text = input.trim()
    if (!text || chatLoading) return

    const questions = questionsForPath(cookPath)
    setInput('')

    if (cookStage === 'describe') {
      setMealBrief((prev) => ({ ...prev, notes: text }))
      setIntakeStep(0)
      setCookStage('ask')
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: questions[0].prompt },
      ])
      return
    }

    if (cookStage !== 'ask') return

    if (intakeStep >= questions.length) {
      const nextBrief = applyIntakeAnswer(mealBrief, { field: 'extra' }, text)
      setMealBrief(nextBrief)
      setMessages((prev) => [...prev, { role: 'user', content: text }])
      requestDishOptions(nextBrief)
      return
    }

    const question = questions[intakeStep]
    const nextBrief = applyIntakeAnswer(mealBrief, question, text)
    const nextStep = intakeStep + 1
    setMealBrief(nextBrief)
    setIntakeStep(nextStep)

    if (nextStep < questions.length) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'assistant', content: questions[nextStep].prompt },
      ])
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    requestDishOptions(nextBrief)
  }, [input, chatLoading, cookPath, cookStage, intakeStep, mealBrief, requestDishOptions])

  const chooseDishOption = useCallback((option) => {
    setSelectedOption(option)
    setMessages((prev) => [...prev, { role: 'user', content: `I choose ${option.title}.` }])
    setInput(tweakDraftByOptionTitle?.[option.title] ?? '')
    setCookStage('tweak')
  }, [tweakDraftByOptionTitle])

  const backToDishOptions = useCallback(() => {
    if (chatLoading) return
    const title = selectedOption?.title
    if (title) {
      setTweakDraftByOptionTitle((prev) => ({ ...prev, [title]: input }))
    }
    setSelectedOption(null)
    setInput('')
    setCookStage('options')
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'No problem — pick one of the other options.' },
    ])
  }, [chatLoading, selectedOption, input])

  const rejectDishOptions = useCallback(() => {
    setDishOptions([])
    setSelectedOption(null)
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: 'None of these—let’s keep talking.' },
      { role: 'assistant', content: 'What should I change? Add anything you want me to take into account, and I’ll give you three new options.' },
    ])
    setInput('')
    setCookStage('ask')
    setIntakeStep(questionsForPath(cookPath).length)
  }, [cookPath])

  const finalizeDishOption = useCallback((tweak = '') => {
    if (!selectedOption || chatLoading) return
    const cleanTweak = String(tweak || '').trim()
    const raw = [
      cookPath === 'week'
        ? `Create the complete week plan for this direction: “${selectedOption.title}”.`
        : `Create the complete recipe for the selected dish: “${selectedOption.title}”.`,
      `Selected description: ${selectedOption.description}.`,
      cleanTweak ? `Final requested tweak: ${cleanTweak}.` : 'No further tweaks requested.',
      cookPath === 'week'
        ? 'Write one recipe per requested meal for each day. Keep the week recognisable and obey the complete kitchen brief.'
        : 'Keep the selected dish recognisable and obey the complete kitchen brief.',
    ].join(' ')
    setCookStage('finalizing')
    setInput('')
    sendMessageText(
      raw,
      cleanTweak ? `Tweak: ${cleanTweak}` : `Make ${selectedOption.title}`,
      'finalize',
    )
  }, [selectedOption, chatLoading, sendMessageText, cookPath])

  const openCatalogDish = useCallback((dish) => {
    setMealPlan(dish.mealPlan)
    setCookStage('recipe')
    setSavedPlanId(null)
    setShoppingList(null)
    setCatalogHits([])
    setCatalogMiss('')
    setInput('')
    setView('tonight')
    requestAnimationFrame(() => {
      recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const cookTonight = useCallback(() => {
    const text = input.trim()
    if (!text || chatLoading) return
    const hits = searchCatalog(text)
    setActiveMood(null)
    if (hits.length === 1) {
      openCatalogDish(hits[0])
      return
    }
    if (hits.length > 1) {
      const ranked = rankCatalogDishes(hits, { prefs, mealBrief })
      setCatalogHits(ranked)
      setCatalogMiss('')
      setMealPlan(null)
      return
    }
    setCatalogHits([])
    setCatalogMiss(text)
    setMealPlan(null)
    setMealBrief((prev) => ({
      ...prev,
      notes: prev.notes?.trim() ? prev.notes : text,
    }))
  }, [input, chatLoading, openCatalogDish, prefs, mealBrief])

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
    }
  }, [sendMessageText, input, mealPlan])

  const handleCreate = useCallback(() => {
    if (chatLoading) return
    const wish = mealBrief?.notes?.trim() || catalogMiss
    if (!wish) return
    sendMessageText(
      `Create one recipe for: ${wish}. One strong dish, realistic UK cost and calories. Save-ready. Do not ask questions — cook now.`,
      wish,
      'create',
    )
  }, [chatLoading, sendMessageText, mealBrief, catalogMiss])

  const pickMood = useCallback((collection) => {
    applyInspiration(collection)
    setActiveMood(collection.id)
    const hits = dishesForCollection(collection.id)
    setCatalogHits(hits)
    setCatalogMiss(hits.length ? '' : collection.title)
    setMealPlan(null)
    setInput(collection.title)
  }, [applyInspiration])

  const clearChat = useCallback(() => {
    setMessages([])
    setInput('')
    setConversationId(crypto.randomUUID())
    setCookStage('start')
    setCookPath('')
    setIntakeStep(0)
    setDishOptions([])
    setSelectedOption(null)
    setMealPlan(null)
    setSavedPlanId(null)
    setShoppingList(null)
    setActiveShareMeta({ is_public: false, share_slug: null })
    setCookMode('search')
    setCatalogHits([])
    setCatalogMiss('')
    setActiveMood(null)
    setMealBrief({ ...defaultBrief })
    addToast('Starting over', 'success')
  }, [addToast])

  const handleRemix = useCallback((prompt, label) => {
    sendMessageText(prompt, label ? `Tweak: ${label}` : 'Tweak this', 'tweak')
  }, [sendMessageText])

  const handleLandingInspiration = useCallback((collection) => {
    setPendingInspiration(collection)
    setLandingAuthMode('register')
  }, [])

  const handleLandingQuery = useCallback((query) => {
    const nextQuery = String(query || '').trim()
    if (!nextQuery) return
    setInput(nextQuery)
    setCatalogMiss(nextQuery)
    setMealBrief((prev) => ({
      ...prev,
      notes: prev.notes?.trim() ? prev.notes : nextQuery,
    }))
    setLandingAuthMode('register')
  }, [])

  /* ── Save plan ── */
  const persistRecipe = useCallback(async ({ openPicker = false } = {}) => {
    if (savedPlanId) return savedPlanId
    if (!mealPlan || planLoading) return null
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
      await loadSavedPlans()
      await loadPlaylists()
      if (openPicker) {
        setPickerPlanId(planId)
        setPickerOpen(true)
      }
      const listRes = await fetch(`${API}/shopping-list/${planId}`, {
        headers: authHeaders(),
      })
      const listParsed = await parseRes(listRes, 'Cannot load shopping list.')
      if (!listParsed.error && listRes.ok) setShoppingList(listParsed.data)
      return planId
    } catch (err) {
      addToast(err.message, 'error')
      return null
    } finally {
      setPlanLoading(false)
    }
  }, [savedPlanId, mealPlan, planLoading, authHeaders, loadSavedPlans, loadPlaylists, addToast])

  const savePlan = useCallback(async () => {
    const planId = await persistRecipe({ openPicker: true })
    if (planId) addToast('Recipe saved. Add it to a recipe book, or shop the list below.', 'success')
  }, [persistRecipe, addToast])

  const publishShareLink = useCallback(async (planId) => {
    const res = await fetch(`${API}/meal-plan/${planId}/share`, {
      method: 'POST',
      headers: authHeaders(),
    })
    const { data, error } = await parseRes(res, 'Cannot create share link.')
    if (error) throw new Error(error)
    if (!res.ok) throw new Error(getErrorMsg(data, 'Share failed'))
    const slug = data.share_slug
    const url = buildShareUrl(slug)
    setActiveShareMeta({ is_public: true, share_slug: slug })
    setMealPlan((prev) => (prev ? { ...prev, is_public: true, share_slug: slug } : prev))
    await loadSavedPlans()
    return url
  }, [authHeaders, loadSavedPlans])

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
      const url = await publishShareLink(planId)
      const result = await shareOut(url, 'Cooked this on my food. SORTED.')
      if (result === 'shared') addToast('Shared', 'success')
      else if (result === 'copied') addToast('Link copied — paste it anywhere', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, publishShareLink, addToast])

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

  const openPlaylist = useCallback(async (playlistId) => {
    if (activePlaylist?.id === playlistId) {
      setActivePlaylist(null)
      setShoppingList(null)
      return
    }
    setLibraryLoading(true)
    try {
      const res = await fetch(`${API}/playlists/${playlistId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const { data, error } = await parseRes(res, 'Cannot open list.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not open list'))
      setActivePlaylist(data)
      setSavedPlanId(null)
      setMealPlan(null)
      const listRes = await fetch(`${API}/playlists/${playlistId}/shopping-list`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const listParsed = await parseRes(listRes, 'Cannot load shopping list.')
      if (!listParsed.error && listRes.ok) setShoppingList(listParsed.data)
      else setShoppingList(null)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLibraryLoading(false)
    }
  }, [activePlaylist, token, addToast])

  const createPlaylist = useCallback(async (title) => {
    try {
      const res = await fetch(`${API}/playlists`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title }),
      })
      const { data, error } = await parseRes(res, 'Cannot create list.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not create list'))
      await loadPlaylists()
      setActivePlaylist(data)
      addToast(`Created “${data.title}”`, 'success')
      return data
    } catch (err) {
      addToast(err.message, 'error')
      return null
    }
  }, [authHeaders, loadPlaylists, addToast])

  const addPlanToPlaylist = useCallback(async (playlistId, mealPlanId) => {
    const res = await fetch(`${API}/playlists/${playlistId}/items`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ meal_plan_id: mealPlanId }),
    })
    const { data, error } = await parseRes(res, 'Cannot add to list.')
    if (error) throw new Error(error)
    if (!res.ok) throw new Error(getErrorMsg(data, 'Could not add to list'))
    await loadPlaylists()
    if (activePlaylist?.id === playlistId) setActivePlaylist(data)
    return data
  }, [authHeaders, loadPlaylists, activePlaylist])

  const handlePickPlaylist = useCallback(async (list) => {
    const planId = pickerPlanId || savedPlanId
    if (!planId) return
    try {
      await addPlanToPlaylist(list.id, planId)
      addToast(`Added to ${list.title}`, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [pickerPlanId, savedPlanId, addPlanToPlaylist, addToast])

  const handleCreateAndAdd = useCallback(async (title) => {
    const created = await createPlaylist(title)
    const planId = pickerPlanId || savedPlanId
    if (!created || !planId) return
    try {
      await addPlanToPlaylist(created.id, planId)
      addToast(`Added to ${created.title}`, 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [createPlaylist, pickerPlanId, savedPlanId, addPlanToPlaylist, addToast])

  const deletePlaylist = useCallback(async (playlistId) => {
    try {
      const res = await fetch(`${API}/playlists/${playlistId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot delete list.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not delete list'))
      if (activePlaylist?.id === playlistId) {
        setActivePlaylist(null)
        setShoppingList(null)
      }
      await loadPlaylists()
      addToast('List deleted', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [authHeaders, activePlaylist, loadPlaylists, addToast])

  const removeTrack = useCallback(async (playlistId, mealPlanId) => {
    try {
      const res = await fetch(`${API}/playlists/${playlistId}/items/${mealPlanId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot remove dish.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not remove dish'))
      setActivePlaylist(data)
      await loadPlaylists()
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [authHeaders, loadPlaylists, addToast])

  const moveTrack = useCallback(async (playlistId, mealPlanId, direction) => {
    const tracks = activePlaylist?.tracks || []
    const ids = tracks.map((t) => t.meal_plan_id)
    const index = ids.indexOf(mealPlanId)
    const next = index + direction
    if (index < 0 || next < 0 || next >= ids.length) return
    const reordered = [...ids]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(next, 0, moved)
    try {
      const res = await fetch(`${API}/playlists/${playlistId}/items/order`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ meal_plan_ids: reordered }),
      })
      const { data, error } = await parseRes(res, 'Cannot reorder.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not reorder'))
      setActivePlaylist(data)
    } catch (err) {
      addToast(err.message, 'error')
    }
  }, [activePlaylist, authHeaders, addToast])

  const publishAndCopyPlaylist = useCallback(async (playlistId) => {
    if (!playlistId || shareBusy) return
    setShareBusy(true)
    try {
      const res = await fetch(`${API}/playlists/${playlistId}/share`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot share list.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Share failed'))
      const url = buildShareUrl(data.share_slug, 'list')
      const result = await shareOut(url, data.title || 'A list from my food. SORTED.')
      if (result === 'shared') addToast('List shared', 'success')
      else if (result === 'copied') addToast('List link copied — paste it anywhere', 'success')
      setActivePlaylist((prev) => prev ? { ...prev, is_public: true, share_slug: data.share_slug } : prev)
      await loadPlaylists()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, authHeaders, addToast, loadPlaylists])

  const unsharePlaylist = useCallback(async (playlistId) => {
    if (!playlistId || shareBusy) return
    setShareBusy(true)
    try {
      const res = await fetch(`${API}/playlists/${playlistId}/unshare`, {
        method: 'POST',
        headers: authHeaders(),
      })
      const { data, error } = await parseRes(res, 'Cannot update sharing.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not make private'))
      setActivePlaylist((prev) => prev ? { ...prev, is_public: false } : prev)
      await loadPlaylists()
      addToast('List is private again', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, authHeaders, addToast, loadPlaylists])

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
  const generateShoppingList = useCallback(async (planIdArg) => {
    if (shopLoading) return
    const playlistId = activePlaylist?.id
    const planId = planIdArg ?? savedPlanId
    if (!planId && !playlistId) return
    setShopLoading(true)
    try {
      const path = playlistId && !planId
        ? `${API}/playlists/${playlistId}/shopping-list/generate`
        : `${API}/shopping-list/${planId}/generate`
      const res = await fetch(path, {
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
  }, [savedPlanId, activePlaylist, shopLoading, token, addToast])

  const createShoppingListFromChat = useCallback(async () => {
    const planId = await persistRecipe({ openPicker: false })
    if (!planId) return
    await generateShoppingList(planId)
    addToast('Shopping list ready — shop it, or send it to Tesco or Sainsbury’s.', 'success')
    recipeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [persistRecipe, generateShoppingList, addToast])

  const shareRecipeTo = useCallback(async (network) => {
    if (shareBusy) return
    setShareBusy(true)
    try {
      const planId = await persistRecipe({ openPicker: false })
      if (!planId) return
      const url = await publishShareLink(planId)
      const title = mealPlan?.plan_name || mealPlan?.recipes?.[0]?.title || 'A recipe from my food. SORTED.'
      if (network === 'facebook') {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          '_blank',
          'noopener,noreferrer'
        )
        addToast('Facebook opened with your recipe link.', 'success')
        return
      }
      await navigator.clipboard.writeText(`${title}\n${url}`)
      if (network === 'instagram') {
        window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
        addToast('Link copied. Paste it in your Instagram story, post or DM.', 'success')
        return
      }
      addToast('Recipe link copied — share it anywhere.', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setShareBusy(false)
    }
  }, [shareBusy, persistRecipe, publishShareLink, mealPlan, addToast])

  const toggleShoppingItem = useCallback(async (item) => {
    if (item?.id == null) return
    const nextChecked = !item.checked
    const playlistScoped = Boolean(activePlaylist && !savedPlanId)
    setShoppingList((prev) => {
      if (!prev?.items) return prev
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? { ...i, checked: nextChecked } : i)),
      }
    })
    try {
      const path = playlistScoped
        ? `${API}/playlist-list/items/${item.id}`
        : `${API}/shopping-list/items/${item.id}`
      const res = await fetch(path, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ checked: nextChecked }),
      })
      if (!res.ok) {
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
  }, [authHeaders, activePlaylist, savedPlanId])

  const clearChecks = useCallback(async () => {
    if (shopLoading) return
    const playlistId = activePlaylist?.id
    if (!savedPlanId && !playlistId) return
    setShopLoading(true)
    try {
      const path = playlistId && !savedPlanId
        ? `${API}/playlists/${playlistId}/shopping-list/clear-checks`
        : `${API}/shopping-list/${savedPlanId}/clear-checks`
      const res = await fetch(path, {
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
  }, [savedPlanId, activePlaylist, shopLoading, token, addToast])

  const openRetailer = useCallback(async (retailer) => {
    const nextTab = window.open('about:blank', '_blank')
    if (nextTab) nextTab.opener = null
    try {
      const res = await fetch(`${API}/affiliate-link`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ retailer }),
      })
      const { data, error } = await parseRes(res, 'Cannot open that retailer.')
      if (error) throw new Error(error)
      if (!res.ok || !data.url) throw new Error(getErrorMsg(data, 'Retailer link unavailable'))
      if (nextTab) nextTab.location.href = data.url
      else window.location.assign(data.url)
    } catch (err) {
      nextTab?.close()
      addToast(err.message, 'error')
    }
  }, [authHeaders, addToast])

  const setPreferredRetailer = useCallback(async (retailerId) => {
    try {
      localStorage.setItem('myFoodSortedRetailer', retailerId)
    } catch {
      /* ignore */
    }
    if (token) savePrefs({ preferred_retailer: retailerId })
  }, [savePrefs, token])

  /* ── Render ── */
  if (shareFrom?.slug) {
    return (
      <SharedRecipeView
        slug={shareFrom.slug}
        kind={shareFrom.kind}
        onClose={closeSharedView}
      />
    )
  }

  if (!token) {
    return (
      <LandingPage
        loading={loading}
        handleAuth={handleAuth}
        initialAuthMode={landingAuthMode}
        pendingInspiration={pendingInspiration}
        onPickInspiration={handleLandingInspiration}
        onStartCooking={handleLandingQuery}
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
            <span className="app__logoClaim">Your meals. Your recipe books.</span>
          </button>
          <div className="app__headerRight">
            <nav className="app__nav" aria-label="Main">
              <button
                type="button"
                className={`app__navItem ${view === 'tonight' ? 'app__navItem--active' : ''}`}
                onClick={() => setView('tonight')}
              >
                Cook
              </button>
              <button
                type="button"
                className={`app__navItem ${view === 'library' ? 'app__navItem--active' : ''}`}
                onClick={() => setView('library')}
              >
                Recipe books
              </button>
              <button
                type="button"
                className={`app__navItem ${view === 'journal' ? 'app__navItem--active' : ''}`}
                onClick={() => setView('journal')}
              >
                Journal
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

      <div className="app__principles" aria-label="How tonight goes">
        <span>Chat</span>
        <span>Cook</span>
        <span>Keep the book</span>
      </div>

      <main className={`app__main app__main--${view}`}>
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
                playlists={playlists}
                activePlaylist={activePlaylist}
                onSelectPlaylist={openPlaylist}
                onCreatePlaylist={createPlaylist}
                onDeletePlaylist={deletePlaylist}
                onSharePlaylist={publishAndCopyPlaylist}
                onUnsharePlaylist={unsharePlaylist}
                onRemoveTrack={removeTrack}
                onMoveTrack={moveTrack}
                onOpenTrack={(planId) => {
                  openPlan(planId)
                }}
                plans={savedPlans}
                activePlanId={savedPlanId}
                onSelectPlan={openPlan}
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
                onSharePlan={publishAndCopyShare}
                onUnsharePlan={unsharePlan}
                onAddToList={(planId) => {
                  setPickerPlanId(planId)
                  setPickerOpen(true)
                }}
                shareBusy={shareBusy}
                shareUrlForPlan={(plan) =>
                  buildShareUrl(
                    plan.share_slug || activeShareMeta.share_slug || mealPlan?.share_slug
                  )
                }
                shareUrlForPlaylist={(list) => buildShareUrl(list.share_slug, 'list')}
              />
            </section>
            {(savedPlanId || activePlaylist) && (
              <section className="app__panel app__panel--muted">
                <ShoppingListDisplay
                  shoppingList={shoppingList}
                  generateShoppingList={generateShoppingList}
                  loading={shopLoading}
                  onToggleItem={toggleShoppingItem}
                  onClearChecks={clearChecks}
                  onOpenRetailer={openRetailer}
                  onSetPreferredRetailer={setPreferredRetailer}
                  preferredRetailer={prefs?.preferred_retailer}
                />
              </section>
            )}
          </>
        ) : view === 'journal' ? (
          <section className="app__panel">
            <CompanionChat
              apiBase={API}
              accessToken={token}
              onToast={addToast}
            />
          </section>
        ) : (
          <div ref={recipeRef} className="app__conversation">
            <ChatInterface
              stage={cookStage}
              path={cookPath}
              messages={messages}
              input={input}
              setInput={setInput}
              loading={chatLoading}
              onClearChat={clearChat}
              options={dishOptions}
              selectedOption={selectedOption}
              onChoosePath={beginCookFlow}
              onSubmitTurn={submitCookTurn}
              onSelectOption={chooseDishOption}
              onRejectOptions={rejectDishOptions}
              onFinalize={finalizeDishOption}
              onTweakRecipe={sendMessage}
            onBackToOptions={backToDishOptions}
              recipeSaved={Boolean(savedPlanId)}
            />

            {mealPlan && savedPlanId == null && (
              <section className="app__panel">
                <MealPlanDisplay
                  mealPlan={mealPlan}
                  savePlan={savePlan}
                  loading={planLoading || chatLoading}
                  alreadySaved={false}
                  onRemix={(prompt, label) => handleRemix(prompt, label)}
                  onCreateShoppingList={createShoppingListFromChat}
                  shopLoading={shopLoading}
                  hasShoppingList={Boolean(shoppingList?.items?.length)}
                  onShareFacebook={() => shareRecipeTo('facebook')}
                  onShareInstagram={() => shareRecipeTo('instagram')}
                  onCopyShareLink={() => shareRecipeTo('copy')}
                  shareBusy={shareBusy}
                  shareUrl={buildShareUrl(
                    activeShareMeta.share_slug || mealPlan.share_slug
                  )}
                />
              </section>
            )}

            {mealPlan && savedPlanId != null && view === 'tonight' && (
              <section className="app__panel">
                <MealPlanDisplay
                  mealPlan={mealPlan}
                  alreadySaved
                  onRemix={(prompt, label) => handleRemix(prompt, label)}
                  onShare={() => publishAndCopyShare(savedPlanId)}
                  onUnshare={() => unsharePlan(savedPlanId)}
                  onAddToList={() => {
                    setPickerPlanId(savedPlanId)
                    setPickerOpen(true)
                  }}
                  onCreateShoppingList={createShoppingListFromChat}
                  shopLoading={shopLoading}
                  hasShoppingList={Boolean(shoppingList?.items?.length)}
                  onShareFacebook={() => shareRecipeTo('facebook')}
                  onShareInstagram={() => shareRecipeTo('instagram')}
                  onCopyShareLink={() => shareRecipeTo('copy')}
                  shareBusy={shareBusy}
                  isPublic={libraryShareIsPublic}
                  shareUrl={buildShareUrl(
                    activeShareMeta.share_slug ||
                    activePlanFromLibrary?.share_slug ||
                    mealPlan.share_slug
                  )}
                  savedPlanId={savedPlanId}
                  apiBase={API}
                  accessToken={token}
                  onToast={addToast}
                />
              </section>
            )}

            {mealPlan && view === 'tonight' && (savedPlanId || shoppingList) && (
              <section className="app__panel app__panel--muted">
                <ShoppingListDisplay
                  shoppingList={shoppingList}
                  generateShoppingList={generateShoppingList}
                  loading={shopLoading}
                  onToggleItem={toggleShoppingItem}
                  onClearChecks={clearChecks}
                  onOpenRetailer={openRetailer}
                  onSetPreferredRetailer={setPreferredRetailer}
                  preferredRetailer={prefs?.preferred_retailer}
                />
              </section>
            )}
          </div>
        )}
      </main>
      <footer className="app__footer">
        <div>
          <span className="app__footerBrand">my food. <strong>SORTED.</strong></span>
          <span>Chat, cook, keep the book.</span>
        </div>
        <nav aria-label="Footer">
          <button type="button" onClick={() => setView('tonight')}>Cook tonight</button>
          <button type="button" onClick={() => setView('library')}>Recipe books</button>
          <button type="button" onClick={() => setView('journal')}>Journal</button>
          <button type="button" onClick={() => setView('account')}>Preferences</button>
        </nav>
      </footer>
      <PlaylistPicker
        open={pickerOpen}
        playlists={playlists}
        loading={planLoading || libraryLoading}
        onClose={() => setPickerOpen(false)}
        onPick={handlePickPlaylist}
        onCreate={handleCreateAndAdd}
      />
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

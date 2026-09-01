import { useCallback, useEffect, useRef, useState } from 'react'
import './CompanionChat.css'

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

function getErrorMsg(data, fallback = 'Something went wrong') {
  if (!data) return fallback
  return data.detail ?? data.message ?? data.error ?? fallback
}

/**
 * Private journal companion. Warm, brief, practical chat about cooking.
 * Separate conversation from the kitchen planner. Prompts come from recent
 * saved meals + feedback so the journal stays grounded in what the user cooked.
 */
function CompanionChat({ apiBase, accessToken, onToast }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [prompts, setPrompts] = useState([])
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID())
  const scrollRef = useRef(null)

  const loadPrompts = useCallback(async () => {
    if (!apiBase || !accessToken) return
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/recent`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) return
      const { data, error } = await parseRes(res, 'Cannot load journal.')
      if (error || !res.ok) return
      setPrompts(Array.isArray(data.prompts) ? data.prompts : [])
    } catch {
      /* non-blocking */
    }
  }, [apiBase, accessToken])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading])

  const send = useCallback(async (text) => {
    const clean = String(text || '').trim()
    if (!clean || loading) return
    if (!apiBase || !accessToken) {
      onToast?.('Log in to use the journal.', 'error')
      return
    }

    setMessages((prev) => [...prev, { role: 'user', content: clean }])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_message: clean,
          conversation_id: conversationId,
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot reach the journal right now.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not respond just now'))

      const content = data.message ?? data.response ?? data.content ?? ''
      if (content) {
        setMessages((prev) => [...prev, { role: 'assistant', content }])
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'I am here. Tell me a bit more.' }])
      }
      if (Array.isArray(data.prompts)) setPrompts(data.prompts)
    } catch (err) {
      const friendly = /fetch|network|reach/i.test(err.message)
        ? 'The journal could not be reached. Try again in a moment.'
        : err.message
      setMessages((prev) => [...prev, { role: 'assistant', content: friendly }])
      if (err.message && !/quota|limit/i.test(err.message)) onToast?.(friendly, 'error')
    } finally {
      setLoading(false)
    }
  }, [loading, apiBase, accessToken, conversationId, onToast])

  const startNewConversation = useCallback(() => {
    setMessages([])
    setInput('')
    setConversationId(crypto.randomUUID())
    loadPrompts()
  }, [loadPrompts])

  return (
    <div className="companion-chat">
      <header className="companion-chat__header">
        <div>
          <p className="companion-chat__label">Journal</p>
          <h2 className="companion-chat__title">Your private kitchen journal</h2>
          <p className="companion-chat__sub">
            A quiet place to think through what to cook, what worked, and what to try next. Not medical advice.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost companion-chat__newBtn"
          onClick={startNewConversation}
          disabled={loading}
        >
          New entry
        </button>
      </header>

      <div className="companion-chat__messages">
        {messages.length === 0 && (
          <div className="companion-chat__empty">
            <p>What is on your mind in the kitchen this week?</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`companion-chat__msg companion-chat__msg--${m.role}`}>
            <p>{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="companion-chat__msg companion-chat__msg--assistant companion-chat__msg--typing">
            <p>Writing…</p>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {prompts.length > 0 && (
        <div className="companion-chat__prompts">
          {prompts.slice(0, 6).map((p, i) => (
            <button
              key={`${p.text}-${i}`}
              type="button"
              className="companion-chat__prompt"
              disabled={loading}
              onClick={() => send(p.text)}
            >
              {p.text}
            </button>
          ))}
        </div>
      )}

      <form
        className="companion-chat__inputRow"
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
      >
        <textarea
          className="companion-chat__input"
          placeholder="Write a few lines…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
          rows={2}
          disabled={loading}
        />
        <button type="submit" className="btn btn--primary companion-chat__sendBtn" disabled={loading || !input.trim()}>
          {loading ? 'Writing…' : 'Write'}
        </button>
      </form>
    </div>
  )
}

export default CompanionChat

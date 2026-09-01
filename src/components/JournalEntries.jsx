import { useCallback, useEffect, useState } from 'react'
import './JournalEntries.css'

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

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString([], { day: 'numeric', month: 'short' })
  } catch {
    return ''
  }
}

/**
 * Persistent private journal — saved and AI-summarized entries.
 * "Summarize this chat" turns the current companion chat into a journal entry.
 */
function JournalEntries({ apiBase, accessToken, onToast, conversationId, onConversationReset }) {
  const [entries, setEntries] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  const load = useCallback(async () => {
    if (!accessToken) return
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/journal`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) return
      const { data, error } = await parseRes(res, 'Cannot load your journal.')
      if (error || !res.ok) return
      setEntries(Array.isArray(data.entries) ? data.entries : [])
    } catch {
      /* non-blocking */
    }
  }, [apiBase, accessToken])

  useEffect(() => {
    load()
  }, [load])

  const saveDraft = useCallback(async () => {
    const clean = draft.trim()
    if (!clean || busy) return
    setBusy(true)
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ body: clean }),
      })
      const { data, error } = await parseRes(res, 'Cannot save that entry.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not save that entry'))
      setDraft('')
      if (data.entry) setEntries((prev) => [data.entry, ...prev])
      onToast?.('Saved to your journal.', 'success')
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }, [draft, busy, apiBase, accessToken, onToast])

  const summarize = useCallback(async () => {
    if (summarizing) return
    setSummarizing(true)
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/journal/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ conversation_id: conversationId }),
      })
      const { data, error } = await parseRes(res, 'Cannot summarize that chat.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not summarize that chat'))
      if (data.entry) {
        setEntries((prev) => [data.entry, ...prev])
        onConversationReset?.()
      }
      onToast?.('Chat saved as a journal entry.', 'success')
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setSummarizing(false)
    }
  }, [summarizing, apiBase, accessToken, conversationId, onConversationReset, onToast])

  const remove = useCallback(async (id) => {
    if (id == null) return
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, '')}/companion/journal/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        const { data } = await parseRes(res, 'Cannot delete that entry.')
        throw new Error(getErrorMsg(data, 'Could not delete that entry'))
      }
      setEntries((prev) => prev.filter((e) => e.id !== id))
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }, [apiBase, accessToken, onToast])

  return (
    <div className="journal-entries">
      <header className="journal-entries__header">
        <p className="journal-entries__label">Journal</p>
        <h2 className="journal-entries__title">Your private journal</h2>
        <p className="journal-entries__sub">
          Save a thought, or turn your latest chat into an entry you can read back later.
        </p>
      </header>

      <div className="journal-entries__actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={summarize}
          disabled={summarizing || busy}
        >
          {summarizing ? 'Summarizing…' : 'Summarize this chat'}
        </button>
      </div>

      <form
        className="journal-entries__form"
        onSubmit={(e) => {
          e.preventDefault()
          saveDraft()
        }}
      >
        <textarea
          className="journal-entries__draft"
          placeholder="Write a quick note to keep…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          disabled={busy}
        />
        <button type="submit" className="btn btn--primary" disabled={busy || !draft.trim()}>
          {busy ? 'Saving…' : 'Save entry'}
        </button>
      </form>

      <div className="journal-entries__list">
        {entries.length === 0 && (
          <p className="journal-entries__empty">No entries yet. Save a note or summarize a chat.</p>
        )}
        {entries.map((e) => (
          <article key={e.id} className="journal-entries__item">
            <div className="journal-entries__itemHead">
              <p className="journal-entries__itemMeta">
                {fmtDate(e.created_at)}
                {e.entry_kind === 'summary' ? ' · from chat' : ''}
                {e.plan_name ? ` · ${e.plan_name}` : ''}
              </p>
              <button
                type="button"
                className="journal-entries__delete"
                onClick={() => remove(e.id)}
                aria-label="Delete entry"
              >
                ×
              </button>
            </div>
            <p className="journal-entries__body">{e.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}

export default JournalEntries

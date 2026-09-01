import { useCallback, useEffect, useRef, useState } from 'react'
import './FoodLog.css'

const API = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

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

function dayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return { from: start.toISOString(), to: now.toISOString() }
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

/**
 * Journal food log — photo or text "what I ate/cooked".
 * Shares the companion message quota with the journal chat.
 */
function FoodLog({ accessToken, onToast }) {
  const [logs, setLogs] = useState([])
  const [summary, setSummary] = useState(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState(null)
  const fileRef = useRef(null)

  const loadLogs = useCallback(async () => {
    if (!accessToken) return
    const { from, to } = dayRange()
    try {
      const res = await fetch(`${API}/companion/food-log?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (res.status === 401) return
      const { data, error } = await parseRes(res, 'Cannot load your journal.')
      if (error || !res.ok) return
      setLogs(Array.isArray(data.logs) ? data.logs : [])
      setSummary(data.summary ?? null)
    } catch {
      /* non-blocking */
    }
  }, [accessToken])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const submitText = useCallback(async () => {
    const clean = text.trim()
    if (!clean || busy) return
    setBusy(true)
    try {
      const { from, to } = dayRange()
      const res = await fetch(`${API}/companion/food-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ description: clean, from, to }),
      })
      const { data, error } = await parseRes(res, 'Cannot log that just now.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not log that'))
      setText('')
      if (data.log) setLogs((prev) => [data.log, ...prev.filter((l) => l.id !== data.log.id)])
      if (data.summary) setSummary(data.summary)
      onToast?.('Logged.', 'success')
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setBusy(false)
    }
  }, [text, busy, accessToken, onToast])

  const submitPhoto = useCallback(async (file) => {
    if (!file || photoBusy) return
    setPhotoBusy(true)
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      const match = String(dataUrl).match(/^data:(image\/[a-z]+);base64,(.*)$/)
      if (!match) throw new Error('Could not read that image.')
      const mime = match[1]
      const base64 = match[2]
      const { from, to } = dayRange()
      const res = await fetch(`${API}/companion/food-log/photo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          image_base64: base64,
          mime_type: mime,
          from,
          to,
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot read that photo.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not read that photo'))
      if (data.log) setLogs((prev) => [data.log, ...prev.filter((l) => l.id !== data.log.id)])
      if (data.summary) setSummary(data.summary)
      onToast?.('Photo logged.', 'success')
    } catch (err) {
      onToast?.(err.message, 'error')
    } finally {
      setPhotoBusy(false)
      setPhotoPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    }
  }, [photoBusy, accessToken, onToast])

  const deleteLog = useCallback(async (id) => {
    if (id == null) return
    const { from, to } = dayRange()
    try {
      const res = await fetch(`${API}/companion/food-log/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ from, to }),
      })
      if (!res.ok) {
        const { data } = await parseRes(res, 'Cannot delete that entry.')
        throw new Error(getErrorMsg(data, 'Could not delete that'))
      }
      const parsed = await res.json().catch(() => ({}))
      setLogs((prev) => prev.filter((l) => l.id !== id))
      if (parsed.summary) setSummary(parsed.summary)
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }, [accessToken, onToast])

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      onToast?.('Image is too large (max 4MB).', 'error')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setPhotoPreview(URL.createObjectURL(file))
    submitPhoto(file)
  }

  const startEdit = (log) => {
    setEditingId(log.id)
    setEditDraft({
      estimated_protein_g: log.estimated_protein_g ?? '',
      estimated_calories: log.estimated_calories ?? '',
      estimated_carbs_g: log.estimated_carbs_g ?? '',
      estimated_fat_g: log.estimated_fat_g ?? '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditDraft(null)
  }

  const saveEdit = useCallback(async (id) => {
    if (!editDraft) return
    const { from, to } = dayRange()
    try {
      const res = await fetch(`${API}/companion/food-log/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          estimated_protein_g: editDraft.estimated_protein_g === '' ? null : Number(editDraft.estimated_protein_g),
          estimated_calories: editDraft.estimated_calories === '' ? null : Number(editDraft.estimated_calories),
          estimated_carbs_g: editDraft.estimated_carbs_g === '' ? null : Number(editDraft.estimated_carbs_g),
          estimated_fat_g: editDraft.estimated_fat_g === '' ? null : Number(editDraft.estimated_fat_g),
          from,
          to,
        }),
      })
      const { data, error } = await parseRes(res, 'Cannot save those edits.')
      if (error) throw new Error(error)
      if (!res.ok) throw new Error(getErrorMsg(data, 'Could not save those edits'))
      if (data.log) setLogs((prev) => prev.map((l) => (l.id === id ? data.log : l)))
      if (data.summary) setSummary(data.summary)
      cancelEdit()
      onToast?.('Updated.', 'success')
    } catch (err) {
      onToast?.(err.message, 'error')
    }
  }, [editDraft, accessToken, onToast])

  return (
    <div className="food-log">
      <header className="food-log__header">
        <p className="food-log__label">Journal</p>
        <h2 className="food-log__title">Log what you ate</h2>
        <p className="food-log__sub">
          Snap a photo or write a line. We estimate the nutrition so you can look back later. No medical advice.
        </p>
      </header>

      <div className="food-log__entry">
        <div className="food-log__photoRow">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            disabled={photoBusy}
            className="food-log__fileInput"
            id="food-log-photo"
          />
          <label htmlFor="food-log-photo" className={`btn btn--ghost food-log__photoBtn ${photoBusy ? 'food-log__photoBtn--busy' : ''}`}>
            {photoBusy ? 'Reading photo…' : 'Add a photo'}
          </label>
          {photoPreview && !photoBusy && (
            <img src={photoPreview} alt="Preview" className="food-log__preview" />
          )}
        </div>

        <form
          className="food-log__textRow"
          onSubmit={(e) => {
            e.preventDefault()
            submitText()
          }}
        >
          <textarea
            className="food-log__text"
            placeholder="e.g. pasta with tomato sauce and a side salad"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submitText()
              }
            }}
            rows={2}
            disabled={busy}
          />
          <button type="submit" className="btn btn--primary food-log__sendBtn" disabled={busy || !text.trim()}>
            {busy ? 'Logging…' : 'Log it'}
          </button>
        </form>
      </div>

      {summary?.daily_calories != null && (
        <p className="food-log__summary">
          Today: {Math.round(summary.daily_calories)} kcal logged
        </p>
      )}

      <div className="food-log__list">
        {logs.length === 0 && (
          <p className="food-log__empty">Nothing logged today yet.</p>
        )}
        {logs.map((l) => (
          <article key={l.id} className="food-log__item">
            <div className="food-log__itemHead">
              <p className="food-log__itemTime">{fmtTime(l.logged_at)}</p>
              <div className="food-log__itemActions">
                <button
                  type="button"
                  className="food-log__edit"
                  onClick={() => (editingId === l.id ? cancelEdit() : startEdit(l))}
                  aria-label="Edit entry"
                >
                  ✎
                </button>
                <button
                  type="button"
                  className="food-log__delete"
                  onClick={() => deleteLog(l.id)}
                  aria-label="Delete entry"
                >
                  ×
                </button>
              </div>
            </div>
            <p className="food-log__itemDesc">{l.description}</p>
            {editingId === l.id && editDraft && (
              <div className="food-log__editForm">
                {[
                  { key: 'estimated_calories', label: 'kcal' },
                  { key: 'estimated_protein_g', label: 'P g' },
                  { key: 'estimated_carbs_g', label: 'C g' },
                  { key: 'estimated_fat_g', label: 'F g' },
                ].map((f) => (
                  <label key={f.key} className="food-log__editField">
                    <span>{f.label}</span>
                    <input
                      type="number"
                      min="0"
                      value={editDraft[f.key] ?? ''}
                      onChange={(e) =>
                        setEditDraft((prev) => ({ ...prev, [f.key]: e.target.value === '' ? '' : Number(e.target.value) }))
                      }
                    />
                  </label>
                ))}
                <div className="food-log__editActions">
                  <button type="button" className="btn btn--ghost" onClick={cancelEdit}>Cancel</button>
                  <button type="button" className="btn btn--primary" onClick={() => saveEdit(l.id)}>Save</button>
                </div>
              </div>
            )}
            {l.items?.length > 0 && (
              <ul className="food-log__items">
                {l.items.map((it, i) => (
                  <li key={i}>
                    <span>{it.name}</span>
                    <span className="food-log__itemMacros">
                      {[
                        it.calories != null ? `${it.calories} kcal` : null,
                        it.protein_g != null ? `P ${it.protein_g}g` : null,
                        it.carbs_g != null ? `C ${it.carbs_g}g` : null,
                        it.fat_g != null ? `F ${it.fat_g}g` : null,
                      ].filter(Boolean).join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {l.coach_note && <p className="food-log__coach">{l.coach_note}</p>}
          </article>
        ))}
      </div>
    </div>
  )
}

export default FoodLog

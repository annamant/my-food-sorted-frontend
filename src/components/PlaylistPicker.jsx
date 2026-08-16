import { useState } from 'react'
import './PlaylistPicker.css'

export default function PlaylistPicker({
  open,
  playlists,
  loading,
  onClose,
  onPick,
  onCreate,
}) {
  const [title, setTitle] = useState('')
  if (!open) return null

  return (
    <div className="playlist-picker" role="dialog" aria-modal="true" aria-labelledby="picker-title">
      <div className="playlist-picker__panel">
        <header className="playlist-picker__bar">
          <div>
            <p className="playlist-picker__label">Your recipe books</p>
            <h2 id="picker-title" className="playlist-picker__title">Add to a recipe book</h2>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Done
          </button>
        </header>
        <p className="playlist-picker__lede">
          Saved dishes stay in your kitchen. Put this one in a recipe book you own — then share the book or publish it.
        </p>
        <ul className="playlist-picker__lists">
          {(playlists || []).map((list) => (
            <li key={list.id}>
              <button
                type="button"
                className="playlist-picker__row"
                disabled={loading}
                onClick={() => onPick(list)}
              >
                <span>
                  <span className="playlist-picker__name">{list.title}</span>
                  <span className="playlist-picker__meta">
                    {list.tracks_count ?? 0} {(list.tracks_count ?? 0) === 1 ? 'dish' : 'dishes'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <form
          className="playlist-picker__create"
          onSubmit={(e) => {
            e.preventDefault()
            const name = title.trim()
            if (!name) return
            onCreate(name)
            setTitle('')
          }}
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New recipe book — Weeknights"
            aria-label="New recipe book name"
            disabled={loading}
          />
          <button type="submit" className="btn btn--primary" disabled={loading || !title.trim()}>
            Create
          </button>
        </form>
      </div>
    </div>
  )
}

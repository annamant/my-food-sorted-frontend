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
            <p className="playlist-picker__label">Your lists</p>
            <h2 id="picker-title" className="playlist-picker__title">Add to a list</h2>
          </div>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Done
          </button>
        </header>
        <p className="playlist-picker__lede">
          Kept dishes land in Liked. Put this one on another list — like a playlist.
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
                <span className="playlist-picker__cover" aria-hidden="true">
                  {list.cover_url ? <img src={list.cover_url} alt="" /> : <span />}
                </span>
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
            placeholder="New list — Tuesday after gym"
            aria-label="New list name"
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

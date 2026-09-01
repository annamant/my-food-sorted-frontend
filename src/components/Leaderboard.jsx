import { useEffect, useState } from 'react'
import './Leaderboard.css'

const BRAND_NAME = 'My Food SORTED'

function buildSharePath(slug) {
  if (!slug) return ''
  return `/share/list/${encodeURIComponent(slug)}`
}

export default function Leaderboard({
  apiBase = '',
  compact = false,
  onJoin,
  authToken = null,
  hideWhenEmpty = false,
}) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const headers = { Accept: 'application/json' }
      if (authToken) headers.Authorization = `Bearer ${authToken}`

      const paths = ['/leaderboard', '/discover/books']
      let loaded = []

      for (const path of paths) {
        if (!apiBase || loaded.length) break
        try {
          const res = await fetch(`${apiBase.replace(/\/$/, '')}${path}`, { headers })
          if (!res.ok) continue
          const data = await res.json()
          const list = data.entries ?? data.books ?? []
          if (Array.isArray(list) && list.length) {
            loaded = list
            break
          }
        } catch {
          /* try next path */
        }
      }

      if (!cancelled) {
        setEntries(loaded)
        setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [apiBase, authToken])

  const title = compact ? 'Most cooked books' : 'Community leaderboard'
  const lede = compact
    ? 'Public books people are cooking from right now.'
    : 'See which shared books and meal plans people are cooking most. Publish yours to climb the board.'

  if (hideWhenEmpty && (loading || !entries.length)) {
    return null
  }

  return (
    <section className={`leaderboard ${compact ? 'leaderboard--compact' : ''}`} aria-labelledby="leaderboard-title">
      <div className="leaderboard__head">
        <p className="leaderboard__kicker">Community</p>
        <h2 id="leaderboard-title">{title}</h2>
        <p className="leaderboard__lede">{lede}</p>
      </div>

      {loading && <p className="leaderboard__status">Loading community books…</p>}

      {!loading && !entries.length && (
        <div className="leaderboard__empty">
          <p>No public books on the board yet.</p>
          <p>Plan meals, save them to your book, then publish to appear here.</p>
          {onJoin && (
            <button type="button" className="btn btn--primary" onClick={onJoin}>
              Join free and publish your book
            </button>
          )}
        </div>
      )}

      {!loading && entries.length > 0 && (
        <ol className="leaderboard__list">
          {entries.map((entry, index) => {
            const rank = entry.rank ?? index + 1
            const titleText = entry.title || entry.plan_name || 'Shared book'
            const slug = entry.share_slug || entry.slug
            const href = slug ? buildSharePath(slug) : null
            const dishes = entry.tracks_count ?? entry.dishes_count ?? null

            return (
              <li key={entry.id ?? slug ?? rank} className="leaderboard__item">
                <span className="leaderboard__rank">{rank}</span>
                <div className="leaderboard__copy">
                  {href ? (
                    <a href={href} className="leaderboard__title">{titleText}</a>
                  ) : (
                    <span className="leaderboard__title">{titleText}</span>
                  )}
                  <span className="leaderboard__meta">
                    {entry.owner_display ? (
                      <span className="leaderboard__creator">By {entry.owner_display}</span>
                    ) : null}
                    {dishes != null ? `${dishes} ${dishes === 1 ? 'dish' : 'dishes'}` : ''}
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}

      {!compact && (
        <p className="leaderboard__note">
          The best meals on {BRAND_NAME} come from people who actually cooked them.
        </p>
      )}
    </section>
  )
}

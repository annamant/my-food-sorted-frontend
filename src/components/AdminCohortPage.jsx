import { useEffect, useState } from 'react'
import { formatCount, formatShare, formatWhen } from '../data/adminAccess'
import './AdminCohortPage.css'

export default function AdminCohortPage({ apiBase, accessToken, onHome }) {
  const [days, setDays] = useState(30)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) return
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`${apiBase.replace(/\/$/, '')}/admin/cohort?days=${encodeURIComponent(days)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(async (res) => {
        const text = await res.text()
        let data = {}
        try { data = text ? JSON.parse(text) : {} } catch { /* keep empty */ }
        if (!res.ok) {
          if (res.status === 404) throw new Error('Not available.')
          throw new Error(data.error || 'Could not load the cohort.')
        }
        return data
      })
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiBase, accessToken, days])

  return (
    <div className="admin-cohort">
      <header className="admin-cohort__header">
        <button type="button" className="admin-cohort__back" onClick={onHome}>
          ← Back
        </button>
        <p className="admin-cohort__kicker">Admin</p>
        <h1 className="admin-cohort__title">Cohort snapshot</h1>
        <p className="admin-cohort__sub">
          Aggregate activity across all users. No medical info, no individual health data.
        </p>
        <label className="admin-cohort__days">
          Window:
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
          </select>
        </label>
      </header>

      {loading && <p className="admin-cohort__status">Loading…</p>}
      {error && <p className="admin-cohort__error">{error}</p>}

      {summary && !loading && !error && (
        <>
          <section className="admin-cohort__block">
            <h2>Users</h2>
            <ul className="admin-cohort__stats">
              <li><span>Registered</span><strong>{formatCount(summary.users?.registered_in_window)}</strong></li>
              <li><span>Left feedback</span><strong>{formatCount(summary.users?.with_feedback)}</strong></li>
              <li><span>Kept a food log</span><strong>{formatCount(summary.users?.with_food_logs)}</strong></li>
              <li><span>Both</span><strong>{formatCount(summary.users?.with_both)}</strong></li>
            </ul>
          </section>

          <section className="admin-cohort__block">
            <h2>Feedback</h2>
            <ul className="admin-cohort__stats">
              <li><span>Liked</span><strong>{formatCount(summary.feedback?.liked)}</strong></li>
              <li><span>Disliked</span><strong>{formatCount(summary.feedback?.disliked)}</strong></li>
              <li><span>Too spicy</span><strong>{formatCount(summary.feedback?.too_spicy)}</strong></li>
              <li><span>Too bland</span><strong>{formatCount(summary.feedback?.too_bland)}</strong></li>
              <li><span>Would repeat</span><strong>{formatCount(summary.repeat?.would_repeat)}</strong></li>
              <li><span>No repeat</span><strong>{formatCount(summary.repeat?.no_repeat)}</strong></li>
            </ul>
          </section>

          <section className="admin-cohort__block">
            <h2>Food logs</h2>
            <p className="admin-cohort__stat">{formatCount(summary.food_logs)} entries logged in the window.</p>
          </section>

          {Array.isArray(summary.recipes_by_repeat) && summary.recipes_by_repeat.length > 0 && (
            <section className="admin-cohort__block">
              <h2>Recipes by repeat rate</h2>
              <ol className="admin-cohort__list">
                {summary.recipes_by_repeat.map((r) => (
                  <li key={r.recipe_title}>
                    <span className="admin-cohort__recipeTitle">{r.recipe_title}</span>
                    <span className="admin-cohort__recipeMeta">
                      {formatShare(r.repeat_rate)} repeat · {formatCount(r.would_repeat)} yes / {formatCount(r.no_repeat)} no
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {Array.isArray(summary.people) && summary.people.length > 0 && (
            <section className="admin-cohort__block">
              <h2>People</h2>
              <table className="admin-cohort__table">
                <thead>
                  <tr>
                    <th>Email</th><th>Joined</th><th>Logs</th><th>Days</th><th>Liked</th><th>Repeat</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.people.map((p) => (
                    <tr key={p.id}>
                      <td>{p.email}</td>
                      <td>{formatWhen(p.created_at)}</td>
                      <td>{formatCount(p.food_logs)}</td>
                      <td>{formatCount(p.food_log_days)}</td>
                      <td>{formatCount(p.liked)}</td>
                      <td>{formatCount(p.would_repeat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {Array.isArray(summary.recent_logs) && summary.recent_logs.length > 0 && (
            <section className="admin-cohort__block">
              <h2>Recent food logs</h2>
              <ul className="admin-cohort__logs">
                {summary.recent_logs.map((l) => (
                  <li key={l.id}>
                    <span className="admin-cohort__logMeta">{formatWhen(l.logged_at)} · {l.email}</span>
                    <span className="admin-cohort__logDesc">{l.description}</span>
                    {l.recipe_title ? <span className="admin-cohort__logRecipe">{l.recipe_title}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )
}

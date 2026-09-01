import { useEffect, useRef, useState } from 'react'
import MealPlanDisplay from './MealPlanDisplay'
import './PlanLibrary.css'

function fmtPrice(p) {
  return (Number(p) || 0).toFixed(2)
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return ''
  }
}

export default function PlanLibrary({
  playlists,
  activePlaylist,
  onSelectPlaylist,
  onCreatePlaylist,
  onDeletePlaylist,
  onSharePlaylist,
  onUnsharePlaylist,
  onPrintBook,
  onRemoveTrack,
  onMoveTrack,
  onOpenTrack,
  plans,
  activePlanId,
  onSelectPlan,
  loading,
  expandedPlan,
  expandedLoading,
  onRemix,
  onSharePlan,
  onUnsharePlan,
  onAddToList,
  shareBusy,
  shareUrlForPlan,
  shareUrlForPlaylist,
}) {
  const expandRef = useRef(null)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    if ((activePlaylist || activePlanId != null) && expandRef.current) {
      expandRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activePlaylist, activePlanId])

  return (
    <div className="plan-library plan-library--hero">
      <div className="plan-library__header">
        <p className="plan-library__label">Your recipe books</p>
        <h2 className="plan-library__title">Books you actually own</h2>
        <p className="plan-library__subtitle">
          Dishes you made, and classics you adapted. Keep a book private, share it, or publish it for anyone to cook from.
        </p>
      </div>

      <form
        className="plan-library__create"
        onSubmit={(e) => {
          e.preventDefault()
          const title = newTitle.trim()
          if (!title) return
          onCreatePlaylist?.(title)
          setNewTitle('')
        }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New recipe book — Five dinners under £40"
          aria-label="New recipe book name"
          disabled={loading}
        />
        <button type="submit" className="btn btn--primary" disabled={loading || !newTitle.trim()}>
          New recipe book
        </button>
      </form>

      {!playlists?.length && !loading && (
        <p className="plan-library__empty">
          Keep a dish tonight. Then put it in your first recipe book.
        </p>
      )}

      {!!playlists?.length && (
        <ul className="plan-library__grid">
          {playlists.map((list) => {
            const active = activePlaylist?.id === list.id
            return (
              <li key={list.id} className={`plan-library__card ${active ? 'plan-library__card--on' : ''}`}>
                <button
                  type="button"
                  className="plan-library__cardBtn"
                  onClick={() => onSelectPlaylist?.(list.id)}
                  disabled={loading}
                  aria-expanded={active}
                >
                  <span className="plan-library__cardCopy">
                    <span className="plan-library__itemName">{list.title}</span>
                    <span className="plan-library__itemMeta">
                      {list.is_public ? 'Public · ' : ''}
                      {list.tracks_count ?? 0} {(list.tracks_count ?? 0) === 1 ? 'dish' : 'dishes'}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {activePlaylist && (
        <div className="plan-library__expand plan-library__expand--list" ref={expandRef}>
          <div className="plan-library__listHead">
            <div>
              <p className="plan-library__label">{activePlaylist.kind === 'liked' ? 'Always here' : 'Recipe book'}</p>
              <h3 className="plan-library__listTitle">{activePlaylist.title}</h3>
              {activePlaylist.blurb && <p className="plan-library__subtitle">{activePlaylist.blurb}</p>}
            </div>
            <div className="plan-library__listActions">
              {activePlaylist.is_public ? (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    disabled={shareBusy}
                    onClick={() => onSharePlaylist?.(activePlaylist.id)}
                  >
                    {shareBusy ? 'Working…' : 'Copy / share book'}
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost"
                    disabled={shareBusy}
                    onClick={() => onUnsharePlaylist?.(activePlaylist.id)}
                  >
                    Make private
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn--primary"
                  disabled={shareBusy}
                  onClick={() => onSharePlaylist?.(activePlaylist.id)}
                >
                  {shareBusy ? 'Publishing…' : 'Share or publish this book'}
                </button>
              )}
              {activePlaylist.kind !== 'liked' && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={loading}
                  onClick={() => onDeletePlaylist?.(activePlaylist.id)}
                >
                  Delete list
                </button>
              )}
              {onPrintBook && activePlaylist.kind !== 'liked' && (
                <button
                  type="button"
                  className="btn btn--ghost"
                  disabled={loading || !activePlaylist.tracks?.length}
                  onClick={() => onPrintBook(activePlaylist)}
                >
                  Print book
                </button>
              )}
            </div>
          </div>
          {activePlaylist.is_public && shareUrlForPlaylist?.(activePlaylist) && (
            <p className="plan-library__shareUrl">{shareUrlForPlaylist(activePlaylist)}</p>
          )}
          {!activePlaylist.tracks?.length && (
            <p className="plan-library__empty">This list is empty. Keep a dish, then add it here.</p>
          )}
          {!!activePlaylist.tracks?.length && (
            <ol className="plan-library__tracks">
              {activePlaylist.tracks.map((track, index) => (
                <li key={track.meal_plan_id} className="plan-library__track">
                  <button
                    type="button"
                    className="plan-library__trackMain"
                    onClick={() => onOpenTrack?.(track.meal_plan_id)}
                  >
                    <span>
                      <span className="plan-library__itemName">{track.plan_name}</span>
                      <span className="plan-library__itemMeta">
                        {track.servings != null ? `${track.servings} servings` : ''}
                        {track.total_estimated_cost != null ? ` · £${fmtPrice(track.total_estimated_cost)}` : ''}
                      </span>
                    </span>
                  </button>
                  <div className="plan-library__trackTools">
                    <button
                      type="button"
                      className="plan-library__tiny"
                      disabled={index === 0 || loading}
                      onClick={() => onMoveTrack?.(activePlaylist.id, track.meal_plan_id, -1)}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      className="plan-library__tiny"
                      disabled={index === activePlaylist.tracks.length - 1 || loading}
                      onClick={() => onMoveTrack?.(activePlaylist.id, track.meal_plan_id, 1)}
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      className="plan-library__tiny"
                      disabled={loading}
                      onClick={() => onRemoveTrack?.(activePlaylist.id, track.meal_plan_id)}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      <div className="plan-library__header plan-library__header--dishes">
        <p className="plan-library__label">Dishes</p>
        <h3 className="plan-library__listTitle">Everything you kept</h3>
      </div>

      {!plans?.length && !loading && (
        <p className="plan-library__empty">No saved dishes yet. Chat, cook, then keep one in a book.</p>
      )}

      {!!plans?.length && (
        <ul className="plan-library__list">
          {plans.map((plan) => {
            const active = activePlanId === plan.id
            return (
              <li
                key={plan.id}
                className={`plan-library__row ${active ? 'plan-library__row--active' : ''}`}
              >
                <button
                  type="button"
                  className={`plan-library__item ${active ? 'plan-library__item--active' : ''}`}
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={loading}
                  aria-expanded={active}
                >
                  <span className="plan-library__itemTop">
                    <span className="plan-library__itemName">{plan.plan_name || 'Untitled recipe'}</span>
                    <span className="plan-library__chevron" aria-hidden="true">
                      {active ? 'Close' : 'Open'}
                    </span>
                  </span>
                  <span className="plan-library__itemMeta">
                    {plan.is_public ? 'Public · ' : ''}
                    {plan.created_at ? fmtDate(plan.created_at) : ''}
                    {plan.total_estimated_cost != null ? ` · £${fmtPrice(plan.total_estimated_cost)}` : ''}
                  </span>
                </button>

                {active && (
                  <div className="plan-library__expand">
                    {expandedLoading && !expandedPlan && (
                      <p className="plan-library__expandLoading">Opening recipe…</p>
                    )}
                    {expandedPlan && (
                      <MealPlanDisplay
                        mealPlan={expandedPlan}
                        alreadySaved
                        embedded
                        onRemix={onRemix}
                        onShare={onSharePlan ? () => onSharePlan(plan.id) : undefined}
                        onUnshare={onUnsharePlan ? () => onUnsharePlan(plan.id) : undefined}
                        onAddToList={onAddToList ? () => onAddToList(plan.id) : undefined}
                        shareBusy={shareBusy}
                        isPublic={Boolean(plan.is_public || expandedPlan.is_public)}
                        shareUrl={shareUrlForPlan?.(plan)}
                      />
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

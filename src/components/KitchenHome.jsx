import { INSPIRATIONS } from '../data/inspirations'
import './KitchenHome.css'

export default function KitchenHome({
  hideHero,
  query,
  onQuery,
  onCook,
  loading,
  onPickMood,
  activeMood,
  children,
}) {
  return (
    <div className="kitchen-home">
      {!hideHero && (
        <section className="kitchen-home__hero" aria-label="What’s for dinner">
          <div className="kitchen-home__heroMedia" aria-hidden="true">
            <img
              className="kitchen-home__heroImg"
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2400&q=80"
              alt=""
            />
            <div className="kitchen-home__heroShade" />
          </div>
          <div className="kitchen-home__heroContent">
            <p className="kitchen-home__heroLabel">Your personal kitchen</p>
            <h1 className="kitchen-home__heroTitle">
              Start with a trusted dish.<br />
              <em>Make it work tonight.</em>
            </h1>
            <p className="kitchen-home__heroBody">
              Search the shelf or describe your time, budget, pantry and household.
            </p>
            <form
              className="kitchen-home__compose"
              onSubmit={(e) => {
                e.preventDefault()
                onCook?.()
              }}
            >
              <input
                className="kitchen-home__search"
                type="search"
                value={query}
                onChange={(e) => onQuery?.(e.target.value)}
                placeholder="Carbonara, leftover chicken, dinner under £10…"
                aria-label="What’s for dinner"
                disabled={loading}
              />
              <button
                type="submit"
                className="btn kitchen-home__cookBtn"
                disabled={loading || !String(query || '').trim()}
              >
                {loading ? 'Cooking…' : 'Cook tonight'}
              </button>
            </form>
          </div>
        </section>
      )}

      {!hideHero && (
        <section className="kitchen-home__browseIntro" aria-labelledby="moods-heading">
          <p className="kitchen-home__browseLabel">Or pick a mood</p>
          <h2 id="moods-heading" className="kitchen-home__browseTitle">
            Choose a trusted starting point.
          </h2>
          <p className="kitchen-home__browseBody">
            Open a foundation recipe, then keep it faithful or adapt it to your kitchen.
          </p>
          <ul className="kitchen-home__grid">
            {INSPIRATIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`kitchen-home__tile ${activeMood === item.id ? 'kitchen-home__tile--on' : ''}`}
                  disabled={loading}
                  onClick={() => onPickMood?.(item)}
                >
                  <span className="kitchen-home__tileMedia" aria-hidden="true">
                    <img src={item.image} alt="" />
                    <span className="kitchen-home__tileShade" />
                    <span className="kitchen-home__tileOnImage">
                      <span className="kitchen-home__tileTitle">{item.title}</span>
                      <span className="kitchen-home__tileBlurb">{item.blurb}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children}
    </div>
  )
}

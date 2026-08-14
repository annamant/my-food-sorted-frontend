import './KitchenHome.css'

export default function KitchenHome({ hideHero, children }) {
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
            <p className="kitchen-home__heroLabel">Tonight</p>
            <h1 className="kitchen-home__heroTitle">
              What’s for<br />
              <em>dinner?</em>
            </h1>
            <p className="kitchen-home__heroBody">
              Search a recipe, or create one. Set your filters first.
            </p>
          </div>
        </section>
      )}

      {children}
    </div>
  )
}

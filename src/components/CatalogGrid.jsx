import './CatalogGrid.css'

export default function CatalogGrid({ dishes, onPick, title, empty }) {
  if (!dishes?.length) {
    return empty || null
  }
  return (
    <section className="catalog-grid" aria-label={title || 'Dishes'}>
      {title && <h2 className="catalog-grid__title">{title}</h2>}
      <ul className="catalog-grid__list">
        {dishes.map((d) => (
          <li key={d.id}>
            <button type="button" className="catalog-grid__card" onClick={() => onPick(d)}>
              <span className="catalog-grid__photo" aria-hidden="true">
                <img src={d.image} alt="" />
              </span>
              <span className="catalog-grid__copy">
                <span className="catalog-grid__name">{d.title}</span>
                <span className="catalog-grid__blurb">{d.blurb}</span>
                <span className="catalog-grid__meta">
                  {d.mealPlan?.recipes?.[0]?.cook_time
                    ? `${(d.mealPlan.recipes[0].prep_time || 0) + d.mealPlan.recipes[0].cook_time} min`
                    : ''}
                  {d.mealPlan?.recipes?.[0]?.estimated_cost != null
                    ? ` · £${Number(d.mealPlan.recipes[0].estimated_cost).toFixed(2)}`
                    : ''}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

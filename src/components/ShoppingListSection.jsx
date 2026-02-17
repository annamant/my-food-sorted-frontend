import { useMemo } from 'react'
import './ShoppingListSection.css'

function fmtPrice(p) {
  return (Number(p) ?? 0).toFixed(2)
}

function itemKey(item, i) {
  return item.id ?? `${item.ingredient_name}-${item.category ?? 'other'}-${i}`
}

export default function ShoppingListSection({
  shoppingList,
  savedPlanId,
  retailer,
  setRetailer,
  onGenerate,
  onShopNow,
  loading,
}) {
  const byCategory = useMemo(() => {
    if (!shoppingList?.items?.length) return null
    return shoppingList.items.reduce((acc, item) => {
      const c = item.category || 'Other'
      if (!acc[c]) acc[c] = []
      acc[c].push(item)
      return acc
    }, {})
  }, [shoppingList])

  return (
    <>
      {savedPlanId && (
        <section className="shopping-list-section shopping-list-section--generate" aria-label="Generate shopping list">
          <h2 className="shopping-list-section__title">Shopping List</h2>
          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="btn btn--primary"
          >
            Generate Shopping List
          </button>
        </section>
      )}

      {shoppingList && (
        <section className="shopping-list-section" aria-labelledby="shopping-list-heading">
          <h2 id="shopping-list-heading" className="shopping-list-section__title">
            Shopping List (Total: £{fmtPrice(shoppingList.total_cost)})
          </h2>
          {byCategory && (
            <div className="shopping-list-section__categories">
              {Object.entries(byCategory).map(([cat, items]) => (
                <div key={cat} className="shopping-list-section__category">
                  <h3 className="shopping-list-section__categoryTitle">{cat}</h3>
                  <ul className="shopping-list-section__list">
                    {items.map((item, i) => (
                      <li key={itemKey(item, i)} className="shopping-list-section__item">
                        {item.ingredient_name} – {item.quantity} {item.unit || ''} (£{fmtPrice(item.estimated_price)})
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          <div className="shopping-list-section__retailer">
            <h3 className="shopping-list-section__retailerTitle">Supermarket</h3>
            <div className="shopping-list-section__retailerButtons">
              <button
                type="button"
                onClick={() => setRetailer('tesco')}
                className={`btn btn--retailer ${retailer === 'tesco' ? 'btn--retailerActive' : ''}`}
              >
                Tesco
              </button>
              <button
                type="button"
                onClick={() => setRetailer('sainsburys')}
                className={`btn btn--retailer ${retailer === 'sainsburys' ? 'btn--retailerActive' : ''}`}
              >
                Sainsbury&apos;s
              </button>
              <button type="button" onClick={onShopNow} className="btn btn--primary">
                Shop Now
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  )
}

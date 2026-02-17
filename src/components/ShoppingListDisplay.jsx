import { useMemo } from 'react'
import './ShoppingListDisplay.css'

function fmtPrice(p) {
  return (Number(p) ?? 0).toFixed(2)
}

function itemKey(item, i) {
  return item.id ?? `${item.ingredient_name}-${item.category ?? 'other'}-${i}`
}

function ShoppingListDisplay({
  shoppingList,
  generateShoppingList,
  shopNow,
  retailer,
  setRetailer,
  loading,
  savedPlanId,
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

  // Show "Generate" only when we have a saved plan but no list yet
  if (savedPlanId && !shoppingList) {
    return (
      <div className="shopping-list-display">
        <h2 className="shopping-list-display__title">Shopping List</h2>
        <button
          type="button"
          onClick={generateShoppingList}
          disabled={loading}
          className="btn btn--primary"
        >
          Generate Shopping List
        </button>
      </div>
    )
  }

  if (!shoppingList) return null

  return (
    <div className="shopping-list-display">
      <h2 className="shopping-list-display__title">
        Shopping List (Total: £{fmtPrice(shoppingList.total_cost)})
      </h2>
      <button
        type="button"
        onClick={generateShoppingList}
        disabled={loading}
        className="btn btn--primary shopping-list-display__generateBtn"
      >
        Generate Shopping List
      </button>

      {byCategory &&
        Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="shopping-list-display__category">
            <h3 className="shopping-list-display__categoryTitle">{cat}</h3>
            <ul className="shopping-list-display__list">
              {items.map((item, i) => (
                <li key={itemKey(item, i)} className="shopping-list-display__item">
                  {item.ingredient_name} – {item.quantity} {item.unit || ''} (£
                  {fmtPrice(item.estimated_price)})
                </li>
              ))}
            </ul>
          </div>
        ))}

      <div className="shopping-list-display__retailer">
        <h3 className="shopping-list-display__retailerTitle">Supermarket</h3>
        <div className="shopping-list-display__retailerButtons">
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
          <button type="button" onClick={shopNow} className="btn btn--success">
            Shop Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default ShoppingListDisplay

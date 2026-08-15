import { useMemo, useState } from 'react'
import './ShoppingListDisplay.css'

function fmtPrice(p) {
  return (Number(p) || 0).toFixed(2)
}

function formatItemLine(item) {
  const qty = item.quantity != null ? `${item.quantity} ` : ''
  const unit = item.unit ? `${item.unit} ` : ''
  return `${item.ingredient_name} — ${qty}${unit}`.trim()
}

function ShoppingListDisplay({
  shoppingList,
  generateShoppingList,
  loading,
  onToggleItem,
  onClearChecks,
  onOpenRetailer,
  preferredRetailer = 'tesco',
}) {
  const [copyMsg, setCopyMsg] = useState('')

  const grouped = useMemo(() => {
    if (!shoppingList?.items?.length) return null
    return shoppingList.items.reduce((acc, item) => {
      const cat = item.category || 'Other'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(item)
      return acc
    }, {})
  }, [shoppingList])

  const checkedCount = shoppingList?.items?.filter((i) => i.checked).length ?? 0
  const totalCount = shoppingList?.items?.length ?? 0

  const copyList = async () => {
    if (!shoppingList?.items?.length) return
    const text = shoppingList.items
      .map((item) => `${item.checked ? '[x]' : '[ ]'} ${formatItemLine(item)}`)
      .join('\n')
    try {
      await navigator.clipboard.writeText(text)
      setCopyMsg('Copied')
      setTimeout(() => setCopyMsg(''), 2000)
    } catch {
      setCopyMsg('Copy failed')
      setTimeout(() => setCopyMsg(''), 2000)
    }
  }

  return (
    <div className="shopping-list-display">
      <p className="shopping-list-display__label">From recipe to shop</p>
      <h2 className="shopping-list-display__title">Your shopping list</h2>
      <p className="shopping-list-display__lede">
        Everything from this dish or playlist, combined into one practical list.
      </p>

      <div className="shopping-list-display__actions">
        {shoppingList ? (
          <button
            type="button"
            onClick={generateShoppingList}
            disabled={loading}
            className="btn btn--ghost"
          >
            Refresh list
          </button>
        ) : (
          <button
            type="button"
            onClick={generateShoppingList}
            disabled={loading}
            className="btn btn--primary"
          >
            {loading ? 'Building…' : 'Build ingredient list'}
          </button>
        )}

        {shoppingList && (
          <>
            <button
              type="button"
              onClick={copyList}
              disabled={loading || !totalCount}
              className="btn btn--ghost"
            >
              {copyMsg || 'Copy list'}
            </button>
            <button
              type="button"
              onClick={onClearChecks}
              disabled={loading || checkedCount === 0}
              className="btn btn--ghost"
            >
              Clear checks
            </button>
          </>
        )}
      </div>

      {shoppingList && totalCount > 0 && (
        <p className="shopping-list-display__progress">
          {checkedCount} of {totalCount} checked
          {shoppingList.total_cost != null && (
            <span> · est. £{fmtPrice(shoppingList.total_cost)}</span>
          )}
        </p>
      )}

      {grouped && Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="shopping-list-display__category">
          <h3 className="shopping-list-display__categoryTitle">{cat}</h3>
          <ul className="shopping-list-display__list">
            {items.map((item, i) => (
              <li
                key={item.id ?? i}
                className={`shopping-list-display__item ${item.checked ? 'shopping-list-display__item--checked' : ''}`}
              >
                <label className="shopping-list-display__checkLabel">
                  <input
                    type="checkbox"
                    checked={Boolean(item.checked)}
                    disabled={loading || item.id == null}
                    onChange={() => onToggleItem?.(item)}
                  />
                  <span>
                    {item.ingredient_name} — {item.quantity} {item.unit}
                    {item.estimated_price != null && (
                      <span className="shopping-list-display__price">
                        {' '}(£{fmtPrice(item.estimated_price)})
                      </span>
                    )}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {shoppingList && totalCount > 0 && (
        <div className="shopping-list-display__retailers">
          <div>
            <h3>Ready to shop?</h3>
            <p>Keep this list open while you shop with your preferred supermarket.</p>
          </div>
          <div className="shopping-list-display__retailerActions">
            {[
              { id: 'tesco', label: 'Tesco' },
              { id: 'sainsburys', label: 'Sainsbury’s' },
            ].map((retailer) => (
              <button
                key={retailer.id}
                type="button"
                className={`btn ${preferredRetailer === retailer.id ? 'btn--retailerActive' : 'btn--retailer'}`}
                onClick={() => onOpenRetailer?.(retailer.id)}
              >
                Open {retailer.label}
                {preferredRetailer === retailer.id ? ' · preferred' : ''}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="shopping-list-display__footnote">
        Retailer availability and product matching vary. You stay in control of
        what enters your basket and complete your purchase with the retailer.
      </p>
    </div>
  )
}

export default ShoppingListDisplay

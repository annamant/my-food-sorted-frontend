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
      <h2 className="shopping-list-display__title">Ingredients</h2>
      <p className="shopping-list-display__lede">
        A cook’s checklist for this recipe — copy it, tick it off, take it to any shop you like.
        When you’ve remixed a dish for your budget, this list is what makes it real.
      </p>

      <div className="shopping-list-display__actions">
        <button
          type="button"
          onClick={generateShoppingList}
          disabled={loading}
          className="btn btn--primary"
        >
          {shoppingList ? 'Refresh ingredients' : 'Build ingredient list'}
        </button>

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

      <p className="shopping-list-display__footnote">
        No basket checkout here — this is your recipe library. When you’re ready to buy,
        open{' '}
        <a href="https://www.tesco.com" target="_blank" rel="noopener noreferrer">Tesco</a>
        {' '}or{' '}
        <a href="https://www.sainsburys.co.uk" target="_blank" rel="noopener noreferrer">Sainsbury’s</a>
        {' '}with this list beside you.
      </p>
    </div>
  )
}

export default ShoppingListDisplay

import { useCallback, useEffect, useMemo, useState } from 'react'
import { RETAILERS, getRetailerById } from '../data/retailers'
import {
  findFirstUncheckedIndex,
  findNextUncheckedIndex,
  formatShopItemLabel,
  getSearchTermsForItem,
  hasLaunchedShopWindow,
  isDesktopShopLayout,
  navigateShopWindow,
  openRetailerCheckout,
  openShopWindow,
  shopPositionLabel,
  buildShopSearchLink,
  SHOP_WINDOW_NAME,
} from '../data/shopMode'
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
  onSetPreferredRetailer,
  preferredRetailer = 'tesco',
}) {
  const [copyMsg, setCopyMsg] = useState('')
  const [shopMode, setShopMode] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [showShopDrawer, setShowShopDrawer] = useState(false)
  const [shopWindowBlocked, setShopWindowBlocked] = useState(false)
  const [shopWindowReady, setShopWindowReady] = useState(false)
  const [activeSearchTerm, setActiveSearchTerm] = useState('')

  const items = shoppingList?.items ?? []
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null
  const preferredLabel = getRetailerById(preferredRetailer).label
  const shopComplete = shopMode && activeIndex < 0 && items.length > 0
  const searchTerms = useMemo(
    () => (activeItem ? getSearchTermsForItem(activeItem) : []),
    [activeItem]
  )

  useEffect(() => {
    if (!activeItem) return
    const terms = getSearchTermsForItem(activeItem)
    setActiveSearchTerm(terms[0] || activeItem.ingredient_name)
  }, [activeItem?.id, activeItem?.ingredient_name])

  useEffect(() => {
    if (!shopMode) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowShopDrawer(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [shopMode])

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

  const openSearchForItem = useCallback((index, retailerId, termOverride) => {
    const item = items[index]
    if (!item) return false
    const term = termOverride || getSearchTermsForItem(item)[0] || item.ingredient_name
    setActiveSearchTerm(term)
    const opened = navigateShopWindow(retailerId, term)
    const ready = Boolean(opened) || hasLaunchedShopWindow()
    setShopWindowReady(ready)
    setShopWindowBlocked(!opened)
    return Boolean(opened)
  }, [items])

  const startShopping = useCallback((retailerId) => {
    onSetPreferredRetailer?.(retailerId)
    const idx = findFirstUncheckedIndex(items)
    if (idx < 0) {
      setCopyMsg('All items checked')
      setTimeout(() => setCopyMsg(''), 2000)
      return
    }
    setShopMode(true)
    setShowShopDrawer(false)
    setActiveIndex(idx)
    openSearchForItem(idx, retailerId)
  }, [items, onSetPreferredRetailer, openSearchForItem])

  const goToItem = useCallback((index) => {
    if (index < 0 || !items[index]) return
    setActiveIndex(index)
    openSearchForItem(index, preferredRetailer)
    setShowShopDrawer(false)
  }, [items, preferredRetailer, openSearchForItem])

  const handleGotIt = useCallback(async () => {
    if (!activeItem || activeIndex < 0) return
    if (!activeItem.checked) await onToggleItem?.(activeItem)
    const next = findNextUncheckedIndex(items, activeIndex)
    if (next < 0) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex(next)
    openSearchForItem(next, preferredRetailer)
  }, [activeItem, activeIndex, items, onToggleItem, preferredRetailer, openSearchForItem])

  const handleSkip = useCallback(() => {
    const next = findNextUncheckedIndex(items, activeIndex)
    if (next < 0) {
      setActiveIndex(-1)
      return
    }
    setActiveIndex(next)
    openSearchForItem(next, preferredRetailer)
  }, [activeIndex, items, preferredRetailer, openSearchForItem])

  const handleSearchTerm = useCallback((term) => {
    if (!activeItem || activeIndex < 0) return
    setActiveSearchTerm(term)
    const opened = navigateShopWindow(preferredRetailer, term)
    setShopWindowReady(Boolean(opened) || hasLaunchedShopWindow())
    setShopWindowBlocked(!opened)
  }, [activeItem, activeIndex, preferredRetailer])

  const endShopping = useCallback(() => {
    setShopMode(false)
    setShowShopDrawer(false)
    setActiveIndex(-1)
    setShopWindowBlocked(false)
    setShopWindowReady(false)
  }, [])

  const flatItems = items

  return (
    <div className="shopping-list-display">
      <p className="shopping-list-display__label">From recipe to shop</p>
      <h2 className="shopping-list-display__title">Your shopping list</h2>
      <p className="shopping-list-display__lede">
        Shop this list yourself, or send it to Tesco or Sainsbury’s to deliver. Combined from this dish or recipe book.
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

      {grouped && Object.entries(grouped).map(([cat, categoryItems]) => (
        <div key={cat} className="shopping-list-display__category">
          <h3 className="shopping-list-display__categoryTitle">{cat}</h3>
          <ul className="shopping-list-display__list">
            {categoryItems.map((item) => {
              const itemIndex = flatItems.findIndex((entry, entryIndex) => (
                entry === item
                || (entry.id != null && entry.id === item.id)
                || (
                  entry.id == null
                  && item.id == null
                  && entry.ingredient_name === item.ingredient_name
                  && entry.unit === item.unit
                  && entry.quantity === item.quantity
                  && flatItems.slice(0, entryIndex).every((earlier) => (
                    earlier.ingredient_name !== item.ingredient_name
                    || earlier.unit !== item.unit
                    || earlier.quantity !== item.quantity
                  ))
                )
              ))
              const resolvedIndex = itemIndex >= 0 ? itemIndex : flatItems.indexOf(item)
              const isActive = shopMode && resolvedIndex === activeIndex
              return (
                <li
                  key={item.id ?? `${cat}-${item.ingredient_name}`}
                  className={`shopping-list-display__item ${item.checked ? 'shopping-list-display__item--checked' : ''} ${isActive ? 'shopping-list-display__item--active' : ''}`}
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
                  {shopMode && !item.checked && (
                    <button
                      type="button"
                      className="shopping-list-display__jumpBtn"
                      onClick={() => goToItem(resolvedIndex)}
                    >
                      Shop this
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}

      {shoppingList && totalCount > 0 && !shopMode && (
        <div className="shopping-list-display__retailers">
          <div>
            <h3>Shop at your supermarket</h3>
            <p>
              Walk through your list one ingredient at a time. Pick your supermarket, then we open search for each item. You choose products and checkout there.
            </p>
          </div>
          <div className="shopping-list-display__retailerBlock">
            <div className="shopping-list-display__retailerActions">
              {RETAILERS.map((retailer) => (
                <button
                  key={retailer.id}
                  type="button"
                  className={`btn ${preferredRetailer === retailer.id ? 'btn--primary' : 'btn--retailer'}`}
                  onClick={() => startShopping(retailer.id)}
                  disabled={loading}
                >
                  Shop at {retailer.label}
                </button>
              ))}
            </div>
            <p className="shopping-list-display__shopHint">
              {isDesktopShopLayout()
                ? 'Opens a shop window beside this page on desktop.'
                : 'Opens your supermarket in a new tab. Switch back here to tap Got it for the next item.'}
            </p>
            {onOpenRetailer && (
              <div className="shopping-list-display__manualShop">
                <p className="shopping-list-display__manualShopLabel">
                  Prefer to shop the whole list yourself?
                </p>
                <div className="shopping-list-display__manualShopActions">
                  {RETAILERS.map((retailer) => (
                    <button
                      key={`manual-${retailer.id}`}
                      type="button"
                      className="btn btn--link"
                      onClick={() => onOpenRetailer?.(retailer.id)}
                      disabled={loading}
                    >
                      Open {retailer.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {shopMode && (
        <div className="shopping-list-display__shopActive">
          <p>
            Guided shopping at {preferredLabel}.
            {shopWindowReady ? ' Your shop window is open.' : ' Open the shop window to search each item.'}
          </p>
          <button type="button" className="btn btn--ghost" onClick={endShopping}>
            Done shopping
          </button>
        </div>
      )}

      <p className="shopping-list-display__footnote">
        Retailer availability and product matching vary. You stay in control of
        what enters your basket and complete your purchase with the retailer.
      </p>

      {shopMode && (
        <>
          <div
            className="shop-mode-bar"
            role="region"
            aria-label="Guided shopping"
          >
            {shopComplete ? (
              <>
                <div className="shop-mode-bar__main">
                  <p className="shop-mode-bar__label">List complete</p>
                  <p className="shop-mode-bar__item">Open checkout at {preferredLabel} when you are ready.</p>
                </div>
                <div className="shop-mode-bar__actions">
                  <button
                    type="button"
                    className="btn btn--ghost shop-mode-bar__listBtn"
                    onClick={() => setShowShopDrawer(true)}
                  >
                    View list
                  </button>
                  <button
                    type="button"
                    className="btn btn--success"
                    onClick={() => openRetailerCheckout(preferredRetailer)}
                  >
                    Checkout
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={endShopping}>
                    Done
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="shop-mode-bar__main">
                  <p className="shop-mode-bar__label">Shopping for</p>
                  <p className="shop-mode-bar__item">{formatShopItemLabel(activeItem)}</p>
                  {searchTerms.length > 1 && (
                    <div className="shop-mode-bar__terms">
                      {searchTerms.map((term) => (
                        <button
                          key={term}
                          type="button"
                          className={`shop-mode-bar__term ${term === activeSearchTerm ? 'shop-mode-bar__term--active' : ''}`}
                          onClick={() => handleSearchTerm(term)}
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  )}
                  {shopWindowBlocked && activeSearchTerm && (
                    <a
                      className="shop-mode-bar__reopen"
                      href={buildShopSearchLink(preferredRetailer, activeSearchTerm)}
                      target={SHOP_WINDOW_NAME}
                      rel="noopener"
                      onClick={() => {
                        setShopWindowBlocked(false)
                        setShopWindowReady(true)
                      }}
                    >
                      Tap to open this search in {preferredLabel}
                    </a>
                  )}
                </div>
                <div className="shop-mode-bar__actions">
                  <button
                    type="button"
                    className="btn btn--ghost shop-mode-bar__listBtn"
                    onClick={() => setShowShopDrawer(true)}
                  >
                    {shopPositionLabel(items, activeIndex)}
                  </button>
                  <button type="button" className="btn btn--secondary" onClick={handleSkip}>
                    Skip
                  </button>
                  <button type="button" className="btn btn--success" onClick={handleGotIt}>
                    Got it
                  </button>
                </div>
              </>
            )}
          </div>

          {showShopDrawer && (
            <div className="shop-mode-drawer" role="dialog" aria-modal="true" aria-label="Shopping list">
              <div className="shop-mode-drawer__backdrop" onClick={() => setShowShopDrawer(false)} />
              <div className="shop-mode-drawer__panel">
                <div className="shop-mode-drawer__header">
                  <h3>Your shopping list</h3>
                  <button type="button" className="shop-mode-drawer__close" onClick={() => setShowShopDrawer(false)}>
                    Close
                  </button>
                </div>
                <ul className="shop-mode-drawer__list">
                  {items.map((item, index) => (
                    <li
                      key={item.id ?? index}
                      className={`shop-mode-drawer__item ${item.checked ? 'shop-mode-drawer__item--checked' : ''} ${index === activeIndex ? 'shop-mode-drawer__item--active' : ''}`}
                    >
                      <button
                        type="button"
                        className="shop-mode-drawer__row"
                        onClick={() => {
                          if (!item.checked) goToItem(index)
                        }}
                        disabled={item.checked}
                      >
                        <span className="shop-mode-drawer__status">{item.checked ? '✓' : '○'}</span>
                        <span className="shop-mode-drawer__text">{formatShopItemLabel(item)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="btn btn--primary shop-mode-drawer__continue"
                  onClick={() => setShowShopDrawer(false)}
                >
                  Continue shopping
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ShoppingListDisplay

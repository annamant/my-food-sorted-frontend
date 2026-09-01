import { buildRetailerSearchUrl, getRetailerById } from './retailers'

export const SHOP_WINDOW_NAME = 'my-food-sorted-shop'

export function isDesktopShopLayout() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(min-width: 768px)').matches
}

function shopWindowFeatures() {
  return isDesktopShopLayout()
    ? 'popup=yes,width=440,height=900,left=80,top=0,scrollbars=yes,resizable=yes'
    : undefined
}

export function formatShopItemLabel(item) {
  if (!item) return ''
  const parts = []
  if (item.quantity != null && item.quantity !== '') parts.push(String(item.quantity))
  if (item.unit) parts.push(String(item.unit))
  const name = String(item.ingredient_name || '').trim()
  if (name) parts.push(name)
  return parts.join(' ')
}

export function getSearchTermsForItem(item) {
  const raw = String(item?.ingredient_name || '').trim()
  if (!raw) return []
  const lower = raw.toLowerCase()
  const terms = [raw]

  if (lower.includes('ground beef')) {
    terms.push('lean beef mince', 'beef mince')
  }
  if (lower.includes('ground lamb')) terms.push('lamb mince')
  if (lower.includes('ground turkey')) terms.push('turkey mince')
  if (lower.includes('ground pork')) terms.push('pork mince')
  if (lower.includes('zucchini')) terms.push('courgette')
  if (lower.includes('cilantro')) terms.push('coriander')
  if (lower.includes('eggplant')) terms.push('aubergine')
  if (lower.includes('scallion')) terms.push('spring onion')
  if (lower.includes('heavy cream')) terms.push('double cream')
  if (lower.includes('half and half')) terms.push('single cream')
  if (lower.includes('garlic powder')) terms.push('garlic granules')
  if (lower.includes('salmon fillet')) terms.push('salmon fillet', 'salmon')
  if (lower.includes('cooked rice')) terms.push('microwave rice', 'basmati rice')

  const seen = new Set()
  return terms
    .filter((term) => {
      const key = term.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 3)
}

export function findFirstUncheckedIndex(items) {
  if (!Array.isArray(items)) return -1
  return items.findIndex((item) => !item.checked)
}

export function findNextUncheckedIndex(items, afterIndex = -1) {
  if (!Array.isArray(items)) return -1
  for (let i = afterIndex + 1; i < items.length; i++) {
    if (!items[i].checked) return i
  }
  return -1
}

export function shopPositionLabel(items, activeIndex) {
  if (activeIndex < 0 || !Array.isArray(items) || !items.length) return null
  return `${activeIndex + 1} / ${items.length}`
}

let shopWindowRef = null
let shopWindowLaunched = false

export function hasLaunchedShopWindow() {
  return shopWindowLaunched
}

export function getShopWindow() {
  if (shopWindowRef && !shopWindowRef.closed) return shopWindowRef
  shopWindowRef = null
  return null
}

/**
 * Open or navigate the shop window. Always targets the named window so Tesco
 * can sever opener links (COOP) without breaking later ingredient searches.
 */
export function openShopWindow(retailerId, searchQuery) {
  const url = buildRetailerSearchUrl(retailerId, searchQuery)
  const features = shopWindowFeatures()
  let w = null

  try {
    w = features
      ? window.open(url, SHOP_WINDOW_NAME, features)
      : window.open(url, SHOP_WINDOW_NAME)
  } catch {
    w = null
  }

  if (w) {
    shopWindowRef = w
    shopWindowLaunched = true
    try {
      w.focus()
    } catch {
      /* ignore */
    }
    return w
  }

  // Fallback: reuse JS reference if the named open was blocked but we still hold the window.
  const existing = getShopWindow()
  if (!existing) return null

  try {
    existing.location.href = url
    existing.focus()
    shopWindowLaunched = true
    return existing
  } catch {
    return null
  }
}

export function navigateShopWindow(retailerId, searchQuery) {
  return openShopWindow(retailerId, searchQuery)
}

export function closeShopWindow() {
  const w = getShopWindow()
  if (w) w.close()
  shopWindowRef = null
  shopWindowLaunched = false
}

export function openRetailerCheckout(retailerId) {
  const retailer = getRetailerById(retailerId)
  const url = retailer.checkoutUrl
  const features = shopWindowFeatures()
  let w = null

  try {
    w = features
      ? window.open(url, SHOP_WINDOW_NAME, features)
      : window.open(url, SHOP_WINDOW_NAME)
  } catch {
    w = null
  }

  if (w) {
    shopWindowRef = w
    shopWindowLaunched = true
    try {
      w.focus()
    } catch {
      /* ignore */
    }
  }
}

export function buildShopSearchLink(retailerId, searchQuery) {
  return buildRetailerSearchUrl(retailerId, searchQuery)
}

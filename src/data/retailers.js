export const RETAILERS = [
  {
    id: 'tesco',
    label: 'Tesco',
    checkoutUrl: 'https://www.tesco.com/groceries/en-GB/trolley',
    buildSearchUrl(query) {
      return `https://www.tesco.com/groceries/en-GB/search?query=${encodeURIComponent(query)}`
    },
  },
  {
    id: 'sainsburys',
    label: 'Sainsbury\'s',
    checkoutUrl: 'https://www.sainsburys.co.uk/grocery/en-GB/basket',
    buildSearchUrl(query) {
      return `https://www.sainsburys.co.uk/grocery/en-GB/search?query=${encodeURIComponent(query)}`
    },
  },
  {
    id: 'asda',
    label: 'Asda',
    checkoutUrl: 'https://www.asda.com/groceries/basket',
    buildSearchUrl(query) {
      return `https://www.asda.com/groceries/search/${encodeURIComponent(query)}`
    },
  },
  {
    id: 'ocado',
    label: 'Ocado',
    checkoutUrl: 'https://www.ocado.com/webshop/basket',
    buildSearchUrl(query) {
      return `https://www.ocado.com/search?entry=${encodeURIComponent(query)}`
    },
  },
]

export const RETAILER_STORAGE_KEY = 'myFoodSortedRetailer'

export function getRetailerById(id) {
  return RETAILERS.find((item) => item.id === id) ?? RETAILERS[0]
}

export function readStoredRetailer() {
  try {
    const stored = localStorage.getItem(RETAILER_STORAGE_KEY)
    return stored && getRetailerById(stored) ? stored : 'tesco'
  } catch {
    return 'tesco'
  }
}

export function writeStoredRetailer(id) {
  try {
    localStorage.setItem(RETAILER_STORAGE_KEY, id)
  } catch {
    /* ignore */
  }
}

export function buildRetailerSearchUrl(retailerId, query) {
  const retailer = getRetailerById(retailerId)
  const q = String(query || '').trim() || 'groceries'
  return retailer.buildSearchUrl(q)
}

export function buildRetailerUrlForItem(retailerId, item) {
  return buildRetailerSearchUrl(retailerId, item?.ingredient_name)
}

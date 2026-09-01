/** Founder account for the admin cohort snapshot. Backend still checks this too. */
export const FOUNDER_ADMIN_EMAIL = 'mantova.a@gmail.com'

export function isFounderAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === FOUNDER_ADMIN_EMAIL
}

export function formatShare(rate) {
  if (rate == null || Number.isNaN(Number(rate))) return 'No data'
  return `${Math.round(Number(rate) * 100)}%`
}

export function formatCount(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return String(Math.round(n))
}

export function formatWhen(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown'
  return date.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

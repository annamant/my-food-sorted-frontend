import { marked } from 'marked'

marked.setOptions({
  gfm: true,
  breaks: false,
})

function stripQuotes(value) {
  const trimmed = String(value ?? '').trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

/** Browser-safe YAML-ish frontmatter. Avoids gray-matter (Node Buffer / eval). */
export function parseFrontmatter(rawMarkdown) {
  const text = String(rawMarkdown ?? '')
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: text }

  const data = {}
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const rawValue = line.slice(idx + 1).trim()
    if (!key) continue
    if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
      data[key] = rawValue
        .slice(1, -1)
        .split(',')
        .map((item) => stripQuotes(item))
        .filter(Boolean)
    } else {
      data[key] = stripQuotes(rawValue)
    }
  }

  return { data, content: match[2] }
}

/**
 * @param {string} slug
 * @param {string} rawMarkdown
 */
export function parsePost(slug, rawMarkdown) {
  const { data, content } = parseFrontmatter(rawMarkdown)
  const title = String(data.title || slug).trim()
  const description = String(data.description || '').trim()
  const date = String(data.date || '').trim()
  const author = String(data.author || '').trim()
  const reviewedBy = String(data.reviewedBy || '').trim()
  const coverImage = String(data.coverImage || '').trim()
  const tags = Array.isArray(data.tags)
    ? data.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : []

  let body = content.trim()
  if (reviewedBy) {
    body = body.replaceAll('{{reviewedBy}}', reviewedBy)
  }

  let html = ''
  try {
    const parsed = marked.parse(body, { async: false })
    html = typeof parsed === 'string' ? parsed : String(parsed)
  } catch (err) {
    console.error(`Cannot render markdown for ${slug}`, err)
    html = `<p>${body.replace(/</g, '&lt;')}</p>`
  }

  return {
    slug,
    title,
    description,
    date,
    author,
    reviewedBy,
    coverImage,
    tags,
    html,
  }
}

export function sortPostsNewestFirst(posts) {
  return [...posts].sort((a, b) => String(b.date).localeCompare(String(a.date)))
}

export function postPath(slug) {
  return `/blog/${encodeURIComponent(slug)}`
}

export function formatPostDate(date) {
  if (!date) return ''
  const parsed = new Date(`${date}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

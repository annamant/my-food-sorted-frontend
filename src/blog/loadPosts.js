import { parsePost, sortPostsNewestFirst } from './parsePost'

const rawModules = import.meta.glob('../../content/blog/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function slugFromPath(filePath) {
  const file = filePath.split('/').pop() || ''
  return file.replace(/\.md$/i, '')
}

/** All blog posts, newest first. Never throw: a bad file must not blank the site. */
export function getAllPosts() {
  try {
    const posts = Object.entries(rawModules).flatMap(([filePath, raw]) => {
      try {
        return [parsePost(slugFromPath(filePath), String(raw))]
      } catch (err) {
        console.error(`Cannot parse blog post ${filePath}`, err)
        return []
      }
    })
    return sortPostsNewestFirst(posts)
  } catch (err) {
    console.error('Cannot load blog posts', err)
    return []
  }
}

/** @param {string} slug */
export function getPostBySlug(slug) {
  return getAllPosts().find((post) => post.slug === slug) || null
}

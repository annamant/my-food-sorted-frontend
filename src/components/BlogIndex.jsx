import { useEffect } from 'react'
import { formatPostDate, postPath } from '../blog/parsePost'
import { getAllPosts } from '../blog/loadPosts'
import './BlogPage.css'

export default function BlogIndex({ onOpenPost, onHome }) {
  const posts = getAllPosts()

  useEffect(() => {
    document.title = 'Blog | My Food SORTED'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'My Food SORTED'
    }
  }, [])

  return (
    <div className="blog">
      <header className="blog__header">
        <button type="button" className="blog__back" onClick={onHome}>
          ← Back
        </button>
        <p className="blog__kicker">Blog</p>
        <h1 className="blog__title">Cooking, planning, and keeping what works</h1>
        <p className="blog__lede">
          Notes on planning the week, shopping your list, and building a kitchen that
          actually fits your life.
        </p>
      </header>

      <section className="blog__index" aria-label="Articles">
        {posts.length === 0 ? (
          <p className="blog__empty">New articles are on the way.</p>
        ) : (
          <ul className="blog__list">
            {posts.map((post) => (
              <li key={post.slug}>
                <article className="blog__item">
                  <p className="blog__itemMeta">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                    {post.tags?.[0] ? <span>{post.tags[0]}</span> : null}
                  </p>
                  <h2>
                    <button
                      type="button"
                      className="blog__itemTitle"
                      onClick={() => onOpenPost(post.slug)}
                    >
                      {post.title}
                    </button>
                  </h2>
                  <p className="blog__itemDesc">{post.description}</p>
                  <button
                    type="button"
                    className="blog__itemRead"
                    onClick={() => onOpenPost(post.slug)}
                  >
                    Read article
                  </button>
                  <a className="visually-hidden" href={postPath(post.slug)}>
                    {post.title}
                  </a>
                </article>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

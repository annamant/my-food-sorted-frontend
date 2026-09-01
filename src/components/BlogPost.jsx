import { useEffect } from 'react'
import { formatPostDate } from '../blog/parsePost'
import { getPostBySlug } from '../blog/loadPosts'
import './BlogPage.css'

export default function BlogPost({ slug, onOpenBlog, onHome }) {
  const post = getPostBySlug(slug)

  useEffect(() => {
    document.title = post ? `${post.title} | My Food SORTED` : 'My Food SORTED'
    window.scrollTo(0, 0)
    return () => {
      document.title = 'My Food SORTED'
    }
  }, [post])

  if (!post) {
    return (
      <div className="blog">
        <header className="blog__header">
          <button type="button" className="blog__back" onClick={onOpenBlog}>
            ← Back to blog
          </button>
        </header>
        <main className="blog__missing">
          <h1>Article not found</h1>
          <p>That article is not here anymore.</p>
          <button type="button" className="btn btn--primary" onClick={onOpenBlog}>
            Back to blog
          </button>
        </main>
      </div>
    )
  }

  return (
    <div className="blog">
      <header className="blog__header">
        <button type="button" className="blog__back" onClick={onOpenBlog}>
          ← Back to blog
        </button>
      </header>

      <article className="blog__article">
        <header className="blog__articleHeader">
          <p className="blog__kicker">Blog</p>
          <h1>{post.title}</h1>
          <p className="blog__articleLede">{post.description}</p>
          <p className="blog__byline">
            <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            {post.author ? <span>{post.author}</span> : null}
          </p>
        </header>

        {post.coverImage ? (
          <figure className="blog__cover">
            <img src={post.coverImage} alt="" />
          </figure>
        ) : null}

        <div
          className="blog__body"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </article>
    </div>
  )
}

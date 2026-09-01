import Leaderboard from './Leaderboard'
import './DiscoverPage.css'

export default function DiscoverPage({ apiBase, authToken, onBrowseIdeas }) {
  return (
    <section className="discover-page app__panel app__panel--library">
      <header className="discover-page__hero">
        <p className="discover-page__kicker">Community</p>
        <h1>Community books and shared meals</h1>
        <p className="discover-page__lede">
          See what other people are cooking and sharing. For our house recipes, open the library.
        </p>
        {onBrowseIdeas && (
          <button type="button" className="btn btn--primary" onClick={onBrowseIdeas}>
            Browse the library
          </button>
        )}
      </header>

      <Leaderboard apiBase={apiBase} authToken={authToken} />

      <aside className="discover-page__aside">
        <h2>House recipes</h2>
        <p>
          Our curated recipes live in the library — drawn from the bibles of each cuisine.
        </p>
        {onBrowseIdeas && (
          <button type="button" className="btn btn--ghost" onClick={onBrowseIdeas}>
            Open library
          </button>
        )}
      </aside>
    </section>
  )
}

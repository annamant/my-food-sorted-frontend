import { useEffect, useRef, useState } from 'react'
import AuthForm from './AuthForm'
import MealPlanDisplay from './MealPlanDisplay'
import { FEATURED_DISHES } from '../data/featuredDishes'
import { INSPIRATIONS } from '../data/inspirations'
import { dishesForCollection, searchCatalog } from '../data/catalog'
import './LandingPage.css'

const PLAYLIST_PREVIEWS = [
  {
    label: 'Budget cooking',
    title: 'Five proper dinners under £40',
    body: 'A practical week of filling dishes with one combined shopping list.',
  },
  {
    label: 'The Canon',
    title: 'An Italian week',
    body: 'Classics worth learning, ready to keep faithful or adapt carefully.',
  },
  {
    label: 'Family table',
    title: 'Meals everyone can share',
    body: 'Flexible favourites that can account for dislikes and dietary needs.',
  },
]

const TRUST_LABELS = [
  {
    title: 'Canonical',
    body: 'A carefully researched foundation with its culinary source made visible.',
  },
  {
    title: 'Adapted for you',
    body: 'A trusted dish adjusted for your budget, time, pantry or household.',
  },
  {
    title: 'Community-tested',
    body: 'Cooked, rated and kept by real households in the My Food Sorted community.',
  },
]

function LogoMark({ size = 'md', tone = 'ink' }) {
  return (
    <span
      className={`logomark logomark--${size} logomark--${tone}`}
      aria-label="My Food Sorted"
    >
      <span className="logomark__top">my food.</span>
      <span className="logomark__bottom">SORTED.</span>
    </span>
  )
}

function recipePreview(dish, eyebrow = 'From the Canon') {
  return {
    id: dish.id,
    eyebrow,
    title: dish.title,
    blurb: dish.blurb,
    image: dish.image,
    mealPlan: dish.mealPlan,
  }
}

export default function LandingPage({
  loading,
  handleAuth,
  initialAuthMode = 'register',
  pendingInspiration,
  onPickInspiration,
  onStartCooking,
}) {
  const authRef = useRef(null)
  const canonRef = useRef(null)
  const exploreRef = useRef(null)
  const [openDish, setOpenDish] = useState(null)
  const [shelf, setShelf] = useState(null)
  const [authMode, setAuthMode] = useState(initialAuthMode)
  const [heroQuery, setHeroQuery] = useState('')

  useEffect(() => {
    setAuthMode(initialAuthMode)
  }, [initialAuthMode])

  useEffect(() => {
    if (!openDish) return undefined
    function onKey(event) {
      if (event.key === 'Escape') setOpenDish(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openDish])

  function scrollToAuth(nextMode = 'register') {
    setAuthMode(nextMode)
    setOpenDish(null)
    authRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function pickInspiration(item) {
    const dishes = dishesForCollection(item.id).map((dish) => recipePreview(dish, item.title))
    setShelf({ title: item.title, body: item.blurb, dishes })
    onPickInspiration?.(item)
    requestAnimationFrame(() => scrollTo(exploreRef))
  }

  function submitHeroSearch(event) {
    event.preventDefault()
    const query = heroQuery.trim()
    if (!query) return

    const hits = searchCatalog(query)
    if (hits.length === 1) {
      setOpenDish(recipePreview(hits[0]))
      return
    }
    if (hits.length > 1) {
      setShelf({
        title: `Results for “${query}”`,
        body: 'Trusted dishes already in the kitchen.',
        dishes: hits.map((dish) => recipePreview(dish)),
      })
      requestAnimationFrame(() => scrollTo(exploreRef))
      return
    }

    onStartCooking?.(query)
    scrollToAuth('register')
  }

  return (
    <div className="landing">
      <header className="landing__siteHeader">
        <button
          type="button"
          className="landing__brandBtn"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="My Food Sorted home"
        >
          <LogoMark size="sm" />
        </button>

        <nav className="landing__nav" aria-label="Main navigation">
          <details className="landing__navMenu">
            <summary>Recipes</summary>
            <div className="landing__navDropdown">
              <button type="button" onClick={() => scrollTo(canonRef)}>The Canon</button>
              <button type="button" onClick={() => scrollTo(exploreRef)}>Cuisines</button>
              <button type="button" onClick={() => pickInspiration(INSPIRATIONS.find((item) => item.id === 'budget'))}>
                Budget cooking
              </button>
              <button type="button" onClick={() => pickInspiration(INSPIRATIONS.find((item) => item.id === 'vegetarian'))}>
                Vegetarian
              </button>
            </div>
          </details>
          <a href="#personal-kitchen">Cook tonight</a>
          <a href="#community">Collections</a>
          <a href="#shopping">Shopping</a>
          <a href="#how-it-works">How it works</a>
        </nav>

        <div className="landing__navActions">
          <button type="button" className="landing__navLogin" onClick={() => scrollToAuth('login')}>
            Log in
          </button>
          <button type="button" className="btn btn--primary landing__navCta" onClick={() => scrollToAuth('register')}>
            Build your kitchen
          </button>
        </div>
      </header>

      <main>
        <section className="landing__hero" id="personal-kitchen">
          <div className="landing__heroCopy">
            <p className="landing__eyebrow">A personal kitchen, not another recipe feed</p>
            <h1 className="landing__headline">
              Trusted recipes.<br />
              <em>Made right for you.</em>
            </h1>
            <p className="landing__sub">
              Start with a proper dish. Adapt it to your time, budget, pantry and
              household. Keep what works, build collections, and shop one clear list.
            </p>
            <form className="landing__search" onSubmit={submitHeroSearch}>
              <label htmlFor="landing-search">What do you want to cook?</label>
              <div className="landing__searchRow">
                <input
                  id="landing-search"
                  type="search"
                  value={heroQuery}
                  onChange={(event) => setHeroQuery(event.target.value)}
                  placeholder="Carbonara, leftover chicken, dinner under £10…"
                />
                <button type="submit" className="btn btn--primary">Cook tonight</button>
              </div>
            </form>
            <div className="landing__quickLinks" aria-label="Quick cooking options">
              <button type="button" onClick={() => pickInspiration(INSPIRATIONS.find((item) => item.id === 'pantry'))}>
                Use what I have
              </button>
              <button type="button" onClick={() => pickInspiration(INSPIRATIONS.find((item) => item.id === 'budget'))}>
                Cook on a budget
              </button>
              <button type="button" onClick={() => pickInspiration(INSPIRATIONS.find((item) => item.id === 'wellbeing'))}>
                High-protein
              </button>
            </div>
          </div>

          <div className="landing__heroMedia">
            <img
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1800&q=85"
              alt="A home cook preparing dinner in a warm kitchen"
            />
            <div className="landing__heroNote">
              <span>From recipe to trolley</span>
              <strong>One trusted cooking flow</strong>
            </div>
          </div>
        </section>

        <section className="landing__promise" aria-label="Product promise">
          <p>Curated foundations</p>
          <span aria-hidden="true">·</span>
          <p>Personal adaptations</p>
          <span aria-hidden="true">·</span>
          <p>Community collections</p>
          <span aria-hidden="true">·</span>
          <p>Combined shopping lists</p>
        </section>

        <section className="landing__section landing__canon" ref={canonRef} id="canon">
          <div className="landing__sectionHead">
            <div>
              <p className="landing__eyebrow">The Canon</p>
              <h2>Recipes worth trusting.</h2>
            </div>
            <p>
              A focused library of culinary foundations—from Italian classics to
              French bistro cooking. Canon recipes will make their source and
              adaptation status visible.
            </p>
          </div>
          <ul className="landing__dishGrid">
            {FEATURED_DISHES.map((dish) => (
              <li key={dish.id}>
                <button type="button" className="landing__dish" onClick={() => setOpenDish(dish)}>
                  <span className="landing__dishMedia">
                    <img src={dish.image} alt="" />
                    <span className="landing__recipeBadge">Foundation</span>
                  </span>
                  <span className="landing__dishCopy">
                    <span className="landing__dishEyebrow">{dish.eyebrow}</span>
                    <span className="landing__dishName">{dish.title}</span>
                    <span className="landing__dishBlurb">{dish.blurb}</span>
                    <span className="landing__dishAction">Open recipe →</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="landing__section landing__adapt" id="how-it-works">
          <div className="landing__adaptImage">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1400&q=85"
              alt="Fresh ingredients ready for a home-cooked meal"
            />
          </div>
          <div className="landing__adaptCopy">
            <p className="landing__eyebrow">Keep the dish. Change the constraints.</p>
            <h2>Your kitchen is the context.</h2>
            <p>
              My Food Sorted starts with trustworthy recipes, then helps them fit
              real life without pretending every substitution is the original.
            </p>
            <ol className="landing__steps">
              <li><span>01</span><div><strong>Choose a foundation</strong><p>Search the Canon or discover a community favourite.</p></div></li>
              <li><span>02</span><div><strong>Make it work tonight</strong><p>Set your time, spend, pantry, diet and household needs.</p></div></li>
              <li><span>03</span><div><strong>Keep and shop it</strong><p>Add recipes to a collection and combine them into one shopping list.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing__section" ref={exploreRef} id="explore">
          <div className="landing__sectionHead">
            <div>
              <p className="landing__eyebrow">Browse your way</p>
              <h2>Start with a cuisine, need or mood.</h2>
            </div>
            <p>
              The library stays easy to explore even when you do not yet know the dish.
            </p>
          </div>
          <ul className="landing__inspireGrid">
            {INSPIRATIONS.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`landing__inspireTile ${pendingInspiration?.id === item.id ? 'landing__inspireTile--on' : ''}`}
                  onClick={() => pickInspiration(item)}
                >
                  <span className="landing__inspireMedia">
                    <img src={item.image} alt="" />
                    <span className="landing__inspireShade" />
                    <span className="landing__inspireOnImage">
                      <span className="landing__inspireName">{item.title}</span>
                      <span className="landing__inspireBlurb">{item.blurb}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {shelf?.dishes?.length > 0 && (
            <div className="landing__shelf">
              <p className="landing__eyebrow">On the shelf</p>
              <h3>{shelf.title}</h3>
              <p>{shelf.body}</p>
              <ul className="landing__dishGrid">
                {shelf.dishes.map((dish) => (
                  <li key={dish.id}>
                    <button type="button" className="landing__dish" onClick={() => setOpenDish(dish)}>
                      <span className="landing__dishMedia"><img src={dish.image} alt="" /></span>
                      <span className="landing__dishCopy">
                        <span className="landing__dishName">{dish.title}</span>
                        <span className="landing__dishBlurb">{dish.blurb}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="landing__community" id="community">
          <div className="landing__communityIntro">
            <p className="landing__eyebrow">The community kitchen</p>
            <h2>Recipe collections made to be cooked.</h2>
            <p>
              Save dishes into lists for a week, a budget or a mood. Share yours,
              discover what other households actually cook, and keep the best ideas moving.
            </p>
          </div>
          <div className="landing__playlistGrid">
            {PLAYLIST_PREVIEWS.map((playlist, index) => (
              <article className="landing__playlist" key={playlist.title}>
                <div className={`landing__playlistArt landing__playlistArt--${index + 1}`}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <p>{playlist.label}</p>
                <h3>{playlist.title}</h3>
                <span>{playlist.body}</span>
              </article>
            ))}
          </div>
          <button type="button" className="btn landing__lightButton" onClick={() => scrollToAuth('register')}>
            Start your first collection
          </button>
        </section>

        <section className="landing__section landing__shopping" id="shopping">
          <div className="landing__shoppingCopy">
            <p className="landing__eyebrow">From plan to shop</p>
            <h2>One list for everything you chose.</h2>
            <p>
              Combine ingredients across a recipe or an entire collection, check off
              what is already in the cupboard, then take the remaining list to your
              preferred supermarket.
            </p>
            <div className="landing__retailers" aria-label="Retailer support">
              <span>Tesco</span>
              <span>Sainsbury&apos;s</span>
              <span>More retailers to come</span>
            </div>
          </div>
          <div className="landing__listMock" aria-label="Example shopping list">
            <div><span>Fresh produce</span><strong>4 items</strong></div>
            <label><input type="checkbox" defaultChecked /> Onions</label>
            <label><input type="checkbox" /> Tomatoes</label>
            <label><input type="checkbox" /> Flat-leaf parsley</label>
            <div><span>Pantry</span><strong>3 items</strong></div>
            <label><input type="checkbox" /> Tinned chickpeas</label>
            <label><input type="checkbox" defaultChecked /> Olive oil</label>
            <p>Already have 2 · Shop 5</p>
          </div>
        </section>

        <section className="landing__section landing__trust">
          <div className="landing__sectionHead">
            <div>
              <p className="landing__eyebrow">Trust stays visible</p>
              <h2>Always know what kind of recipe you are cooking.</h2>
            </div>
          </div>
          <div className="landing__trustGrid">
            {TRUST_LABELS.map((item, index) => (
              <article key={item.title}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing__authSection" ref={authRef}>
          <div className="landing__authPitch">
            <p className="landing__eyebrow">
              {pendingInspiration ? 'Your choice is ready' : 'Build your kitchen'}
            </p>
            <h2>
              {pendingInspiration
                ? `Keep exploring ${pendingInspiration.title}.`
                : 'Keep the recipes that work for your household.'}
            </h2>
            <p>
              Join free to adapt dishes, create collections, combine shopping lists
              and share what you cook.
            </p>
          </div>
          <div className="landing__authCard">
            <AuthForm
              loading={loading}
              handleAuth={handleAuth}
              loggedInUserId={null}
              email=""
              handleLogout={() => {}}
              initialMode={authMode}
            />
          </div>
        </section>
      </main>

      <footer className="landing__footer">
        <div className="landing__footerTop">
          <div>
            <LogoMark size="md" tone="light" />
            <p>Trusted recipes, made right for your kitchen.</p>
          </div>
          <div className="landing__footerLinks">
            <div><strong>Cook</strong><a href="#canon">The Canon</a><a href="#explore">Cuisines</a><a href="#personal-kitchen">Cook tonight</a></div>
            <div><strong>Keep</strong><a href="#community">Collections</a><a href="#shopping">Shopping lists</a><button type="button" onClick={() => scrollToAuth('register')}>Join free</button></div>
            <div><strong>About</strong><a href="#how-it-works">How it works</a><span>Recipe standards</span><span>Community guidelines</span></div>
          </div>
        </div>
        <div className="landing__footerBottom">
          <span>© {new Date().getFullYear()} My Food Sorted</span>
          <span>Privacy · Terms · Cookies</span>
        </div>
      </footer>

      {openDish && (
        <div className="landing__cook" role="dialog" aria-modal="true" aria-labelledby="cook-title">
          <div className="landing__cookPanel">
            <header className="landing__cookBar">
              <div>
                <p className="landing__cookEyebrow">{openDish.eyebrow}</p>
                <h2 id="cook-title">{openDish.title}</h2>
              </div>
              <button type="button" className="btn btn--ghost" onClick={() => setOpenDish(null)}>
                Close
              </button>
            </header>
            <MealPlanDisplay mealPlan={openDish.mealPlan} readOnly alreadySaved />
            <div className="landing__cookKeep">
              <div>
                <strong>Make this recipe yours.</strong>
                <p>Join to adapt it, keep it in a collection and build its shopping list.</p>
              </div>
              <button type="button" className="btn btn--primary" onClick={() => scrollToAuth('register')}>
                Build your kitchen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

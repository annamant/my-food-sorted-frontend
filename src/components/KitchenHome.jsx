import './KitchenHome.css'

const COLLECTIONS = [
  {
    id: 'italian',
    title: 'Italian classics',
    blurb: 'Carbonara, ragù, risotto — the real ones.',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional Italian classic dinner for my brief — authentic technique, realistic UK cost and calories. Save-ready.',
  },
  {
    id: 'french',
    title: 'French classics',
    blurb: 'Bistro plates you can cook at home.',
    image:
      'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional French classic dinner for my brief — home-cookable, with cost and calories. Save-ready.',
  },
  {
    id: 'british',
    title: 'British comfort',
    blurb: 'Sunday energy, weeknight ease.',
    image:
      'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional British comfort dinner for my brief — proper and satisfying, with cost and calories. Save-ready.',
  },
  {
    id: 'japanese',
    title: 'Japanese favourites',
    blurb: 'Clean flavours, weeknight-friendly.',
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional Japanese-inspired dinner for my brief — achievable at home in the UK, with cost and calories. Save-ready.',
  },
  {
    id: 'indian',
    title: 'Indian classics',
    blurb: 'Spice, warmth, and balance.',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional Indian classic dinner for my brief — aromatic but home-cookable, with cost and calories. Save-ready.',
  },
  {
    id: 'mexican',
    title: 'Mexican kitchen',
    blurb: 'Bright, bold, shareable plates.',
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a traditional Mexican classic dinner for my brief — vibrant and achievable, with cost and calories. Save-ready.',
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean',
    blurb: 'Olive oil, herbs, sunshine plates.',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Give me a Mediterranean dinner for my brief — vegetables-forward and satisfying, with cost and calories. Save-ready.',
  },
  {
    id: 'vegetarian',
    title: 'Vegetarian',
    blurb: 'No meat — still proper supper.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Create a vegetarian dinner for my brief — filling and flavourful, with cost and calories. Save-ready.',
  },
  {
    id: 'vegan',
    title: 'Vegan',
    blurb: 'Plant-based, cooked with care.',
    image:
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Create a vegan dinner for my brief — balanced and delicious, with cost and calories. Save-ready.',
  },
  {
    id: 'wellbeing',
    title: 'High-protein',
    blurb: 'Wellbeing without sad salads.',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Create a high-protein dinner for my brief — good for wellbeing, still tasty, with cost and calories. Save-ready.',
  },
  {
    id: 'budget',
    title: 'Budget week',
    blurb: 'Feed well when prices bite.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Build a budget-friendly dinner for my brief — maximum flavour per pound, with clear cost and calories. Save-ready.',
  },
  {
    id: 'pantry',
    title: 'From the cupboard',
    blurb: 'Cook what you already have.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
    prompt:
      'Create a dinner using mainly the pantry items in my brief. Minimise new shopping. Save-ready with cost and calories.',
  },
]

export default function KitchenHome({ onPickCollection, composeDisabled }) {
  return (
    <div className="kitchen-home">
      <section className="kitchen-home__hero" aria-label="Kitchen welcome">
        <div className="kitchen-home__heroMedia" aria-hidden="true">
          <img
            className="kitchen-home__heroImg"
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2400&q=80"
            alt=""
          />
          <div className="kitchen-home__heroShade" />
        </div>
        <div className="kitchen-home__heroContent">
          <p className="kitchen-home__heroLabel">Your kitchen library</p>
          <h1 className="kitchen-home__heroTitle">
            Find a classic.<br />
            <em>Make it yours.</em>
          </h1>
          <p className="kitchen-home__heroBody">
            Browse traditions and diets below, remix for budget and wellbeing,
            then keep what you love in your collection.
          </p>
        </div>
      </section>

      <section className="kitchen-home__browse" aria-labelledby="browse-heading">
        <div className="kitchen-home__browseIntro">
          <p className="kitchen-home__browseLabel">Start from a collection</p>
          <h2 id="browse-heading" className="kitchen-home__browseTitle">
            Traditions & ways of eating
          </h2>
          <p className="kitchen-home__browseBody">
            Tap a box to compose a recipe in that spirit — then remix, save, or share.
          </p>
        </div>

        <ul className="kitchen-home__grid">
          {COLLECTIONS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="kitchen-home__tile"
                disabled={composeDisabled}
                onClick={() => onPickCollection?.(item)}
              >
                <span className="kitchen-home__tileMedia" aria-hidden="true">
                  <img src={item.image} alt="" loading="lazy" />
                </span>
                <span className="kitchen-home__tileCopy">
                  <span className="kitchen-home__tileTitle">{item.title}</span>
                  <span className="kitchen-home__tileBlurb">{item.blurb}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export { COLLECTIONS }

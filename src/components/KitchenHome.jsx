import './KitchenHome.css'

const COLLECTIONS = [
  {
    id: 'italian',
    title: 'Italian classics',
    blurb: 'Carbonara, ragù, risotto — the real ones.',
    image:
      'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    label: 'Italian classic for tonight',
    prompt:
      'Give me a traditional Italian classic dinner for my brief — authentic technique, realistic UK cost and calories. Save-ready.',
  },
  {
    id: 'french',
    title: 'French classics',
    blurb: 'Bistro plates you can cook at home.',
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    label: 'French classic for tonight',
    prompt:
      'Give me a traditional French classic dinner for my brief — home-cookable, with cost and calories. Save-ready.',
  },
  {
    id: 'british',
    title: 'British comfort',
    blurb: 'Sunday energy, weeknight ease.',
    image:
      'https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=900&q=80',
    label: 'British comfort for tonight',
    prompt:
      'Give me a traditional British comfort dinner for my brief — proper and satisfying, with cost and calories. Save-ready.',
  },
  {
    id: 'japanese',
    title: 'Japanese favourites',
    blurb: 'Clean flavours, weeknight-friendly.',
    image:
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80',
    label: 'Japanese-inspired dinner',
    prompt:
      'Give me a traditional Japanese-inspired dinner for my brief — achievable at home in the UK, with cost and calories. Save-ready.',
  },
  {
    id: 'indian',
    title: 'Indian classics',
    blurb: 'Spice, warmth, and balance.',
    image:
      'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    label: 'Indian classic for tonight',
    prompt:
      'Give me a traditional Indian classic dinner for my brief — aromatic but home-cookable, with cost and calories. Save-ready.',
  },
  {
    id: 'mexican',
    title: 'Mexican kitchen',
    blurb: 'Bright, bold, shareable plates.',
    image:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80',
    label: 'Mexican classic for tonight',
    prompt:
      'Give me a traditional Mexican classic dinner for my brief — vibrant and achievable, with cost and calories. Save-ready.',
  },
  {
    id: 'mediterranean',
    title: 'Mediterranean',
    blurb: 'Olive oil, herbs, sunshine plates.',
    image:
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=80',
    label: 'Mediterranean dinner',
    prompt:
      'Give me a Mediterranean dinner for my brief — vegetables-forward and satisfying, with cost and calories. Save-ready.',
  },
  {
    id: 'vegetarian',
    title: 'Vegetarian',
    blurb: 'No meat — still proper supper.',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
    label: 'Vegetarian dinner',
    prompt:
      'Create a vegetarian dinner for my brief — filling and flavourful, with cost and calories. Save-ready.',
  },
  {
    id: 'vegan',
    title: 'Vegan',
    blurb: 'Plant-based, cooked with care.',
    image:
      'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80',
    label: 'Vegan dinner',
    prompt:
      'Create a vegan dinner for my brief — balanced and delicious, with cost and calories. Save-ready.',
  },
  {
    id: 'wellbeing',
    title: 'High-protein',
    blurb: 'Wellbeing without sad salads.',
    image:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
    label: 'High-protein dinner',
    prompt:
      'Create a high-protein dinner for my brief — good for wellbeing, still tasty, with cost and calories. Save-ready.',
  },
  {
    id: 'budget',
    title: 'Budget week',
    blurb: 'Feed well when prices bite.',
    image:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    label: 'Budget-friendly dinner',
    prompt:
      'Build a budget-friendly dinner for my brief — maximum flavour per pound, with clear cost and calories. Save-ready.',
  },
  {
    id: 'pantry',
    title: 'From the cupboard',
    blurb: 'Cook what you already have.',
    image:
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80',
    label: 'Cook from the cupboard',
    prompt:
      'Create a dinner using mainly the pantry items in my brief. Minimise new shopping. Save-ready with cost and calories.',
  },
]

export default function KitchenHome({
  onPickCollection,
  composeDisabled,
  hideCollections,
  hideHero,
  children,
}) {

  return (
    <div className="kitchen-home">
      {!hideHero && (
        <section className="kitchen-home__hero" aria-label="What’s for dinner">
          <div className="kitchen-home__heroMedia" aria-hidden="true">
            <img
              className="kitchen-home__heroImg"
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=2400&q=80"
              alt=""
            />
            <div className="kitchen-home__heroShade" />
          </div>
          <div className="kitchen-home__heroContent">
            <p className="kitchen-home__heroLabel">Tonight</p>
            <h1 className="kitchen-home__heroTitle">
              What’s for<br />
              <em>dinner?</em>
            </h1>
            <p className="kitchen-home__heroBody">
              Find a dish you know, or make your own. The kitchen asks first — then cooks once.
            </p>
          </div>
        </section>
      )}

      {children}

      {!hideCollections && (
        <section className="kitchen-home__browse" aria-labelledby="browse-heading">
          <div className="kitchen-home__browseIntro">
            <p className="kitchen-home__browseLabel">Or start from a mood</p>
            <h2 id="browse-heading" className="kitchen-home__browseTitle">
              Classics & ways of eating
            </h2>
            <p className="kitchen-home__browseBody">
              Tap one to fill the search. It won’t cook until you hit Find.
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
                    <span className="kitchen-home__tileShade" />
                    <span className="kitchen-home__tileOnImage">
                      <span className="kitchen-home__tileTitle">{item.title}</span>
                      <span className="kitchen-home__tileBlurb">{item.blurb}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

export { COLLECTIONS }

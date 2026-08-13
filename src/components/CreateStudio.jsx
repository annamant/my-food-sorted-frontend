import './CreateStudio.css'

export default function CreateStudio({ children, studioRef }) {
  return (
    <section className="create-studio" ref={studioRef} aria-labelledby="create-studio-heading">
      <header className="create-studio__header">
        <p className="create-studio__label">Create</p>
        <h2 id="create-studio-heading" className="create-studio__title">
          Let’s get creative.
        </h2>
        <p className="create-studio__body">
          This is where you do the cooking work — ask for any recipe, invent one from
          what’s in the cupboard, remix for budget or wellbeing, then add it to your library.
        </p>
      </header>
      <div className="create-studio__stack">{children}</div>
    </section>
  )
}

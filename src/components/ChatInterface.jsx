import MealBriefPanel from './MealBriefPanel'
import './ChatInterface.css'

function messageKey(message, index) {
  return message.id ?? `msg-${index}-${String(message.content).slice(0, 40)}`
}

function OptionNutrition({ option }) {
  const facts = [
    option.calories != null ? `${Math.round(option.calories)} kcal` : null,
    option.protein != null ? `Protein ${Math.round(option.protein)}g` : null,
    option.carbs != null ? `Carbs ${Math.round(option.carbs)}g` : null,
    option.fat != null ? `Fat ${Math.round(option.fat)}g` : null,
    option.sugar != null ? `Sugar ${Math.round(option.sugar)}g` : null,
  ].filter(Boolean)

  if (option.estimated_cost == null && facts.length === 0) return null

  return (
    <div className="chat-interface__optionFacts">
      {option.estimated_cost != null && (
        <span className="chat-interface__optionCost">About £{Number(option.estimated_cost).toFixed(2)} total</span>
      )}
      {facts.length > 0 && <span>{facts.join(' · ')}</span>}
      <small>Rough estimate · nutrition per serving</small>
    </div>
  )
}

function flowStep(stage, recipeSaved) {
  if (recipeSaved) return 'book'
  if (stage === 'recipe' || stage === 'finalizing') return 'cook'
  return 'chat'
}

function Conversation({ messages, loading, stage }) {
  return (
    <div className="chat-interface__messages" aria-live="polite">
      <div className="chat-interface__message chat-interface__message--assistant">
        <strong className="chat-interface__messageRole">Kitchen</strong>
        <span className="chat-interface__messageContent">
          What are we cooking? Ask anything — a classic to adapt, or your own idea. I’ll use the knowledge base, then you can keep the dish in a recipe book you own.
        </span>
      </div>
      {messages.map((message, index) => (
        <div
          key={messageKey(message, index)}
          className={`chat-interface__message chat-interface__message--${message.role}`}
        >
          <strong className="chat-interface__messageRole">{message.role === 'user' ? 'You' : 'Kitchen'}</strong>
          <span className="chat-interface__messageContent">{message.content}</span>
        </div>
      ))}
      {stage === 'describe' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            Tell me the night you have — a dish, a cuisine, what’s in the cupboard, the budget, or the mood.
          </span>
        </div>
      )}
      {stage === 'preferences' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            Before I suggest anything: how many people, how much time, and is there anything you cannot or do not want to eat?
          </span>
        </div>
      )}
      {stage === 'tweak' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            Good choice. Any last change — cheaper, faster, a swap — or shall I write it as suggested?
          </span>
        </div>
      )}
      {stage === 'recipe' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            Your recipe is ready below. Keep it, add it to a recipe book, then shop the list or have the supermarket deliver it.
          </span>
        </div>
      )}
      {loading && <div className="chat-interface__loading">Thinking…</div>}
    </div>
  )
}

export default function ChatInterface({
  stage,
  path,
  messages,
  input,
  setInput,
  loading,
  onClearChat,
  brief,
  onChangeBrief,
  prefs,
  options,
  selectedOption,
  onChoosePath,
  onSubmitIdea,
  onRequestOptions,
  onSelectOption,
  onRejectOptions,
  onFinalize,
  onTweakRecipe,
  recipeSaved = false,
}) {
  const submitOnEnter = (event, action) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    action()
  }

  const currentStep = flowStep(stage, recipeSaved)

  return (
    <section className="chat-interface chat-interface--guided" aria-labelledby="kitchen-chat-title">
      <header className="chat-interface__top">
        <div>
          <p className="chat-interface__label">Your kitchen conversation</p>
          <h1 id="kitchen-chat-title" className="chat-interface__heroTitle">What are we cooking?</h1>
          <p className="chat-interface__lede">
            Chat with the kitchen. Cook the meal. Keep it in a recipe book you can share or publish.
          </p>
        </div>
        {stage !== 'start' && (
          <button type="button" className="chat-interface__clear" onClick={onClearChat} disabled={loading}>
            Start over
          </button>
        )}
      </header>

      <ol className="chat-interface__flow" aria-label="How tonight goes">
        {[
          { id: 'chat', n: '01', label: 'Chat' },
          { id: 'cook', n: '02', label: 'Cook' },
          { id: 'book', n: '03', label: 'Recipe book' },
        ].map((step) => (
          <li
            key={step.id}
            className={
              currentStep === step.id
                ? 'chat-interface__flowStep chat-interface__flowStep--on'
                : 'chat-interface__flowStep'
            }
          >
            <span>{step.n}</span>
            {step.label}
          </li>
        ))}
      </ol>

      <Conversation messages={messages} loading={loading} stage={stage} />

      {stage === 'start' && (
        <div className="chat-interface__pathGrid">
          <button type="button" onClick={() => onChoosePath('recipe')} disabled={loading}>
            <span>01</span>
            <strong>Adapt a classic</strong>
            <small>Start from a trusted recipe, then make it yours.</small>
          </button>
          <button type="button" onClick={() => onChoosePath('create')} disabled={loading}>
            <span>02</span>
            <strong>Start from your idea</strong>
            <small>Time, budget, cupboard, mood — we’ll turn it into a meal.</small>
          </button>
        </div>
      )}

      {stage === 'describe' && (
        <div className="chat-interface__inputWrap">
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmitIdea)}
            placeholder={path === 'recipe' ? 'Carbonara, a French chicken dish, something with aubergine…' : 'Comforting, leftover chicken, under £12, 30 minutes…'}
            className="chat-interface__input"
            aria-label="Tell the kitchen what you want"
            autoFocus
          />
          <button type="button" className="btn btn--primary" onClick={onSubmitIdea} disabled={loading || !input.trim()}>
            Continue
          </button>
        </div>
      )}

      {stage === 'preferences' && (
        <div className="chat-interface__brief">
          <MealBriefPanel brief={brief} onChange={onChangeBrief} prefs={prefs} requireNotes />
          <button type="button" className="btn btn--primary chat-interface__primaryAction" onClick={onRequestOptions} disabled={loading}>
            Show me three options
          </button>
        </div>
      )}

      {(stage === 'suggesting' || stage === 'finalizing') && (
        <p className="chat-interface__working">{stage === 'suggesting' ? 'Finding three good directions…' : 'Writing your chosen recipe…'}</p>
      )}

      {stage === 'options' && (
        <div className="chat-interface__options" aria-label="Dish options">
          <p>Choose one. I’ll ask about tweaks, then write the recipe you can keep in a book.</p>
          <div>
            {options.map((option, index) => (
              <button type="button" key={`${option.title}-${index}`} onClick={() => onSelectOption(option)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
                <OptionNutrition option={option} />
                {option.reason && <em>{option.reason}</em>}
              </button>
            ))}
          </div>
          <button type="button" className="chat-interface__noneOption" onClick={onRejectOptions}>
            None of these — let’s continue chatting
          </button>
        </div>
      )}

      {stage === 'tweak' && selectedOption && (
        <div className="chat-interface__tweak">
          <div className="chat-interface__selected">
            <span>Selected dish</span>
            <strong>{selectedOption.title}</strong>
            <p>{selectedOption.description}</p>
          </div>
          <div className="chat-interface__quickTweaks">
            {['Make it cheaper', 'Make it faster', 'More vegetables', 'Milder'].map((tweak) => (
              <button type="button" key={tweak} onClick={() => setInput(tweak)}>{tweak}</button>
            ))}
          </div>
          <div className="chat-interface__inputWrap">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => submitOnEnter(event, () => onFinalize(input))}
              placeholder="Any final tweak? Leave blank to use it as suggested."
              className="chat-interface__input"
              aria-label="Final recipe tweak"
              autoFocus
            />
            <button type="button" className="btn btn--secondary" onClick={() => onFinalize('')} disabled={loading}>Use as is</button>
            <button type="button" className="btn btn--primary" onClick={() => onFinalize(input)} disabled={loading || !input.trim()}>Apply tweak</button>
          </div>
        </div>
      )}

      {stage === 'recipe' && (
        <div className="chat-interface__inputWrap">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onTweakRecipe)}
            placeholder="Ask for another change, or keep it as it is below…"
            className="chat-interface__input"
            aria-label="Tweak the finished recipe"
          />
          <button type="button" className="btn btn--primary" onClick={onTweakRecipe} disabled={loading || !input.trim()}>Tweak recipe</button>
        </div>
      )}
    </section>
  )
}

import MealBriefPanel from './MealBriefPanel'
import './ChatInterface.css'

function messageKey(message, index) {
  return message.id ?? `msg-${index}-${String(message.content).slice(0, 40)}`
}

function Conversation({ messages, loading, stage }) {
  return (
    <div className="chat-interface__messages" aria-live="polite">
      <div className="chat-interface__message chat-interface__message--assistant">
        <strong className="chat-interface__messageRole">Kitchen</strong>
        <span className="chat-interface__messageContent">
          What would you like to do tonight? We can begin with a trusted recipe or create something around your kitchen.
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
            Tell me what you have in mind—a dish, cuisine, ingredient, mood, or simply the kind of evening you are having.
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
            Good choice. Would you like any final change—cheaper, faster, a swap, more spice—or should I make it exactly like this?
          </span>
        </div>
      )}
      {stage === 'recipe' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            Your recipe is ready below. You can keep it, add it to a collection, or ask for another change.
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
}) {
  const submitOnEnter = (event, action) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    event.preventDefault()
    action()
  }

  return (
    <section className="chat-interface chat-interface--guided" aria-labelledby="kitchen-chat-title">
      <header className="chat-interface__top">
        <div>
          <p className="chat-interface__label">Your kitchen conversation</p>
          <h1 id="kitchen-chat-title" className="chat-interface__heroTitle">What are we cooking?</h1>
        </div>
        {stage !== 'start' && (
          <button type="button" className="chat-interface__clear" onClick={onClearChat} disabled={loading}>
            Start over
          </button>
        )}
      </header>

      <Conversation messages={messages} loading={loading} stage={stage} />

      {stage === 'start' && (
        <div className="chat-interface__pathGrid">
          <button type="button" onClick={() => onChoosePath('recipe')} disabled={loading}>
            <span>01</span>
            <strong>Start from a trusted recipe</strong>
            <small>Choose a classic or reliable foundation, then adapt it carefully.</small>
          </button>
          <button type="button" onClick={() => onChoosePath('create')} disabled={loading}>
            <span>02</span>
            <strong>Create something for me</strong>
            <small>Begin with your ingredients, mood, budget, or the night you have.</small>
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
            placeholder={path === 'recipe' ? 'Carbonara, a French chicken dish, something with aubergine…' : 'Comforting, quick, leftover chicken, under £12…'}
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
          <p>Choose one. I will ask about tweaks before writing the recipe.</p>
          <div>
            {options.map((option, index) => (
              <button type="button" key={`${option.title}-${index}`} onClick={() => onSelectOption(option)}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{option.title}</strong>
                <small>{option.description}</small>
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
            placeholder="Ask for another change…"
            className="chat-interface__input"
            aria-label="Tweak the finished recipe"
          />
          <button type="button" className="btn btn--primary" onClick={onTweakRecipe} disabled={loading || !input.trim()}>Tweak recipe</button>
        </div>
      )}
    </section>
  )
}

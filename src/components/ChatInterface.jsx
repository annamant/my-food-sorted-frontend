import { useEffect, useRef } from 'react'
import { COOK_PATHS, pathMeta } from '../data/cookIntake'
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

function Conversation({ messages, loading, stage, isWeek }) {
  const scrollerRef = useRef(null)

  useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages, loading, stage])

  return (
    <div className="chat-interface__messages" aria-live="polite" ref={scrollerRef}>
      {stage === 'start' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            What are we cooking? Adapt a recipe, create your own, or plan a week. I’ll ask a few questions, then give you three options.
          </span>
        </div>
      )}
      {messages.map((message, index) => (
        <div
          key={messageKey(message, index)}
          className={`chat-interface__message chat-interface__message--${message.role}`}
        >
          <strong className="chat-interface__messageRole">{message.role === 'user' ? 'You' : 'Kitchen'}</strong>
          <span className="chat-interface__messageContent">{message.content}</span>
        </div>
      ))}
      {stage === 'tweak' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            {isWeek
              ? 'Good choice. Any last change to this week — cheaper, simpler, more variety — or shall I write the plan as suggested?'
              : 'Good choice. Any last change — cheaper, faster, a swap — or shall I write it as suggested?'}
          </span>
        </div>
      )}
      {stage === 'recipe' && (
        <div className="chat-interface__message chat-interface__message--assistant">
          <strong className="chat-interface__messageRole">Kitchen</strong>
          <span className="chat-interface__messageContent">
            {isWeek
              ? 'Your week is ready below. Keep it, add it to a recipe book, then shop the list or have the supermarket deliver it.'
              : 'Your recipe is ready below. Keep it, add it to a recipe book, then shop the list or have the supermarket deliver it.'}
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
  options,
  selectedOption,
  onChoosePath,
  onSubmitTurn,
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
  const isWeek = path === 'week'
  const meta = pathMeta(path)
  const chatting = stage === 'describe' || stage === 'ask'

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

      <Conversation messages={messages} loading={loading} stage={stage} isWeek={isWeek} />

      {stage === 'start' && (
        <div className="chat-interface__pathGrid">
          {COOK_PATHS.map((item) => (
            <button type="button" key={item.id} onClick={() => onChoosePath(item.id)} disabled={loading}>
              <span>{item.n}</span>
              <strong>{item.title}</strong>
              <small>{item.blurb}</small>
            </button>
          ))}
        </div>
      )}

      {chatting && (
        <div className="chat-interface__inputWrap">
          <textarea
            rows={3}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => submitOnEnter(event, onSubmitTurn)}
            placeholder={stage === 'ask' ? 'Type your answer…' : meta.placeholder}
            className="chat-interface__input"
            aria-label={stage === 'ask' ? 'Answer the kitchen' : 'Tell the kitchen what you want'}
            autoFocus
          />
          <button type="button" className="btn btn--primary" onClick={onSubmitTurn} disabled={loading || !input.trim()}>
            Continue
          </button>
        </div>
      )}

      {(stage === 'suggesting' || stage === 'finalizing') && (
        <p className="chat-interface__working">
          {stage === 'suggesting'
            ? (isWeek ? 'Finding three good week directions…' : 'Finding three good directions…')
            : (isWeek ? 'Writing your week…' : 'Writing your chosen recipe…')}
        </p>
      )}

      {stage === 'options' && (
        <div className="chat-interface__options" aria-label={isWeek ? 'Week options' : 'Dish options'}>
          <p>
            {isWeek
              ? 'Choose one week direction. I’ll ask about tweaks, then write the full plan you can keep in a book.'
              : 'Choose one. I’ll ask about tweaks, then write the recipe you can keep in a book.'}
          </p>
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
            <span>{isWeek ? 'Selected week' : 'Selected dish'}</span>
            <strong>{selectedOption.title}</strong>
            <p>{selectedOption.description}</p>
          </div>
          <div className="chat-interface__quickTweaks">
            {(isWeek ? ['Make it cheaper', 'Simpler weeknights', 'More variety', 'More vegetables'] : ['Make it cheaper', 'Make it faster', 'More vegetables', 'Milder']).map((tweak) => (
              <button type="button" key={tweak} onClick={() => setInput(tweak)}>{tweak}</button>
            ))}
          </div>
          <div className="chat-interface__inputWrap">
            <textarea
              rows={2}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => submitOnEnter(event, () => onFinalize(input))}
              placeholder={isWeek ? 'Any final tweak to the week? Leave blank to use it as suggested.' : 'Any final tweak? Leave blank to use it as suggested.'}
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

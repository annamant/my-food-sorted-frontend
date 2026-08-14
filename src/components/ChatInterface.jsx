import MealBriefPanel from './MealBriefPanel'
import './ChatInterface.css'

const TWEAK_SUGGESTS = ['Make cheaper', 'Lower calories', 'More protein', 'Use my cupboard']

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function ChatInterface({
  messages,
  input,
  setInput,
  sendMessage,
  loading,
  onClearChat,
  mode,
  onModeChange,
  hasRecipe,
  brief,
  onChangeBrief,
  prefs,
  onCreate,
}) {
  const kitchenMode = hasRecipe ? 'tweak' : mode

  return (
    <div className={`chat-interface ${kitchenMode === 'tweak' ? 'chat-interface--tweak' : 'chat-interface--compose'}`}>
      <div className="chat-interface__top">
        <div>
          <p className="chat-interface__label">
            {kitchenMode === 'tweak' ? 'Tweak this' : 'The kitchen'}
          </p>
          <h2 className="chat-interface__title">
            {kitchenMode === 'tweak'
              ? 'One change at a time'
              : kitchenMode === 'create'
                ? 'Make your own'
                : 'Find a dish'}
          </h2>
        </div>
        {(hasRecipe || messages.length > 0) && onClearChat && (
          <button
            type="button"
            className="chat-interface__clear"
            onClick={onClearChat}
            disabled={loading}
          >
            Start over
          </button>
        )}
      </div>

      {kitchenMode !== 'tweak' && (
        <div className="chat-interface__modes" role="tablist" aria-label="How to cook">
          <button
            type="button"
            role="tab"
            aria-selected={kitchenMode === 'search'}
            className={`chat-interface__mode ${kitchenMode === 'search' ? 'chat-interface__mode--on' : ''}`}
            disabled={loading}
            onClick={() => onModeChange?.('search')}
          >
            Find a dish
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={kitchenMode === 'create'}
            className={`chat-interface__mode ${kitchenMode === 'create' ? 'chat-interface__mode--on' : ''}`}
            disabled={loading}
            onClick={() => onModeChange?.('create')}
          >
            Make my own
          </button>
        </div>
      )}

      {kitchenMode === 'search' && (
        <p className="chat-interface__disclaimer">
          Name a dish or a mood. One search, one recipe. Mood tiles below fill this box — they don’t cook until you hit Find.
        </p>
      )}

      {kitchenMode === 'create' && (
        <>
          <MealBriefPanel brief={brief} onChange={onChangeBrief} prefs={prefs} />
          <div className="chat-interface__createActions">
            <button
              type="button"
              className="btn btn--primary"
              disabled={loading}
              onClick={onCreate}
            >
              {loading ? 'Cooking…' : 'Cook this once'}
            </button>
            <p className="chat-interface__createHint">Uses one kitchen message. Then you can tweak.</p>
          </div>
        </>
      )}

      {kitchenMode === 'tweak' && (
        <>
          <p className="chat-interface__disclaimer">
            Each tweak cooks a new version. Say one change, then send.
          </p>
          <div className="chat-interface__messages">
            {messages.map((m, i) => (
              <div key={messageKey(m, i)} className={`chat-interface__message chat-interface__message--${m.role}`}>
                <strong className="chat-interface__messageRole">{m.role === 'user' ? 'You' : 'Kitchen'}</strong>
                <span className="chat-interface__messageContent">{m.content}</span>
              </div>
            ))}
            {loading && <div className="chat-interface__loading">Cooking…</div>}
          </div>
          <div className="chat-interface__chips" aria-label="Quick tweaks">
            {TWEAK_SUGGESTS.map((label) => (
              <button
                key={label}
                type="button"
                className="chat-interface__suggest"
                disabled={loading}
                onClick={() => setInput(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}

      {kitchenMode !== 'create' && (
        <div className="chat-interface__inputWrap">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={
              kitchenMode === 'tweak'
                ? 'Make it cheaper, no garlic, extra crispy…'
                : 'Carbonara, leftover chicken, Japanese…'
            }
            className="chat-interface__input"
            aria-label={kitchenMode === 'tweak' ? 'Tweak this recipe' : 'Find a dish'}
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn btn--primary"
          >
            {loading ? 'Cooking…' : kitchenMode === 'tweak' ? 'Tweak' : 'Find'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatInterface

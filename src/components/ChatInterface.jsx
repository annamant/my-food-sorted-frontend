import MealBriefPanel from './MealBriefPanel'
import './ChatInterface.css'

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
  hasRecipe,
  brief,
  onChangeBrief,
  prefs,
  onCreate,
  catalogMiss,
  missQuery,
}) {
  if (hasRecipe) {
    return (
      <div className="chat-interface chat-interface--tweak">
        <div className="chat-interface__top">
          <div>
            <p className="chat-interface__label">Tweak this</p>
            <h2 className="chat-interface__title">One change at a time</h2>
          </div>
          {onClearChat && (
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
        <p className="chat-interface__disclaimer">
          Say one change. A new dish comes back.
        </p>
        {messages.length > 0 && (
          <div className="chat-interface__messages">
            {messages.map((m, i) => (
              <div key={messageKey(m, i)} className={`chat-interface__message chat-interface__message--${m.role}`}>
                <strong className="chat-interface__messageRole">{m.role === 'user' ? 'You' : 'Kitchen'}</strong>
                <span className="chat-interface__messageContent">{m.content}</span>
              </div>
            ))}
            {loading && <div className="chat-interface__loading">Cooking…</div>}
          </div>
        )}
        <div className="chat-interface__inputWrap">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Make it cheaper, no garlic, extra crispy…"
            className="chat-interface__input"
            aria-label="Tweak this recipe"
            disabled={loading}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="btn btn--primary"
          >
            {loading ? 'Cooking…' : 'Tweak'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-interface chat-interface--compose">
      <MealBriefPanel
        brief={brief}
        onChange={onChangeBrief}
        prefs={prefs}
        requireNotes={Boolean(catalogMiss)}
      />
      {catalogMiss && (
        <div className="chat-interface__createActions">
          <p className="chat-interface__createHint">
            We don’t have “{missQuery}” on the shelf. Tell the chef what you want, then we’ll make one.
          </p>
          <button
            type="button"
            className="btn btn--primary"
            disabled={loading || !brief?.notes?.trim()}
            onClick={onCreate}
          >
            {loading ? 'Cooking…' : 'Make this one'}
          </button>
        </div>
      )}
    </div>
  )
}

export default ChatInterface

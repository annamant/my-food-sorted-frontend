import './ChatInterface.css'

const COMPOSE_MODES = [
  {
    id: 'classic',
    label: 'Get a classic',
    prompt: 'Give me a classic carbonara for my brief — include cost and calories so I can remix it.',
  },
  {
    id: 'remix',
    label: 'Remix',
    prompt: 'Remix the last recipe to be lower calorie and cheaper without losing flavour.',
  },
  {
    id: 'pantry',
    label: 'From pantry',
    prompt: 'Create a dinner using mainly what I marked in the cupboard / pantry in my brief. Minimise new shopping.',
  },
  {
    id: 'week',
    label: 'Build a week',
    prompt: 'Build a week of meals from my brief — varied, budget-aware, good for wellbeing. Save-ready.',
  },
]

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function ChatInterface({ messages, input, setInput, sendMessage, loading, onQuickPrompt }) {
  return (
    <div className="chat-interface">
      <h2 className="chat-interface__title">Compose</h2>
      <p className="chat-interface__disclaimer">
        Ask for a classic, remix it for cost or wellbeing, cook from what you have, then save to your library —
        like adding a track to a playlist. Not medical advice; for clinical concerns, speak with your GP or a dietitian.
      </p>

      <div className="chat-interface__modes" role="group" aria-label="Compose modes">
        {COMPOSE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className="chat-interface__mode"
            disabled={loading}
            onClick={() => {
              if (onQuickPrompt) onQuickPrompt(mode.prompt)
              else {
                setInput(mode.prompt)
              }
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="chat-interface__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-interface__empty">
            Try a mode above, or ask for any recipe you want in your library.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={messageKey(m, i)} className={`chat-interface__message chat-interface__message--${m.role}`}>
            <strong className="chat-interface__messageRole">{m.role === 'user' ? 'You' : 'Kitchen'}</strong>
            <span className="chat-interface__messageContent">{m.content}</span>
          </div>
        ))}
        {loading && <div className="chat-interface__loading">•••</div>}
      </div>
      <div className="chat-interface__inputWrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask for a recipe, remix one, or say go…"
          className="chat-interface__input"
          aria-label="Chat message"
          disabled={loading}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="btn btn--primary"
        >
          Send
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
export { COMPOSE_MODES }

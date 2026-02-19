import './ChatPanel.css'

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

export default function ChatPanel({ messages, input, setInput, onSend, loading }) {
  return (
    <section className="chat-panel" aria-label="Chat">
      <h2 className="chat-panel__title">Chat</h2>
      <div className="chat-panel__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-panel__empty">Ask for a meal plan (e.g. &quot;Quick dinners for 2 this week&quot;).</p>
        )}
        {messages.map((m, i) => (
          <div key={messageKey(m, i)} className={`chat-panel__message chat-panel__message--${m.role}`}>
            <strong className="chat-panel__messageRole">{m.role}:</strong>
            <span className="chat-panel__messageContent">{m.content}</span>
          </div>
        ))}
        {loading && (
          <div className="chat-panel__message chat-panel__message--assistant chat-panel__message--loading">
            <span className="chat-panel__typing">...</span>
          </div>
        )}
      </div>
      <div className="chat-panel__inputWrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="Type a message"
          className="chat-panel__input"
          aria-label="Chat message"
          disabled={loading}
        />
        <button
          type="button"
          onClick={onSend}
          disabled={loading || !input.trim()}
          className="btn btn--primary"
        >
          Send
        </button>
      </div>
    </section>
  )
}

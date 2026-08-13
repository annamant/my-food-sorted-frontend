import './ChatInterface.css'

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function ChatInterface({ messages, input, setInput, sendMessage, loading }) {
  return (
    <div className="chat-interface">
      <h2 className="chat-interface__title">Compose</h2>
      <p className="chat-interface__disclaimer">
        Everyday meal ideas for your kitchen — not medical or clinical advice.
        For dietary concerns, speak with your GP or a registered dietitian.
      </p>
      <div className="chat-interface__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-interface__empty">
            Set your brief above, then send a note — or simply say “go”.
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
          placeholder="Add a note, or say go…"
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

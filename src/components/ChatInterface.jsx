import './ChatInterface.css'

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function ChatInterface({ messages, input, setInput, sendMessage, loading }) {
  return (
    <div className="chat-interface">
      <h2 className="chat-interface__title">Chat</h2>
      <p className="chat-interface__disclaimer">
        For medical or clinical dietary advice, please consult your GP or a registered dietitian.
        My Food SORTED is here to help with everyday meal ideas and does not replace professional medical advice.
      </p>
      <div className="chat-interface__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-interface__empty">
            Tick your meal brief above, then send a short note — e.g. “make brunch light” or “go”.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={messageKey(m, i)} className={`chat-interface__message chat-interface__message--${m.role}`}>
            <strong className="chat-interface__messageRole">{m.role}</strong>
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
          placeholder="Add a note, or just say go…"
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

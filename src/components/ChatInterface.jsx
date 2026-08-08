import './ChatInterface.css'

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function ChatInterface({ messages, input, setInput, sendMessage, loading }) {
  return (
    <div className="chat-interface">
      <h2 className="chat-interface__title">Chat</h2>
      <div className="chat-interface__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-interface__empty">
            Tell the chef what you're after — they'll ask a few quick questions (likes, dislikes, what's in the cupboard) before building your plan.
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
          placeholder="e.g. high-protein Italian dinners for 4…"
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

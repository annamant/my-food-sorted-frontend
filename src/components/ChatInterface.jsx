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
}) {
  const hasThread = messages.length > 0 || loading

  if (!hasThread) return null

  return (
    <div className="chat-interface chat-interface--tweak">
      <div className="chat-interface__top">
        <div>
          <p className="chat-interface__label">Tweak this</p>
          <h2 className="chat-interface__title">Cheaper, lighter, or yours</h2>
        </div>
        {onClearChat && (
          <button
            type="button"
            className="chat-interface__clear"
            onClick={onClearChat}
            disabled={loading || messages.length === 0}
          >
            Start over
          </button>
        )}
      </div>

      <div className="chat-interface__messages">
        {messages.map((m, i) => (
          <div key={messageKey(m, i)} className={`chat-interface__message chat-interface__message--${m.role}`}>
            <strong className="chat-interface__messageRole">{m.role === 'user' ? 'You' : 'Kitchen'}</strong>
            <span className="chat-interface__messageContent">{m.content}</span>
          </div>
        ))}
        {loading && <div className="chat-interface__loading">Cooking…</div>}
      </div>

      <div className="chat-interface__inputWrap">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Tweak it — cheaper, no garlic, extra crispy…"
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
          Tweak
        </button>
      </div>
    </div>
  )
}

export default ChatInterface

import './ChatInterface.css'

const COMPOSE_MODES = [
  {
    id: 'classic',
    label: 'Find a classic',
    prompt:
      'Give me a classic recipe adapted to my Step 1 brief — keep my proteins, meal slots, avoid list and notes exactly. Include cost and calories.',
  },
  {
    id: 'tonight',
    label: 'What am I cooking tonight?',
    prompt:
      'What am I cooking tonight? One strong meal that strictly follows my Step 1 brief (proteins, meal type, avoid list, notes). Realistic UK cost and calories. Save-ready.',
  },
  {
    id: 'invent',
    label: 'Invent something',
    prompt:
      'Invent a new dish that strictly follows my Step 1 brief — creative but cookable, obeying proteins, meal slots, avoid list and notes. Cost and calories. Save-ready.',
  },
  {
    id: 'pantry',
    label: 'From my cupboard',
    prompt:
      'Create a meal using mainly the cupboard/pantry items in my Step 1 brief, still obeying proteins, meal slots, avoid list and notes. Minimise new shopping.',
  },
  {
    id: 'occasion',
    label: 'Special occasion menu',
    prompt:
      'Create a special-occasion menu that strictly follows my Step 1 brief — guest-worthy but home-cookable, same proteins/meal slots/avoid/notes. Cost and calories. Save-ready.',
  },
  {
    id: 'remix',
    label: 'Remix last idea',
    prompt:
      'Remix the last recipe to be lower calorie and cheaper without losing flavour — still obey my Step 1 brief (proteins, avoid list, notes).',
  },
  {
    id: 'week',
    label: 'Build a week',
    prompt:
      'Build a week of meals that strictly follows my Step 1 brief — varied, budget-aware, good for wellbeing, same proteins/avoid/notes rules throughout. Save-ready.',
  },
]

function messageKey(m, i) {
  return m.id ?? `msg-${i}-${String(m.content).slice(0, 40)}`
}

function briefChips(brief) {
  if (!brief) return []
  const chips = []
  if (brief.meal_slots?.length) chips.push(...brief.meal_slots.map((s) => String(s)))
  if (brief.proteins?.length) chips.push(...brief.proteins.map((p) => String(p)))
  if (brief.cuisines?.length) chips.push(...brief.cuisines.slice(0, 2).map((c) => String(c)))
  if (brief.budget_per_day) chips.push(`£${brief.budget_per_day}/day`)
  if (brief.max_cook_minutes) chips.push(`${brief.max_cook_minutes} mins`)
  if (brief.avoid?.trim()) chips.push(`Avoid: ${brief.avoid.trim()}`)
  if (brief.notes?.trim()) chips.push(brief.notes.trim())
  return chips
}

function ChatInterface({
  messages,
  input,
  setInput,
  sendMessage,
  loading,
  onQuickPrompt,
  mealBrief,
  onClearChat,
}) {
  const chips = briefChips(mealBrief)

  return (
    <div className="chat-interface">
      <div className="chat-interface__top">
        <div>
          <p className="chat-interface__label">Step 2 · create</p>
          <h2 className="chat-interface__title">Ask, invent, discover</h2>
        </div>
        {onClearChat && (
          <button
            type="button"
            className="chat-interface__clear"
            onClick={onClearChat}
            disabled={loading || messages.length === 0}
          >
            Clear chat
          </button>
        )}
      </div>

      <p className="chat-interface__disclaimer">
        Your Step 1 choices below are always sent with whatever you type or tap.
        Write extra wishes in the box (onions, no garlic, spicy…) — they join the brief.
        Not medical advice; for clinical concerns, speak with your GP or a dietitian.
      </p>

      {chips.length > 0 && (
        <div className="chat-interface__activeBrief" aria-label="Active brief">
          <p className="chat-interface__activeLabel">Using from Step 1</p>
          <ul className="chat-interface__chips">
            {chips.map((chip) => (
              <li key={chip} className="chat-interface__chip">{chip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="chat-interface__modes" role="group" aria-label="Create modes">
        {COMPOSE_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className="chat-interface__mode"
            disabled={loading}
            onClick={() => {
              if (onQuickPrompt) onQuickPrompt(mode.prompt)
              else setInput(mode.prompt)
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="chat-interface__messages">
        {messages.length === 0 && !loading && (
          <p className="chat-interface__empty">
            Set Step 1, then type here or tap a mode. Everything in the brief travels with your request.
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
          placeholder="Add wishes here — e.g. lots of onions, no garlic, extra crispy…"
          className="chat-interface__input"
          aria-label="Create a recipe"
          disabled={loading}
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="btn btn--primary"
        >
          Create
        </button>
      </div>
    </div>
  )
}

export default ChatInterface
export { COMPOSE_MODES }

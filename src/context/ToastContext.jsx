import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(null)

const TOAST_TTL_MS = 4000
const ERROR_TTL_MS = 7000
const MAX_TOASTS = 5

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current[id])
    delete timers.current[id]
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message, type = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      setToasts((prev) => {
        const capped = prev.length >= MAX_TOASTS ? prev.slice(1) : prev
        return [...capped, { id, message, type }]
      })
      const ttl = type === 'error' ? ERROR_TTL_MS : TOAST_TTL_MS
      timers.current[id] = setTimeout(() => dismiss(id), ttl)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, dismiss }}>
      {children}
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

function ToastList({ toasts, onDismiss }) {
  return (
    <div className="toast-list" role="region" aria-label="Notifications">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="alert">
          <span className="toast__message">{t.message}</span>
          <button
            type="button"
            className="toast__dismiss"
            aria-label="Dismiss"
            onClick={() => onDismiss(t.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

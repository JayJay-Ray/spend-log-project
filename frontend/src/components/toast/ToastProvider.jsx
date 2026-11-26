import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { ToastContext } from './ToastContext.js'

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const nextIdRef = useRef(0)
  const timersRef = useRef(new Map())

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id)

    if (timer) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }

    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ type = 'info', message, detail, duration = 4500 }) => {
      const id = nextIdRef.current
      nextIdRef.current += 1

      setToasts((current) => [
        ...current.slice(-2),
        { id, type, message, detail },
      ])

      if (duration > 0) {
        const timer = window.setTimeout(() => dismiss(id), duration)
        timersRef.current.set(id, timer)
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const timers = timersRef.current

    return () => {
      for (const timer of timers.values()) {
        window.clearTimeout(timer)
      }

      timers.clear()
    }
  }, [])

  const contextValue = useMemo(
    () => ({ showToast, dismiss }),
    [dismiss, showToast],
  )

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      <div className="toast-viewport" aria-live="polite">
        {toasts.map((toast) => {
          const Icon = TOAST_ICONS[toast.type] ?? Info

          return (
            <div
              className={`toast toast--${toast.type}`}
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
            >
              <span className="toast__icon" aria-hidden="true">
                <Icon size={18} />
              </span>

              <div className="toast__content">
                <p className="toast__message">{toast.message}</p>
                {toast.detail && (
                  <p className="toast__detail">{toast.detail}</p>
                )}
              </div>

              <button
                className="toast__close"
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

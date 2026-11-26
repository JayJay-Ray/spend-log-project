import { AlertCircle, RefreshCw } from 'lucide-react'

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
}) {
  return (
    <div className="error-state" role="alert">
      <span className="error-state__icon" aria-hidden="true">
        <AlertCircle size={22} />
      </span>

      <div className="error-state__copy">
        <h3 className="error-state__title">{title}</h3>
        <p className="error-state__message">{message}</p>
      </div>

      {onRetry && (
        <button className="btn btn--secondary btn--sm" type="button" onClick={onRetry}>
          <RefreshCw size={14} />
          {retryLabel}
        </button>
      )}
    </div>
  )
}

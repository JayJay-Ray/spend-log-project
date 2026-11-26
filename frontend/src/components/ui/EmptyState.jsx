import { Inbox } from 'lucide-react'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  compact = false,
}) {
  return (
    <div className={`empty-state${compact ? ' empty-state--compact' : ''}`}>
      <span className="empty-state__icon" aria-hidden="true">
        <Icon size={compact ? 20 : 26} />
      </span>
      <div className="empty-state__copy">
        <h3 className="empty-state__title">{title}</h3>
        <p className="empty-state__description">{description}</p>
      </div>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  )
}

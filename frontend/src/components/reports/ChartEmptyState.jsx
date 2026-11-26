import { ChartColumn } from 'lucide-react'

export default function ChartEmptyState({
  title = 'No spending in this range',
  description = 'Try a different date range or add an expense.',
}) {
  return (
    <div className="chart-empty">
      <span className="chart-empty__icon" aria-hidden="true">
        <ChartColumn size={22} />
      </span>
      <div>
        <p className="chart-empty__title">{title}</p>
        <p className="chart-empty__description">{description}</p>
      </div>
    </div>
  )
}

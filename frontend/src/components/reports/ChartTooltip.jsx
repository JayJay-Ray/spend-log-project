import { formatCurrency } from '../../lib/money.js'

export default function ChartTooltip({
  active,
  payload,
  label,
  labelFormatter,
  valueLabel = 'Spent',
}) {
  if (!active || !payload?.length) {
    return null
  }

  const entry = payload[0]
  const title = labelFormatter ? labelFormatter(label, entry) : label
  const color =
    entry.color || entry.payload?.fill || 'var(--chart-1)'

  return (
    <div className="chart-tooltip">
      <p className="chart-tooltip__label">{title}</p>
      <div className="chart-tooltip__row">
        <span
          className="chart-tooltip__dot"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="chart-tooltip__name">{valueLabel}</span>
        <strong className="chart-tooltip__value">
          {formatCurrency(entry.value)}
        </strong>
      </div>
    </div>
  )
}

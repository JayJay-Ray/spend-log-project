import { useId } from 'react'
import { CalendarRange } from 'lucide-react'
import {
  formatDateRange,
  formatDayCount,
  daysBetweenInclusive,
} from '../../lib/dates.js'

export default function ReportRangeFilter({
  draftFrom,
  draftTo,
  setDraftFrom,
  setDraftTo,
  applyCustomRange,
  range,
  validationError,
  loading,
  hasNoExpenses,
}) {
  const fromId = useId()
  const toId = useId()
  const days = range
    ? daysBetweenInclusive(range.from, range.to)
    : 0

  function handleSubmit(event) {
    event.preventDefault()
    applyCustomRange()
  }

  const summary = range
    ? `${formatDateRange(range.from, range.to)} · ${formatDayCount(days)}`
    : loading
      ? 'Loading available dates…'
      : hasNoExpenses
        ? 'No expenses recorded yet'
        : 'Choose a custom range'

  return (
    <div className="range-filter">
      <form className="range-custom" onSubmit={handleSubmit}>
        <div className="range-field">
          <label htmlFor={fromId}>From</label>
          <input
            id={fromId}
            type="date"
            value={draftFrom}
            onChange={(event) => setDraftFrom(event.target.value)}
            aria-invalid={Boolean(validationError)}
          />
        </div>

        <span className="range-separator" aria-hidden="true">
          to
        </span>

        <div className="range-field">
          <label htmlFor={toId}>To</label>
          <input
            id={toId}
            type="date"
            value={draftTo}
            onChange={(event) => setDraftTo(event.target.value)}
            aria-invalid={Boolean(validationError)}
          />
        </div>

        <button className="btn btn--secondary btn--sm" type="submit">
          Apply
        </button>
      </form>

      <div className="range-filter__meta">
        <span className="range-filter__summary">
          <CalendarRange size={14} aria-hidden="true" />
          {summary}
        </span>

        {validationError && (
          <span className="range-filter__error" role="alert">
            {validationError}
          </span>
        )}
      </div>
    </div>
  )
}

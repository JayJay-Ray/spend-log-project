import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatCount } from '../lib/money.js'

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  disabled = false,
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = total === 0 ? 0 : page * pageSize + 1
  const end = Math.min(total, (page + 1) * pageSize)

  return (
    <div className="pagination">
      <p className="pagination__summary">
        Showing <strong>{formatCount(start)}</strong>–
        <strong>{formatCount(end)}</strong> of{' '}
        <strong>{formatCount(total)}</strong>
      </p>

      <div className="pagination__controls">
        <button
          className="icon-button icon-button--subtle"
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={disabled || page <= 0}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="pagination__page">
          Page {formatCount(page + 1)} of {formatCount(pageCount)}
        </span>

        <button
          className="icon-button icon-button--subtle"
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={disabled || page + 1 >= pageCount}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}

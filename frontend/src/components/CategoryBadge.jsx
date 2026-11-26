import { getCategoryColor } from '../lib/categories.js'

export default function CategoryBadge({ category, disableColor = false, plain = false }) {
  if (plain) {
    return <span className="category-text">{category}</span>
  }

  return (
    <span
      className={`category-badge${disableColor ? ' category-badge--plain' : ''}`}
      style={{ '--category-color': getCategoryColor(category) }}
    >
      {!disableColor && (
        <span className="category-badge__dot" aria-hidden="true" />
      )}
      {category}
    </span>
  )
}

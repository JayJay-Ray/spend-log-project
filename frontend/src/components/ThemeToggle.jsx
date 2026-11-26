import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === 'dark'
  const label = isDark ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__track" aria-hidden="true">
        <span className="theme-toggle__thumb">
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </span>
      </span>
    </button>
  )
}

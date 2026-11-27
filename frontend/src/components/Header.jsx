import { Plus } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ theme, onToggleTheme, onAddExpense }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand">
          <span className="brand__mark">
            <img
              className="brand__logo"
              src="/spend-log-logo.svg"
              alt=""
              width="40"
              height="40"
              decoding="async"
            />
          </span>
          <span className="brand__copy">
            <span className="brand__name">SpendLog</span>
            <span className="brand__tagline">Expense tracker</span>
          </span>
        </div>

        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />

          <button
            className="btn btn--primary"
            type="button"
            onClick={onAddExpense}
            aria-label="Add expense"
            title="Add expense"
          >
            <Plus size={17} />
            <span className="btn__label">Add expense</span>
          </button>
        </div>
      </div>
    </header>
  );
}

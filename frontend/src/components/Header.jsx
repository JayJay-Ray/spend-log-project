import { Plus, WalletMinimal } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header({ theme, onToggleTheme, onAddExpense }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <WalletMinimal size={20} />
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
          >
            <Plus size={17} />
            <span>Add expense</span>
          </button>
        </div>
      </div>
    </header>
  );
}

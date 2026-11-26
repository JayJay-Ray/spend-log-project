import { useState, useEffect, useRef } from "react";
import { ReceiptText } from "lucide-react";
import { formatCount } from "../../lib/money.js";
import ConfirmDialog from "../ConfirmDialog.jsx";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import Pagination from "../Pagination.jsx";
import ExpenseTable from "./ExpenseTable.jsx";

export default function ExpenseLedger({
  rows,
  total,
  page,
  pageSize,
  loading,
  error,
  onPageChange,
  onRetry,
  onEdit,
  onDelete,
  onAdd,
  search,
  category,
  from,
  to,
  onSearchChange,
  onCategoryChange,
  onFromChange,
  onToChange,
  onClearFilters,
  hasActiveFilters,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const searchTimer = useRef(null);
  const [localSearch, setLocalSearch] = useState(search ?? "");

  const dateRangeActive = Boolean(from && to);
  const activeFilterCount =
    [search, category].filter(Boolean).length + (dateRangeActive ? 1 : 0);

  const categoryOptions = Array.from(
    new Set(rows.map((expense) => expense.category).filter(Boolean)),
  ).sort((first, second) => first.localeCompare(second));

  useEffect(() => {
    setLocalSearch(search ?? "");
  }, [search]);

  function askToDelete(expense) {
    setDeleteError("");
    setPendingDelete(expense);
  }

  function cancelDelete() {
    setDeleteError("");
    setPendingDelete(null);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) {
      return;
    }

    setDeletePending(true);
    setDeleteError("");

    try {
      await onDelete(pendingDelete);
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error.message || "Could not delete the expense. Try again.",
      );
    } finally {
      setDeletePending(false);
    }
  }

  const showEmpty = !loading && !error && total === 0;

  function handleSearchChange(event) {
    const value = event.target.value;

    setLocalSearch(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(() => {
      onSearchChange(value);
    }, 300);
  }

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, []);

  return (
    <section
      className="ledger-section"
      id="expenses"
      aria-labelledby="expenses-heading"
    >
      <div className="section-heading section-heading--row">
        <div>
          <h2 id="expenses-heading">Expense Table</h2>
        </div>
      </div>

      <div className="ledger-card">
        <div
          className="filter-toolbar"
          role="region"
          aria-label="Expense filters"
        >
          <form
            className="filter-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="filter-field">
              <label htmlFor="expense-search">Search description</label>
              <input
                id="expense-search"
                type="search"
                value={localSearch}
                onChange={handleSearchChange}
                placeholder="Search by description"
                aria-controls="expenses-table"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="expense-category">Category</label>
              <select
                id="expense-category"
                value={category ?? ""}
                onChange={onCategoryChange}
                aria-controls="expenses-table"
              >
                <option value="">All categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-field">
              <label htmlFor="expense-from">From</label>
              <input
                id="expense-from"
                type="date"
                value={from ?? ""}
                onChange={(event) => onFromChange(event.target.value)}
                aria-controls="expenses-table"
              />
            </div>

            <div className="filter-field">
              <label htmlFor="expense-to">To</label>
              <input
                id="expense-to"
                type="date"
                value={to ?? ""}
                onChange={(event) => onToChange(event.target.value)}
                aria-controls="expenses-table"
              />
            </div>

            {activeFilterCount > 0 && (
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={onClearFilters}
              >
                Clear filters
              </button>
            )}
          </form>

          <div className="filter-toolbar__meta">
            <span className="filter-toolbar__count">
              {formatCount(total)} {total === 1 ? "expense" : "expenses"}
            </span>
            {activeFilterCount > 0 && (
              <span className="filter-toolbar__active">
                {activeFilterCount} active filter
                {activeFilterCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="ledger-card__feedback">
            <ErrorState
              title="Expenses could not be loaded"
              message={error}
              onRetry={onRetry}
            />
          </div>
        )}

        {!error && showEmpty && (
          <div className="ledger-card__feedback">
            <EmptyState
              icon={ReceiptText}
              title="No expenses recorded yet"
              description="Add your first expense to start building the ledger and its reports."
              action={
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={onAdd}
                >
                  Record your first expense
                </button>
              }
            />
          </div>
        )}

        {!error && !showEmpty && (
          <>
            <ExpenseTable
              rows={rows}
              loading={loading}
              onEdit={onEdit}
              onDelete={askToDelete}
            />

            {total > 0 && (
              <Pagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={onPageChange}
                disabled={loading}
              />
            )}
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this expense?"
        description="This action cannot be undone."
        confirmLabel="Delete expense"
        pending={deletePending}
        onCancel={cancelDelete}
        onConfirm={handleConfirmDelete}
      >
        {deleteError && (
          <p className="form-alert confirm-dialog__error" role="alert">
            {deleteError}
          </p>
        )}
      </ConfirmDialog>
    </section>
  );
}

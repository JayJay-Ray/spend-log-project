import { useMemo, useState } from "react";
import { deleteExpense } from "./api/client.js";
import ExpenseFormDialog from "./components/expenses/ExpenseFormDialog.jsx";
import ExpenseLedger from "./components/expenses/ExpenseLedger.jsx";
import Header from "./components/Header.jsx";
import ReportsSection from "./components/reports/ReportsSection.jsx";
import useExpenses from "./hooks/useExpenses.js";
import usePrefersReducedMotion from "./hooks/usePrefersReducedMotion.js";
import useReportRange from "./hooks/useReportRange.js";
import useReports from "./hooks/useReports.js";
import useTheme from "./hooks/useTheme.js";
import useToast from "./hooks/useToast.js";
import { PAGE_SIZE } from "./lib/constants.js";
import "./App.css";

function App() {
  const { theme, toggleTheme } = useTheme();
  const reducedMotion = usePrefersReducedMotion();
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [formState, setFormState] = useState({
    open: false,
    expense: null,
    openCount: 0,
  });

  const rangeState = useReportRange(refreshKey);
  const reportsState = useReports(rangeState.range, refreshKey);
  const dateRangeComplete = Boolean(from && to);

  const expensesState = useExpenses({
    page,
    pageSize: PAGE_SIZE,
    refreshKey,
    search,
    category,
    from: dateRangeComplete ? from : undefined,
    to: dateRangeComplete ? to : undefined,
  });

  const categorySuggestions = useMemo(() => {
    const categories = new Set();

    for (const row of reportsState.reports?.categories ?? []) {
      categories.add(row.category);
    }

    for (const expense of expensesState.rows) {
      categories.add(expense.category);
    }

    return [...categories].sort((first, second) => first.localeCompare(second));
  }, [expensesState.rows, reportsState.reports]);

  function openAddExpense() {
    setFormState((current) => ({
      open: true,
      expense: null,
      openCount: current.openCount + 1,
    }));
  }

  function openEditExpense(expense) {
    setFormState((current) => ({
      open: true,
      expense,
      openCount: current.openCount + 1,
    }));
  }

  function closeExpenseForm() {
    setFormState((current) => ({ ...current, open: false }));
  }

  function handleSearchChange(value) {
    setSearch(value);
    setPage(0);
  }

  function handleCategoryChange(event) {
    setCategory(event.target.value);
    setPage(0);
  }

  function handleFromChange(value) {
    setFrom(value);
    setPage(0);
  }

  function handleToChange(value) {
    setTo(value);
    setPage(0);
  }

  function handleClearFilters() {
    setSearch("");
    setCategory("");
    setFrom("");
    setTo("");
    setPage(0);
  }

  const hasActiveFilters = Boolean(search || category || from || to);

  function handleExpenseSaved({ expense, mode }) {
    setFormState({ open: false, expense: null });

    if (mode === "add") {
      setPage(0);
    }

    setRefreshKey((current) => current + 1);

    const range = rangeState.range;
    const isOutsideRange =
      range &&
      rangeState.activePreset !== "all-time" &&
      (expense.expense_date < range.from || expense.expense_date > range.to);

    showToast({
      type: "success",
      message: mode === "add" ? "Expense added." : "Expense updated.",
      detail: isOutsideRange
        ? "The saved date is outside the selected report range."
        : undefined,
    });
  }

  async function handleDeleteExpense(expense) {
    try {
      await deleteExpense(expense.id);

      if (expensesState.rows.length === 1 && page > 0) {
        setPage((current) => current - 1);
      }

      setRefreshKey((current) => current + 1);
      showToast({ type: "success", message: "Expense deleted." });
    } catch (error) {
      showToast({
        type: "error",
        message: error.message || "Could not delete the expense.",
      });
      throw error;
    }
  }

  const chartVersion = `${
    rangeState.range?.from ?? "none"
  }:${rangeState.range?.to ?? "none"}:${refreshKey}`;

  return (
    <>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onAddExpense={openAddExpense}
      />

      <main className="app-main">
        <ReportsSection
          rangeState={rangeState}
          reportsState={reportsState}
          reducedMotion={reducedMotion}
          chartVersion={chartVersion}
          onAddExpense={openAddExpense}
        />

        <ExpenseLedger
          rows={expensesState.rows}
          total={expensesState.total}
          page={page}
          pageSize={PAGE_SIZE}
          loading={expensesState.loading}
          error={expensesState.error}
          onPageChange={setPage}
          onRetry={expensesState.retry}
          onEdit={openEditExpense}
          onDelete={handleDeleteExpense}
          onAdd={openAddExpense}
          search={search}
          category={category}
          from={from}
          to={to}
          onSearchChange={handleSearchChange}
          onCategoryChange={handleCategoryChange}
          onFromChange={handleFromChange}
          onToChange={handleToChange}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />
      </main>

      <ExpenseFormDialog
        key={String(formState.openCount)}
        open={formState.open}
        expense={formState.expense}
        categorySuggestions={categorySuggestions}
        onClose={closeExpenseForm}
        onSaved={handleExpenseSaved}
      />
    </>
  );
}

export default App;

function normalizeCategory(value) {
  return value
    .trim()
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");
}

function normalizeExpense(expense) {
  return {
    expense_date: String(expense.expense_date ?? "").trim(),
    description: String(expense.description ?? "").trim(),
    category: normalizeCategory(String(expense.category ?? "")),
    amount: Number(expense.amount),
  };
}

function expensesAreEqual(a, b) {
  return (
    a.expense_date === b.expense_date &&
    a.description === b.description &&
    a.category === b.category &&
    a.amount === b.amount
  );
}

export function findDuplicate(candidate, existingExpenses) {
  const normalized = normalizeExpense(candidate);
  return existingExpenses.find((existing) =>
    expensesAreEqual(normalized, normalizeExpense(existing)),
  );
}

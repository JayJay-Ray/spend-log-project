import { useEffect, useId, useRef, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createExpense, updateExpense } from "../../api/client.js";
import {
  getInitialValues,
  validateExpense,
} from "../../lib/expense-validation.js";
import Modal from "../ui/Modal.jsx";
import { findDuplicate } from "../../lib/expense-duplicate.js";

export default function ExpenseFormDialog({
  open,
  expense,
  categorySuggestions,
  existingExpenses = [],
  onClose,
  onSaved,
}) {
  const [values, setValues] = useState(() => getInitialValues(expense));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const descriptionId = useId();
  const categoryListId = useId();
  const formId = useId();
  const descriptionInputRef = useRef(null);
  const [newCategory, setNewCategory] = useState("");
  const [dirty, setDirty] = useState(false);
  const isEditing = Boolean(expense);

  useEffect(() => {
    if (open) {
      setValues(getInitialValues(expense));
      setErrors({});
      setServerError("");
      setNewCategory("");
      setDirty(false);
      if (descriptionInputRef.current) {
        descriptionInputRef.current.focus();
      }
    }
  }, [open, expense]);

  function updateField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setDirty(true);
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateExpense({ ...values, newCategory });
    setErrors(nextErrors);
    setServerError("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const selectedCategory = newCategory.trim() || values.category.trim();

    const candidate = {
      expense_date: values.expenseDate,
      description: values.description.trim(),
      category: selectedCategory,
      amount: Number(values.amount),
    };

    if (!isEditing) {
      const duplicate = findDuplicate(candidate, existingExpenses);
      if (duplicate) {
        setServerError("This expense already exists.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const savedExpense = isEditing
        ? await updateExpense(expense.id, candidate)
        : await createExpense(candidate);

      onSaved({
        expense: savedExpense,
        mode: isEditing ? "edit" : "add",
      });
      setNewCategory("");
    } catch (requestError) {
      const fieldErrors = (requestError.details ?? []).reduce(
        (accum, issue) => {
          const field = (issue.field ?? "server").replace(/^query\./, "");
          return {
            ...accum,
            [field]: issue.message ?? "Could not save the expense.",
          };
        },
        {},
      );
      setErrors(fieldErrors);
      setServerError(
        requestError.message || "Could not save the expense. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={submitting}
      title={isEditing ? "Edit expense" : "Add expense"}
      description="Fill in the expense details to add or update a record."
    >
      <form onSubmit={handleSubmit} noValidate>
        {serverError && (
          <div className="form-error alert alert--error" role="alert">
            <span className="alert__icon" aria-hidden="true">
              ⚠️
            </span>
            <span className="alert__message">{serverError}</span>
          </div>
        )}
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor={descriptionId}>
              Description <span className="form-field__required">*</span>
            </label>
            <input
              ref={descriptionInputRef}
              id={descriptionId}
              name="description"
              type="text"
              value={values.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              aria-invalid={Boolean(errors.description)}
              required
            />
            {errors.description && (
              <span className="form-field__error" role="alert">
                {errors.description}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor={categoryListId}>
              Category <span className="form-field__required">*</span>
            </label>
            <select
              id={categoryListId}
              name="category"
              value={values.category}
              onChange={(event) => {
                updateField("category", event.target.value);
                setNewCategory("");
              }}
              aria-invalid={Boolean(errors.category)}
              required
            >
              <option value="">Choose a category</option>
              {categorySuggestions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
              {!isEditing && <option value="__new__">Add new category…</option>}
            </select>
            {errors.category && (
              <span className="form-field__error" role="alert">
                {errors.category}
              </span>
            )}
            {values.category === "__new__" && (
              <div className="form-field">
                <label htmlFor={`${categoryListId}-new`}>
                  New category name
                </label>
                <input
                  id={`${categoryListId}-new`}
                  type="text"
                  value={newCategory}
                  onChange={(event) => {
                    setNewCategory(event.target.value);
                    setServerError("");
                  }}
                  placeholder="Type a new category"
                  autoFocus
                />
                {errors.newCategory && (
                  <span className="form-field__error" role="alert">
                    {errors.newCategory}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="form-field">
            <label htmlFor={`${formId}-amount`}>
              Amount <span className="form-field__required">*</span>
            </label>
            <div className="amount-input">
              <span className="amount-input__prefix">₱</span>
              <input
                id={`${formId}-amount`}
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={values.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                aria-invalid={Boolean(errors.amount)}
                required
              />
            </div>
            {errors.amount && (
              <span className="form-field__error" role="alert">
                {errors.amount}
              </span>
            )}
          </div>

          <div className="form-field">
            <label htmlFor={`${formId}-date`}>
              Date <span className="form-field__required">*</span>
            </label>
            <input
              id={`${formId}-date`}
              name="expense_date"
              type="date"
              value={values.expenseDate}
              onChange={(event) =>
                updateField("expenseDate", event.target.value)
              }
              aria-invalid={Boolean(errors.expenseDate)}
              required
            />
            {errors.expenseDate && (
              <span className="form-field__error" role="alert">
                {errors.expenseDate}
              </span>
            )}
          </div>
        </div>

        <footer className="modal__footer">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !dirty}
          >
            {submitting && <LoaderCircle className="spin" size={16} />}
            {submitting
              ? "Saving…"
              : isEditing
                ? "Save changes"
                : "Add expense"}
          </button>
        </footer>
      </form>
    </Modal>
  );
}

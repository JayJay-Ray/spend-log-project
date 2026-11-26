import { isValidISODate, todayISO } from "./dates.js";

const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s&,.'\-/()]+$/;

export const MAX_AMOUNT = 9_999_999_999.99;

export function getInitialValues(expense) {
  if (!expense) {
    return {
      expenseDate: todayISO(),
      description: "",
      category: "",
      amount: "",
    };
  }

  return {
    expenseDate: expense.expense_date,
    description: expense.description,
    category: expense.category,
    amount: String(expense.amount),
  };
}

export function validateExpense(values) {
  const errors = {};
  const description = values.description.trim();
  const category = values.category.trim();
  const newCategory = values.newCategory?.trim();
  const amount = values.amount.trim();

  if (!values.expenseDate) {
    errors.expenseDate = "Choose the date the expense occurred.";
  } else if (!isValidISODate(values.expenseDate)) {
    errors.expenseDate = "Enter a valid calendar date.";
  }

  if (!description) {
    errors.description = "Description is required.";
  } else if (description.length > 500) {
    errors.description = "Description must be 500 characters or fewer.";
  } else if (!SAFE_TEXT_REGEX.test(description)) {
    errors.description = "Description contains invalid characters.";
  }

  if (category !== "__new__") {
    if (!category) {
      errors.category = "Category is required.";
    } else if (category.length > 100) {
      errors.category = "Category must be 100 characters or fewer.";
    } else if (!SAFE_TEXT_REGEX.test(category)) {
      errors.category = "Category contains invalid characters.";
    }
  }

  if (category === "__new__") {
    if (!newCategory) {
      errors.newCategory = "Enter a category name.";
    } else if (newCategory.length > 100) {
      errors.newCategory = "Category must be 100 characters or fewer.";
    } else if (!SAFE_TEXT_REGEX.test(newCategory)) {
      errors.newCategory = "Category contains invalid characters.";
    }
  }

  if (!amount) {
    errors.amount = "Amount is required.";
  } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
    errors.amount = "Only a number with at most two decimal places is allowed.";
  } else {
    const numericAmount = Number(amount);

    if (!(numericAmount > 0)) {
      errors.amount = "Amount must be greater than zero.";
    } else if (numericAmount > MAX_AMOUNT) {
      errors.amount = "Amount is too large.";
    }
  }

  return errors;
}

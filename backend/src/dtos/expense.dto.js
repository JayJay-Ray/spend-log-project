const { z } = require("zod");

const MAX_EXPENSE_ID = "9223372036854775807";

const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s&,.'\-/()]+$/;

function isValidCalendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() >= 1 &&
    parsed.toISOString().slice(0, 10) === value
  );
}

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

const expenseDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "expense_date must be in YYYY-MM-DD format.",
  })
  .refine(isValidCalendarDate, {
    message: "expense_date must be a real calendar date.",
  });

const descriptionSchema = z
  .string()
  .trim()
  .min(1, { message: "Description is required." })
  .max(500, { message: "Description must not exceed 500 characters." })
  .regex(SAFE_TEXT_REGEX, {
    message: "Description contains invalid characters.",
  });

const categorySchema = z
  .string()
  .trim()
  .min(1, { message: "Category is required." })
  .max(100, { message: "Category must not exceed 100 characters." })
  .regex(SAFE_TEXT_REGEX, {
    message: "Category contains invalid characters.",
  })
  .transform(normalizeCategory);

const amountSchema = z
  .number()
  .positive({ message: "Amount must be greater than zero." })
  .max(9999999999.99, { message: "Amount is too large." })
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(String(value)), {
    message: "Amount must have at most two decimal places.",
  });

const createExpenseSchema = z.strictObject({
  expense_date: expenseDateSchema,
  description: descriptionSchema,
  category: categorySchema,
  amount: amountSchema,
});

const updateExpenseSchema = z
  .strictObject({
    expense_date: expenseDateSchema.optional(),
    description: descriptionSchema.optional(),
    category: categorySchema.optional(),
    amount: amountSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required.",
  });

function dateRangeIsValid(data) {
  if (!data.from || !data.to) {
    return true;
  }

  return data.from <= data.to;
}

const dateRangeErrorMessage = {
  message: "from must be on or before to.",
  path: ["to"],
};

const listExpensesQuerySchema = z
  .strictObject({
    category: categorySchema.optional(),
    from: expenseDateSchema.optional(),
    to: expenseDateSchema.optional(),
    search: z.string().trim().min(1).max(200).optional(),
    limit: z.coerce.number().int().min(1).max(500).default(100),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .refine(dateRangeIsValid, dateRangeErrorMessage);

const expenseIdParamSchema = z.strictObject({
  id: z
    .string()
    .regex(/^[1-9]\d*$/, {
      message: "Invalid expense id.",
    })
    .refine(
      (value) =>
        /^[1-9]\d*$/.test(value) &&
        (value.length < MAX_EXPENSE_ID.length ||
          (value.length === MAX_EXPENSE_ID.length && value <= MAX_EXPENSE_ID)),
      {
        message: "Invalid expense id.",
      },
    ),
});

const expenseResponseSchema = z.strictObject({
  id: z.string(),
  expense_date: z.string(),
  description: z.string(),
  category: z.string(),
  amount: z.number(),
  created_at: z.string(),
});

function toDateOnly(value) {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return String(value);
}

function toExpenseResponse(row) {
  return expenseResponseSchema.parse({
    id: String(row.id),
    expense_date: toDateOnly(row.expense_date),
    description: row.description,
    category: row.category,
    amount: Number(row.amount),
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
  });
}

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParamSchema,
  listExpensesQuerySchema,
  toExpenseResponse,
  expenseDateSchema,
};

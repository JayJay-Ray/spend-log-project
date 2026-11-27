const express = require("express");
const { pool } = require("../db.js");
const validate = require("../middleware/validate.js");
const { writeRateLimiter } = require("../middleware/ratelimit.js");
const {
  createExpenseSchema,
  updateExpenseSchema,
  expenseIdParamSchema,
  listExpensesQuerySchema,
  toExpenseResponse,
} = require("../dtos/expense.dto.js");

const router = express.Router();

const EXPENSE_COLUMNS = `
  id,
  expense_date,
  description,
  category,
  amount,
  created_at
`;

const UPDATABLE_COLUMNS = new Set([
  "expense_date",
  "description",
  "category",
  "amount",
]);

function buildExpenseFilters({ category, from, to, search } = {}) {
  const conditions = [];
  const values = [];

  if (category !== undefined) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (from !== undefined) {
    values.push(from);
    conditions.push(`expense_date >= $${values.length}`);
  }

  if (to !== undefined) {
    values.push(to);
    conditions.push(`expense_date <= $${values.length}`);
  }

  if (search !== undefined && search !== "") {
    values.push(`%${search}%`);
    conditions.push(`description ILIKE $${values.length}`);
  }

  return {
    whereClause:
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

router.get(
  "/",
  validate(listExpensesQuerySchema, "query"),
  async (req, res) => {
    const { limit, offset, ...filters } = req.validated.query;
    const { whereClause, values } = buildExpenseFilters(req.validated.query);

    const [countResult, result] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) AS total FROM expenses ${whereClause}`,
        values,
      ),
      pool.query(
        `
          SELECT ${EXPENSE_COLUMNS}
          FROM expenses
          ${whereClause}
          ORDER BY expense_date DESC, id DESC
          LIMIT $${values.length + 1}
          OFFSET $${values.length + 2}
        `,
        [...values, limit, offset],
      ),
    ]);

    res.json({
      from: filters.from ?? null,
      to: filters.to ?? null,
      category: filters.category ?? null,
      search: filters.search ?? null,
      limit,
      offset,
      total: Number(countResult.rows[0].total),
      rows: result.rows.map(toExpenseResponse),
    });
  },
);

router.get(
  "/:id",
  validate(expenseIdParamSchema, "params"),
  async (req, res) => {
    const { id } = req.validated.params;

    const result = await pool.query(
      `SELECT ${EXPENSE_COLUMNS} FROM expenses WHERE id = $1`,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    return res.json(toExpenseResponse(result.rows[0]));
  },
);

router.post(
  "/",
  writeRateLimiter,
  validate(createExpenseSchema),
  async (req, res) => {
    const expense = req.validated.body;

    try {
      const result = await pool.query(
        `
        INSERT INTO expenses (expense_date, description, category, amount)
        VALUES ($1, $2, $3, $4)
        RETURNING ${EXPENSE_COLUMNS}
      `,
        [
          expense.expense_date,
          expense.description,
          expense.category,
          expense.amount,
        ],
      );

      const created = result.rows[0];

      res
        .status(201)
        .location(`/api/expenses/${created.id}`)
        .json(toExpenseResponse(created));
    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          error: "A duplicate expense already exists.",
          details: [
            { field: "server", message: "A duplicate expense already exists." },
          ],
        });
      }
      throw error;
    }
  },
);

router.patch(
  "/:id",
  writeRateLimiter,
  validate(expenseIdParamSchema, "params"),
  validate(updateExpenseSchema),
  async (req, res) => {
    const { id } = req.validated.params;
    const updates = req.validated.body;

    const columns = Object.keys(updates).filter((column) =>
      UPDATABLE_COLUMNS.has(column),
    );

    if (columns.length === 0) {
      return res.status(400).json({
        error: "No updatable fields provided.",
      });
    }

    const values = columns.map((column) => updates[column]);
    const assignments = columns.map(
      (column, index) => `${column} = $${index + 1}`,
    );

    values.push(id);

    try {
      const result = await pool.query(
        `
        UPDATE expenses
        SET ${assignments.join(", ")}
        WHERE id = $${values.length}
        RETURNING ${EXPENSE_COLUMNS}
      `,
        values,
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Expense not found." });
      }

      res.json(toExpenseResponse(result.rows[0]));
    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          error: "A duplicate expense already exists.",
          details: [
            { field: "server", message: "A duplicate expense already exists." },
          ],
        });
      }
      throw error;
    }
  },
);

router.delete(
  "/:id",
  writeRateLimiter,
  validate(expenseIdParamSchema, "params"),
  async (req, res) => {
    const { id } = req.validated.params;

    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Expense not found." });
    }

    res.status(204).send();
  },
);

module.exports = router;

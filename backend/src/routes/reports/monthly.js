const express = require("express");
const { pool } = require("../../db.js");
const validate = require("../../middleware/validate.js");
const {
  monthlyReportRangeSchema,
  toMonthlyReportRow,
} = require("../../dtos/report.dto.js");

const router = express.Router();

router.get(
  "/",
  validate(monthlyReportRangeSchema, "query"),
  async (req, res) => {
    const { from, to } = req.validated.query;

    const result = await pool.query(
      `
    WITH calendar AS (
        SELECT generate_series(
            date_trunc('month', $1::date),
            date_trunc('month', $2::date),
            interval '1 month'
        )::date AS period
    ),
    totals AS (
        SELECT date_trunc('month', expense_date)::date AS period, SUM(amount) AS total
        FROM expenses
        WHERE expense_date >= $1 AND expense_date <= $2
        GROUP BY 1
    )
    SELECT to_char(c.period, 'YYYY-MM') AS period, COALESCE(t.total, 0) AS total
    FROM calendar c
    LEFT JOIN totals t ON t.period = c.period
    ORDER BY c.period ASC
  `,
      [from, to],
    );

    res.json({
      from,
      to,
      rows: result.rows.map(toMonthlyReportRow),
    });
});

module.exports = router;

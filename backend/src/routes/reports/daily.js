const express = require("express");
const { pool } = require("../../db.js");
const validate = require("../../middleware/validate.js");
const {
  dailyReportRangeSchema,
  toDailyReportRow,
} = require("../../dtos/report.dto.js");

const router = express.Router();

router.get(
  "/",
  validate(dailyReportRangeSchema, "query"),
  async (req, res) => {
    const { from, to } = req.validated.query;

    const result = await pool.query(
      `
          WITH calendar AS (
              SELECT generate_series($1::date, $2::date, interval '1 day')::date AS period
          ),
          totals AS (
              SELECT expense_date AS period, SUM(amount) AS total
              FROM expenses
              WHERE expense_date >= $1 AND expense_date <= $2
              GROUP BY expense_date
          )
          SELECT to_char(c.period, 'YYYY-MM-DD') AS period, COALESCE(t.total, 0) AS total
          FROM calendar c
          LEFT JOIN totals t ON t.period = c.period
          ORDER BY c.period ASC
      `,
      [from, to],
    );

    res.json({
      from,
      to,
      rows: result.rows.map(toDailyReportRow),
    });
  });

module.exports = router;

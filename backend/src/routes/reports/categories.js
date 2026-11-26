const express = require("express");
const { pool } = require("../../db.js");
const validate = require("../../middleware/validate.js");
const {
  dateRangeQuerySchema,
  toCategoryReportRow,
} = require("../../dtos/report.dto.js");

const router = express.Router();

router.get("/", validate(dateRangeQuerySchema, "query"), async (req, res) => {
  const { from, to } = req.validated.query;

  const result = await pool.query(
    `
    SELECT category, SUM(amount) as total
    FROM expenses
    WHERE expense_date >= $1 AND expense_date <= $2
    GROUP BY category
    ORDER BY SUM(amount) DESC, category ASC
  `,
    [from, to],
  );

  res.json({
    from,
    to,
    rows: result.rows.map(toCategoryReportRow),
  });
});

module.exports = router;

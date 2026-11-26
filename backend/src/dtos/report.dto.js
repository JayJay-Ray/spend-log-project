const { z } = require("zod");
const { expenseDateSchema } = require("./expense.dto.js");

const MAX_DAILY_RANGE_DAYS = 366;
const MAX_MONTHLY_RANGE_MONTHS = 120;

function parseISODate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function daysBetweenInclusive(from, to) {
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);

  return Math.floor((toDate - fromDate) / (24 * 60 * 60 * 1000)) + 1;
}

function monthsBetweenInclusive(from, to) {
  const fromDate = parseISODate(from);
  const toDate = parseISODate(to);

  return (
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth()) +
    1
  );
}

const dateRangeQuerySchema = z
  .strictObject({
    from: expenseDateSchema,
    to: expenseDateSchema,
  })
  .refine((data) => data.from <= data.to, {
    message: "from must be on or before to",
    path: ["to"],
  });

const dailyReportRangeSchema = dateRangeQuerySchema.refine(
  (data) => daysBetweenInclusive(data.from, data.to) <= MAX_DAILY_RANGE_DAYS,
  {
    message: `Daily reports cover at most ${MAX_DAILY_RANGE_DAYS} days.`,
    path: ["to"],
  },
);

const monthlyReportRangeSchema = dateRangeQuerySchema.refine(
  (data) =>
    monthsBetweenInclusive(data.from, data.to) <= MAX_MONTHLY_RANGE_MONTHS,
  {
    message: `Monthly reports cover at most ${MAX_MONTHLY_RANGE_MONTHS} months.`,
    path: ["to"],
  },
);

const categoryReportRowSchema = z.strictObject({
  category: z.string(),
  total: z.number(),
});

const dailyReportRowSchema = z.strictObject({
  date: z.string(),
  total: z.number(),
});

const monthlyReportRowSchema = z.strictObject({
  month: z.string(),
  total: z.number(),
});

function toCategoryReportRow(row) {
  return categoryReportRowSchema.parse({
    category: row.category,
    total: Number(row.total),
  });
}

function toDailyReportRow(row) {
  return dailyReportRowSchema.parse({
    date: row.period,
    total: Number(row.total),
  });
}

function toMonthlyReportRow(row) {
  return monthlyReportRowSchema.parse({
    month: row.period,
    total: Number(row.total),
  });
}

module.exports = {
  dateRangeQuerySchema,
  dailyReportRangeSchema,
  monthlyReportRangeSchema,
  toCategoryReportRow,
  toDailyReportRow,
  toMonthlyReportRow,
};

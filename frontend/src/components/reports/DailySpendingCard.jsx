import { ChartColumn } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDate, formatShortDate } from "../../lib/dates.js";
import { formatCompactCurrency, formatCurrency } from "../../lib/money.js";
import { MONOCHROMATIC_PALETTE } from "../../lib/categories.js";
import ChartEmptyState from "./ChartEmptyState.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import ReportCardHeader from "./ReportCardHeader.jsx";
import ReportTable from "./ReportTable.jsx";

export default function DailySpendingCard({ data, reducedMotion, version }) {
  const spendingData = data.filter((row) => row.total > 0);
  const hasSpending = spendingData.length > 0;
  const tickInterval = Math.max(0, Math.ceil(spendingData.length / 12) - 1);
  const chartWidth = Math.max(620, Math.min(12_000, spendingData.length * 14));

  const columns = [
    {
      key: "date",
      label: "Date",
      render: (row) => formatDate(row.date),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (row) => formatCurrency(row.total),
    },
  ];

  return (
    <article className="report-card report-card--daily">
      <ReportCardHeader
        icon={ChartColumn}
        title="Daily Report"
        subtitle={`${spendingData.length} ${spendingData.length === 1 ? "day" : "days"} in the selected range`}
      />

      <div
        className="daily-chart-scroll"
        role="img"
        aria-label="Daily spending column chart. The same data is available in the daily totals table."
        key={version}
      >
        {hasSpending ? (
          <div
            className="daily-chart-inner"
            style={{ minWidth: `${chartWidth}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={spendingData}
                margin={{ top: 12, right: 10, bottom: 4, left: -10 }}
              >
                <CartesianGrid
                  stroke="var(--chart-grid)"
                  strokeDasharray="3 6"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  interval={tickInterval}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                  dy={8}
                />
                <YAxis
                  tickFormatter={formatCompactCurrency}
                  tickLine={false}
                  axisLine={false}
                  width={64}
                  tick={{ fill: "var(--muted)", fontSize: 12 }}
                />
                <Tooltip
                  isAnimationActive={false}
                  cursor={{ fill: "var(--chart-cursor)" }}
                  content={
                    <ChartTooltip
                      labelFormatter={(value) => formatDate(value)}
                      valueLabel="Spent"
                    />
                  }
                />
                <Bar
                  dataKey="total"
                  name="Spent"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={26}
                  isAnimationActive={!reducedMotion}
                  animationDuration={spendingData.length > 150 ? 350 : 750}
                  animationEasing="ease-out"
                >
                  {spendingData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        MONOCHROMATIC_PALETTE[
                          index % MONOCHROMATIC_PALETTE.length
                        ]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <ChartEmptyState />
        )}
      </div>

      <div className="report-card__table-panel">
        <p className="report-card__table-label">Daily totals</p>
        <ReportTable
          columns={columns}
          rows={spendingData}
          getRowKey={(row) => row.date}
          ariaLabel="Daily spending report"
        />
      </div>
    </article>
  );
}

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
  const tickInterval = Math.max(0, Math.ceil(data.length / 12) - 1);
  const chartWidth = Math.max(620, Math.min(12_000, data.length * 14));

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
        subtitle={`${data.length} ${data.length === 1 ? "day" : "days"} in the selected range`}
      />

      <div
        className="daily-chart-scroll"
        role="img"
        aria-label="Daily spending column chart. The same data is available in the daily totals table."
        key={version}
      >
        {data.length > 0 ? (
          <div
            className="daily-chart-inner"
            style={{ minWidth: `${chartWidth}px` }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
                  trigger="click"
                  position={{ y: 8 }}
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
                  animationDuration={data.length > 150 ? 350 : 750}
                  animationEasing="ease-out"
                >
                  {data.map((_, index) => (
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
          rows={data}
          getRowKey={(row) => row.date}
          ariaLabel="Daily spending report"
        />
      </div>
    </article>
  );
}

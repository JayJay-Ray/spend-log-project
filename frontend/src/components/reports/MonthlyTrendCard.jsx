import { useId } from "react";
import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonth, formatMonthShort } from "../../lib/dates.js";
import { formatCompactCurrency, formatCurrency } from "../../lib/money.js";
import ChartEmptyState from "./ChartEmptyState.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import ReportCardHeader from "./ReportCardHeader.jsx";
import ReportTable from "./ReportTable.jsx";

function gradientIdFrom(reactId) {
  return `monthly-fill-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export default function MonthlyTrendCard({ data, reducedMotion, version }) {
  const gradientId = gradientIdFrom(useId());
  const hasSpending = data.some((row) => row.total > 0);
  const chartWidth = Math.max(620, Math.min(12_000, data.length * 60));

  const columns = [
    {
      key: "month",
      label: "Month",
      render: (row) => formatMonth(row.month),
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (row) => formatCurrency(row.total),
    },
  ];

  return (
    <article className="report-card report-card--monthly">
      <ReportCardHeader
        icon={TrendingUp}
        title="Monthly Report"
        subtitle={`${data.length} ${data.length === 1 ? "month" : "months"} in the selected range`}
      />

      <div className="report-card__split">
        <div
          className="daily-chart-scroll"
          role="img"
          aria-label="Monthly spending trend chart. The same data is available in the monthly totals table."
          key={version}
        >
          {hasSpending ? (
            <div
              className="daily-chart-inner"
              style={{ minWidth: `${chartWidth}px` }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 12, right: 10, bottom: 4, left: -10 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--chart-1)"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="var(--chart-grid)"
                    strokeDasharray="3 6"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tickFormatter={formatMonthShort}
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
                    cursor={{
                      stroke: "var(--border-strong)",
                      strokeDasharray: "4 4",
                    }}
                    content={
                      <ChartTooltip
                        labelFormatter={(value) => formatMonth(value)}
                        valueLabel="Spent"
                      />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Spent"
                    stroke="var(--chart-1)"
                    strokeWidth={2.6}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    activeDot={{
                      r: 5,
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                    isAnimationActive={!reducedMotion}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        <div className="report-card__table-panel">
          <p className="report-card__table-label">Monthly totals</p>
          <ReportTable
            columns={columns}
            rows={data}
            getRowKey={(row) => row.month}
            ariaLabel="Monthly spending report"
            compact
          />
        </div>
      </div>
    </article>
  );
}

import { BarChart as BarChartIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency, formatPercent, sumMoney } from "../../lib/money.js";
import ChartEmptyState from "./ChartEmptyState.jsx";
import ChartTooltip from "./ChartTooltip.jsx";
import ReportCardHeader from "./ReportCardHeader.jsx";
import ReportTable from "./ReportTable.jsx";

export default function CategoryBreakdownCard({
  data,
  total,
  reducedMotion,
  version,
}) {
  const hasSpending = data.length > 0 && total > 0;
  const reportTotal = total || sumMoney(data.map((row) => row.total));

  const columns = [
    {
      key: "category",
      label: "Category",
      render: (row) => row.category,
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      render: (row) => formatCurrency(row.total),
    },
  ];

  const chartData = data.map((row) => ({
    ...row,
    share: reportTotal > 0 ? row.total / reportTotal : 0,
  }));

  const chartHeight = Math.max(262, data.length * 40);

  return (
    <article className="report-card report-card--category">
      <ReportCardHeader
        icon={BarChartIcon}
        title="Category Report"
        subtitle={`${data.length} ${data.length === 1 ? "category" : "categories"} in the selected range`}
      />

      <div
        className="chart-frame chart-frame--bar"
        role="img"
        aria-label="Category spending bar chart. Category totals and shares are available in the table below."
        key={version}
      >
        {hasSpending ? (
          <div className="category-chart-scroll">
            <div style={{ height: `${chartHeight}px`, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                  >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    content={
                      <ChartTooltip
                        labelFormatter={(_label, entry) =>
                          entry.payload?.category ?? ""
                        }
                        valueLabel="Spent"
                      />
                    }
                  />
                  <Bar
                    dataKey="total"
                    fill="var(--chart-1)"
                    isAnimationActive={!reducedMotion}
                    animationDuration={950}
                    animationEasing="ease-out"
                  >
                    <LabelList
                      dataKey="share"
                      formatter={(value) => formatPercent(value)}
                      position="right"
                      offset={5}
                      fill="var(--text)"
                      fontSize={12}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <ChartEmptyState />
        )}
      </div>

      <div className="report-card__table-panel">
        <p className="report-card__table-label">Category totals</p>
        <ReportTable
          columns={columns}
          rows={data}
          getRowKey={(row) => row.category}
          ariaLabel="Category spending report"
          emptyMessage="No categories in this range."
        />
      </div>
    </article>
  );
}

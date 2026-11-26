import { ReceiptText } from "lucide-react";
import EmptyState from "../ui/EmptyState.jsx";
import ErrorState from "../ui/ErrorState.jsx";
import Skeleton from "../ui/Skeleton.jsx";
import CategoryBreakdownCard from "./CategoryBreakdownCard.jsx";
import DailySpendingCard from "./DailySpendingCard.jsx";
import MonthlyTrendCard from "./MonthlyTrendCard.jsx";
import ReportKpis from "./ReportKpis.jsx";
import ReportRangeFilter from "./ReportRangeFilter.jsx";

function ReportsSkeleton() {
  return (
    <div aria-hidden="true">
      <div className="kpi-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="kpi-card kpi-card--skeleton" key={index}>
            <Skeleton width="38px" height="38px" className="skeleton--circle" />
            <Skeleton width="44%" height="12px" />
            <Skeleton width="72%" height="30px" />
            <Skeleton width="60%" height="12px" />
          </div>
        ))}
      </div>

      <div className="reports-grid">
        <article className="report-card report-card--monthly report-card--skeleton">
          <Skeleton width="38px" height="38px" className="skeleton--circle" />
          <Skeleton width="32%" height="18px" />
          <Skeleton width="100%" height="270px" className="skeleton--chart" />
        </article>

        <article className="report-card report-card--daily report-card--skeleton">
          <Skeleton width="38px" height="38px" className="skeleton--circle" />
          <Skeleton width="40%" height="18px" />
          <Skeleton width="100%" height="260px" className="skeleton--chart" />
        </article>

        <article className="report-card report-card--category report-card--skeleton">
          <Skeleton width="38px" height="38px" className="skeleton--circle" />
          <Skeleton width="48%" height="18px" />
          <Skeleton width="100%" height="260px" className="skeleton--chart" />
        </article>
      </div>
    </div>
  );
}

export default function ReportsSection({
  rangeState,
  reportsState,
  reducedMotion,
  chartVersion,
  onAddExpense,
}) {
  const { range, loading: resolvingRange, error: rangeError } = rangeState;
  const reports = reportsState.reports;
  const showSkeleton =
    resolvingRange ||
    reportsState.loading ||
    (range && !reports && !reportsState.error);

  const showError = Boolean((rangeError && !range) || reportsState.error);
  const errorMessage = rangeError || reportsState.error;
  const retry = rangeError && !range ? rangeState.retry : reportsState.retry;

  const noExpenses =
    rangeState.hasNoExpenses && !range && !showSkeleton && !showError;

  return (
    <section
      className="reports-section"
      id="reports"
      aria-labelledby="reports-heading"
    >
      <ReportRangeFilter {...rangeState} />

      {showError && (
        <div className="report-feedback">
          <ErrorState
            title="Reports could not be loaded"
            message={errorMessage}
            onRetry={retry}
          />
        </div>
      )}

      {!showError && showSkeleton && <ReportsSkeleton />}

      {!showError && !showSkeleton && noExpenses && (
        <div className="report-feedback">
          <EmptyState
            icon={ReceiptText}
            title="No expenses to report yet"
            description="Add your first expense and the monthly, daily, and category reports will appear here."
            action={
              <button
                className="btn btn--primary"
                type="button"
                onClick={onAddExpense}
              >
                Add your first expense
              </button>
            }
          />
        </div>
      )}

      {!showError && !showSkeleton && !noExpenses && range && reports && (
        <>
          <ReportKpis
            summary={reportsState.summary}
            range={range}
            reducedMotion={reducedMotion}
          />

          <div className="reports-grid">
            <MonthlyTrendCard
              data={reports.monthly}
              reducedMotion={reducedMotion}
              version={`monthly-${chartVersion}`}
            />
            <DailySpendingCard
              data={reports.daily}
              reducedMotion={reducedMotion}
              version={`daily-${chartVersion}`}
            />
            <CategoryBreakdownCard
              data={reports.categories}
              total={reportsState.summary.total}
              reducedMotion={reducedMotion}
              version={`category-${chartVersion}`}
            />
          </div>
        </>
      )}
    </section>
  );
}

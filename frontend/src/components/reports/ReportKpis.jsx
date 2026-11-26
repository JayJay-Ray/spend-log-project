import { Activity, CalendarDays, Tag, WalletMinimal } from "lucide-react";
import useCountUp from "../../hooks/useCountUp.js";
import { getCategoryColor } from "../../lib/categories.js";
import { formatCurrency, formatPercent } from "../../lib/money.js";
import { formatDateRange, formatDayCount } from "../../lib/dates.js";
import Skeleton from "../ui/Skeleton.jsx";

function KpiCard({ icon: Icon, label, value, hint, valueClassName = "" }) {
  return (
    <article className="kpi-card">
      <span className="kpi-card__icon" aria-hidden="true">
        <Icon size={17} />
      </span>
      <p className="kpi-card__label">{label}</p>
      <strong className={`kpi-card__value ${valueClassName}`.trim()}>
        {value}
      </strong>
      {hint && <p className="kpi-card__hint">{hint}</p>}
    </article>
  );
}

export default function ReportKpis({
  summary,
  range,
  reducedMotion,
  loading = false,
}) {
  const animatedTotal = useCountUp(summary.total, {
    disabled: reducedMotion,
  });
  const animatedAverage = useCountUp(summary.averagePerDay, {
    disabled: reducedMotion,
  });
  const animatedActiveDays = Math.round(
    useCountUp(summary.activeDays, { disabled: reducedMotion }),
  );
  const topCategory = summary.topCategory;

  const days = summary.days || 0;
  const rangeHint = range
    ? `${formatDateRange(range.from, range.to)} · ${formatDayCount(days)}`
    : "";

  if (loading) {
    return (
      <div className="kpi-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="kpi-card kpi-card--skeleton" key={index}>
            <Skeleton width="38px" height="38px" className="skeleton--circle" />
            <Skeleton width="44%" height="12px" />
            <Skeleton width="72%" height="30px" />
            <Skeleton width="60%" height="12px" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="kpi-grid" aria-label="Report summary">
      <KpiCard
        icon={WalletMinimal}
        label="Total spent"
        value={formatCurrency(animatedTotal)}
        hint={rangeHint}
      />

      <KpiCard
        icon={CalendarDays}
        label="Average per day"
        value={formatCurrency(animatedAverage)}
        hint={
          days > 0
            ? `${summary.activeDays} of ${days} days with spending`
            : "No days with spending"
        }
      />

      <KpiCard
        icon={Activity}
        label="Active spending days"
        value={animatedActiveDays}
        hint={
          days > 0
            ? formatPercent(summary.activeDays / days)
            : "0%"
        }
      />

      <KpiCard
        icon={Tag}
        label="Top category"
        value={
          topCategory ? (
            <span className="kpi-category">
              <span
                className="kpi-category__dot"
                style={{
                  background: getCategoryColor(topCategory.category),
                }}
                aria-hidden="true"
              />
              <span className="kpi-category__name">{topCategory.category}</span>
            </span>
          ) : (
            "—"
          )
        }
        valueClassName="kpi-card__value--text"
        hint={
          topCategory && summary.topCategoryShare != null
            ? `${formatPercent(summary.topCategoryShare)} of total`
            : ""
        }
      />
    </div>
  );
}

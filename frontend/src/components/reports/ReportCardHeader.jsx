export default function ReportCardHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="report-card__header">
      <span className="report-card__icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div>
        <h3 className="report-card__title">{title}</h3>
        <p className="report-card__subtitle">{subtitle}</p>
      </div>
    </div>
  )
}

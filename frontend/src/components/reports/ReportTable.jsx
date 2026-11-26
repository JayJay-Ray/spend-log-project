export default function ReportTable({
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No data for this range.',
  ariaLabel,
  compact = false,
}) {
  if (rows.length === 0) {
    return <p className="report-table-empty">{emptyMessage}</p>
  }

  return (
    <div className={`report-table-wrap${compact ? ' report-table-wrap--compact' : ''}`}>
      <table
        className="data-table data-table--report"
        aria-label={ariaLabel}
      >
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.align === 'right' ? 'is-numeric' : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={getRowKey ? getRowKey(row) : index}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={
                    column.align === 'right' ? 'is-numeric' : undefined
                  }
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

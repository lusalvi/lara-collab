export default function Header({
  groupedHeader,
  periodColumns,
  config,
  today,
}) {
  return (
    <div className="timeline-header">
      {/* Grupo principal (año) */}
      <div className="timeline-header-groups">
        {groupedHeader.map((group, idx) => {
          // ancho del grupo = suma de los días de las columnas que caen dentro
          const groupDays = periodColumns
            .slice(
              groupedHeader.slice(0, idx).reduce((sum, g) => sum + g.count, 0),
              groupedHeader.slice(0, idx).reduce((sum, g) => sum + g.count, 0) + group.count
            )
            .reduce((sum, col) => sum + col.days, 0);

          return (
            <div
              key={idx}
              className="timeline-header-group"
              style={{ width: groupDays * config.dayWidth }}
            >
              {group.label}
            </div>
          );
        })}
      </div>

      {/* Columnas de período (semana / mes / trimestre) */}
      <div className="timeline-header-periods">
        {periodColumns.map(col => (
          <div
            key={col.start.format('YYYY-MM-DD')}
            className={`timeline-header-period ${
              today.isBetween(col.start, col.end, 'day', '[]') ? 'is-today' : ''
            }`}
            style={{ width: col.days * config.dayWidth }}
          >
            {config.unit === 'isoWeek' && `Sem ${col.start.format('D')} – ${col.end.format('D MMM')}`}
            {config.unit === 'month' && col.start.format('MMMM')}
            {config.unit === 'quarter' && `${col.start.format('MMM')} – ${col.end.format('MMM')}`}
          </div>
        ))}
      </div>

      {/* Sub-header de días (solo semana) — texto informativo, sin bordes de grilla */}
      {config.showSubHeader && (
        <div className="timeline-header-subgroups">
          {periodColumns.map(col => (
            <div
              key={col.start.format('YYYY-MM-DD')}
              className="timeline-header-subgroup"
              style={{ width: col.days * config.dayWidth }}
            >
              {Array.from({ length: col.days }).map((_, i) => (
                <span key={i} className="timeline-header-subday">
                  {col.start.add(i, 'day').format('D')}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default function Grid({ periodColumns, config }) {
  return (
    <div className="timeline-grid">
      {periodColumns.map(col => (
        <div
          key={col.start.format('YYYY-MM-DD')}
          className="timeline-grid-col"
          style={{ width: col.days * config.dayWidth }}
        />
      ))}
    </div>
  );
}
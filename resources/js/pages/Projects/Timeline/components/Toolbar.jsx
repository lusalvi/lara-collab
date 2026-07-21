import { Button, SegmentedControl } from '@mantine/core';

export default function Toolbar({
  zoom,
  setZoom,
  scrollToToday,
}) {
  return (
    <div className="timeline-gantt-toolbar">
      <SegmentedControl
        size="xs"
        value={zoom}
        onChange={setZoom}
        data={[
          { label: 'Semanas', value: 'week' },
          { label: 'Meses', value: 'month' },
          { label: 'Trimestres', value: 'quarter' },
        ]}
      />

      <Button
        size="xs"
        variant="light"
        onClick={scrollToToday}
      >
        Hoy
      </Button>
    </div>
  );
}
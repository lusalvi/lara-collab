import { router } from '@inertiajs/react';
import { Tooltip } from '@mantine/core';
import dayjs from 'dayjs';

export default function Bars({ tasks, start, config, project }) {
  return (
    <>
      {tasks.map((task, rowIndex) => {
        if (!task.start_on || !task.due_on) return null;

        const barStart = dayjs(task.start_on);
        const barEnd = dayjs(task.due_on);
        const offsetDays = barStart.diff(start, 'day');
        const durationDays = Math.max(barEnd.diff(barStart, 'day') + 1, 1);

        return (
          <Tooltip
            key={task.id}
            label={`${task.name} · ${barStart.format('DD/MM')} – ${barEnd.format('DD/MM')}`}
            openDelay={300}
            withArrow
          >
            <div
              className={`timeline-bar status-${task.status}`}
              style={{
                top: rowIndex * 44 + 8,
                left: offsetDays * config.dayWidth,
                width: durationDays * config.dayWidth - 4,
              }}
              onClick={() =>
                router.get(route('projects.tasks.open', { project: project.id, task: task.id }))
              }
            />
          </Tooltip>
        );
      })}
    </>
  );
}
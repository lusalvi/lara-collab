import { router } from '@inertiajs/react';
import { Tooltip } from '@mantine/core';
import dayjs from 'dayjs';

// Default colors for task groups
const DEFAULT_GROUP_COLORS = {
  backlog: 'var(--mantine-color-gray-3)',
  'por hacer': 'var(--mantine-color-gray-5)',
  todo: 'var(--mantine-color-gray-5)',

  'en curso': 'var(--mantine-color-blue-5)',
  'in progress': 'var(--mantine-color-blue-5)',

  'en revisión': 'var(--mantine-color-yellow-5)',
  review: 'var(--mantine-color-yellow-5)',

  finalizado: 'var(--mantine-color-green-6)',
  done: 'var(--mantine-color-green-6)',

  desplegado: 'var(--mantine-color-cyan-6)',
  deployed: 'var(--mantine-color-cyan-6)',
};

export default function Bars({ tasks, start, config, project }) {
  return (
    <>
      {tasks.map((task, rowIndex) => {
        if (!task.start_on || !task.due_on) return null;

        const barStart = dayjs(task.start_on);
        const barEnd = dayjs(task.due_on);
        const offsetDays = barStart.diff(start, 'day');
        const durationDays = Math.max(barEnd.diff(barStart, 'day') + 1, 1);

        const groupName = task.group?.name?.trim().toLowerCase();

        const barColor =
          task.group?.color ||
          DEFAULT_GROUP_COLORS[groupName] ||
          '#adb5bd';

        return (
          <Tooltip
            key={task.id}
            label={`${task.name} · ${barStart.format('DD/MM')} – ${barEnd.format('DD/MM')}`}
            openDelay={300}
            withArrow
          >
            <div
              className="timeline-bar"
              style={{
                backgroundColor: barColor,
                top: rowIndex * 44 + 8,
                left: offsetDays * config.dayWidth,
                width: durationDays * config.dayWidth - 4,
              }}
              onClick={() =>
                router.get(
                  route('projects.tasks.open', {
                    project: project.id,
                    task: task.id,
                  })
                )
              }
            />
          </Tooltip>
        );
      })}
    </>
  );
}
import { router } from '@inertiajs/react';
import { Tooltip } from '@mantine/core';
import { IconAlertTriangleFilled } from '@tabler/icons-react';
import dayjs from 'dayjs';

import { getGroupBarColor } from '../../../../utils/taskGroupColors';

export default function Bars({
  tasks,
  start,
  config,
  project,
  hasScheduleConflict,
}) {
  return (
    <>
      {tasks.map((task, rowIndex) => {
        if (!task.start_on || !task.due_on) return null;

        const barStart = dayjs(task.start_on);
        const barEnd = dayjs(task.due_on);

        const offsetDays = barStart.diff(start, 'day');
        const durationDays = Math.max(barEnd.diff(barStart, 'day') + 1, 1);

        const barColor = getGroupBarColor(task.group);

        return (
          <div
            key={task.id}
            style={{
              position: 'absolute',
              top: rowIndex * 44 + 8,
              left: offsetDays * config.dayWidth,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Tooltip
              label={`${task.name} · ${barStart.format('DD/MM')} – ${barEnd.format('DD/MM')}`}
              openDelay={300}
              withArrow
            >
              <div
                className='timeline-bar'
                style={{
                  backgroundColor: barColor,
                  width: durationDays * config.dayWidth - 4,
                  position: 'relative',
                  top: 0,
                  left: 0,
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

            {hasScheduleConflict(task) && (
              <Tooltip
                label='Esta actividad finaliza antes que una de sus actividades secundarias.'
                withArrow
              >
                <IconAlertTriangleFilled
                  size={16}
                  color='orange'
                  style={{
                    flexShrink: 0,
                    cursor: 'pointer',
                  }}
                />
              </Tooltip>
            )}
          </div>
        );
      })}
    </>
  );
}
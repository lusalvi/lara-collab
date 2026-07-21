import { router } from '@inertiajs/react';
import { Avatar, Badge, ScrollArea, Text } from '@mantine/core';

const STATUS_COLOR = {
  done: 'green.6',
  in_progress: 'blue.5',
  todo: 'gray.4',
};

const STATUS_LABEL = {
  done: 'Finalizada',
  in_progress: 'En curso',
  todo: 'Por hacer',
};

export default function Sidebar({
  project,
  tasks,
  columns,
  listWidth,
  listScrollRef,
  ganttScrollRef,
  syncScroll,
  startColumnResize,
}) {
  return (
    <div
      className='timeline-list'
      style={{
        width: listWidth,
        minWidth: listWidth,
      }}
    >
      <div className='timeline-list-header'>
        <div
          className='timeline-list-header-cell'
          style={{ width: columns.activity }}
        >
          <Text
            size='sm'
            fw={600}
            c='dimmed'
          >
            Actividad
          </Text>

          <div
            className='timeline-col-resize-handle'
            onMouseDown={startColumnResize('activity')}
          />
        </div>

        <div
          className='timeline-list-header-cell'
          style={{ width: columns.assignee }}
        >
          <Text
            size='sm'
            fw={600}
            c='dimmed'
          >
            Responsable
          </Text>

          <div
            className='timeline-col-resize-handle'
            onMouseDown={startColumnResize('assignee')}
          />
        </div>

        <div
          className='timeline-status-column'
          style={{ width: columns.status }}
        >
          <Text
            size='sm'
            fw={600}
            c='dimmed'
          >
            Estado
          </Text>
        </div>
      </div>

      <ScrollArea
        h={Math.max(tasks.length * 44, 120)}
        type='never'
        viewportRef={listScrollRef}
        onScrollPositionChange={() => syncScroll(listScrollRef.current, ganttScrollRef)}
      >
        {tasks.map(task => (
          <div
            key={task.id}
            className='timeline-list-row'
            onClick={() =>
              router.get(
                route('projects.tasks.open', {
                  project: project.id,
                  task: task.id,
                })
              )
            }
          >
            <div
              className='timeline-list-row-name'
              style={{ width: columns.activity }}
            >
              <Text
                size='sm'
                fw={500}
                truncate
              >
                {task.name}
              </Text>
            </div>

            <div
              className='timeline-assignee-column'
              style={{ width: columns.assignee }}
            >
              {task.assigned_to_user ? (
                <>
                  <Avatar
                    src={task.assigned_to_user.avatar}
                    size={24}
                    radius='xl'
                  >
                    {task.assigned_to_user.name?.[0]}
                  </Avatar>

                  <Text
                    size='sm'
                    truncate
                  >
                    {task.assigned_to_user.name}
                  </Text>
                </>
              ) : (
                <Text
                  size='xs'
                  c='dimmed'
                >
                  Sin asignar
                </Text>
              )}
            </div>

            <div
              className='timeline-status-column'
              style={{ width: columns.status }}
            >
              <Badge
                color={STATUS_COLOR[task.status]}
                variant='light'
                size='sm'
              >
                {STATUS_LABEL[task.status]}
              </Badge>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <Text
            size='sm'
            c='dimmed'
            p='md'
          >
            No hay tareas con fechas cargadas todavía.
          </Text>
        )}
      </ScrollArea>
    </div>
  );
}

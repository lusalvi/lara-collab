import { ScrollArea, Text } from '@mantine/core';
import TaskRow from './TaskRow';


export default function Sidebar({
  project,
  tasks,
  columns,
  listWidth,
  listScrollRef,
  ganttScrollRef,
  syncScroll,
  startColumnResize,
  onTaskChange,
  taskGroups,
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
          <TaskRow
            key={task.id}
            project={project}
            task={task}
            columns={columns}
            onTaskChange={onTaskChange}
            taskGroups={taskGroups}
          />
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

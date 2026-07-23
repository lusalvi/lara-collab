import { router } from '@inertiajs/react';
import { Avatar, Text } from '@mantine/core';
import EditableTaskName from './EditableTaskName';
import TaskGroupSelect from './TaskGroupSelect';

export default function TaskRow({ project, task, columns, onTaskChange, taskGroups }) {
  return (
    <div
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
        style={{ width: columns.activity, minWidth: 0 }}
      >
        <EditableTaskName
          project={project}
          task={task}
          onTaskChange={onTaskChange}
        />
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
        <TaskGroupSelect
          project={project}
          task={task}
          groups={taskGroups}
          onTaskChange={onTaskChange}
        />
      </div>
    </div>
  );
}

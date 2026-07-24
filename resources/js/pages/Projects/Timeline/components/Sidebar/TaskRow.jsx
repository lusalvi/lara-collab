import { router } from '@inertiajs/react';
import EditableTaskName from './EditableTaskName';
import TaskGroupSelect from './TaskGroupSelect';
import TaskAssigneeSelect from './TaskAssigneeSelect';

export default function TaskRow({ project, task, columns, onTaskChange, taskGroups, users }) {
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
        <TaskAssigneeSelect
          project={project}
          task={task}
          users={users}
          onTaskChange={onTaskChange}
        />
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

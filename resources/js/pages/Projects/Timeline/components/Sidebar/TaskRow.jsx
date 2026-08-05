import { router } from '@inertiajs/react';
import EditableTaskName from './EditableTaskName';
import TaskGroupSelect from './TaskGroupSelect';
import TaskAssigneeSelect from './TaskAssigneeSelect';
import { IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import IssueTypeIcon from '@/components/IssueTypeIcon';

export default function TaskRow({
  mobile,
  project,
  task,
  columns,
  hasChildren,
  collapsed,
  onToggle,
  onTaskChange,
  taskGroups,
  users,
}) {
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
        <div
          className='timeline-task-name'
          style={{
            paddingLeft: `${task.depth * 24}px`,
          }}
        >
          <div
            style={{
              width: 18,
              display: 'flex',
              justifyContent: 'center',
              cursor: hasChildren ? 'pointer' : 'default',
              flexShrink: 0,
            }}
            onClick={e => {
              e.stopPropagation();

              if (hasChildren) {
                onToggle();
              }
            }}
          >
            {hasChildren ? (
              collapsed ? (
                <IconChevronRight size={14} />
              ) : (
                <IconChevronDown size={14} />
              )
            ) : (
              <div style={{ width: 14 }} />
            )}
          </div>

          <IssueTypeIcon type={task.issue_type} />

          <EditableTaskName
            project={project}
            task={task}
            onTaskChange={onTaskChange}
          />
        </div>
      </div>

      {!mobile && (
        <>
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
        </>
      )}
    </div>
  );
}
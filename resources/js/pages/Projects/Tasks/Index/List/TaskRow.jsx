import { Badge, Checkbox, Group, Text } from '@mantine/core';

import IssueTypeIcon from '@/components/IssueTypeIcon';

import classes from './ListView.module.css';

import TaskAssignee from './Components/TaskAssignee';
import TaskDueDate from './Components/TaskDueDate';
import TaskActions from './Components/TaskActions';
import TaskStatusDropdown from './Components/TaskStatusDropdown';
import { IconChevronDown, IconChevronRight, IconPlus } from '@tabler/icons-react';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';

export default function TaskRow({ task, hasChildren, collapsed, onToggle }) {
  const { openEditTask, openCreateTask } = useTaskDrawerStore();

  return (
    <div
      className={classes.row}
      onClick={() => openEditTask(task)}
    >
      <div className={classes.checkbox}>
        <Checkbox
          size='xs'
          onClick={e => e.stopPropagation()}
        />
      </div>

      <div className={classes.key}>
        <Text fw={500}>#{task.number}</Text>
      </div>

      <div className={`${classes.summary} ${task.parent_task_id ? classes.subtask : ''}`}>
        <div className={classes.summaryContent}>
          <Group
            gap='xs'
            wrap='nowrap'
            ml={task.parent_task_id ? 28 : 0}
          >
            <div
              className={`${classes.expandButton} ${hasChildren ? classes.expandButtonActive : ''}`}
              onClick={e => {
                e.stopPropagation();

                if (hasChildren) {
                  onToggle();
                }
              }}
            >
              {hasChildren &&
                (collapsed ? (
                  <IconChevronRight
                    size={14}
                    stroke={2}
                    color='var(--mantine-color-gray-6)'
                  />
                ) : (
                  <IconChevronDown
                    size={14}
                    stroke={2}
                    color='var(--mantine-color-gray-6)'
                  />
                ))}
            </div>

            <IssueTypeIcon type={task.issue_type} />

            <Text lineClamp={1}>{task.name}</Text>
          </Group>

          <div
            className={classes.summaryAction}
            onClick={e => {
              e.stopPropagation();

              openCreateTask({
                issue_type: 'Subtarea',
                parent_task_id: task.id,
              });
            }}
          >
            <IconPlus
              size={16}
              stroke={2}
            />
          </div>
        </div>
      </div>

      <div
        className={classes.assignee}
        onClick={e => e.stopPropagation()}
      >
        <TaskAssignee user={task.assigned_to_user} />
      </div>

      <div className={classes.priority}>
        {task.priority ? (
          <Badge
            color={task.priority.color}
            variant='light'
            radius='sm'
          >
            {task.priority.label}
          </Badge>
        ) : (
          <Text
            c='dimmed'
            size='sm'
          >
            -
          </Text>
        )}
      </div>

      <div
        className={classes.status}
        onClick={e => e.stopPropagation()}
      >
        <TaskStatusDropdown task={task} />
      </div>

      <div className={classes.due}>
        <TaskDueDate date={task.due_on} />
      </div>

      <div
        className={classes.actions}
        onClick={e => e.stopPropagation()}
      >
        <TaskActions task={task} />
      </div>
    </div>
  );
}

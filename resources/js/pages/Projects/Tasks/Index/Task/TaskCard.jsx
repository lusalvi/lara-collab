import { Label } from '@/components/Label';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import { isOverdue } from '@/utils/task';
import { getInitials } from '@/utils/user';
import { Draggable } from '@hello-pangea/dnd';
import { Link } from '@inertiajs/react';
import { Avatar, Group, Text, Tooltip, rem, useComputedColorScheme } from '@mantine/core';
import TaskActions from '../TaskActions';
import classes from './css/TaskCard.module.css';
import { ActionIcon } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

export default function TaskCard({ task, index }) {
  const { openEditTask, openCreateTask } = useTaskDrawerStore();
  const computedColorScheme = useComputedColorScheme();
  console.log(task);
  return (
    <Draggable
      draggableId={'task-' + task.id}
      index={index}
    >
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`${classes.task} ${snapshot.isDragging && classes.itemDragging} ${
            task.completed_at !== null && classes.completed
          }`}
        >
          {task.priority && (
            <Tooltip
              label={task.priority.label + ' priority'}
              withArrow
              openDelay={300}
            >
              <div
                className={classes.priorityIndicator}
                style={{ backgroundColor: task.priority.color }}
              />
            </Tooltip>
          )}
          <div {...(can('reorder task') && provided.dragHandleProps)}>
            <Group
              wrap='nowrap'
              justify='start'
              align='start'
              gap='xs'
            >
              <Text
                className={classes.name}
                size='xs'
                fw={500}
                c={isOverdue(task) && task.completed_at === null ? 'red.7' : ''}
                onClick={() => openEditTask(task)}
              >
                #{task.number + ': ' + task.name}
              </Text>
            </Group>

            <Group
              wrap='nowrap'
              justify='space-between'
            >
              <Group
                wrap='wrap'
                style={{ rowGap: rem(3), columnGap: rem(12) }}
                mt={5}
              >
                {task.labels.map(label => (
                  <Label
                    key={label.id}
                    name={label.name}
                    color={label.color}
                    size={9}
                    dot={false}
                  />
                ))}
              </Group>

              {task.assigned_to_user && (
                <Tooltip
                  label={task.assigned_to_user.name}
                  openDelay={1000}
                  withArrow
                >
                  <Link
                    href={route('users.edit', task.assigned_to_user.id)}
                    style={{ textDecoration: 'none' }}
                  >
                    <Avatar
                      src={task.assigned_to_user.avatar}
                      radius='xl'
                      size={20}
                      color={computedColorScheme === 'light' ? 'white' : 'blue'}
                    >
                      {getInitials(task.assigned_to_user.name)}
                    </Avatar>
                  </Link>
                </Tooltip>
              )}
              {['Historia', 'Tarea'].includes(task.issue_type) && (
                <ActionIcon
                  variant='subtle'
                  size='sm'
                  onClick={event => {
                    event.stopPropagation();

                    openCreateTask({
                      group_id: task.group_id,
                      issue_type: 'Subtarea',
                      parent_task_id: task.id,
                    });
                  }}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              )}
              {(can('archive task') || can('restore task')) && (
                <TaskActions
                  task={task}
                  className={classes.actions}
                />
              )}
            </Group>
          </div>
        </div>
      )}
    </Draggable>
  );
}

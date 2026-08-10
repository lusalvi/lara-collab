import { Label } from '@/components/Label';
import IssueTypeIcon from '@/components/IssueTypeIcon';
import { diffForHumans } from '@/utils/datetime';
import { redirectTo } from '@/utils/route';
import { isOverdue } from '@/utils/task';
import { getTaskPriorityConfig } from '@/utils/taskPriority';
import { shortName } from '@/utils/user';
import { Link } from '@inertiajs/react';
import { Flex, Group, Pill, Text, Tooltip, rem } from '@mantine/core';
import classes from './css/Task.module.css';
import translateGroupName from '@/utils/translateGroupName';
import TaskGroupLabel from '@/components/TaskGroupLabel';

export default function Task({ task }) {
    const priorityConfig = getTaskPriorityConfig(task.priority);

    return (
        <Flex
            className={`${classes.task} ${
                task.completed_at !== null ? classes.completed : ''
            }`}
            wrap="nowrap"
        >
            {/* Estado */}
          <TaskGroupLabel taskGroup={task.task_group}>
            {translateGroupName(task.task_group.name)}
          </TaskGroupLabel>    

            {/* Responsable */}
            {task.assigned_to_user && (
                <Link
                    href={route(
                        'users.edit',
                        task.assigned_to_user.id
                    )}
                    className={classes.assignee}
                >
                    <Pill size="sm" className={classes.user}>
                        {shortName(task.assigned_to_user.name)}
                    </Pill>
                </Link>
            )}

            {/* Prioridad */}
            {priorityConfig && (
                <Tooltip
                    label={priorityConfig.label}
                    withArrow
                    openDelay={300}
                >
                    <div
                        className={classes.priority}
                        aria-label={priorityConfig.label}
                    >
                        <span
                            className={`inline-block h-2 w-2 rounded-full bg-${priorityConfig.color}-5`}
                        />
                    </div>
                </Tooltip>
            )}

            {/* Tarea */}
            <Tooltip
                disabled={!isOverdue(task)}
                label={`Vencida hace ${diffForHumans(
                    task.due_on,
                    true
                )}`}
                openDelay={1000}
                withArrow
            >
                <Group
                    gap={6}
                    wrap="nowrap"
                    className={classes.taskInfo}
                    onClick={() =>
                        redirectTo('projects.tasks.open', [
                            task.project_id,
                            task.id,
                        ])
                    }
                    style={{ cursor: 'pointer' }}
                >
                    <IssueTypeIcon
                        type={task.issue_type}
                    />

                    <Text
                        className={classes.name}
                        size="sm"
                        fw={500}
                        truncate="end"
                        c={
                            isOverdue(task) &&
                            task.completed_at === null
                                ? 'red'
                                : ''
                        }
                    >
                        #{task.number}: {task.name}
                    </Text>
                </Group>
            </Tooltip>

            {/* Etiquetas */}
            {task.labels.length > 0 && (
                <Group
                    className={classes.labels}
                    wrap="wrap"
                    style={{
                        rowGap: rem(3),
                        columnGap: rem(12),
                    }}
                >
                    {task.labels.map(label => (
                        <Label
                            key={label.id}
                            name={label.name}
                            color={label.color}
                        />
                    ))}
                </Group>
            )}
        </Flex>
    );
}
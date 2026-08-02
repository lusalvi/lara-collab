import { useMemo } from 'react';
import { Avatar, Select, Text } from '@mantine/core';

import useTasksStore from '@/hooks/store/useTasksStore';

export default function TaskAssigneeDropdown({ task, users }) {
  const { updateTaskProperty } = useTasksStore();

  const options = useMemo(
    () => [
      {
        value: '',
        label: 'Sin asignar',
        user: null,
      },
      ...users.map(user => ({
        value: String(user.id),
        label: user.name,
        user,
      })),
    ],
    [users]
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Select
        value={task.assigned_to_user_id ? String(task.assigned_to_user_id) : ''}
        data={options}
        allowDeselect={false}
        searchable
        placeholder="Sin asignar"
        size="xs"
        variant="filled"
        renderOption={({ option }) => {
          if (!option.user) {
            return (
              <Text size="sm" c="dimmed">
                Sin asignar
              </Text>
            );
          }

          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Avatar
                src={option.user.avatar}
                size={22}
                radius="xl"
              >
                {option.user.name?.[0]}
              </Avatar>

              <Text size="sm">{option.user.name}</Text>
            </div>
          );
        }}
        leftSection={
          <Avatar
            src={task.assigned_to_user?.avatar}
            size={20}
            radius="xl"
            color="gray"
          >
            {task.assigned_to_user?.name?.[0] ?? '?'}
          </Avatar>
        }
        onChange={value => {
          const user =
            users.find(u => u.id === Number(value)) ?? null;

          updateTaskProperty(
            task,
            'assigned_to_user_id',
            user?.id ?? null,
            user
          );
        }}
      />
    </div>
  );
}
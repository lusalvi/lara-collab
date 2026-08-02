import { useMemo, useState } from 'react';
import { Avatar, Select, Text } from '@mantine/core';
import axios from 'axios';

export default function TaskAssigneeSelect({ project, task, users, onTaskChange }) {
  const [saving, setSaving] = useState(false);

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

  const handleChange = async value => {
    if (saving) return;

    const newUserId = value ? Number(value) : null;

    if (newUserId === task.assigned_to_user_id) return;

    setSaving(true);

    const previousUser = task.assigned_to_user;
    const previousUserId = task.assigned_to_user_id;

    const selectedUser = users.find(user => user.id === newUserId) ?? null;

    // Actualización optimista
    onTaskChange(task.id, {
      assigned_to_user_id: newUserId,
      assigned_to_user: selectedUser,
    });

    try {
      await axios.put(
        route('projects.tasks.update', {
          project: project.id,
          task: task.id,
        }),
        {
          assigned_to_user_id: newUserId,
        }
      );
    } catch (error) {
      onTaskChange(task.id, {
        assigned_to_user_id: previousUserId,
        assigned_to_user: previousUser,
      });

      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className='timeline-assignee-select'
      onClick={e => e.stopPropagation()}
    >
      <Select
        value={task.assigned_to_user_id ? String(task.assigned_to_user_id) : ''}
        data={options}
        renderOption={({ option }) => {
          if (!option.user) {
            return (
              <Text
                size='sm'
                c='dimmed'
              >
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
                radius='xl'
              >
                {option.user.name?.[0]}
              </Avatar>

              <Text size='sm'>{option.user.name}</Text>
            </div>
          );
        }}
        onChange={handleChange}
        allowDeselect={false}
        disabled={saving}
        placeholder='Sin asignar'
        size='xs'
        variant='filled'
        styles={{
          input: {
            cursor: 'pointer',
          },
        }}
        comboboxProps={{
          withinPortal: true,
          position: 'bottom-start',
          middlewares: {
            flip: false,
            shift: false,
          },
        }}
        leftSection={
          <Avatar
            src={task.assigned_to_user?.avatar}
            size={20}
            radius='xl'
            color='gray'
          >
            {task.assigned_to_user?.name?.[0] ?? '?'}
          </Avatar>
        }
      />
    </div>
  );
}

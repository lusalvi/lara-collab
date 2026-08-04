import { Select } from '@mantine/core';
import { usePage } from '@inertiajs/react';

import useTasksStore from '@/hooks/store/useTasksStore';

export default function TaskPriorityDropdown({ task }) {
  const { priorities } = usePage().props;
  const { updateTaskProperty } = useTasksStore();

  const currentPriority = priorities.find(
    p => p.id === task.priority_id
  );

  const currentColor =
    currentPriority?.label === 'Alta'
      ? 'red'
      : currentPriority?.label === 'Media'
        ? 'yellow'
        : currentPriority?.label === 'Baja'
          ? 'green'
          : 'gray';

  return (
    <div onClick={e => e.stopPropagation()}>
      <Select
        value={task.priority_id ? String(task.priority_id) : ''}
        data={[
          {
            value: '',
            label: 'Sin prioridad',
          },
          ...priorities.map(priority => ({
            value: String(priority.id),
            label: priority.label,
          })),
        ]}
        allowDeselect
        searchable={false}
        size="xs"
        radius="sm"
        variant="filled"
        onChange={value => {
          const priority =
            priorities.find(p => p.id === Number(value)) ?? null;

          updateTaskProperty(
            task,
            'priority_id',
            priority?.id ?? null,
            priority
          );
        }}
        styles={{
          input: {
            backgroundColor: `var(--mantine-color-${currentColor}-1)`,
            color: `var(--mantine-color-${currentColor}-8)`,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          },
        }}
      />
    </div>
  );
}
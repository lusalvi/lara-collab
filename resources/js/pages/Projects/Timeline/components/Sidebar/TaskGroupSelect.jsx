import { useMemo, useState } from 'react';
import { Select } from '@mantine/core';
import axios from 'axios';

const DEFAULT_GROUP_COLORS = {
  backlog: 'gray',
  'por hacer': 'gray',
  todo: 'gray',

  'en curso': 'blue',
  'in progress': 'blue',

  'en revisión': 'yellow',
  review: 'yellow',

  finalizado: 'green',
  done: 'green',

  desplegado: 'cyan',
  deployed: 'cyan',
};

export default function TaskGroupSelect({ project, task, groups, onTaskChange }) {
  const [saving, setSaving] = useState(false);

  const options = useMemo(
    () =>
      groups.map(group => ({
        value: String(group.id),
        label: group.name,
      })),
    [groups]
  );

  const currentGroup = groups.find(g => g.id === task.group_id);

  const currentColor =
    currentGroup?.color || DEFAULT_GROUP_COLORS[currentGroup?.name?.trim().toLowerCase()] || 'gray';

  const handleChange = async value => {
    if (!value || Number(value) === task.group_id || saving) return;

    setSaving(true);

    const selectedGroup = groups.find(g => g.id === Number(value));

    const previousGroup = task.group;
    const previousGroupId = task.group_id;

    // Actualización optimista (la UI cambia inmediatamente)
    onTaskChange(task.id, {
      group_id: selectedGroup.id,
      group: selectedGroup,
    });

    try {
      await axios.put(
        route('projects.tasks.update', {
          project: project.id,
          task: task.id,
        }),
        {
          group_id: Number(value),
        }
      );
    } catch (error) {
      // Si falla el backend, volvemos al estado anterior
      onTaskChange(task.id, {
        group_id: previousGroupId,
        group: previousGroup,
      });

      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className='timeline-group-select'
      onClick={e => e.stopPropagation()}
    >
      <Select
        value={task.group_id ? String(task.group_id) : null}
        data={options}
        onChange={handleChange}
        allowDeselect={false}
        searchable={false}
        disabled={saving}
        size='xs'
        radius='sm'
        variant='filled'
        comboboxProps={{
          withinPortal: true,
          position: 'bottom-start',
          middlewares: {
            flip: false,
            shift: false,
          },
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

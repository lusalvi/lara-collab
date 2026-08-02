import { Select } from '@mantine/core';
import { getGroupSelectColorName } from '@/utils/taskGroupColors';

import useTaskGroupsStore from '@/hooks/store/useTaskGroupsStore';
import useTasksStore from '@/hooks/store/useTasksStore';

export default function TaskStatusDropdown({ task }) {
  const { groups } = useTaskGroupsStore();
  const { updateTaskProperty } = useTasksStore();

  const currentGroup = groups.find(g => g.id === task.group_id);
  const currentColor = getGroupSelectColorName(currentGroup);

  return (
    <div onClick={e => e.stopPropagation()}>
      <Select
        value={String(task.group_id)}
        data={groups.map(group => ({
          value: String(group.id),
          label: group.name,
        }))}
        allowDeselect={false}
        searchable={false}
        size="xs"
        radius="sm"
        variant="filled"
        onChange={value => {
          const group = groups.find(g => g.id === Number(value));

          updateTaskProperty(task, 'group_id', group.id, group);
        }}
        styles={{
          input: {
            backgroundColor: `var(--mantine-color-${currentColor}-1)`,
            color: `var(--mantine-color-${currentColor}-8)`,
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            textTransform: 'uppercase',
          },
        }}
      />
    </div>
  );
}
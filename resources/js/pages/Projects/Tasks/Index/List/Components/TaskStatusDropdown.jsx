import { Menu } from '@mantine/core';

import useTaskGroupsStore from '@/hooks/store/useTaskGroupsStore';
import useTasksStore from '@/hooks/store/useTasksStore';

import TaskStatusBadge from './TaskStatusBadge';

export default function TaskStatusDropdown({ task }) {
  const { groups } = useTaskGroupsStore();
  const { updateTaskProperty } = useTasksStore();

  return (
    <Menu
      shadow="md"
      width={180}
    >
      <Menu.Target>
        <div style={{ cursor: 'pointer' }}>
          <TaskStatusBadge
            status={task.status}
            editable
          />
        </div>
      </Menu.Target>

      <Menu.Dropdown>
        {groups.map(group => (
          <Menu.Item
            key={group.id}
            onClick={() => updateTaskProperty(task, 'group_id', group.id, group)}
          >
            {group.name}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}
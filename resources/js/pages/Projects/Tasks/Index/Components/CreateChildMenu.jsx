import { ActionIcon, Menu } from '@mantine/core';
import { IconChecklist, IconListDetails, IconPlus, IconSubtask } from '@tabler/icons-react';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';

export default function CreateChildMenu({ task }) {
  const { openCreateTask } = useTaskDrawerStore();

  // Las subtareas no pueden tener hijos
  if (task.issue_type === 'Subtarea') {
    return null;
  }

  const create = (issueType, forceIssueType = false) =>
    openCreateTask({
      group_id: task.group_id,
      issue_type: issueType,
      parent_task_id: task.id,
      force_issue_type: forceIssueType,
    });

  // Las tareas solamente pueden crear subtareas
  if (task.issue_type === 'Tarea') {
    return (
      <ActionIcon
        variant='subtle'
        size='sm'
        onClick={e => {
          e.stopPropagation();
          create('Subtarea');
        }}
      >
        <IconPlus size={16} />
      </ActionIcon>
    );
  }

  return (
    <Menu
      shadow='md'
      width={190}
      withinPortal
    >
      <Menu.Target>
        <ActionIcon
          variant='subtle'
          size='sm'
          onClick={e => e.stopPropagation()}
        >
          <IconPlus size={16} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        {task.issue_type === 'Épica' && (
          <Menu.Item
            leftSection={<IconListDetails size={16} />}
            onClick={() => create('Historia')}
          >
            Historia
          </Menu.Item>
        )}

        <Menu.Item
          leftSection={<IconChecklist size={16} />}
          onClick={() => create('Tarea')}
        >
          Tarea
        </Menu.Item>

        <Menu.Item
          leftSection={<IconSubtask size={16} />}
          onClick={() => create('Subtarea')}
        >
          Subtarea
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

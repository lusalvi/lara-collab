import { useState } from 'react';
import { ActionIcon, Text, TextInput, Group } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import axios from 'axios';
import useTasksStore from '@/hooks/store/useTasksStore';

export default function EditableTaskName({
  task,
}) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [value, setValue] = useState(task.name);
  const [saving, setSaving] = useState(false);
  const { updateTaskProperty } = useTasksStore();

  const cancel = () => {
    setValue(task.name);
    setEditing(false);
  };

  const save = async () => {
    const name = value.trim();

    if (name === '' || name === task.name) {
      cancel();
      return;
    }

    setSaving(true);

    try {
      await axios.put(
        route('projects.tasks.update', {
          project: task.project_id,
          task: task.id,
        }),
        {
          name,
        }
      );

      updateTaskProperty(task, 'name', name);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  if (editing) {
    return (
      <TextInput
        value={value}
        onChange={e => setValue(e.currentTarget.value)}
        onBlur={save}
        onKeyDown={e => {
          if (e.key === 'Enter') {
            save();
          }

          if (e.key === 'Escape') {
            cancel();
          }
        }}
        autoFocus
        size="xs"
        disabled={saving}
        onClick={e => e.stopPropagation()}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <Group
      gap="xs"
      wrap="nowrap"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ flex: 1 }}
    >
      <Text
        size="sm"
        fw={400}
        lineClamp={1}
        style={{ flex: 1 }}
      >
        {task.name}
      </Text>

      {hovered && (
        <ActionIcon
          size="xs"
          variant="subtle"
          onClick={e => {
            e.stopPropagation();
            setEditing(true);
          }}
        >
          <IconPencil size={14} />
        </ActionIcon>
      )}
    </Group>
  );
}
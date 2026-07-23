import { useState } from 'react';
import { ActionIcon, Text, TextInput } from '@mantine/core';
import { IconPencil } from '@tabler/icons-react';
import axios from 'axios';

export default function EditableTaskName({
  project,
  task,
  onTaskChange,
}) {
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [value, setValue] = useState(task.name);
  const [saving, setSaving] = useState(false);

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
          project: project.id,
          task: task.id,
        }),
        {
          name,
        }
      );

      onTaskChange(task.id, { name });

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
      />
    );
  }

  return (
    <div className="timeline-task-name"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Text
        size="sm"
        fw={500}
        truncate
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
    </div>
  );
}
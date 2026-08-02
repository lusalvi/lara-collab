import { Badge, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

import { getGroupSelectColorName } from '@/utils/taskGroupColors';

export default function TaskStatusBadge({ group, editable = false }) {
  return (
    <Badge
      color={getGroupSelectColorName(group)}
      variant="light"
      radius="sm"
    >
      <Group gap={4} wrap="nowrap">
        <span>{group?.name}</span>

        {editable && (
          <IconChevronDown
            size={12}
            stroke={2}
          />
        )}
      </Group>
    </Badge>
  );
}
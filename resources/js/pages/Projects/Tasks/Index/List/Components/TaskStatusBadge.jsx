import { Badge, Group } from '@mantine/core';
import { IconChevronDown } from '@tabler/icons-react';

const getStatusColor = status => {
  switch (status) {
    case 'Backlog':
      return 'gray';

    case 'Por hacer':
      return 'hospitalPrimary';

    case 'En curso':
      return 'orange';

    case 'En revisión':
      return 'violet';

    case 'Finalizado':
      return 'green';

    case 'Desplegado':
      return 'cyan';

    default:
      return 'gray';
  }
};

export default function TaskStatusBadge({ status, editable = false }) {
  return (
    <Badge
      color={getStatusColor(status)}
      variant="light"
      radius="sm"
    >
      <Group
        gap={4}
        wrap="nowrap"
      >
        <span>{status}</span>

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
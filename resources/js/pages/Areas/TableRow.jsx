import TableRowActions from '@/components/TableRowActions';
import { Checkbox, Table, Text } from '@mantine/core';

export default function TableRow({ item, selectable = false, selected = false, onToggleSelect }) {
  return (
    <Table.Tr key={item.id}>
      {selectable && (
        <Table.Td>
          <Checkbox
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`Seleccionar área ${item.name}`}
          />
        </Table.Td>
      )}
      <Table.Td>
        <Text
          fz='sm'
          fw={500}
        >
          {item.name}
        </Text>
      </Table.Td>
      {(can('edit area') || can('archive area') || can('restore area')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            editRoute='areas.edit'
            editPermission='edit area'
            archivePermission='archive area'
            restorePermission='restore area'
            archive={{
              route: 'areas.destroy',
              title: 'Archive area',
              content: `Are you sure you want to archive this area?`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'areas.restore',
              title: 'Restore area',
              content: `Are you sure you want to restore this area?`,
              confirmLabel: 'Restore',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}
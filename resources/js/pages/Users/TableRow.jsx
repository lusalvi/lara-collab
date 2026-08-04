import RoleBadge from '@/components/RoleBadge';
import TableRowActions from '@/components/TableRowActions';
import { getInitials } from '@/utils/user';
import { usePage } from '@inertiajs/react';
import { Avatar, Badge, Checkbox, Flex, Group, Table, Text } from '@mantine/core';

export default function TableRow({ item, selectable = false, selected = false, onToggleSelect }) {
  const { auth } = usePage().props;
  const isSuperAdmin = auth.user.is_super_admin;

  return (
    <Table.Tr key={item.id}>
      {selectable && (
        <Table.Td>
          <Checkbox
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`Seleccionar usuario ${item.name}`}
          />
        </Table.Td>
      )}
      <Table.Td>
        <Group gap='sm'>
          <Avatar
            src={item.avatar}
            size={40}
            radius={40}
            color='hospitalPrimary'
            alt={item.name}
          >
            {getInitials(item.name)}
          </Avatar>
          <div>
            <Text
              fz='sm'
              fw={500}
            >
              {item.name}
            </Text>
            <Text
              fz='xs'
              c='dimmed'
            >
              {item.job_title}
            </Text>
          </div>
        </Group>
      </Table.Td>
      <Table.Td maw={200}>
        <Flex
          gap='sm'
          align='center'
          direction='row'
          wrap='wrap'
        >
          {item.roles.map((role, index) => (
            <RoleBadge
              role={role}
              key={`role-${index}-${item.id}`}
            />
          ))}
        </Flex>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.email}</Text>
        <Text
          fz='xs'
          c='dimmed'
        >
          Email
        </Text>
      </Table.Td>

      {/* Columna área: solo visible para superadmin */}
      {isSuperAdmin && (
        <Table.Td>
          {item.area ? (
            <Badge
              variant='light'
              color='gray'
              radius='sm'
            >
              {item.area.name}
            </Badge>
          ) : (
            <Text
              fz='xs'
              c='dimmed'
            >
              —
            </Text>
          )}
        </Table.Td>
      )}
      {(can('edit user') || can('archive user') || can('restore user')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            editRoute='users.edit'
            editPermission='edit user'
            archivePermission='archive user'
            restorePermission='restore user'
            archive={{
              route: 'users.destroy',
              title: 'Archive user',
              content: `Are you sure you want to archive this user? This action will prevent
                the user from logging in, while all other aspects related to the
                user's actions will remain unaffected.`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'users.restore',
              title: 'Restore user',
              content: `Are you sure you want to restore this user? This action will allow the user to login.`,
              confirmLabel: 'Restore',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}
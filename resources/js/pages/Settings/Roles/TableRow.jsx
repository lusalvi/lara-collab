import TableRowActions from "@/components/TableRowActions";
import { Checkbox, Table, Text } from "@mantine/core";

export default function TableRow({ item, selectable = false, selected = false, onToggleSelect, showSelectColumn = false }) {
  const isLocked = (role) => {
    return role === "admin" || role === "superadmin";
  };

  return (
    <Table.Tr key={item.id}>
      {showSelectColumn && (
        <Table.Td>
          {selectable && (
            <Checkbox
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              aria-label={`Seleccionar rol ${item.name}`}
            />
          )}
        </Table.Td>
      )}
      <Table.Td>
        <Text fz="sm" tt="capitalize" c={isLocked(item.name) ? "blue" : ""}>
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td w={165}>
        <Text fz="sm">{item.permissions_count}</Text>
      </Table.Td>
      {(can("edit role") || can("archive role") ||
        (can("restore role") && item.can_restore !== false)) &&
       !isLocked(item.name) && (
          <Table.Td w={100}>
            <TableRowActions
              item={item}
              editRoute="settings.roles.edit"
              editPermission="edit role"
              archivePermission="archive role"
              restorePermission="restore role"
              archive={{
                route: "settings.roles.destroy",
                title: "Archivar rol",
                content: "¿Estás seguro de que deseas archivar este rol?",
                confirmLabel: "Archivar",
              }}
              restore={{
                route: "settings.roles.restore",
                title: "Restaurar rol",
                content: "¿Estás seguro de que deseas restaurar este rol?",
                confirmLabel: "Restaurar",
              }}
            />
          </Table.Td>
        )}
    </Table.Tr>
  );
}
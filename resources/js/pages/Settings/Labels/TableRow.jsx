import TableRowActions from "@/components/TableRowActions";
import { Checkbox, ColorSwatch, Table, Text } from "@mantine/core";

export default function TableRow({ item, selectable = false, selected = false, onToggleSelect, showSelectColumn = false }) {
  return (
    <Table.Tr key={item.id}>
      {showSelectColumn && (
        <Table.Td>
          {selectable && (
            <Checkbox
              checked={selected}
              onChange={() => onToggleSelect(item.id)}
              aria-label={`Seleccionar etiqueta ${item.name}`}
            />
          )}
        </Table.Td>
      )}
      <Table.Td w={80}>
        <ColorSwatch color={item.color} />
      </Table.Td>
      <Table.Td>
        <Text fz="sm">{item.name}</Text>
      </Table.Td>
      {(can("edit label") || can("archive label") ||
        (can("restore label") && item.can_restore !== false)) && (
        <Table.Td w={100}>
          <TableRowActions
            item={item}
            editRoute="settings.labels.edit"
            editPermission="edit label"
            archivePermission="archive label"
            restorePermission="restore label"
            archive={{
              route: "settings.labels.destroy",
              title: "Archivar etiqueta",
              content: "¿Estás seguro de que deseas archivar esta etiqueta?",
              confirmLabel: "Archivar",
            }}
            restore={{
              route: "settings.labels.restore",
              title: "Restaurar etiqueta",
              content: "¿Estás seguro de que deseas restaurar esta etiqueta?",
              confirmLabel: "Restaurar",
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}
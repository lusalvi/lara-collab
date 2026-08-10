import TableRowActions from '@/components/TableRowActions';
import { Checkbox, Table } from '@mantine/core';
import classes from './Areas.module.css';

export default function TableRow({
    item,
    selectable = false,
    selected = false,
    onToggleSelect,
}) {
    return (
        <Table.Tr>
            {selectable && (
                <Table.Td className={classes.checkbox}>
                    <Checkbox
                        checked={selected}
                        onChange={() => onToggleSelect(item.id)}
                        aria-label={`Seleccionar área ${item.name}`}
                    />
                </Table.Td>
            )}

            <Table.Td className={classes.name}>
                {item.name}
            </Table.Td>

            {(can('edit area') ||
                can('archive area') ||
                can('restore area')) && (
                <Table.Td className={classes.actions}>
                    <TableRowActions
                        item={item}
                        editRoute="areas.edit"
                        editPermission="edit area"
                        archivePermission="archive area"
                        restorePermission="restore area"
                        archive={{
                            route: 'areas.destroy',
                            title: 'Archivar área',
                            content:
                                '¿Estás seguro de que deseas archivar el área seleccionada?',
                            confirmLabel: 'Archivar',
                        }}
                        restore={{
                            route: 'areas.restore',
                            title: 'Restaurar área',
                            content:
                                '¿Estás seguro de que deseas restaurar el área seleccionada?',
                            confirmLabel: 'Restaurar',
                        }}
                    />
                </Table.Td>
            )}
        </Table.Tr>
    );
}
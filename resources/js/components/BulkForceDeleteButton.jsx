import { router } from '@inertiajs/react';
import { Button } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import { openConfirmModal } from './ConfirmModal';

/**
 * Botón "Eliminar seleccionados" para bulk force-delete. Solo debería renderizarse
 * cuando ya hay al menos un elemento seleccionado (selectedIds.length > 0).
 */
export default function BulkForceDeleteButton({
  selectedIds,
  routeName,
  entityLabelSingular,
  entityLabelPlural,
  onSuccess,
  extraData = {},
}) {
  const openBulkDeleteModal = () =>
    openConfirmModal({
      type: 'danger',
      title: `Eliminar ${entityLabelPlural} permanentemente`,
      content: `Esta acción no se puede deshacer. Se eliminarán permanentemente ${selectedIds.length} ${
        selectedIds.length === 1 ? entityLabelSingular : entityLabelPlural
      }.`,
      confirmLabel: 'Eliminar permanentemente',
      confirmProps: { color: 'red' },
      onConfirm: () =>
        router.post(
          route(routeName),
          { ids: selectedIds, ...extraData },
          {
            preserveScroll: true,
            onSuccess,
          }
        ),
    });

  return (
    <Button
      color='red'
      leftSection={<IconTrash size={14} />}
      radius='xl'
      onClick={openBulkDeleteModal}
    >
      Eliminar seleccionados ({selectedIds.length})
    </Button>
  );
}
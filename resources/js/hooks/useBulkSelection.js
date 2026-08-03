import { useEffect, useState } from 'react';

/**
 * Maneja la selección múltiple de una lista de items seleccionables (por ejemplo,
 * los que tienen can_force_delete === true en la página actual de una tabla).
 *
 * Se limpia automáticamente cuando cambia el set de items disponibles (nueva búsqueda,
 * cambio de página, cambio de pestaña activos/archivados), ya que las páginas Inertia
 * que usan preserveState no remontan el componente entre esas navegaciones.
 */
export default function useBulkSelection(selectableIds = []) {
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds([]);
  }, [selectableIds.join(',')]);

  const toggle = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === selectableIds.length ? [] : [...selectableIds]
    );
  };

  const clear = () => setSelectedIds([]);

  const allSelected = selectableIds.length > 0 && selectedIds.length === selectableIds.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  return { selectedIds, toggle, toggleAll, clear, allSelected, someSelected };
}
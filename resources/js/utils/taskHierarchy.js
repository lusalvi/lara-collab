// Espejo en JS de App\Models\Task::ALLOWED_CHILD_TYPES.
// Si cambia la jerarquía, actualizar en ambos lados.
export const ALLOWED_CHILD_TYPES = {
  Epica: ['Historia', 'Tarea'],
  Historia: ['Subtarea'],
  Tarea: ['Subtarea'],
  Subtarea: [],
};

export function canHaveChildOfType(parentIssueType, childIssueType) {
  return (ALLOWED_CHILD_TYPES[parentIssueType] || []).includes(childIssueType);
}
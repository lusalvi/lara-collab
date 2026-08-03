import { Text } from "@mantine/core";

export default function TaskDueDate({ date }) {
  if (!date) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  // Parseaar la fecha ISO como UTC y mostrar en formato local
  const taskDate = new Date(date);
  
  // Crear la fecha en UTC (getUTC* methods)
  const day = String(taskDate.getUTCDate()).padStart(2, '0');
  const month = String(taskDate.getUTCMonth() + 1).padStart(2, '0');
  const year = taskDate.getUTCFullYear();
  
  const formatted = `${day}/${month}/${year}`;

  return (
    <Text size="sm">
      {formatted}
    </Text>
  );
}
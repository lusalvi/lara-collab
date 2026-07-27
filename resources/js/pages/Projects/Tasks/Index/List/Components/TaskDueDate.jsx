import { Text } from "@mantine/core";

export default function TaskDueDate({ date }) {
  if (!date) {
    return (
      <Text size="sm" c="dimmed">
        —
      </Text>
    );
  }

  const formatted = new Date(date).toLocaleDateString("es-AR");

  return (
    <Text size="sm">
      {formatted}
    </Text>
  );
}
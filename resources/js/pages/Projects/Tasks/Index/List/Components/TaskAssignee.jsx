import { Avatar, Group, Text } from "@mantine/core";

export default function TaskAssignee({ user }) {
  return (
    <Group gap={8} wrap="nowrap">
      <Avatar
        size={28}
        radius="xl"
        color="hospitalPrimary"
        src={user?.avatar}
      >
        {user?.name?.charAt(0)}
      </Avatar>

      <Text size="sm">
        {user?.name ?? "-"}
      </Text>
    </Group>
  );
}
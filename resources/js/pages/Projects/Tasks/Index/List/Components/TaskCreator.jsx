import { Avatar, Group, Text } from '@mantine/core';

export default function TaskCreator({ user }) {
  if (!user) {
    return (
      <Text
        c='dimmed'
        size='sm'
      >
        -
      </Text>
    );
  }

  return (
    <Group gap='xs' wrap='nowrap' style={{ overflow: 'hidden' }}>
      <Avatar
        src={user.avatar}
        size='sm'
        radius='xl'
        alt={user.name}
        style={{ flexShrink: 0 }}
      >
        {user.name?.[0]}
      </Avatar>
      <Text size='sm' truncate='end'>
        {user.name}
      </Text>
    </Group>
  );
}
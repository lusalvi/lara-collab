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
    <Group gap='xs'>
      <Avatar
        src={user.avatar}
        size='sm'
        radius='xl'
        alt={user.name}
      >
        {user.name?.[0]}
      </Avatar>
      <Text size='sm' lineClamp={1}>
        {user.name}
      </Text>
    </Group>
  );
}
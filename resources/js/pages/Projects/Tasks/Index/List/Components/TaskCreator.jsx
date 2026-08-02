import { Avatar, Group, Text, Tooltip } from '@mantine/core';

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
    <Tooltip label={user.name} withArrow>
      <Group gap='xs'>
        <Avatar
          src={user.avatar}
          size='sm'
          radius='xl'
          alt={user.name}
        />
        <Text size='sm' lineClamp={1}>
          {user.name}
        </Text>
      </Group>
    </Tooltip>
  );
}
import { dateTime } from '@/utils/datetime';
import { Group, Text, rem } from '@mantine/core';
import classes from './css/Notification.module.css';
import AppIcon from '@/components/AppIcon';

export default function Notification({ title, subtitle, datetime, read }) {
  return (
    <Group wrap='nowrap'>
      <AppIcon
        name='notifications'
        filled={!read}
        size={30}
        style={{
          flexShrink: 0,
          color: read ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-hospitalPrimary-6)',
        }}
      />
      <div>
        <Text
          fz={13}
          lh={rem(16)}
        >
          {title}
        </Text>
        <Text
          fz={11}
          c='dimmed'
        >
          {`${subtitle}, ${dateTime(datetime)}`}
        </Text>
      </div>
    </Group>
  );
}
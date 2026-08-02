import { Group, Button, Text, Badge, Stack } from '@mantine/core';
import { IconArchive, IconX } from '@tabler/icons-react';
import useTasksStore from '@/hooks/store/useTasksStore';
import { openConfirmModal } from '@/components/ConfirmModal';
import { usePage } from '@inertiajs/react';

export default function BulkActionsBar() {
  const { project } = usePage().props;
  const { selectedTaskIds, clearTaskSelection, archiveSelectedTasks } = useTasksStore();

  if (selectedTaskIds.length === 0) {
    return null;
  }

  const handleArchiveMultiple = () => {
    openConfirmModal({
      type: 'danger',
      title: 'Archive tasks',
      content: `Are you sure you want to archive ${selectedTaskIds.length} task(s)? This action cannot be undone.`,
      confirmLabel: 'Archive',
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        await archiveSelectedTasks(project.id);
      },
    });
  };

  return (
    <Stack gap='md' mb='md'>
      <Group
        bg='var(--mantine-color-blue-0)'
        p='md'
        radius='md'
        justify='space-between'
        align='center'
        style={{ 
          border: '1px solid var(--mantine-color-blue-2)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        }}
      >
        <Group gap='sm'>
          <Badge size='lg' variant='filled' color='blue'>
            {selectedTaskIds.length} selected
          </Badge>
          <Text size='sm' c='dimmed'>
            Selecting tasks for bulk actions
          </Text>
        </Group>

        <Group gap='sm'>
          {can('archive task') && (
            <Button
              variant='filled'
              color='red'
              size='sm'
              leftSection={<IconArchive size={16} />}
              onClick={handleArchiveMultiple}
            >
              Archive all selected
            </Button>
          )}
          <Button
            variant='light'
            color='gray'
            size='sm'
            leftSection={<IconX size={16} />}
            onClick={clearTaskSelection}
          >
            Clear selection
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
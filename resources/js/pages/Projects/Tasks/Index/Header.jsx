import ArchivedFilterButton from '@/components/ArchivedFilterButton';
import ClearFiltersButton from '@/components/ClearFiltersButton';
import SearchInput from '@/components/SearchInput';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import usePreferences from '@/hooks/usePreferences';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { ActionIcon, Button, Grid, Group, Text, Title, Tooltip } from '@mantine/core';
import {
  IconCalendar,
  IconFilter,
  IconFilterCog,
  IconChartBar,
  IconNote,
  IconPlus,
} from '@tabler/icons-react';
import { SegmentedControl } from '@mantine/core';

export default function Header() {
  const { project } = usePage().props;

  const { tasksView, setTasksView } = usePreferences();
  const { openDrawer } = useTaskFiltersStore();
  const search = search => reloadWithQuery({ search });

  const { openCreateTask } = useTaskDrawerStore();
  const { hasUrlParams } = useTaskFiltersStore();
  const usingFilters = hasUrlParams(['archived']);

  return (
    <Grid
      justify='space-between'
      align='end'
    >
      <Grid.Col span='content'>
        <Group mb='lg'>
          <Title order={1}>
            {project.name}
            {project.archived_at && (
              <Text
                size='2rem'
                fw={500}
                c='red.8'
                ml='md'
                span
              >
                (archived)
              </Text>
            )}
          </Title>
        </Group>
        <Group>
          <SearchInput
            placeholder='Search tasks'
            search={search}
            mr='md'
          />

          <ActionIcon.Group>
            {!route().params.archived && (
              <Tooltip
                label='Filters'
                openDelay={500}
                withArrow
              >
                <ActionIcon
                  variant='filled'
                  size='lg'
                  onClick={() => openDrawer()}
                >
                  {usingFilters ? (
                    <IconFilterCog
                      style={{ width: '60%', height: '60%' }}
                      stroke={1.5}
                    />
                  ) : (
                    <IconFilter
                      style={{ width: '60%', height: '60%' }}
                      stroke={1.5}
                    />
                  )}
                </ActionIcon>
              </Tooltip>
            )}
            {usingFilters && <ClearFiltersButton />}
          </ActionIcon.Group>
          <Tooltip
            label='Calendario'
            openDelay={500}
            withArrow
          >
            <ActionIcon
              variant='default'
              size='lg'
              onClick={() => redirectTo('projects.calendar', project.id)}
            >
              <IconCalendar
                style={{ width: '60%', height: '60%' }}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>

          <Tooltip
            label='Cronograma'
            openDelay={500}
            withArrow
          >
            <ActionIcon
              variant='default'
              size='lg'
              onClick={() => redirectTo('projects.timeline', project.id)}
            >
              <IconChartBar
                style={{ width: '60%', height: '60%' }}
                stroke={1.5}
              />
            </ActionIcon>
          </Tooltip>

          {can('view notes') && (
            <Tooltip
              label='Notas'
              openDelay={500}
              withArrow
            >
              <ActionIcon
                variant='default'
                size='lg'
                onClick={() => redirectTo('projects.notes', project.id)}
              >
                <IconNote
                  style={{ width: '60%', height: '60%' }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Tooltip>
          )}

          <ArchivedFilterButton />
        </Group>
      </Grid.Col>
      <Grid.Col span='content'>
        <Group>
          <Group mr='sm'>
            <SegmentedControl
              value={tasksView}
              onChange={setTasksView}
              data={[
                { label: 'Listado', value: 'list' },
                { label: 'Tablero', value: 'kanban' },
              ]}
            />
          </Group>

          {can('create task') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => openCreateTask()}
            >
              Add task
            </Button>
          )}
        </Group>
      </Grid.Col>
    </Grid>
  );
}

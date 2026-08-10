import ClearFiltersButton from '@/components/ClearFiltersButton';
import ProjectTabs from '@/components/ProjectTabs';
import SearchInput from '@/components/SearchInput';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import { reloadWithQuery } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import {
  ActionIcon,
  Button,
  Group,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  IconFilter,
  IconFilterCog,
  IconPlus,
} from '@tabler/icons-react';

export default function Header() {
  const { project } = usePage().props;

  const { openDrawer } = useTaskFiltersStore();
  const { openCreateTask } = useTaskDrawerStore();
  const { hasUrlParams } = useTaskFiltersStore();

  const mobile = useMediaQuery('(max-width: 768px)');

  const search = search => reloadWithQuery({ search });

  const isArchived = !!route().params.archived;
  const currentRoute = route().current();

  const isTasksView =
    currentRoute === 'projects.tasks' ||
    currentRoute === 'projects.tasks.open';

  const usingFilters = hasUrlParams(['archived']);

  return (
    <>
      <Group
        mt="md"
        mb="md"
        align="center"
      >
        <Title order={1}>
          {project.name}
        </Title>

        {project.archived_at && (
          <Text
            size="lg"
            fw={500}
            c="red.8"
          >
            (archivado)
          </Text>
        )}
      </Group>

      <ProjectTabs />

      {isTasksView && !isArchived && (
        <Group
          justify="space-between"
          align="flex-end"
          wrap="wrap"
          mb="md"
          gap="md"
        >
          <Group
            grow={mobile}
            style={{
              flex: mobile ? 1 : undefined,
            }}
          >
            <SearchInput
              placeholder="Buscar actividades"
              search={search}
            />

            <ActionIcon.Group>
              <Tooltip
                label="Filtros"
                openDelay={500}
                withArrow
              >
                <ActionIcon
                  variant="filled"
                  size="lg"
                  onClick={openDrawer}
                >
                  {usingFilters ? (
                    <IconFilterCog
                      stroke={1.5}
                      style={{
                        width: '60%',
                        height: '60%',
                      }}
                    />
                  ) : (
                    <IconFilter
                      stroke={1.5}
                      style={{
                        width: '60%',
                        height: '60%',
                      }}
                    />
                  )}
                </ActionIcon>
              </Tooltip>

              {usingFilters && <ClearFiltersButton />}
            </ActionIcon.Group>
          </Group>

          {can('create task') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius="xl"
              onClick={openCreateTask}
              fullWidth={mobile}
              style={{
                width: mobile ? '100%' : 'auto',
              }}
            >
              Agregar actividad
            </Button>
          )}
        </Group>
      )}
    </>
  );
}
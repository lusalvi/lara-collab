import ClearFiltersButton from '@/components/ClearFiltersButton';
import ProjectTabs from '@/components/ProjectTabs';
import SearchInput from '@/components/SearchInput';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';
import { reloadWithQuery } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { ActionIcon, Button, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconFilter, IconFilterCog, IconPlus } from '@tabler/icons-react';

export default function Header() {
  const { project } = usePage().props;

  const { openDrawer } = useTaskFiltersStore();
  const search = (search) => reloadWithQuery({ search });

  const { openCreateTask } = useTaskDrawerStore();
  const { hasUrlParams } = useTaskFiltersStore();

  // Buscador, filtros y botón crear solo en lista/tablero activos (no en archivados)
  const isArchived = !!route().params.archived;
  const currentRoute = route().current();
  const isTasksView =
    currentRoute === 'projects.tasks' || currentRoute === 'projects.tasks.open';

  // Filtros activos (excluimos 'archived' porque ahora es pestaña)
  const usingFilters = hasUrlParams(['archived']);

  return (
    <>
      {/* Título del proyecto */}
      <Group mb='md' wrap='wrap'>
        <Title 
          order={1}
          size={{ base: 'h2', sm: 'h1' }}
        >
          {project.name}
          {project.archived_at && (
            <Text
              size={{ base: 'md', sm: 'lg' }}
              fw={500}
              c='red.8'
              ml='md'
              span
            >
              (archivado)
            </Text>
          )}
        </Title>
      </Group>

      {/* Pestañas: Lista, Tablero, Calendario, Cronograma, Notas, Archivados */}
      <ProjectTabs />

      {/* Barra de herramientas: buscador + filtros + botón crear – solo en lista/tablero activos */}
      {isTasksView && !isArchived && (
        <Group
          justify='space-between'
          mb='md'
          wrap='wrap'
          gap={{ base: 'xs', sm: 'md' }}
        >
          <Group grow={{ base: true, sm: false }}>
            <SearchInput
              placeholder='Buscar actividades'
              search={search}
            />

            <ActionIcon.Group>
              <Tooltip
                label='Filtros'
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
              {usingFilters && <ClearFiltersButton />}
            </ActionIcon.Group>
          </Group>

          {can('create task') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => openCreateTask()}
              fullWidth={{ base: true, sm: false }}
            >
              Agregar actividad
            </Button>
          )}
        </Group>
      )}
    </>
  );
}
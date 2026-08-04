import ArchivedTabs from '@/components/ArchivedTabs';
import { openConfirmModal } from '@/components/ConfirmModal';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import SearchInput from '@/components/SearchInput';
import useAuthorization from '@/hooks/useAuthorization';
import Layout from '@/layouts/MainLayout';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { router, usePage } from '@inertiajs/react';
import { Button, Center, Flex, Grid } from '@mantine/core';
import { IconPlus, IconSearch, IconTrash } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import ProjectCard from './Index/ProjectCard';

const ProjectsIndex = () => {
  const { items } = usePage().props;
  const { isAdmin, isSuperAdmin } = useAuthorization();
  const [selectedIds, setSelectedIds] = useState([]);

  const isArchivedView = !!route().params.archived;
  const canForceDelete = can('force delete project');
  const selectable = isArchivedView && canForceDelete;

  // preserveState mantiene el componente montado al navegar entre pestañas,
  // así que limpiamos la selección manualmente al cambiar de vista o al buscar.
  useEffect(() => {
    setSelectedIds([]);
  }, [isArchivedView, items]);

  const search = (search) => reloadWithQuery({ search });

  const toggleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id]
    );
  };

  const openBulkDeleteModal = () =>
    openConfirmModal({
      type: 'danger',
      title: 'Eliminar proyectos permanentemente',
      content: `Esta acción no se puede deshacer. Se eliminarán permanentemente ${selectedIds.length} proyecto(s) y todo su contenido asociado (tareas, tableros, notas y archivos adjuntos).`,
      confirmLabel: 'Eliminar permanentemente',
      confirmProps: { color: 'red' },
      onConfirm: () =>
        router.post(
          route('projects.bulk-force-delete'),
          { ids: selectedIds },
          {
            preserveScroll: true,
            onSuccess: () => setSelectedIds([]),
          }
        ),
    });

  return (
    <>
      {/* Pestañas Activos / Archivados – solo visibles para admin */}
      {(isAdmin() || isSuperAdmin()) && (
        <ArchivedTabs
          activeLabel='Proyectos activos'
          archivedLabel='Proyectos archivados'
        />
      )}

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        {!isArchivedView && (
          <Grid.Col span='content'>
            <SearchInput
              placeholder='Buscar proyectos'
              search={search}
            />
          </Grid.Col>
        )}
        <Grid.Col span='content'>
          <Flex gap='sm' align='center'>
            {selectable && selectedIds.length > 0 && (
              <Button
                color='red'
                leftSection={<IconTrash size={14} />}
                radius='xl'
                onClick={openBulkDeleteModal}
              >
                Eliminar seleccionados ({selectedIds.length})
              </Button>
            )}
            {!isArchivedView && can('create project') && (
              <Button
                leftSection={<IconPlus size={14} />}
                radius='xl'
                onClick={() => redirectTo('projects.create')}
              >
                Crear
              </Button>
            )}
          </Flex>
        </Grid.Col>
      </Grid>

      {items.length ? (
        <Flex
          mt='xl'
          gap='lg'
          justify='flex-start'
          align='flex-start'
          direction='row'
          wrap='wrap'
        >
          {items.map((item) => (
            <ProjectCard
              item={item}
              key={item.id}
              selectable={selectable}
              selected={selectedIds.includes(item.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </Flex>
      ) : (
        <Center mih={400}>
          <EmptyWithIcon
            title='No se encontraron proyectos'
            subtitle='o no tenés acceso a ninguno'
            icon={IconSearch}
          />
        </Center>
      )}
    </>
  );
};

ProjectsIndex.layout = (page) => <Layout title='Proyectos'>{page}</Layout>;

export default ProjectsIndex;
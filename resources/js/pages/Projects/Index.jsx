import ArchivedTabs from '@/components/ArchivedTabs';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import SearchInput from '@/components/SearchInput';
import useAuthorization from '@/hooks/useAuthorization';
import Layout from '@/layouts/MainLayout';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { Button, Center, Flex, Grid } from '@mantine/core';
import { IconPlus, IconSearch } from '@tabler/icons-react';
import ProjectCard from './Index/ProjectCard';

const ProjectsIndex = () => {
  const { items } = usePage().props;
  const { isAdmin, isSuperAdmin } = useAuthorization();

  const search = (search) => reloadWithQuery({ search });

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
        <Grid.Col span='content'>
          <SearchInput
            placeholder='Buscar proyectos'
            search={search}
          />
        </Grid.Col>
        <Grid.Col span='content'>
          {can('create project') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => redirectTo('projects.create')}
            >
              Crear
            </Button>
          )}
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

import ArchivedTabs from '@/components/ArchivedTabs';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { Button, Grid, Table } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';

const RolesIndex = () => {
  const { items } = usePage().props;

  const protectedRoles = ['superadmin', 'admin'];
  const sortedData = [...items.data].sort((a, b) => {
    const aIndex = protectedRoles.indexOf(a.name);
    const bIndex = protectedRoles.indexOf(b.name);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  const columns = prepareColumns([
    { label: 'Nombre', column: 'name' },
    { label: 'Cantidad de permisos', sortable: false },
    {
      label: 'Acciones',
      sortable: false,
      visible: actionColumnVisibility('role'),
    },
  ]);

  const rows = sortedData.length ? (
    sortedData.map((item) => (
      <TableRow
        item={item}
        key={item.id}
      />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  const search = (search) => reloadWithQuery({ search });
  const sort = (sort) => reloadWithQuery(sort);

  return (
    <>
      <ArchivedTabs
        activeLabel='Roles activos'
        archivedLabel='Roles archivados'
      />

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <SearchInput
            placeholder='Buscar roles'
            search={search}
          />
        </Grid.Col>
        <Grid.Col span='content'>
          {can('create role') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => redirectTo('settings.roles.create')}
            >
              Crear
            </Button>
          )}
        </Grid.Col>
      </Grid>

      <Table.ScrollContainer
        maw={500}
        my='lg'
      >
        <Table verticalSpacing='sm'>
          <TableHead
            columns={columns}
            sort={sort}
          />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Pagination
        current={items.meta.current_page}
        pages={items.meta.last_page}
      />
    </>
  );
};

RolesIndex.layout = (page) => <Layout title='Roles'>{page}</Layout>;

export default RolesIndex;

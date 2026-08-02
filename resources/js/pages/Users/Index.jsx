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

const UsersIndex = () => {
  const { items, auth } = usePage().props;
  const isSuperAdmin = auth.user.is_super_admin;

  const columns = prepareColumns([
    { label: 'Usuario', column: 'name' },
    { label: 'Rol', sortable: false },
    { label: 'Email', column: 'email' },
    {
      label: 'Área',
      column: 'area_id',
      sortable: true,
      visible: isSuperAdmin,
    },
    {
      label: 'Acciones',
      sortable: false,
      visible: actionColumnVisibility('user'),
    },
  ]);

  const rows = items.data.length ? (
    items.data.map((item) => (
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
        activeLabel='Usuarios activos'
        archivedLabel='Usuarios archivados'
      />

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <SearchInput
            placeholder='Buscar usuarios'
            search={search}
          />
        </Grid.Col>
        <Grid.Col span='content'>
          {can('create user') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => redirectTo('users.create')}
            >
              Crear
            </Button>
          )}
        </Grid.Col>
      </Grid>

      <Table.ScrollContainer
        miw={800}
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

UsersIndex.layout = (page) => <Layout title='Usuarios'>{page}</Layout>;

export default UsersIndex;

import ArchivedTabs from '@/components/ArchivedTabs';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import Layout from '@/layouts/MainLayout';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { Button, Grid, Group, Table } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import TableRow from './TableRow';

const AreasIndex = () => {
  const { items } = usePage().props;

  const columns = prepareColumns([
    { label: 'Área', column: 'name' },
    {
      label: 'Acciones',
      sortable: false,
      visible: actionColumnVisibility('area'),
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
        activeLabel='Áreas activas'
        archivedLabel='Áreas archivadas'
      />

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <SearchInput
            placeholder='Buscar áreas'
            search={search}
          />
        </Grid.Col>
        <Grid.Col span='content'>
          {can('create area') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => redirectTo('areas.create')}
            >
              Crear
            </Button>
          )}
        </Grid.Col>
      </Grid>

      <Table.ScrollContainer
        miw={600}
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

AreasIndex.layout = (page) => <Layout title='Áreas'>{page}</Layout>;

export default AreasIndex;

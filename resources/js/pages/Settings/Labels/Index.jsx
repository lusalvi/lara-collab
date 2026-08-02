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

const LabelsIndex = () => {
  const { items } = usePage().props;

  const columns = prepareColumns([
    { label: 'Color', sortable: false },
    { label: 'Nombre', column: 'name' },
    {
      label: 'Acciones',
      sortable: false,
      visible: actionColumnVisibility('label'),
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
        activeLabel='Etiquetas activas'
        archivedLabel='Etiquetas archivadas'
      />

      <Grid
        justify='space-between'
        align='center'
        mb='md'
      >
        <Grid.Col span='content'>
          <SearchInput
            placeholder='Buscar etiquetas'
            search={search}
          />
        </Grid.Col>
        <Grid.Col span='content'>
          {can('create label') && (
            <Button
              leftSection={<IconPlus size={14} />}
              radius='xl'
              onClick={() => redirectTo('settings.labels.create')}
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

LabelsIndex.layout = (page) => <Layout title='Etiquetas'>{page}</Layout>;

export default LabelsIndex;

import ArchivedTabs from '@/components/ArchivedTabs';
import BulkForceDeleteButton from '@/components/BulkForceDeleteButton';
import Pagination from '@/components/Pagination';
import SearchInput from '@/components/SearchInput';
import TableHead from '@/components/TableHead';
import TableRowEmpty from '@/components/TableRowEmpty';
import useBulkSelection from '@/hooks/useBulkSelection';
import Layout from '@/layouts/MainLayout';
import { redirectTo, reloadWithQuery } from '@/utils/route';
import { actionColumnVisibility, prepareColumns } from '@/utils/table';
import { usePage } from '@inertiajs/react';
import { Button, Flex, Grid, Table } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import classes from './Areas.module.css';
import TableRow from './TableRow';

const AreasIndex = () => {
  const { items } = usePage().props;

  const isArchivedView = !!route().params.archived;
  const selectableIds = items.data.filter(item => item.can_force_delete).map(item => item.id);
  const { selectedIds, toggle, toggleAll, clear, allSelected, someSelected } =
    useBulkSelection(selectableIds);

  const columns = prepareColumns([
    { label: 'Área', column: 'name' },
    {
      label: 'Acciones',
      sortable: false,
      visible: actionColumnVisibility('area'),
    },
  ]);

  const rows = items.data.length ? (
    items.data.map(item => (
      <TableRow
        item={item}
        key={item.id}
        selectable={isArchivedView && item.can_force_delete}
        selected={selectedIds.includes(item.id)}
        onToggleSelect={toggle}
      />
    ))
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  const search = search => reloadWithQuery({ search });
  const sort = sort => reloadWithQuery(sort);

  return (
    <>
      <ArchivedTabs
        activeLabel='Áreas activas'
        archivedLabel='Áreas archivadas'
      />
      <div className={classes.tableWrapper}>
      <Grid
        justify="space-between"
        align='center'
        mb='md'
        gutter='sm'
      >
        {!isArchivedView && (
          <Grid.Col span='content'>
            <SearchInput
              placeholder='Buscar áreas'
              search={search}
            />
          </Grid.Col>
        )}

        <Grid.Col span='content'>
          <Flex
            gap='sm'
            align='center'
          >
            {selectedIds.length > 0 && (
              <BulkForceDeleteButton
                selectedIds={selectedIds}
                routeName='areas.bulk-force-delete'
                entityLabelSingular='área'
                entityLabelPlural='áreas'
                onSuccess={clear}
              />
            )}

            {!isArchivedView && can('create area') && (
              <Button
                leftSection={<IconPlus size={14} />}
                radius='xl'
                onClick={() => redirectTo('areas.create')}
              >
                Crear
              </Button>
            )}
          </Flex>
        </Grid.Col>
      </Grid>
        <Table.ScrollContainer
          my='lg'
          className={classes.tableContainer}
        >
          <Table verticalSpacing='sm'>
            <TableHead
              columns={columns}
              sort={sort}
              selectAll={
                selectableIds.length > 0
                  ? {
                      checked: allSelected,
                      indeterminate: someSelected,
                      onChange: toggleAll,
                    }
                  : undefined
              }
            />

            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <div className={classes.pagination}>
          <Pagination
            current={items.meta.current_page}
            pages={items.meta.last_page}
          />
        </div>
      </div>
    </>
  );
};

AreasIndex.layout = page => <Layout title='Áreas'>{page}</Layout>;

export default AreasIndex;

import { Checkbox, Table } from "@mantine/core";
import TableHeaderCell from "./TableHeaderCell";
import useSorting from "@/hooks/useSorting";

export default function TableHead({ columns, sort, selectAll, showSelectColumn = false }) {
  const [sortBy, reverseSortDirection, setSorting] = useSorting(sort);

  return (
    <Table.Thead>
      <Table.Tr>
        {showSelectColumn && (
          <Table.Th w={40}>
            {selectAll && (
              <Checkbox
                checked={selectAll.checked}
                indeterminate={selectAll.indeterminate}
                onChange={selectAll.onChange}
                aria-label='Seleccionar todos'
              />
            )}
          </Table.Th>
        )}
        {columns.map((item) => (
          <TableHeaderCell
            key={item.column || item.label}
            column={item.column}
            sorted={sortBy === item.column}
            reversed={reverseSortDirection}
            sortable={item.sortable}
            onSort={() => setSorting(item.column)}
          >
            {item.label}
          </TableHeaderCell>
        ))}
      </Table.Tr>
    </Table.Thead>
  );
}
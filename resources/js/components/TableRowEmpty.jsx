import { Table, Text } from "@mantine/core";

export default function TableRowEmpty(props) {
  return (
    <Table.Tr>
      <Table.Td {...props}>
        <Text fz="md" ta="center" py={50}>
          No se encontraron registros
        </Text>
      </Table.Td>
    </Table.Tr>
  );
}

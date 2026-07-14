import { Group, Image, Text } from "@mantine/core";
import logoIcon from "@/../images/logohu.png";

export default function Logo(props) {
  return (
    <Group wrap="nowrap" gap="xs" {...props}>
      <Image src={logoIcon} alt="Hospital Universitario" h={60} w="auto" fit="contain" />
      <Text fz={16} fw={600} lh={1.1}>
        HOSPITAL
        <br />
        UNIVERSITARIO
      </Text>
    </Group>
  );
}
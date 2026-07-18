import { Image } from "@mantine/core";
import logoCompleto from "@/../images/logoBlanco.png";

export default function Logo(props) {
  return (
    <Image
      src={logoCompleto}
      alt="Hospital Universitario"
      h={60}
      w="auto"
      fit="contain"
      {...props}
    />
  );
}
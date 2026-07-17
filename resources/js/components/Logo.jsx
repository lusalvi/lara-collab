import { Image } from "@mantine/core";
import logoCompleto from "@/../images/logoBlanco.png";

export default function Logo(props) {
  return (
    <Image
      src={logoCompleto}
      alt="Hospital Universitario"
      h={60}      // Ajustá este valor hasta que quede como te gusta
      w="auto"
      fit="contain"
      {...props}
    />
  );
}
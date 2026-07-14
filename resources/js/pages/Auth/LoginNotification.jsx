import { Alert } from "@mantine/core";
import {
  IconInfoCircle,
  IconAlertTriangle,
  IconExclamationCircle,
} from "@tabler/icons-react";

export default function LoginNotification({ notify }) {
  return (
    <div style={{ marginTop: "25px" }}>
      {notify === "password-reset" && (
        <Alert radius="md" title="Password was reset" icon={<IconInfoCircle />}>
          Tu contraseña ha sido restablecida. Por favor, inicia sesión con tu nueva contraseña.
        </Alert>
      )}
      {notify === "social-login-user-not-found" && (
        <Alert
          radius="md"
          title="Login failed"
          icon={<IconAlertTriangle />}
          color="orange"
        >
          No se encontró ningún usuario con la dirección de correo electrónico asociada a tu cuenta de Google. Por favor, regístrate primero antes de iniciar sesión con Google.
        </Alert>
      )}
      {notify === "social-login-failed" && (
        <Alert
          radius="md"
          title="Whoops, something went wrong"
          icon={<IconExclamationCircle />}
          color="red"
        >
          Ocurrió un error inesperado al intentar iniciar sesión con tu cuenta de Google. Por favor, inténtalo de nuevo más tarde.
        </Alert>
      )}
    </div>
  );
}

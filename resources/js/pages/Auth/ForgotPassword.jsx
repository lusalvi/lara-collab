import GuestLayout from '@/layouts/GuestLayout';
import { redirectTo } from '@/utils/route';
import { Alert, Anchor, Box, Button, Center, Group, TextInput, rem } from '@mantine/core';
import { IconArrowLeft, IconInfoCircle, IconMail } from '@tabler/icons-react';
import { useForm } from 'laravel-precognition-react-inertia';
import classes from './css/Login.module.css';

const ForgotPassword = ({ status }) => {
  const form = useForm('post', route('auth.forgotPassword.sendLink'), {
    email: '',
  });

  const submit = e => {
    e.preventDefault();
    form.clearErrors();

    form.submit({
      preserveScroll: true,
    });
  };

  return (
    <>
      {status && (
        <Alert
          mb='lg'
          radius='xl'
          color='green'
          icon={<IconInfoCircle size={18} />}
        >
          {status}
        </Alert>
      )}

      <form
        onSubmit={submit}
        className={classes.form}
        style={{ marginTop: "1.4rem" }}
      >
        <TextInput
          label='Correo electrónico'
          placeholder='usuario@hospital.edu.ar'
          required
          radius='xl'
          size='md'
          leftSection={<IconMail size={18} />}
          value={form.data.email}
          onChange={e => form.setData('email', e.target.value)}
          onBlur={() => form.validate('email')}
          error={form.errors.email}
        />

        <Button
          mt='lg'
          type='submit'
          fullWidth
          radius='xl'
          size='lg'
          loading={form.processing}
        >
          Enviar enlace de recuperación
        </Button>

        <Group
          justify='center'
          mt='md'
        >
          <Anchor
            component='button'
            type='button'
            c='dimmed'
            onClick={() => redirectTo('auth.login.form')}
          >
            <Center inline>
              <IconArrowLeft
                style={{
                  width: rem(14),
                  height: rem(14),
                }}
              />

              <Box ml={6}>Volver al inicio de sesión</Box>
            </Center>
          </Anchor>
        </Group>
      </form>
    </>
  );
};

ForgotPassword.layout = page => (
  <GuestLayout
    title='Recuperar contraseña'
    heading='¿Olvidaste tu contraseña?'
    subtitle='Ingresá tu correo registrado y te enviaremos un enlace.'
    sideTitle='Recuperá el acceso'
    sideDescription='Te ayudaremos a recuperar tu cuenta de forma segura mediante un enlace enviado a tu correo registrado.'
  >
    {page}
  </GuestLayout>
);

export default ForgotPassword;

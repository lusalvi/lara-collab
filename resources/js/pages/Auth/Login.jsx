import GuestLayout from '@/layouts/GuestLayout';
import { router } from '@inertiajs/react';
import { Anchor, Button, Checkbox, Group, PasswordInput, TextInput } from '@mantine/core';
import { useForm } from 'laravel-precognition-react-inertia';
import { useEffect, useRef } from 'react';
import LoginNotification from './LoginNotification';
import classes from './css/Login.module.css';
import { IconMail, IconLock } from '@tabler/icons-react';

const Login = ({ notify }) => {
  const passwordRef = useRef(null);

  const form = useForm('post', route('auth.login.attempt'), {
    email: route().params?.email || '',
    password: '',
    remember: false,
  });

  useEffect(() => {
    if (route().params?.email) {
      passwordRef.current?.focus();
    }
  }, []);

  const submit = e => {
    e.preventDefault();

    form.submit({
      preserveScroll: true,
    });
  };

  return (
    <form
      onSubmit={submit}
      className={classes.form}
    >
      <LoginNotification notify={notify} />

      <TextInput
        label='Correo electrónico'
        placeholder='usuario@hospital.edu.ar'
        size='md'
        radius='xl'
        required
        value={form.data.email}
        leftSection={<IconMail size={18} />}
        onChange={e => form.setData('email', e.target.value)}
        onBlur={() => form.validate('email')}
        error={form.errors.email}
      />

      <PasswordInput
        ref={passwordRef}
        mt='lg'
        label='Contraseña'
        placeholder='Ingresá tu contraseña'
        size='md'
        radius='xl'
        required
        value={form.data.password}
        leftSection={<IconLock size={18} />}
        onChange={e => form.setData('password', e.target.value)}
      />

      <Group
        justify='space-between'
        mt='md'
      >
        <Checkbox
          label='Recordarme'
          checked={form.data.remember}
          onChange={event => form.setData('remember', event.currentTarget.checked)}
        />

        <Anchor
          component='button'
          type='button'
          size='sm'
          c='hospitalSecondary.6'
          fw={600}
          onClick={() => router.get(route('auth.forgotPassword.form'))}
        >
          ¿Olvidaste tu contraseña?
        </Anchor>
      </Group>

      <Button
        type='submit'
        fullWidth
        mt='xl'
        size='lg'
        radius='xl'
        loading={form.processing}
      >
        Iniciar sesión
      </Button>
    </form>
  );
};

Login.layout = page => (
  <GuestLayout
    title='Iniciar sesión'
    heading='Iniciar sesión'
    subtitle='Ingresá con tu correo registrado.'
    sideTitle={
      <>
        ¡Bienvenido
        <br />
        de vuelta!
      </>
    }
    sideDescription='Accedé de forma segura al sistema utilizando tus credenciales registradas.'
  >
    {page}
  </GuestLayout>
);
export default Login;

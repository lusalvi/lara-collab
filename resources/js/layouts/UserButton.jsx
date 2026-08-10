import { redirectTo } from '@/utils/route';
import { getInitials } from '@/utils/user';
import { router, usePage } from '@inertiajs/react';
import {
  Avatar,
  Box,
  Collapse,
  Group,
  Text,
  UnstyledButton,
  darken,
  rem,
  useComputedColorScheme,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import { upperFirst, useDisclosure } from '@mantine/hooks';
import AppIcon from '@/components/AppIcon';
import classes from './css/UserButton.module.css';

export default function UserButton() {
  const { user } = usePage().props.auth;
  const { setColorScheme } = useMantineColorScheme({ keepTransition: true });
  const computedColorScheme = useComputedColorScheme();
  const { colors } = useMantineTheme();
  const [opened, { toggle }] = useDisclosure(false);

  const logout = () => {
    router.delete(route('logout'), {
      onSuccess: redirectTo('auth.login.form'),
    });
  };

  const handleMenuItemClick = (callback) => {
    callback();
    toggle();
  };

  return (
    <>
      <UnstyledButton
        className={classes.user}
        onClick={toggle}
        style={{
          width: '100%',
        }}
      >
        <Group>
          <Avatar
            src={user.avatar}
            radius='xl'
            color={computedColorScheme === 'light' ? 'white' : 'blue'}
            alt={user.name}
          >
            {getInitials(user.name)}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text
              size='sm'
              fw={500}
            >
              {user.name}
            </Text>

            <Text
              c={computedColorScheme === 'light' ? 'blue.4' : 'dimmed'}
              size='xs'
            >
              {user.job_title}
            </Text>
          </div>
          <AppIcon
            name='chevron_right'
            size={18}
            style={{
              transform: opened ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform .2s ease',
            }}
          />
        </Group>
      </UnstyledButton>

      <Collapse in={opened}>
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            marginTop: '8px',
          }}
        >
          <UnstyledButton
            className={classes.menuItem}
            onClick={() =>
              handleMenuItemClick(() => redirectTo('account.profile.edit'))
            }
          >
            <Group gap='sm'>
              <AppIcon
                name='person'
                size={18}
              />
              <Text size='sm'>Mi Perfil</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={classes.menuItem}
            onClick={() =>
              handleMenuItemClick(() => redirectTo('notifications'))
            }
          >
            <Group gap='sm'>
              <AppIcon
                name='notifications'
                size={18}
              />
              <Text size='sm'>Notificaciones</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={classes.menuItem}
            onClick={() =>
              handleMenuItemClick(() =>
                setColorScheme(
                  computedColorScheme === 'light' ? 'dark' : 'light'
                )
              )
            }
          >
            <Group gap='sm'>
              {computedColorScheme === 'light' ? (
                <AppIcon
                  name='light_mode'
                  size={18}
                />
              ) : (
                <AppIcon
                  name='dark_mode'
                  size={18}
                />
              )}
              <Text size='sm'>
                {computedColorScheme === 'light'
                  ? 'Modo claro'
                  : 'Modo oscuro'}
              </Text>
            </Group>
          </UnstyledButton>

          <Box
            style={{
              height: '1px',
              backgroundColor: 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))',
              margin: '4px 0',
            }}
          />

          <UnstyledButton
            className={`${classes.menuItem} ${classes.logout}`}
            onClick={() => handleMenuItemClick(logout)}
          >
            <Group gap='sm'>
              <AppIcon
                name='logout'
                size={18}
              />
              <Text size='sm'>Cerrar Sesión</Text>
            </Group>
          </UnstyledButton>
        </Box>
      </Collapse>
    </>
  );
}
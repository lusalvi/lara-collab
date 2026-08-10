import FlashNotification from '@/components/FlashNotification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import useAuthorization from '@/hooks/useAuthorization';
import useWebSockets from '@/hooks/useWebSockets';
import NavBarNested from '@/layouts/NavBarNested';
import Notifications from '@/layouts/Notifications';
import { Head, usePage } from '@inertiajs/react';

import { AppShell, Burger } from '@mantine/core';

import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useEffect } from 'react';

export default function MainLayout({ children, title }) {
  window.can = useAuthorization().can;

  const mobile = useMediaQuery('(max-width: 768px)');
  const [opened, { toggle, close }] = useDisclosure(false);

  const { initUserWebSocket } = useWebSockets();
  const { notifications } = usePage().props.auth;
  const { setNotifications } = useNotificationsStore();

  useEffect(() => {
    setNotifications(notifications);

    const stopListening = initUserWebSocket();

    return () => stopListening?.();
  }, []);

  return (
    <>
      <Head title={title} />

      <FlashNotification />
      {(!mobile || !opened) && <Notifications />}

      <AppShell
        header={
          mobile
            ? {
                height: 60,
                collapsed: opened,
              }
            : undefined
        }
        navbar={{
          width: 280,
          breakpoint: 'md',
          collapsed: {
            mobile: !opened,
          },
        }}
        padding={{
          base: 'sm',
          md: 'md',
        }}
      >
        {mobile && (
          <AppShell.Header
            px='sm'
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',

              background: 'transparent',
              borderBottom: 'none',
              boxShadow: 'none',
            }}
          >
            <Burger
              opened={opened}
              onClick={toggle}
              size='sm'
            />
          </AppShell.Header>
        )}

        <AppShell.Navbar p={0}>
          <NavBarNested
            closeDrawer={close}
            mobile={mobile}
          />
        </AppShell.Navbar>

        <AppShell.Main
          style={{
            minHeight: '100vh',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            overflowX: 'hidden',
            background: 'var(--mantine-color-body)',
          }}
        >
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}

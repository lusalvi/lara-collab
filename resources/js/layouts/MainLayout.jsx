import FlashNotification from '@/components/FlashNotification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import useAuthorization from '@/hooks/useAuthorization';
import useWebSockets from '@/hooks/useWebSockets';
import NavBarNested from '@/layouts/NavBarNested';
import Notifications from '@/layouts/Notifications';
import { Head, usePage } from '@inertiajs/react';

import {
  AppShell,
  Burger,
} from '@mantine/core';

import { useDisclosure } from '@mantine/hooks';
import { useEffect } from 'react';

export default function MainLayout({ children, title }) {
  window.can = useAuthorization().can;

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
      <Notifications />

      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 280,
          breakpoint: 'md',
          collapsed: {
            mobile: !opened,
          },
        }}
        padding="md"
      >
        <AppShell.Header
          px="md"
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
          />
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <NavBarNested closeDrawer={close} />
        </AppShell.Navbar>

        <AppShell.Main
          style={{
            minHeight: '100vh',
            background: 'var(--mantine-color-body)',
          }}
        >
          {children}
        </AppShell.Main>
      </AppShell>
    </>
  );
}
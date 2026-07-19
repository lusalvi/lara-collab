import FlashNotification from '@/components/FlashNotification';
import useNotificationsStore from '@/hooks/store/useNotificationsStore';
import useAuthorization from '@/hooks/useAuthorization';
import useWebSockets from '@/hooks/useWebSockets';
import NavBarNested from '@/layouts/NavBarNested';
import Notifications from '@/layouts/Notifications';
import { Head, usePage } from '@inertiajs/react';
import { AppShell } from '@mantine/core';
import { useEffect } from 'react';

export default function MainLayout({ children, title }) {
  window.can = useAuthorization().can;

  const { initUserWebSocket } = useWebSockets();
  const { notifications } = usePage().props.auth;
  const { setNotifications } = useNotificationsStore();

  useEffect(() => {
    setNotifications(notifications);

    const stopListening = initUserWebSocket();

    return () => {
      stopListening?.();
    };
  }, []);

  return (
    <AppShell
      navbar={{ width: 280, breakpoint: 'sm', collapsed: { mobile: false } }}
      padding='4rem'
    >
      <Head title={title} />
      <FlashNotification />
      <Notifications />
      <AppShell.Navbar>
        <NavBarNested></NavBarNested>
      </AppShell.Navbar>
      <AppShell.Main
        style={{
          backgroundColor: 'var(--mantine-color-body)',
          minHeight: '100vh',
        }}
      >
        {children}
      </AppShell.Main>{' '}
    </AppShell>
  );
}
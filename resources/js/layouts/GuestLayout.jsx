import FlashNotification from '@/components/FlashNotification';
import { Head } from '@inertiajs/react';
import { Box, Paper, Stack, Text, Title } from '@mantine/core';

export default function GuestLayout({
  title,
  heading,
  subtitle,
  sideTitle,
  sideDescription,
  children,
}) {
  return (
    <>
      <Head title={title} />
      <FlashNotification />

      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: 'light-dark(#EEF3F8, var(--mantine-color-dark-8))',
        }}
      >
        {/* ======================================
                    PANEL IZQUIERDO
                ======================================= */}

        <Box
          visibleFrom='md'
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '5rem',
            background: 'light-dark(linear-gradient(135deg,#003764 0%,#0E4B7A 100%), linear-gradient(135deg,#001F3A 0%,#002D55 100%))',
          }}
        >
          {/* decoración */}

          <Box
            style={{
              position: 'absolute',
              width: 430,
              height: 430,
              borderRadius: '50%',
              background: 'rgba(255,255,255,.04)',
              top: -180,
              left: -180,
            }}
          />

          <Box
            style={{
              position: 'absolute',
              width: 300,
              height: 300,
              borderRadius: '50%',
              background: 'rgba(199,163,110,.08)',
              right: -100,
              bottom: -100,
            }}
          />

          <Stack
            gap='xl'
            maw={470}
            style={{
              zIndex: 2,
            }}
          >
            <Title
              order={1}
              style={{
                color: '#FFF',
                fontSize: 'clamp(2rem,3vw,3.2rem)',
                lineHeight: 1.1,
                fontWeight: 800,
                fontFamily: 'Montserrat',
              }}
            >
              {sideTitle}
            </Title>

            <Text
              style={{
                color: 'rgba(255,255,255,.75)',
                fontSize: '1rem',
                lineHeight: 1.8,
                maxWidth: 420,
              }}
            >
              {sideDescription}
            </Text>

          </Stack>
        </Box>

        {/* ======================================
                    PANEL DERECHO
                ======================================= */}

        <Box
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // En mobile ocupa todo el ancho; en desktop comparte con el panel izquierdo
            minWidth: 0,
            padding: 'var(--guest-panel-padding, 2rem)',
          }}
          // Padding responsive: 1rem en mobile, 2rem en desktop
          mod={{ 'data-guest-panel': true }}
        >
          <Paper
            radius={{ base: 20, sm: 34 }}
            shadow='xl'
            p={{ base: 'xl', sm: 32, md: 45 }}
            style={{
              width: '100%',
              maxWidth: 500,
              background: 'light-dark(#FFF, var(--mantine-color-dark-6))',
            }}
          >
            {(heading || subtitle) && (
              <Stack gap={6}>
                {heading && (
                  <Title
                    order={2}
                    style={{
                      color: 'light-dark(#003764, var(--mantine-color-hospitalPrimary-3))',
                      fontWeight: 800,
                      fontFamily: 'Montserrat',
                      fontSize: 'clamp(1.4rem, 4vw, 1.875rem)',
                    }}
                  >
                    {heading}
                  </Title>
                )}

                {subtitle && (
                  <Text size='sm' c='dimmed'>
                    {subtitle}
                  </Text>
                )}
              </Stack>
            )}

            {children}
          </Paper>
        </Box>
      </Box>
    </>
  );
}

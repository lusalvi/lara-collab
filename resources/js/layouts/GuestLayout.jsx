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
          background: '#EEF3F8',
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
            background: 'linear-gradient(135deg,#003764 0%,#0E4B7A 100%)',
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
            padding: '2rem',
          }}
        >
          <Paper
            radius={34}
            shadow='xl'
            p={45}
            style={{
              width: '100%',
              maxWidth: 500,
              background: '#FFF',
            }}
          >
            {(heading || subtitle) && (
              <Stack
                gap={6}
              >
                {heading && (
                  <Title
                    order={2}
                    style={{
                      color: '#003764',
                      fontWeight: 800,
                      fontFamily: 'Montserrat',
                    }}
                  >
                    {heading}
                  </Title>
                )}

                {subtitle && (
                  <Text
                    size='sm'
                    c='dimmed'
                  >
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

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';
import 'nprogress/nprogress.css';
import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const theme = createTheme({
  primaryColor: 'hospitalPrimary',
  primaryShade: { light: 6, dark: 6 },
  fontFamily: 'Montserrat, sans-serif',
  headings: { fontFamily: 'Montserrat, sans-serif', fontWeight: '600' },
  defaultRadius: 'md',
  colors: {
    hospitalPrimary: [
      '#d9e1e8',
      '#adbfcd',
      '#859fb5',
      '#5c7f9c',
      '#335f83',
      '#0f436d',
      '#003764',
      '#003058',
      '#002a4c',
      '#002340',
    ],
    hospitalSecondary: [
      '#f7f1e9',
      '#ede2d1',
      '#e4d3b9',
      '#dbc4a2',
      '#d2b58b',
      '#caa977',
      '#c7a36e',
      '#af8f61',
      '#977c54',
      '#7f6846',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
    hospitalGray: [
      '#f4f4f4',
      '#e0e0e1',
      '#c7c7c8',
      '#adadaf',
      '#949496',
      '#7b7b7d',
      '#59595b',
      '#4d4d4f',
      '#414143',
      '#353537',
    ],
  },
});

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
  title: title => `${title} - ${appName}`,
  resolve: name =>
    resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(
      <MantineProvider
        theme={theme}
        defaultColorScheme='auto'
      >
        <Notifications />
        <ModalsProvider>
          <App {...props} />
        </ModalsProvider>
      </MantineProvider>
    );
  },
  progress: false,
});

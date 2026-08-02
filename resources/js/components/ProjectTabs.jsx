import usePreferences from '@/hooks/usePreferences';
import { redirectTo } from '@/utils/route';
import { router, usePage } from '@inertiajs/react';
import { Tabs } from '@mantine/core';
import {
  IconArchive,
  IconCalendar,
  IconChartBar,
  IconLayoutKanban,
  IconList,
  IconNote,
} from '@tabler/icons-react';
import classes from './css/ProjectTabs.module.css';

/**
 * ProjectTabs – sistema de pestañas estilo Jira para las vistas de un proyecto.
 *
 * Pestañas:
 *   list      → Lista (ListView)          projects.tasks  + tasksView=list
 *   kanban    → Tablero (BoardView)       projects.tasks  + tasksView=kanban
 *   calendar  → Calendario               projects.calendar
 *   timeline  → Cronograma               projects.timeline
 *   notes     → Notas                    projects.notes
 *   archived  → Archivados               projects.tasks?archived=1
 *
 * Lista y Tablero comparten la misma ruta (projects.tasks); la distinción
 * se maneja con el valor `tasksView` guardado en localStorage.
 */
export default function ProjectTabs() {
  const { project } = usePage().props;
  const { tasksView, setTasksView } = usePreferences();

  // --- Detectar pestaña activa -------------------------------------------
  const isArchived = !!route().params.archived;
  const currentRoute = route().current();
  const isTasksRoute =
    currentRoute === 'projects.tasks' || currentRoute === 'projects.tasks.open';

  let activeTab;
  if (isArchived) {
    activeTab = 'archived';
  } else if (isTasksRoute) {
    // Lista o Tablero según la preferencia guardada
    activeTab = tasksView === 'kanban' ? 'kanban' : 'list';
  } else if (currentRoute === 'projects.calendar') {
    activeTab = 'calendar';
  } else if (currentRoute === 'projects.timeline') {
    activeTab = 'timeline';
  } else if (currentRoute?.startsWith('projects.notes')) {
    activeTab = 'notes';
  } else {
    activeTab = 'list';
  }

  // --- Navegación --------------------------------------------------------
  const handleChange = (value) => {
    if (value === activeTab) return;

    switch (value) {
      case 'list':
        // Si ya estamos en projects.tasks solo cambiamos la vista local
        if (isTasksRoute && !isArchived) {
          setTasksView('list');
        } else {
          setTasksView('list');
          redirectTo('projects.tasks', project.id);
        }
        break;

      case 'kanban':
        if (isTasksRoute && !isArchived) {
          setTasksView('kanban');
        } else {
          setTasksView('kanban');
          redirectTo('projects.tasks', project.id);
        }
        break;

      case 'calendar':
        redirectTo('projects.calendar', project.id);
        break;

      case 'timeline':
        redirectTo('projects.timeline', project.id);
        break;

      case 'notes':
        redirectTo('projects.notes', project.id);
        break;

      case 'archived':
        router.get(route('projects.tasks', project.id), { archived: 1 });
        break;
    }
  };

  return (
    <Tabs
      value={activeTab}
      onChange={handleChange}
      classNames={{ root: classes.root, list: classes.list, tab: classes.tab }}
    >
      <Tabs.List>
        <Tabs.Tab
          value='list'
          leftSection={<IconList size={15} stroke={1.8} />}
        >
          Lista
        </Tabs.Tab>

        <Tabs.Tab
          value='kanban'
          leftSection={<IconLayoutKanban size={15} stroke={1.8} />}
        >
          Tablero
        </Tabs.Tab>

        <Tabs.Tab
          value='calendar'
          leftSection={<IconCalendar size={15} stroke={1.8} />}
        >
          Calendario
        </Tabs.Tab>

        <Tabs.Tab
          value='timeline'
          leftSection={<IconChartBar size={15} stroke={1.8} />}
        >
          Cronograma
        </Tabs.Tab>

        {can('view notes') && (
          <Tabs.Tab
            value='notes'
            leftSection={<IconNote size={15} stroke={1.8} />}
          >
            Notas
          </Tabs.Tab>
        )}

        <Tabs.Tab
          value='archived'
          leftSection={<IconArchive size={15} stroke={1.8} />}
          color='red'
        >
          Archivados
        </Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}

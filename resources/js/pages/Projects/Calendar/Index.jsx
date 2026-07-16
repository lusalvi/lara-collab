import Layout from '@/layouts/MainLayout';
import { router, usePage } from '@inertiajs/react';
import { Button, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './css/calendar.css';

let currentProject = null;

const CalendarIndex = () => {
  const { project, tasks } = usePage().props;

  currentProject = project;

  const events = tasks.map(task => ({
    id: task.id.toString(),
    title: task.name,
    date: task.due_on.split('T')[0],
    allDay: true,
  }));

  return (
    <>
      <div>
        <Button
          variant='transparent'
          radius='xl'
          size='sm'
          color='gray'
          pl={0}
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => router.get(route('projects.tasks', project.id))}
        >
          Back to tasks
        </Button>

        <Title
          order={1}
          mt={4}
          mb='xl'
        >
          {project.name}{' '}
        </Title>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={esLocale}
        initialView='dayGridMonth'
        events={events}
        height='auto'
        datesSet={() => {
          const title = document.querySelector('.fc-toolbar-title');

          if (title) {
            title.textContent =
              title.textContent.charAt(0).toUpperCase() + title.textContent.slice(1);
          }
        }}
        eventClick={info => {
          router.get(
            route('projects.tasks.open', {
              project: project.id,
              task: Number(info.event.id),
            })
          );
        }}
      />
    </>
  );
};

CalendarIndex.layout = page => <Layout title={currentProject?.name}>{page}</Layout>;

export default CalendarIndex;

import ProjectTabs from '@/components/ProjectTabs';
import Layout from '@/layouts/MainLayout';
import { router, usePage } from '@inertiajs/react';
import { Title } from '@mantine/core';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import './css/calendar.css';

let currentProject = null;

const CalendarIndex = () => {
  const { project, tasks } = usePage().props;

  currentProject = project;

  const events = tasks.map((task) => ({
    id: task.id.toString(),
    title: task.name,
    date: task.due_on.split('T')[0],
    allDay: true,
  }));

  return (
    <>
      <Title
        order={1}
        mb='md'
        mt="md"
      >
        {project.name}
      </Title>

      <ProjectTabs />

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        locale={esLocale}
        initialView='dayGridMonth'
        events={events}
        height='auto'
        eventClick={(info) => {
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

CalendarIndex.layout = (page) => <Layout title={currentProject?.name}>{page}</Layout>;

export default CalendarIndex;

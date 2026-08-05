import EmptyWithIcon from "@/components/EmptyWithIcon";
import Layout from "@/layouts/MainLayout";
import { dateTime, diffForHumans } from "@/utils/datetime";
import { redirectTo, reloadWithQuery, reloadWithoutQueryParams } from "@/utils/route";
import { usePage } from "@inertiajs/react";
import { Anchor, Breadcrumbs, Center, Select, Text, Timeline, Title, Tooltip } from "@mantine/core";
import {
  IconActivity,
  IconArchive,
  IconCalendarMonth,
  IconCheck,
  IconClock,
  IconEdit,
  IconMessage,
  IconPaperclip,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

const ActivityIndex = () => {
  let { groupedActivities, dropdowns } = usePage().props;

  const [selectedProject, setSelectedProject] = useState(route().params?.project || "0");

  useEffect(() => {
    if (selectedProject > 0) {
      reloadWithQuery({ project: selectedProject });
    } else {
      reloadWithoutQueryParams({ exclude: ["project"] });
    }
  }, [selectedProject]);

  const getIcon = (title) => {
    if (title.includes("archivad") || title.includes("archived")) {
      return <IconArchive size={18} />;
    }
    if (title.includes("comentario") || title.includes("comment")) {
      return <IconMessage size={18} />;
    }
    if (title.includes("cambiado") || title.includes("cambiada") || title.includes("changed")  || title.includes("actualizad")) {
      return <IconEdit size={18} />;
    }
    if (title.includes("Fecha de vencimiento") || title.includes("Due date")) {
      return <IconCalendarMonth size={18} />;
    }
    if (title.includes("Adjunto") || title.includes("Attachment")) {
      return <IconPaperclip size={18} />;
    }
    if (title.includes("Estimación") || title.includes("Estimation was set")) {
      return <IconClock size={18} />;
    }
    if (title.includes("completada") || title.includes("was completed")) {
      return <IconCheck size={18} />;
    }
    if (title.includes("incompleta") || title.includes("uncompleted")) {
      return <IconX size={18} />;
    }
    if (
      title === "Nueva actividad" ||
      title === "New task" ||
      title === "Nuevo proyecto" ||
      title === "New project" ||
      title === "Nuevo proyecto creado" ||
      title.includes("Usuario asignado") ||
      title.includes("Assigned user")
    ) {
      return <IconPlus size={18} />;
    }
  };

  return (
    <>
      <Breadcrumbs fz={14} mb={30}>
        <div>Mi Trabajo </div>
        <div>Actividades de los proyectos</div>
      </Breadcrumbs>

      <Title order={1} mb={20}>
        Actividades de los proyectos
      </Title>

      <Select
        size="md"
        placeholder="Seleccionar proyecto"
        allowDeselect={false}
        value={selectedProject}
        onChange={(value) => setSelectedProject(value)}
        data={dropdowns.projects}
        mb={35}
        maw={260}
      />

      {Object.keys(groupedActivities).length ? (
        Object.keys(groupedActivities).map((date) => (
          <div key={date}>
            <Title order={3} mb="lg">
              {date}
            </Title>
            <Timeline active={9999} bulletSize={32} lineWidth={3} mb="xl">
              {groupedActivities[date].map((activity) => (
                <Timeline.Item key={activity.id} bullet={getIcon(activity.title)}>
                  <div>
                    <Anchor
                      href="#"
                      fz="md"
                      fw={600}
                      onClick={() =>
                        redirectTo("projects.tasks.open", [
                          activity.project.id,
                          activity.activity_capable.id,
                        ])
                      }
                    >
                      {activity.title}
                    </Anchor>
                    <Text c="dimmed" size="sm">
                      {activity.subtitle}
                    </Text>
                    <Anchor
                      href="#"
                      fz="xs"
                      onClick={() => redirectTo("projects.tasks", [activity.project_id])}
                    >
                      {activity.project.name}
                    </Anchor>
                  </div>
                  <Tooltip label={dateTime(activity.created_at)} openDelay={1000} withArrow>
                    <Text inline span size="xs" mt={4}>
                      {diffForHumans(activity.created_at)}
                    </Text>
                  </Tooltip>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        ))
      ) : (
        <Center mih={300}>
          <EmptyWithIcon
            title="No se encontraron actividades"
            subtitle="o proyectos a los que tengas acceso"
            icon={IconActivity}
          />
        </Center>
      )}
    </>
  );
};

ActivityIndex.layout = (page) => <Layout title="Actividades">{page}</Layout>;

export default ActivityIndex;

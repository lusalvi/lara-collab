import EmptyWithIcon from "@/components/EmptyWithIcon";
import Layout from "@/layouts/MainLayout";
import useTaskFiltersStore from "@/hooks/store/useTaskFiltersStore";
import { usePage } from "@inertiajs/react";
import { Accordion, Box, Breadcrumbs, Button, Center, Group, Stack, Text, Title, rem } from "@mantine/core";
import { IconRocket, IconStar, IconStarFilled } from "@tabler/icons-react";
import Task from "./Task";
import classes from "./css/Index.module.css";

const TasksIndex = () => {
  let { projects } = usePage().props;
  const { prioritySort, sortHighToLow, sortLowToHigh, clearPrioritySort } =
    useTaskFiltersStore();

  projects = projects.filter((i) => i.tasks.length);

  let opened = projects.filter((i) => i.favorite).map((i) => i.id.toString());

  if (opened.length === 0) {
    opened = projects[0]?.id.toString() || "";
  }

  return (
    <>
      <Breadcrumbs fz={14} mb={30}>
        <div>Mi Trabajo</div>
        <div>Tareas</div>
      </Breadcrumbs>

      <Title order={1} mb={20}>
        Tareas asignadas
      </Title>

      <Group mb={16}>
        <Group gap="xs">
          <Button
            size="xs"
            variant={prioritySort === "asc" ? "filled" : "light"}
            onClick={sortHighToLow}
          >
            Prioridad: Alta → Baja
          </Button>
          <Button
            size="xs"
            variant={prioritySort === "desc" ? "filled" : "light"}
            onClick={sortLowToHigh}
          >
            Prioridad: Baja → Alta
          </Button>
          {prioritySort && (
            <Button size="xs" variant="subtle" onClick={clearPrioritySort}>
              Orden predeterminado
            </Button>
          )}
        </Group>
      </Group>

      <Box maw={1000}>
        {projects.length ? (
          <Accordion variant="separated" radius="md" multiple defaultValue={opened}>
            {projects.map((project) => (
              <Accordion.Item
                key={project.id}
                value={project.id.toString()}
                className={classes.accordionControl}
              >
                <Accordion.Control
                  icon={
                    project.favorite ? (
                      <IconStarFilled
                        style={{
                          color: "var(--mantine-color-yellow-4)",
                          width: rem(20),
                          height: rem(20),
                        }}
                      />
                    ) : (
                      <IconStar
                        style={{
                          width: rem(20),
                          height: rem(20),
                        }}
                      />
                    )
                  }
                >
                  <Text fz={20} fw={600}>
                    {project.name}
                  </Text>
                </Accordion.Control>
                <Accordion.Panel>
                  <Stack gap={8}>
                    {project.tasks.map((task) => (
                      <Task key={task.id} task={task} />
                    ))}
                  </Stack>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        ) : (
          <Center mih={300}>
            <EmptyWithIcon
              title="¡Ya estás al día!"
              subtitle="No tienes tareas pendientes asignadas. ¡Sigue así!"
              icon={IconRocket}
            />
          </Center>
        )}
      </Box>
    </>
  );
};

TasksIndex.layout = (page) => <Layout title="Tareas">{page}</Layout>;

export default TasksIndex;

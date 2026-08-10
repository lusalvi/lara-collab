import Card from "@/components/Card";
import { redirectTo } from "@/utils/route";
import { Group, RingProgress, Stack, Text, Title, rem } from "@mantine/core";
import { IconStarFilled } from "@tabler/icons-react";
import round from "lodash/round";
import classes from "./css/ProjectCard.module.css";

export function ProjectCard({ project }) {
  let completedPercent = 0;
  let overduePercent = 0;

  if (project.all_tasks_count > 0) {
    completedPercent = (project.completed_tasks_count / project.all_tasks_count) * 100;
    overduePercent = (project.overdue_tasks_count / project.all_tasks_count) * 100;
  }

  return (
    <Card
      padding="lg"
      className={classes.projectCard}
      onClick={() => redirectTo("projects.tasks", project.id)}
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        <Stack gap={4} className={classes.info}>
          <Title fz={19} lineClamp={1} className={classes.title}>
            {project.favorite && (
              <IconStarFilled
                style={{
                  color: "var(--mantine-color-hospitalSecondary-6)",
                  width: rem(15),
                  height: rem(15),
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
            )}
            {project.name}
          </Title>
          <Text fz={12} fw={700} c="dimmed" tt="uppercase" lineClamp={1}>
            {project.area ? project.area.name : '-'}
          </Text>
        </Stack>
        <RingProgress
          size={82}
          thickness={8}
          sections={[
            { value: 100 - (completedPercent + overduePercent), color: "hospitalGray.2" },
            {
              value: overduePercent,
              color: "red.5",
              tooltip: `Vencidas: ${project.overdue_tasks_count}`,
            },
            {
              value: completedPercent,
              color: "hospitalPrimary.6",
              tooltip: `Completadas: ${project.completed_tasks_count}`,
            },
          ]}
          label={
            <Text fz={14} fw={700} ta="center">
              {round(completedPercent)}%
            </Text>
          }
        />
      </Group>
    </Card>
  );
}
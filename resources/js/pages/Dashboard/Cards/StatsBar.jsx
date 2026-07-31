import Card from "@/components/Card";
import { Group, SimpleGrid, Text, ThemeIcon } from "@mantine/core";
import { IconCalendarDue, IconChevronDown, IconClipboardList, IconFolders, IconMessage } from "@tabler/icons-react";
import classes from "./css/StatsBar.module.css";

function StatCard({ icon: Icon, value, label, color, clickable, active, onClick }) {
  return (
    <Card
      padding="md"
      className={`${classes.statCard} ${active ? classes.statCardActive : ""}`}
      onClick={clickable ? onClick : undefined}
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      <Group justify="space-between" wrap="nowrap">
        <Group gap={12} wrap="nowrap" className={classes.stat}>
          <ThemeIcon size={38} radius="md" variant="light" color={color}>
            <Icon size={20} />
          </ThemeIcon>
          <div>
            <Text fz={20} fw={700} lh={1.1}>
              {value}
            </Text>
            <Text fz={12} c="dimmed">
              {label}
            </Text>
          </div>
        </Group>
        {clickable && (
          <IconChevronDown
            size={16}
            className={classes.chevron}
            style={{ transform: active ? "rotate(180deg)" : "none" }}
          />
        )}
      </Group>
    </Card>
  );
}

export default function StatsBar({
  overdueCount,
  assignedCount,
  commentsCount,
  projectsCount,
  activeSection,
  onToggleSection,
}) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md" mb="xl">
      <StatCard
        icon={IconCalendarDue}
        value={overdueCount}
        label={overdueCount === 1 ? "Tarea vencida" : "Tareas vencidas"}
        color={overdueCount > 0 ? "red" : "hospitalPrimary"}
        clickable
        active={activeSection === "overdue"}
        onClick={() => onToggleSection("overdue")}
      />
      <StatCard
        icon={IconClipboardList}
        value={assignedCount}
        label="Tareas asignadas"
        color="hospitalPrimary"
        clickable
        active={activeSection === "assigned"}
        onClick={() => onToggleSection("assigned")}
      />
      <StatCard
        icon={IconMessage}
        value={commentsCount}
        label={commentsCount === 1 ? "Comentario reciente" : "Comentarios recientes"}
        color="hospitalSecondary"
        clickable
        active={activeSection === "comments"}
        onClick={() => onToggleSection("comments")}
      />
      <StatCard
        icon={IconFolders}
        value={projectsCount}
        label={projectsCount === 1 ? "Proyecto activo" : "Proyectos activos"}
        color="hospitalGray"
      />
    </SimpleGrid>
  );
}
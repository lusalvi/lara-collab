import useTaskGroupsStore from "@/hooks/store/useTaskGroupsStore";
import useTaskFiltersStore from "@/hooks/store/useTaskFiltersStore";
import { usePage } from "@inertiajs/react";
import { Button, ColorSwatch, Stack, Text } from "@mantine/core";
import FilterButton from "./Filters/FilterButton";
import classes from "./Filters/css/FilterButton.module.css";

export default function Filters() {
  const { usersWithAccessToProject, labels } = usePage().props;

  const { groups } = useTaskGroupsStore();
  const { filters, toggleArrayFilter, toggleObjectFilter, toggleValueFilter, prioritySort, sortHighToLow, sortLowToHigh, clearPrioritySort } =
    useTaskFiltersStore();

  return (
    <>
      <Stack justify="flex-start" gap={24}>
        <div>
          <Text fz="xs" fw={700} tt="uppercase" mb="sm">
            Prioridad
          </Text>
          <Button.Group>
            <Button
              className={classes.button}
              size="xs"
              variant={prioritySort === null ? "filled" : "default"}
              radius="md"
              onClick={clearPrioritySort}
            >
              Default
            </Button>
            <Button
              className={classes.button}
              size="xs"
              variant={prioritySort === "asc" ? "filled" : "default"}
              radius="md"
              onClick={sortHighToLow}
            >
              Alta
            </Button>
            <Button
              className={classes.button}
              size="xs"
              variant={prioritySort === "desc" ? "filled" : "default"}
              radius="md"
              onClick={sortLowToHigh}
            >
              Baja
            </Button>
          </Button.Group>
        </div>

        {usersWithAccessToProject.length > 0 && (
          <div>
            <Text fz="xs" fw={700} tt="uppercase" mb="sm">
              Responsable
            </Text>
            <Stack justify="flex-start" gap={6}>
              {usersWithAccessToProject.map((item) => (
                <FilterButton
                  key={item.id}
                  selected={filters.assignees.includes(item.id)}
                  onClick={() => toggleArrayFilter("assignees", item.id)}
                >
                  {item.name}
                </FilterButton>
              ))}
            </Stack>
          </div>
        )}

        <div>
          <Text fz="xs" fw={700} tt="uppercase" mb="sm">
            Fecha de vencimiento
          </Text>
          <Stack justify="flex-start" gap={6}>
            <FilterButton
              selected={filters.due_date.not_set === 1}
              onClick={() => toggleObjectFilter("due_date", "not_set")}
            >
              Sin fecha
            </FilterButton>
            <FilterButton
              selected={filters.due_date.overdue === 1}
              onClick={() => toggleObjectFilter("due_date", "overdue")}
            >
              Vencidas
            </FilterButton>
          </Stack>
        </div>

        {labels.length > 0 && (
          <div>
            <Text fz="xs" fw={700} tt="uppercase" mb="sm">
              Etiquetas
            </Text>
            <Stack justify="flex-start" gap={6}>
              {labels.map((item) => (
                <FilterButton
                  key={item.id}
                  selected={filters.labels.includes(item.id)}
                  onClick={() => toggleArrayFilter("labels", item.id)}
                  leftSection={<ColorSwatch color={item.color} size={18} />}
                >
                  {item.name}
                </FilterButton>
              ))}
            </Stack>
          </div>
        )}

        {groups.length > 0 && (
          <div>
            <Text fz="xs" fw={700} tt="uppercase" mb="sm">
              Estado
            </Text>
            <Stack justify="flex-start" gap={6}>
              {groups.map((item) => (
                <FilterButton
                  key={item.id}
                  selected={filters.groups.includes(item.id)}
                  onClick={() => toggleArrayFilter("groups", item.id)}
                >
                  {item.name}
                </FilterButton>
              ))}
            </Stack>
          </div>
        )}
      </Stack>
    </>
  );
}

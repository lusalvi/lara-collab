import { EmptyResult } from "@/components/EmptyResult";
import BulkForceDeleteButton from "@/components/BulkForceDeleteButton";
import useBulkSelection from "@/hooks/useBulkSelection";
import { Text, Stack, Flex } from "@mantine/core";
import { usePage } from "@inertiajs/react";
import ArchivedTask from "./ArchivedTask";
import ArchivedTaskGroup from "./ArchivedTaskGroup";
import { useState } from "react";

export default function ArchivedItems({ groups, tasks }) {
  const { project } = usePage().props;
  const [collapsed, setCollapsed] = useState(new Set());
  
  const hasTasks = Object.keys(tasks).some((key) => tasks[key].length > 0);

  // Obtener todas las tareas archivadas en un array
  const allTasks = Object.entries(tasks).flatMap(([groupId, groupTasks]) => {
    const group = groups.find(g => g.id == groupId);
    return (groupTasks || []).map(task => ({
      ...task,
      status: group?.name ?? '',
    }));
  });

  // IDs de tareas que tienen hijos archivados
  const parentIds = new Set(
    allTasks.filter(task => task.parent_task_id).map(task => task.parent_task_id)
  );

  const orderedTasks = [];

  const addChildren = (parentId, depth = 1) => {
    allTasks
      .filter(task => task.parent_task_id === parentId)
      .sort((a, b) => a.number - b.number)
      .forEach(child => {
        orderedTasks.push({
          ...child,
          depth,
        });

        if (!collapsed.has(child.id)) {
          addChildren(child.id, depth + 1);
        }
      });
  };

  // Primero mostrar tareas raíz (sin padre archivado)
  allTasks
    .filter(task => !task.parent_task_id || !allTasks.some(t => t.id === task.parent_task_id))
    .sort((a, b) => a.number - b.number)
    .forEach(parent => {
      // Solo si es realmente raíz (sin padre) o si su padre no está en archivadas
      if (!parent.parent_task_id) {
        orderedTasks.push({
          ...parent,
          depth: 0,
        });

        if (!collapsed.has(parent.id)) {
          addChildren(parent.id);
        }
      } else {
        // Si el padre no está archivado, mostrar como raíz con profundidad 0
        const parentExists = allTasks.some(t => t.id === parent.parent_task_id);
        if (!parentExists) {
          orderedTasks.push({
            ...parent,
            depth: 0,
            isOrphan: true,
          });

          if (!collapsed.has(parent.id)) {
            addChildren(parent.id);
          }
        }
      }
    });

  const toggleCollapsed = taskId => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  // El borrado permanente solo aplica a tareas raíz (depth 0): forceDeleteTask
  // baja recursivamente por las subtareas, así que estas no se seleccionan por separado.
  const selectableIds = orderedTasks
    .filter(task => task.depth === 0 && task.can_force_delete)
    .map(task => task.id);
  const { selectedIds, toggle, clear } = useBulkSelection(selectableIds);

  return groups.length || hasTasks ? (
    <Stack gap="lg">
      {hasTasks && (
        <>
          <Flex justify="space-between" align="center" mb={20}>
            <Text fz={24} fw={600}>
              Tareas archivadas
            </Text>
            {selectedIds.length > 0 && (
              <BulkForceDeleteButton
                selectedIds={selectedIds}
                routeName="projects.tasks.bulk-force-delete"
                routeParams={{ project: project.id }}
                entityLabelSingular="tarea"
                entityLabelPlural="tareas"
                onSuccess={clear}
              />
            )}
          </Flex>
          <Stack gap={0}>
            {orderedTasks.map(task => (
              <ArchivedTask 
                key={`task-${task.id}`} 
                task={task}
                depth={task.depth}
                hasChildren={parentIds.has(task.id)}
                collapsed={collapsed.has(task.id)}
                onToggle={() => toggleCollapsed(task.id)}
                selectable={task.depth === 0 && task.can_force_delete}
                selected={selectedIds.includes(task.id)}
                onToggleSelect={toggle}
              />
            ))}
          </Stack>
        </>
      )}
      {groups.length > 0 && (
        <>
          <Text fz={24} fw={600} mt={35} mb={20}>
            Grupos archivados
          </Text>
          {groups.map((group) => (
            <ArchivedTaskGroup key={`group-${group.id}`} group={group} />
          ))}
        </>
      )}
    </Stack>
  ) : (
    <EmptyResult title="No hay elementos archivados" subtitle="Aquí se mostrarán las tareas y grupos que han sido archivados." />
  );
}
import { useState } from 'react';
import { PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import { canHaveChildOfType } from '@/utils/taskHierarchy';
import useTasksStore from '@/hooks/store/useTasksStore';

// dropZone del over.data.current: 'before' | 'after' | 'inside'

export default function useTaskDragAndDrop(orderedTasks, allTasks) {
  const { reparentTask } = useTasksStore();
  const [activeId, setActiveId] = useState(null);
  const [overState, setOverState] = useState(null); // { id, zone }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const activeTask = activeId ? allTasks.find(t => t.id === activeId) : null;

  const findTask = id => allTasks.find(t => t.id === id);

  const isDescendant = (candidateId, ofTaskId) => {
    let current = findTask(candidateId);

    while (current?.parent_task_id) {
      if (current.parent_task_id === ofTaskId) return true;
      current = findTask(current.parent_task_id);
    }

    return false;
  };

  const isValidDropTarget = (draggedTask, targetTask, zone) => {
    if (!draggedTask || !targetTask) return false;
    if (draggedTask.id === targetTask.id) return false;
    // No se puede soltar dentro de un descendiente propio (evita ciclos).
    if (isDescendant(targetTask.id, draggedTask.id)) return false;

    if (zone === 'inside') {
      return canHaveChildOfType(targetTask.issue_type, draggedTask.issue_type);
    }

    // 'before' / 'after' -> pasa a ser hermano del target, mismo padre que el target.
    const newParentId = targetTask.parent_task_id || null;

    if (!newParentId) {
      // Va a nivel raíz: siempre válido (cualquier tipo puede ser raíz).
      return true;
    }

    const newParent = findTask(newParentId);
    if (!newParent) return false;

    return canHaveChildOfType(newParent.issue_type, draggedTask.issue_type);
  };

  const handleDragStart = event => {
    setActiveId(event.active.id);
  };

  const handleDragOver = event => {
    const { over } = event;

    if (!over) {
      setOverState(null);
      return;
    }

    setOverState({ id: over.id, zone: over.data.current?.zone });
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverState(null);
  };

  const handleDragEnd = event => {
    const { active, over } = event;

    setActiveId(null);
    setOverState(null);

    if (!over) return;

    const draggedTask = findTask(active.id);
    const targetTaskId = over.data.current?.taskId;
    const targetTask = findTask(targetTaskId);
    const zone = over.data.current?.zone;

    if (!isValidDropTarget(draggedTask, targetTask, zone)) return;

    let newParentId;

    if (zone === 'inside') {
      newParentId = targetTask.id;
    } else {
      newParentId = targetTask.parent_task_id || null;
    }

    // Hermanos finales (mismo group_id + mismo parent_task_id que el target),
    // reordenados con la tarea arrastrada en la posición correcta.
    const siblings = allTasks
      .filter(
        t =>
          t.id !== draggedTask.id &&
          t.group_id === targetTask.group_id &&
          (t.parent_task_id || null) === newParentId
      )
      .sort((a, b) => a.number - b.number);

    let insertAt = siblings.length;

    if (zone === 'before') {
      insertAt = siblings.findIndex(t => t.id === targetTask.id);
    } else if (zone === 'after') {
      insertAt = siblings.findIndex(t => t.id === targetTask.id) + 1;
    }

    const reordered = [...siblings];
    reordered.splice(insertAt === -1 ? reordered.length : insertAt, 0, draggedTask);

    reparentTask({
      taskId: draggedTask.id,
      newParentId,
      groupId: draggedTask.group_id,
      ids: reordered.map(t => t.id),
    });
  };

  return {
    sensors,
    activeTask,
    overState,
    isValidDropTarget,
    handleDragStart,
    handleDragOver,
    handleDragCancel,
    handleDragEnd,
  };
}
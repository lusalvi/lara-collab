import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';

import HeaderRow from './List/HeaderRow';
import TaskRow from './List/TaskRow';
import IssueTypeIcon from '@/components/IssueTypeIcon';
import { Text } from '@mantine/core';
import useTaskDragAndDrop from './List/hooks/useTaskDragAndDrop';
import useColumnResize from './List/hooks/useColumnResize';
import classes from './List/ListView.module.css';

const ListView = ({ groups, tasks, usingFilters }) => {
  const [collapsed, setCollapsed] = useState(new Set());
  const { widths, setWidth } = useColumnResize();

  const allTasks = Object.entries(tasks).flatMap(([groupId, groupTasks]) => {
    const group = groups.find(g => g.id == groupId);

    return (groupTasks || []).map(task => ({
      ...task,
      status: group?.name ?? '',
    }));
  });

  // IDs de tareas que tienen hijos
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

  allTasks
    .filter(task => !task.parent_task_id)
    .sort((a, b) => a.number - b.number)
    .forEach(parent => {
      orderedTasks.push({
        ...parent,
        depth: 0,
      });

      if (!collapsed.has(parent.id)) {
        addChildren(parent.id);
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

  const dnd = useTaskDragAndDrop(orderedTasks, allTasks);

  const columnStyleVars = {
    '--col-key-width': `${widths.key}px`,
    '--col-summary-width': `${widths.summary}px`,
    '--col-assignee-width': `${widths.assignee}px`,
    '--col-priority-width': `${widths.priority}px`,
    '--col-status-width': `${widths.status}px`,
    '--col-due-width': `${widths.due}px`,
  };

  return (
    <DndContext
      sensors={dnd.sensors}
      onDragStart={dnd.handleDragStart}
      onDragOver={dnd.handleDragOver}
      onDragEnd={dnd.handleDragEnd}
      onDragCancel={dnd.handleDragCancel}
    >
      <div
        className={classes.container}
        style={columnStyleVars}
      >
        <HeaderRow
          widths={widths}
          setWidth={setWidth}
        />
        {orderedTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            depth={task.depth}
            hasChildren={parentIds.has(task.id)}
            collapsed={collapsed.has(task.id)}
            onToggle={() => toggleCollapsed(task.id)}
            dragState={dnd}
          />
        ))}
      </div>

      <DragOverlay>
        {dnd.activeTask ? (
          <div className={classes.dragOverlay}>
            <IssueTypeIcon type={dnd.activeTask.issue_type} />
            <Text lineClamp={1}>{dnd.activeTask.name}</Text>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default ListView;
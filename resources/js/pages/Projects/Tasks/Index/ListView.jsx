import { useState } from 'react';
import { DndContext, DragOverlay } from '@dnd-kit/core';

import HeaderRow from './List/HeaderRow';
import TaskRow from './List/TaskRow';
import IssueTypeIcon from '@/components/IssueTypeIcon';
import { Text } from '@mantine/core';
import useTaskDragAndDrop from './List/hooks/useTaskDragAndDrop';
import useColumnResize from './List/hooks/useColumnResize';
import classes from './List/ListView.module.css';
import { usePage } from '@inertiajs/react';
import useTaskFiltersStore from '@/hooks/store/useTaskFiltersStore';

const ListView = ({ groups, tasks, usingFilters }) => {
  const { usersWithAccessToProject } = usePage().props;
  const [collapsed, setCollapsed] = useState(new Set());
  const { widths, setWidth } = useColumnResize();
  const { prioritySort } = useTaskFiltersStore();

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

  const sortTasks = (taskList) => {
    if (prioritySort) {
      return [...taskList].sort((a, b) => {
        const aOrder = a.priority?.order ?? Infinity;
        const bOrder = b.priority?.order ?? Infinity;
        return prioritySort === 'asc' ? aOrder - bOrder : bOrder - aOrder;
      });
    }
    return [...taskList].sort((a, b) => a.order_column - b.order_column);
  };

  const addChildren = (parentId, depth = 1) => {
    const children = allTasks.filter(task => task.parent_task_id === parentId);
    sortTasks(children).forEach(child => {
      orderedTasks.push({
        ...child,
        depth,
      });

      if (!collapsed.has(child.id)) {
        addChildren(child.id, depth + 1);
      }
    });
  };

  sortTasks(allTasks.filter(task => !task.parent_task_id))
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
    '--col-creator-width': `${widths.creator}px`,
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
          allTasks={allTasks}
        />
        {orderedTasks.map(task => (
          <TaskRow
            key={task.id}
            task={task}
            users={usersWithAccessToProject}
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
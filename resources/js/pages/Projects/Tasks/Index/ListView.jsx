import { useState } from 'react';

import HeaderRow from './List/HeaderRow';
import TaskRow from './List/TaskRow';
import classes from './List/ListView.module.css';

const ListView = ({ groups, tasks, usingFilters }) => {
  const [collapsed, setCollapsed] = useState(new Set());
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

  return (
    <div className={classes.container}>
      <HeaderRow />
      {orderedTasks.map(task => (
        <TaskRow
          key={task.id}
          task={task}
          hasChildren={parentIds.has(task.id)}
          collapsed={collapsed.has(task.id)}
          onToggle={() => toggleCollapsed(task.id)}
        />
      ))}
    </div>
  );
};

export default ListView;

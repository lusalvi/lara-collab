import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Button } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

import TaskGroup from './TaskGroup';
import CreateTasksGroupModal from './Modals/CreateTasksGroupModal';

import classes from '../css/Index.module.css';

const BoardView = ({ groups, tasks, usingFilters, onDragEnd, tasksView }) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable
        droppableId='groups'
        direction={tasksView === 'list' ? 'vertical' : 'horizontal'}
        type='group'
      >
        {provided => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            <div className={classes.viewport}>
              {groups
                .filter(group => !usingFilters || (usingFilters && tasks[group.id]?.length > 0))
                .map((group, index) => (
                  <TaskGroup
                    key={group.id}
                    index={index}
                    group={group}
                    tasks={tasks[group.id] || []}
                  />
                ))}
              {provided.placeholder}
              {!route().params.archived && can('create task group') && (
                <Button
                  leftSection={<IconPlus size={14} />}
                  variant='transparent'
                  size='sm'
                  mt={14}
                  m={4}
                  radius='xl'
                  onClick={CreateTasksGroupModal}
                  style={{ width: '200px' }}
                >
                  Add {tasksView === 'list' ? 'tasks group' : 'group'}
                </Button>
              )}
            </div>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default BoardView;

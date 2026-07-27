import { replaceUrlWithoutReload } from '@/utils/route';
import { produce } from 'immer';
import { create } from 'zustand';

const useTaskDrawerStore = create((set, get) => ({
  create: {
    opened: false,
    group_id: null,
    issue_type: '',
    parent_task_id: null,
  },
  edit: {
    opened: false,
    task: {},
  },
  openCreateTask: ({
    group_id = null,
    issue_type = '',
    parent_task_id = null,
  } = {}) => {
    return set(
      produce(state => {
        state.create.opened = true;
        state.create.group_id = group_id;
        state.create.issue_type = issue_type;
        state.create.parent_task_id = parent_task_id;
      })
    );
  },
  closeCreateTask: () => {
    return set(
      produce(state => {
        state.create.opened = false;
        state.create.group_id = null;
        state.create.issue_type = '';
        state.create.parent_task_id = null;
      })
    );
  },
  openEditTask: (task) => {
    replaceUrlWithoutReload(
      route("projects.tasks.open", [task.project_id, task.id])
    );

    return set(produce(state => {
      state.edit.opened = true;
      state.edit.task = task;
    }));
  },
  closeEditTask: () => {
    replaceUrlWithoutReload(route("projects.tasks", get().edit.task.project_id));

    return set(produce(state => {
      state.edit.opened = false;
    }));
  },
}));

export default useTaskDrawerStore;

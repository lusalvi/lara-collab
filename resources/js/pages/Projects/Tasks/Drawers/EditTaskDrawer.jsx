import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import useWebSockets from '@/hooks/useWebSockets';
import { date } from '@/utils/datetime';
import { usePage } from '@inertiajs/react';
import {
  Breadcrumbs,
  Checkbox,
  Drawer,
  Group,
  MultiSelect,
  Select,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Comments from './Comments';
import LabelsDropdown from './LabelsDropdown';
import PriorityDropdown from './PriorityDropdown';
import classes from './css/TaskDrawer.module.css';

export function EditTaskDrawer() {
  const editorRef = useRef(null);
  const { edit, openEditTask, closeEditTask } = useTaskDrawerStore();
  const { initTaskWebSocket } = useWebSockets();
  const { findTask, updateTaskProperty, complete, deleteAttachment, uploadAttachments } =
    useTasksStore();
  const {
    usersWithAccessToProject,
    taskGroups,
    labels,
    priorities,
    openedTask,
    auth: { user },
  } = usePage().props;
  
  useEffect(() => {
    if (openedTask) setTimeout(() => openEditTask(openedTask), 50);
  }, []);

  const task = findTask(edit.task.id);

  const [data, setData] = useState({
    group_id: '',
    assigned_to_user_id: '',
    name: '',
    description: '',
    issue_type: '',
    priority_id: '',
    due_on: '',
    subscribed_users: [],
    labels: [],
  });

  useEffect(() => {
    if (edit.opened) {
      return initTaskWebSocket(task);
    }
  }, [edit.opened]);

  useEffect(() => {
    if (edit.opened) {
      setData({
        group_id: task?.group_id || '',
        assigned_to_user_id: task?.assigned_to_user_id || '',
        name: task?.name || '',
        description: task?.description || '',
        issue_type: task?.issue_type || '',
        priority_id: task?.priority_id || '',
        start_on: task?.start_on
          ? dayjs(
              typeof task.start_on === 'string' ? task.start_on.split('T')[0] : task.start_on
            ).toDate()
          : '',
        due_on: task?.due_on
          ? dayjs(
              typeof task.due_on === 'string' ? task.due_on.split('T')[0] : task.due_on
            ).toDate()
          : '',
        subscribed_users: (task?.subscribed_users || []).map(i => i.id.toString()),
        labels: (task?.labels || []).map(i => i.id),
      });
      setTimeout(() => {
        editorRef.current?.setContent(task?.description || '');
      }, 300);
    }
  }, [edit.opened, task]);

  const updateValue = (field, value) => {
    // Convertir Date objects a string YYYY-MM-DD para fechas
    let valueToStore = value;
    if ((field === 'due_on' || field === 'start_on') && value instanceof Date) {
      valueToStore = dayjs(value).format('YYYY-MM-DD');
    }

    setData({ ...data, [field]: value });

    const dropdowns = ['labels', 'subscribed_users'];
    const onBlurInputs = ['name', 'description'];

    if (dropdowns.includes(field)) {
      const options = {
        labels: value.map(id => labels.find(i => i.id === id)),
        subscribed_users: value.map(id =>
          usersWithAccessToProject.find(i => i.id.toString() === id)
        ),
      };
      updateTaskProperty(task, field, value, options[field]);
    } else if (field === 'priority_id') {
      const priority = value ? priorities.find(p => p.id === value) : null;
      updateTaskProperty(task, field, value, priority);
    } else if (!onBlurInputs.includes(field)) {
      updateTaskProperty(task, field, valueToStore);
    }
  };

  const onBlurUpdate = property => {
    if (data.name.length > 0) {
        updateTaskProperty(task, property, data[property]);
    }
  };

  return (
    <Drawer
      opened={edit.opened}
      onClose={closeEditTask}
      title={
        <Group
          ml={25}
          my='sm'
          wrap='nowrap'
        >
          <Checkbox
            size='ms'
            radius='xl'
            color='green'
            checked={task?.completed_at !== null}
            onChange={e => complete(task, e.currentTarget.checked)}
            className={can('complete task') ? classes.checkbox : classes.disabledCheckbox}
          />
          <Text
            fz={rem(27)}
            fw={600}
            lh={1.2}
            td={task?.completed_at !== null ? 'line-through' : null}
          >
            #{task?.number}: {data.name}
          </Text>
        </Group>
      }
      position='right'
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{
        transition: 'slide-left',
        duration: 400,
        timingFunction: 'ease',
      }}
    >
      {task ? (
        <>
          <Breadcrumbs
            className={classes.taskInfo}
            c='dark.3'
            ml={24}
            mb='xs'
            separator='I'
            separatorMargin='sm'
            styles={{
              separator: {
                opacity: 0.3,
              },
            }}
          >
            <Text size='xs'>{task.project.name}</Text>

            <Text size='xs'>
              Task #{task.number}
            </Text>

            <Text size='xs'>
              Created by {task.created_by_user?.name} on {date(task.created_at)}
            </Text>
          </Breadcrumbs>

          <form className={classes.inner}>
            <div className={classes.content}>

              {/* Nombre */}
              <TextInput
                className={classes.nameField}
                label='Nombre'
                placeholder='Nombre de la actividad'
                value={data.name}
                onChange={e => updateValue('name', e.target.value)}
                onBlur={() => onBlurUpdate('name')}
                error={data.name.length === 0}
                readOnly={!can('edit task')}
              />

              {/* Descripción */}
              <RichTextEditor
                ref={editorRef}
                mt='xl'
                placeholder='Descripción de la actividad'
                content={data.description}
                height={260}
                onChange={content => updateValue('description', content)}
                onBlur={() => onBlurUpdate('description')}
                readOnly={!can('edit task')}
              />

              {/* Archivos */}
              {can('edit task') && (
                <Dropzone
                  className={classes.attachments}
                  mt='xl'
                  selected={task.attachments}
                  onChange={files => uploadAttachments(task, files)}
                  remove={index => deleteAttachment(task, index)}
                />
              )}

              {/* Comentarios */}
              {can('view comments') && <Comments task={task} />}

            </div>

            <div className={classes.sidebar}>

              {/* Estado */}
              <Select
                label='Estado'
                placeholder='Selecciona el estado'
                allowDeselect={false}
                value={data.group_id.toString()}
                onChange={value => updateValue('group_id', value)}
                data={taskGroups.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
                size='sm'
              />

              {/* Tipo */}
              <Select
                label='Tipo'
                placeholder='Selecciona el tipo de actividad'
                mt='ms'
                allowDeselect={false}
                value={data.issue_type}
                onChange={value => updateValue('issue_type', value)}
                data={[
                  { value: 'Epica', label: 'Épica' },
                  { value: 'Historia', label: 'Historia' },
                  { value: 'Tarea', label: 'Tarea' },
                  { value: 'Subtarea', label: 'Subtarea' },
                ]}
                readOnly={!can('edit task')}
                size='sm'
              />

              {/* Responsable */}
              <Select
                label='Responsable'
                placeholder='Selecciona un responsable'
                searchable
                mt='ms'
                value={data.assigned_to_user_id?.toString()}
                onChange={value => updateValue('assigned_to_user_id', value)}
                data={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
                size='sm'
              />

              {/* Fecha de inicio */}
              <DateInput
                clearable
                valueFormat='DD MMM YYYY'
                mt='ms'
                label='Fecha de inicio'
                placeholder='Selecciona la fecha de inicio'
                value={data.start_on}
                onChange={value => updateValue('start_on', value)}
                readOnly={!can('edit task')}
                size='sm'
              />

              {/* Fecha de vencimiento */}
              <DateInput
                clearable
                valueFormat='DD MMM YYYY'
                minDate={data.start_on || new Date()}
                mt='ms'
                label='Fecha de vencimiento'
                placeholder='Selecciona la fecha de vencimiento'
                value={data.due_on}
                onChange={value => updateValue('due_on', value)}
                readOnly={!can('edit task')}
                size='sm'
              />

              {/* Etiquetas */}
              <LabelsDropdown
                items={labels}
                selected={data.labels}
                onChange={values => updateValue('labels', values)}
                mt='ms'
              />

              {/* Prioridad */}
              <PriorityDropdown
                value={data.priority_id}
                onChange={value => {
                  updateValue('priority_id', value || null);
                }}
                mt='ms'
              />

              {/* Suscriptores */}
              <MultiSelect
                label='Suscriptores'
                placeholder={
                  !data.subscribed_users.length
                    ? 'Selecciona suscriptores'
                    : null
                }
                mt='lg'
                value={data.subscribed_users}
                onChange={values => updateValue('subscribed_users', values)}
                data={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
                size='sm'
              />

            </div>
          </form>
        </>
      ) : (
        <></>
      )}
    </Drawer>
  );
}
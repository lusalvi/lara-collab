import { openConfirmModal } from '@/components/ConfirmModal';
import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useForm from '@/hooks/useForm';
import { hasRoles } from '@/utils/user';
import { usePage } from '@inertiajs/react';
import {
  Button,
  Checkbox,
  Drawer,
  Flex,
  MultiSelect,
  NumberInput,
  Select,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useEffect } from 'react';
import LabelsDropdown from './LabelsDropdown';
import PriorityDropdown from './PriorityDropdown';
import classes from './css/TaskDrawer.module.css';

export function CreateTaskDrawer() {
  const { create, closeCreateTask } = useTaskDrawerStore();
  const {
    usersWithAccessToProject,
    taskGroups,
    labels,
    project,
    currency,
    auth: { user },
  } = usePage().props;

  const initial = {
    group_id: create.group_id ? create.group_id.toString() : '',
    assigned_to_user_id: '',
    name: '',
    description: '',

    issue_type: create.issue_type || '',
    parent_task_id: create.parent_task_id,

    estimation: '',
    priority_id: null,
    start_on: '',
    due_on: '',
    hidden_from_clients: false,
    subscribed_users: [user.id.toString()],
    labels: [],
    attachments: [],
  };

  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.tasks.store', [route().params.project]),
    {
      ...initial,
    }
  );

  useEffect(() => {
    console.log('SETTING VALUES');

    updateValue('group_id', create.group_id ? create.group_id.toString() : '');
    updateValue('parent_task_id', create.parent_task_id);
    updateValue('issue_type', create.issue_type || '');

    console.log('STORE', create);
  }, [create]);

  useEffect(() => {
    if (create.parent_issue_type === 'Tarea') {
      updateValue('issue_type', 'Subtarea');
    }
  }, [create.parent_issue_type]);

  const closeDrawer = (force = false) => {
    if (force || (JSON.stringify(form.data) === JSON.stringify(initial) && !form.processing)) {
      closeCreateTask();
    } else {
      openConfirmModal({
        type: 'danger',
        title: 'Discard changes?',
        content: `All unsaved changes will be lost.`,
        confirmLabel: 'Discard',
        confirmProps: { color: 'red' },
        onConfirm: () => closeCreateTask(),
      });
    }
  };

  const issueTypeOptions = {
    Epica: [
      { value: 'Historia', label: 'Historia' },
      { value: 'Tarea', label: 'Tarea' },
      { value: 'Subtarea', label: 'Subtarea' },
    ],
    Historia: [
      { value: 'Tarea', label: 'Tarea' },
      { value: 'Subtarea', label: 'Subtarea' },
    ],
    Tarea: [{ value: 'Subtarea', label: 'Subtarea' }],
  };

  const availableIssueTypes = create.parent_issue_type
    ? (issueTypeOptions[create.parent_issue_type] ?? [])
    : [
        { value: 'Epica', label: 'Épica' },
        { value: 'Historia', label: 'Historia' },
        { value: 'Tarea', label: 'Tarea' },
        { value: 'Subtarea', label: 'Subtarea' },
      ];

  const removeAttachment = index => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue('attachments', files);
  };
  console.log('CREATE', create);
  console.log('FORM', form.data);
  return (
    <Drawer
      opened={create.opened}
      onClose={closeDrawer}
      title={
        <Text
          fz={rem(28)}
          fw={600}
          ml={25}
          my='sm'
        >
          Add new task
        </Text>
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
      <form
        onSubmit={event =>
          submit(event, {
            onSuccess: () => closeDrawer(true),
            forceFormData: true,
          })
        }
        className={classes.inner}
      >
        <div className={classes.content}>
          <TextInput
            label='Name'
            placeholder='Task name'
            required
            data-autofocus
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <RichTextEditor
            mt='xl'
            placeholder='Task description'
            height={260}
            onChange={content => updateValue('description', content)}
          />

          <Dropzone
            mt='xl'
            selected={form.data.attachments}
            onChange={files => updateValue('attachments', files)}
            remove={index => removeAttachment(index)}
          />

          <MultiSelect
            label='Subscribers'
            placeholder='Select subscribers'
            searchable
            mt='md'
            value={form.data.subscribed_users}
            onChange={values => updateValue('subscribed_users', values)}
            data={usersWithAccessToProject.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.subscribed_users}
          />

          <Flex
            justify='space-between'
            mt='xl'
          >
            <Button
              variant='transparent'
              w={100}
              disabled={form.processing}
              onClick={closeDrawer}
            >
              Cancel
            </Button>

            <Button
              type='submit'
              w={120}
              loading={form.processing}
            >
              Add task
            </Button>
          </Flex>
        </div>
        <div className={classes.sidebar}>
          <Select
            label='Task group'
            placeholder='Select task group'
            required
            value={form.data.group_id}
            onChange={value => updateValue('group_id', value)}
            data={taskGroups.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.group_id}
          />

          <Select
            label='Issue type'
            placeholder='Select issue type'
            value={form.data.issue_type}
            onChange={value => updateValue('issue_type', value || '')}
            data={availableIssueTypes}
            disabled={create.parent_issue_type === 'Tarea'}
            error={form.errors.issue_type}
          />

          <Select
            label='Assignee'
            placeholder='Select assignee'
            searchable
            mt='md'
            value={form.data.assigned_to_user_id}
            onChange={value => updateValue('assigned_to_user_id', value)}
            data={usersWithAccessToProject.map(i => ({
              value: i.id.toString(),
              label: i.name,
            }))}
            error={form.errors.assigned_to_user_id}
          />

          <DateInput
            clearable
            valueFormat='DD MMM YYYY'
            mt='md'
            label='Start date'
            placeholder='Pick task start date'
            value={form.data.start_on}
            onChange={value => updateValue('start_on', value)}
          />

          <DateInput
            clearable
            valueFormat='DD MMM YYYY'
            minDate={new Date()}
            mt='md'
            label='Due date'
            placeholder='Pick task due date'
            value={form.data.due_on}
            onChange={value => updateValue('due_on', value)}
          />

          <LabelsDropdown
            items={labels}
            selected={form.data.labels}
            onChange={values => updateValue('labels', values)}
            mt='md'
          />

          <PriorityDropdown
            value={form.data.priority_id}
            onChange={value => updateValue('priority_id', value || null)}
            mt='md'
          />

          {!hasRoles(user, ['client']) && (
            <Checkbox
              label='Hidden from clients'
              mt='md'
              checked={form.data.hidden_from_clients}
              onChange={event => updateValue('hidden_from_clients', event.currentTarget.checked)}
            />
          )}
        </div>
      </form>
    </Drawer>
  );
}

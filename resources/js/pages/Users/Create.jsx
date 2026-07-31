import ActionButton from '@/components/ActionButton';
import BackButton from '@/components/BackButton';
import useForm from '@/hooks/useForm';
import useRoles from '@/hooks/useRoles';
import useAreas from '@/hooks/useAreas';
import { usePage } from '@inertiajs/react';
import ContainerBox from '@/layouts/ContainerBox';
import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { getInitials } from '@/utils/user';
import {
  Anchor,
  Avatar,
  Breadcrumbs,
  Divider,
  FileInput,
  Grid,
  Group,
  MultiSelect,
  Select,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';

const UserCreate = () => {
  const { auth } = usePage().props;
  const { getDropdownValues: getAreaDropdownValues } = useAreas();
  const { getDropdownValues } = useRoles();

  const [form, submit, updateValue] = useForm('post', route('users.store'), {
    avatar: null,
    job_title: '',
    name: '',
    phone: '',
    email: '',
    password: '',
    password_confirmation: '',
    roles: [],
    area_id: auth.user.is_super_admin ? '' : String(auth.user.area_id ?? ''), // pre-cargado si es admin de área
  });

  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
      >
        <Anchor
          href='#'
          onClick={() => redirectTo('users.index')}
          fz={14}
        >
          Users
        </Anchor>
        <div>Create</div>
      </Breadcrumbs>

      <Grid
        justify='space-between'
        align='flex-end'
        gutter='xl'
        mb='lg'
      >
        <Grid.Col span='auto'>
          <Title order={1}>Create user</Title>
        </Grid.Col>
        <Grid.Col span='content'></Grid.Col>
      </Grid>

      <ContainerBox maw={600}>
        <form onSubmit={e => submit(e, { forceFormData: true })}>
          <Grid
            justify='flex-start'
            align='flex-start'
            gutter='lg'
          >
            <Grid.Col span='content'>
              <Avatar
                src={form.data.avatar !== null ? URL.createObjectURL(form.data.avatar) : null}
                size={120}
                color='hospitalPrimary'
              >
                {getInitials(form.data.name)}
              </Avatar>
            </Grid.Col>
            <Grid.Col span='auto'>
              <FileInput
                label='Profile image'
                placeholder='Choose image'
                accept='image/png,image/jpeg'
                onChange={image => updateValue('avatar', image)}
                clearable
                error={form.errors.avatar}
              />
              <Text
                size='xs'
                c='dimmed'
                mt='sm'
              >
                If no image is uploaded we will try to fetch it via{' '}
                <Anchor
                  href='https://unavatar.io'
                  target='_blank'
                  opacity={0.6}
                >
                  unavatar.io
                </Anchor>{' '}
                service.
              </Text>
            </Grid.Col>
          </Grid>

          <TextInput
            label='Name'
            placeholder='User full name'
            required
            mt='md'
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label='Job title'
            placeholder='e.g. Frontend Developer'
            required
            mt='md'
            value={form.data.job_title}
            onChange={e => updateValue('job_title', e.target.value)}
            error={form.errors.job_title}
          />

          <MultiSelect
            label='Roles'
            placeholder='Select role'
            required
            mt='md'
            value={form.data.roles}
            onChange={values => updateValue('roles', values)}
            data={getDropdownValues()}
            error={form.errors.roles}
          />

          <Select
            label='Área'
            placeholder='Seleccionar área'
            required
            mt='md'
            value={form.data.area_id}
            onChange={value => updateValue('area_id', value)}
            data={getAreaDropdownValues()}
            disabled={!auth.user.is_super_admin}
            error={form.errors.area_id}
          />

          <TextInput
            label='Phone'
            placeholder='Users phone number'
            mt='md'
            value={form.data.phone}
            onChange={e => updateValue('phone', e.target.value)}
            error={form.errors.phone}
          />

          <Divider
            mt='xl'
            mb='md'
            label='Login credentials'
            labelPosition='center'
          />

          <TextInput
            label='Email'
            placeholder='User email'
            required
            value={form.data.email}
            onChange={e => updateValue('email', e.target.value)}
            onBlur={() => form.validate('email')}
            error={form.errors.email}
          />

          <PasswordInput
            label='Password'
            placeholder='User password'
            required
            mt='md'
            value={form.data.password}
            onChange={e => updateValue('password', e.target.value)}
            error={form.errors.password}
          />

          <PasswordInput
            label='Confirm password'
            placeholder='Confirm password'
            required
            mt='md'
            value={form.data.password_confirmation}
            onChange={e => updateValue('password_confirmation', e.target.value)}
            error={form.errors.password_confirmation}
          />

          <Group
            justify='space-between'
            mt='xl'
          >
            <BackButton route='users.index' />
            <ActionButton loading={form.processing}>Create</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

UserCreate.layout = page => <Layout title='Create user'>{page}</Layout>;

export default UserCreate;

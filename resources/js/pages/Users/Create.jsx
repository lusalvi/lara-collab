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
          Usuarios
        </Anchor>
        <div>Crear usuario</div>
      </Breadcrumbs>

      <Grid
        justify='space-between'
        align='flex-end'
        gutter='xl'
        mb='lg'
      >
        <Grid.Col span='auto'>
          <Title order={1}>Crear usuario</Title>
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
                label='Foto de perfil'
                placeholder='Elige una imagen'
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
                Si no eliges una imagen, se generará un avatar automáticamente usando {' '}
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
            label='Nombre'
            placeholder='Nombre completo del usuario'
            required
            mt='md'
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <TextInput
            label='Puesto de trabajo'
            placeholder='ej. Desarrollador, Técnico de soporte, etc.'
            required
            mt='md'
            value={form.data.job_title}
            onChange={e => updateValue('job_title', e.target.value)}
            error={form.errors.job_title}
          />

          <MultiSelect
            label='Roles'
            placeholder='Selecciona un rol'
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
            label='Teléfono'
            placeholder='Número de teléfono del usuario'
            mt='md'
            value={form.data.phone}
            onChange={e => updateValue('phone', e.target.value)}
            error={form.errors.phone}
          />

          <Divider
            mt='xl'
            mb='md'
            label='Credenciales de acceso'
            labelPosition='center'
          />

          <TextInput
            label='Email'
            placeholder='Correo electrónico del usuario'
            required
            value={form.data.email}
            onChange={e => updateValue('email', e.target.value)}
            onBlur={() => form.validate('email')}
            error={form.errors.email}
          />

          <PasswordInput
            label='Contraseña'
            placeholder='Contraseña del usuario'
            required
            mt='md'
            value={form.data.password}
            onChange={e => updateValue('password', e.target.value)}
            error={form.errors.password}
          />

          <PasswordInput
            label='Confirmar contraseña'
            placeholder='Confirma la contraseña del usuario'
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
            <ActionButton loading={form.processing}>Crear</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

UserCreate.layout = page => <Layout title='Create user'>{page}</Layout>;

export default UserCreate;

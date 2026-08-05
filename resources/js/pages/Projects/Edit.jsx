import ActionButton from '@/components/ActionButton';
import BackButton from '@/components/BackButton';
import useForm from '@/hooks/useForm';
import ContainerBox from '@/layouts/ContainerBox';
import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import {
  Anchor,
  Breadcrumbs,
  Grid,
  Group,
  MultiSelect,
  Select,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';

const ProjectEdit = ({ dropdowns: { areas, users } }) => {
  const { item, auth } = usePage().props;
  const isSuperAdmin = auth.user.is_super_admin;

  const [form, submit, updateValue] = useForm('post', route('projects.update', item.id), {
    _method: 'put',
    name: item.name,
    description: item.description || '',
    area_id: item.area_id || '',
    users: item.users.map(i => i.id.toString()),
  });

  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
      >
        <Anchor
          href='#'
          onClick={() => redirectTo('projects.index')}
          fz={14}
        >
          Proyectos
        </Anchor>
        <div>Editar Proyecto</div>
      </Breadcrumbs>

      <Grid
        justify='space-between'
        align='flex-end'
        gutter='xl'
        mb='lg'
      >
        <Grid.Col span='auto'>
          <Title order={1}>Editar proyecto</Title>
        </Grid.Col>
        <Grid.Col span='content'></Grid.Col>
      </Grid>

      <ContainerBox maw={500}>
        <form onSubmit={submit}>
          <TextInput
            label='Nombre'
            placeholder='Nombre del proyecto'
            required
            mt='md'
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <Textarea
            label='Descripción'
            placeholder='Descripción del proyecto'
            mt='md'
            autosize
            minRows={4}
            maxRows={8}
            value={form.data.description}
            onChange={e => updateValue('description', e.target.value)}
          />

          <Select
            label='Área'
            placeholder='Selecciona un área'
            required
            mt='md'
            value={form.data.area_id?.toString()}
            onChange={value => updateValue('area_id', value)}
            data={areas}
            disabled={!isSuperAdmin}
            error={form.errors.area_id}
          />

          <MultiSelect
            label='Usuarios asignados'
            placeholder='Selecciona usuarios'
            mt='md'
            searchable
            value={form.data.users}
            onChange={values => updateValue('users', values)}
            data={users}
            error={form.errors.users}
          />

          <Group
            justify='space-between'
            mt='xl'
          >
            <BackButton route='projects.index' />
            <ActionButton loading={form.processing}>Actualizar</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

ProjectEdit.layout = page => <Layout title='Edit project'>{page}</Layout>;

export default ProjectEdit;

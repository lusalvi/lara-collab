import ActionButton from '@/components/ActionButton';
import BackButton from '@/components/BackButton';
import useForm from '@/hooks/useForm';
import ContainerBox from '@/layouts/ContainerBox';
import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { usePage } from '@inertiajs/react';
import { Anchor, Breadcrumbs, Grid, Group, TextInput, Title } from '@mantine/core';

const AreaEdit = () => {
  const { item } = usePage().props;
  const [form, submit, updateValue] = useForm('post', route('areas.update', item.id), {
    _method: 'put',
    name: item.name,
  });

  return (
    <>
      <Breadcrumbs
        fz={14}
        mb={30}
      >
        <Anchor
          href='#'
          onClick={() => redirectTo('areas.index')}
          fz={14}
        >
          Áreas
        </Anchor>
        <div>Editar área</div>
      </Breadcrumbs>

      <Grid
        justify='space-between'
        align='flex-end'
        gutter='xl'
        mb='lg'
      >
        <Grid.Col span='auto'>
          <Title order={1}>Editar área</Title>
        </Grid.Col>
        <Grid.Col span='content'></Grid.Col>
      </Grid>

      <ContainerBox maw={600}>
        <form onSubmit={submit}>
          <TextInput
            label='Nombre'
            placeholder='Nombre del área'
            required
            value={form.data.name}
            onChange={e => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <Group
            justify='space-between'
            mt='xl'
          >
            <BackButton route='areas.index' />
            <ActionButton loading={form.processing}>Actualizar</ActionButton>
          </Group>
        </form>
      </ContainerBox>
    </>
  );
};

AreaEdit.layout = page => <Layout title='Edit area'>{page}</Layout>;

export default AreaEdit;
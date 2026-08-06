import { openConfirmModal } from '@/components/ConfirmModal';
import EmptyWithIcon from '@/components/EmptyWithIcon';
import ProjectTabs from '@/components/ProjectTabs';
import RichTextEditor from '@/components/RichTextEditor';
import Layout from '@/layouts/MainLayout';
import { diffForHumans } from '@/utils/datetime';
import { router, usePage } from '@inertiajs/react';
import {
  ActionIcon,
  Badge,
  Button,
  Center,
  Group,
  Modal,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconLock,
  IconLockOff,
  IconLockOpen,
  IconNote,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import classes from './css/Index.module.css';

let currentProject = null;

const NotesIndex = () => {
  const { project, notes } = usePage().props;
  currentProject = project;

  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? null);
  const [title, setTitle] = useState(notes[0]?.title ?? '');
  const [content, setContent] = useState(notes[0]?.content ?? '');
  const [committedContent, setCommittedContent] = useState(notes[0]?.content ?? '');
  const [passcode, setPasscode] = useState(null);
  const [saving, setSaving] = useState(false);
  const pendingCreateRef = useRef(false);

  const [lockOpened, { open: openLockModal, close: closeLockModal }] = useDisclosure(false);
  const [unlockOpened, { open: openUnlockModal, close: closeUnlockModal }] = useDisclosure(false);
  const [lockPass, setLockPass] = useState('');
  const [lockConfirm, setLockConfirm] = useState('');
  const [unlockPass, setUnlockPass] = useState('');
  const [unlockError, setUnlockError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const lockPassRef = useRef(null);
  const unlockPassRef = useRef(null);

  useEffect(() => {
    if (lockOpened) {
      const id = setTimeout(() => lockPassRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [lockOpened]);

  useEffect(() => {
    if (unlockOpened) {
      const id = setTimeout(() => unlockPassRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [unlockOpened]);

  const selectedNote = notes.find(n => n.id === selectedId) ?? null;
  const isLocked = selectedNote?.is_locked ?? false;
  const isUnlockedInSession = isLocked && passcode != null;

  useEffect(() => {
    if (pendingCreateRef.current && notes.length) {
      setSelectedId(notes[0].id);
      pendingCreateRef.current = false;
      return;
    }

    if (!notes.some(n => n.id === selectedId)) {
      setSelectedId(notes[0]?.id ?? null);
    }
  }, [notes]);

  useEffect(() => {
    setTitle(selectedNote?.title ?? '');
    setContent(selectedNote?.content ?? '');
    setCommittedContent(selectedNote?.content ?? '');
    setPasscode(null);
    setUnlockError(null);
  }, [selectedId]);

  const isDirty =
    selectedNote != null &&
    ((selectedNote.title ?? '') !== title || (committedContent ?? '') !== content);

  const selectNote = id => {
    if (id === selectedId) return;

    if (isDirty) {
      openConfirmModal({
        type: 'warning',
        title: '¿Deseas descartar los cambios?',
        content: 'Los cambios no guardados se perderán si cambias de nota. ¿Deseas continuar?',
        confirmLabel: 'Descartar cambios',
        onConfirm: () => setSelectedId(id),
      });
      return;
    }

    setSelectedId(id);
  };

  const createNote = () => {
    pendingCreateRef.current = true;
    router.post(
      route('projects.notes.store', project.id),
      { title: 'Untitled', content: '' },
      { preserveScroll: true, preserveState: true }
    );
  };

  const saveNote = () => {
    if (!selectedNote || !title.trim() || saving) return;

    setSaving(true);
    const payload = { title: title.trim(), content };
    if (isLocked) payload.passcode = passcode;

    router.put(route('projects.notes.update', [project.id, selectedNote.id]), payload, {
      preserveScroll: true,
      preserveState: true,
      onSuccess: () => setCommittedContent(content),
      onFinish: () => setSaving(false),
    });
  };

  const submitLock = () => {
    setProcessing(true);
    router.post(
      route('projects.notes.lock', [project.id, selectedNote.id]),
      { passcode: lockPass, content },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setPasscode(lockPass);
          setCommittedContent(content);
          setLockPass('');
          setLockConfirm('');
          closeLockModal();
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  const submitUnlock = async () => {
    setUnlockError(null);
    setProcessing(true);
    try {
      const res = await axios.post(route('projects.notes.unlock', [project.id, selectedNote.id]), {
        passcode: unlockPass,
      });
      setContent(res.data.content ?? '');
      setCommittedContent(res.data.content ?? '');
      setPasscode(unlockPass);
      setUnlockPass('');
      closeUnlockModal();
    } catch (e) {
      setUnlockError(e.response?.data?.message ?? 'Incorrect passcode');
    } finally {
      setProcessing(false);
    }
  };

  const removeLock = () => {
    openConfirmModal({
      type: 'danger',
      // traducir a español
      title: '¿Deseas eliminar el bloqueo de la nota?',
      content: 'La nota se desbloqueará y ya no requerirá un código de acceso.',
      confirmLabel: 'Eliminar bloqueo',
      confirmProps: { color: 'red' },
      onConfirm: () =>
        router.post(
          route('projects.notes.remove-lock', [project.id, selectedNote.id]),
          { passcode, content },
          {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
              setPasscode(null);
              setCommittedContent(content);
            },
          }
        ),
    });
  };

  const deleteNote = note => {
    openConfirmModal({
      type: 'danger',
      title: '¿Deseas eliminar la nota?',
      content: `"${note.title}" se eliminará permanentemente y no se podrá recuperar. ¿Deseas continuar?`,
      confirmLabel: 'Eliminar nota',
      confirmProps: { color: 'red' },
      onConfirm: () =>
        router.delete(route('projects.notes.destroy', [project.id, note.id]), {
          preserveScroll: true,
          preserveState: true,
        }),
    });
  };

  const canEdit = can('edit note');
  const canCreate = can('create note');
  const canDelete = can('delete note');
  const empty = notes.length === 0;
  const showLockedView = isLocked && !isUnlockedInSession;

  return (
    <>
      <Title
        order={1}
        mb='md'
        mt='md'        
      >
        {project.name}
      </Title>

      <ProjectTabs />

      <div className={classes.layout}>
        <Paper
          withBorder
          radius='md'
          p='sm'
          className={classes.listColumn}
          h='calc(100vh - 220px)'
        >
          <Group
            justify='space-between'
            mb='sm'
            px={4}
          >
            <Title order={4}>Notes</Title>
            {canCreate && (
              <Tooltip
                label='Crear nota'
                openDelay={500}
                withArrow
              >
                <ActionIcon
                  variant='default'
                  onClick={createNote}
                >
                  <IconPlus size={16} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>

          <div className={classes.list}>
            {empty ? (
              <Text
                c='dimmed'
                size='sm'
                ta='center'
                py='lg'
              >
                No se encontraron notas
              </Text>
            ) : (
              notes.map(note => {
                const isSelected = note.id === selectedId;
                return (
                  <Group
                    key={note.id}
                    gap={6}
                    wrap='nowrap'
                  >
                    <UnstyledButton
                      className={`${classes.noteItem} ${isSelected ? classes.noteItemSelected : ''}`}
                      onClick={() => selectNote(note.id)}
                      style={{ flex: 1 }}
                    >
                      <Group
                        gap={6}
                        wrap='nowrap'
                      >
                        {note.is_locked && (
                          <IconLock
                            size={13}
                            stroke={2}
                            className={classes.lockIcon}
                          />
                        )}
                        <Text
                          size='sm'
                          fw={600}
                          lineClamp={1}
                        >
                          {note.title}
                        </Text>
                      </Group>
                      <Text
                        size='xs'
                        c='dimmed'
                        mt={4}
                      >
                        {diffForHumans(note.updated_at)}
                      </Text>
                    </UnstyledButton>
                    {canDelete && (
                      <ActionIcon
                        variant='subtle'
                        color='gray'
                        onClick={() => deleteNote(note)}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    )}
                  </Group>
                );
              })
            )}
          </div>
        </Paper>

        <Paper
          withBorder
          radius='md'
          p='lg'
          className={classes.editorColumn}
          h='calc(100vh - 220px)'
        >
          {selectedNote ? (
            showLockedView ? (
              <Center className={classes.lockedView}>
                <Stack
                  align='center'
                  gap='md'
                >
                  <ThemeIcon
                    size={56}
                    radius='xl'
                    color='yellow'
                    variant='light'
                  >
                    <IconLock size={28} />
                  </ThemeIcon>
                  <Stack
                    align='center'
                    gap={0}
                  >
                    <Text
                      fw={600}
                      size='lg'
                    >
                      Esta nota está bloqueada
                    </Text>
                    <Text
                      size='sm'
                      c='dimmed'
                    >
                      Ingresa el código de acceso para ver el contenido de la nota.
                    </Text>
                  </Stack>
                  <Button
                    leftSection={<IconLockOpen size={16} />}
                    onClick={openUnlockModal}
                  >
                    Desbloquear nota
                  </Button>
                </Stack>
              </Center>
            ) : (
              <Stack
                className={classes.editorStack}
                gap='md'
              >
                <Group
                  justify='space-between'
                  align='center'
                  gap='md'
                  wrap='nowrap'
                >
                  <TextInput
                    className={classes.titleInput}
                    size='md'
                    placeholder='Título de la nota'
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    disabled={!canEdit}
                    error={title.trim() ? false : 'Title is required'}
                  />
                  <Group
                    gap='sm'
                    wrap='nowrap'
                  >
                    {canEdit && !isLocked && (
                      <Button
                        size='md'
                        variant='light'
                        color='gray'
                        onClick={openLockModal}
                        px={12}
                      >
                        <IconLock size={20} />
                      </Button>
                    )}
                    {canEdit && isUnlockedInSession && (
                      <Tooltip label="Quitar bloqueo" openDelay={250} withArrow>
                        <Button
                          size='md'
                          variant='light'
                          color='red'
                          onClick={removeLock}
                          px={12}
                        >
                          <IconLockOff size={20} />
                        </Button>
                      </Tooltip>
                    )}
                    {canEdit && (
                      <Button
                        size='md'
                        loading={saving}
                        onClick={saveNote}
                        disabled={!title.trim()}
                      >
                        Guardar
                      </Button>
                    )}
                  </Group>
                </Group>

                <div className={classes.editorWrapper}>
                  <RichTextEditor
                    key={selectedId}
                    content={isUnlockedInSession ? content : selectedNote.content || ''}
                    onChange={setContent}
                    placeholder='Escribe el contenido de la nota aquí...'
                    height={300}
                    fill
                    readOnly={!canEdit}
                  />
                </div>
              </Stack>
            )
          ) : (
            <Center className={classes.emptyState}>
              <EmptyWithIcon
                icon={IconNote}
                title={empty ? 'Sin notas' : 'Selecciona una nota'}
                subtitle={
                  empty
                    ? canCreate
                      ? 'Crea una nueva nota para empezar.'
                      : 'No hay notas disponibles.'
                    : 'Selecciona una nota de la lista para ver o editar su contenido.'
                }
              />
            </Center>
          )}
        </Paper>
      </div>

      <Modal
        opened={lockOpened}
        onClose={closeLockModal}
        title='Nota bloqueada'
        centered
      >
        <Stack>
          <Text
            size='sm'
            c='dimmed'
          >
            Ingresa un código de acceso para bloquear la nota. Este código será necesario para desbloquearla y ver su contenido. Asegúrate de recordarlo, ya que no se puede recuperar si lo olvidas.
          </Text>
          <PasswordInput
            ref={lockPassRef}
            label='Código de acceso'
            placeholder='Mínimo 4 caracteres'
            value={lockPass}
            onChange={e => setLockPass(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && lockPass.length >= 4 && lockPass === lockConfirm) submitLock();
            }}
          />
          <PasswordInput
            label='Confirmar código de acceso'
            placeholder='Vuelve a ingresar el código de acceso'
            value={lockConfirm}
            onChange={e => setLockConfirm(e.target.value)}
            error={lockConfirm && lockPass !== lockConfirm ? 'Passcodes do not match' : null}
            onKeyDown={e => {
              if (e.key === 'Enter' && lockPass.length >= 4 && lockPass === lockConfirm) submitLock();
            }}
          />
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={closeLockModal}
            >
              Cancelar
            </Button>
            <Button
              loading={processing}
              disabled={lockPass.length < 4 || lockPass !== lockConfirm}
              onClick={submitLock}
            >
              Bloquear nota
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={unlockOpened}
        onClose={closeUnlockModal}
        title='Nota desbloqueada'
        centered
      >
        <Stack>
          <PasswordInput
            ref={unlockPassRef}
            placeholder='Ingresa el código de acceso'
            value={unlockPass}
            onChange={e => {
              setUnlockPass(e.target.value);
              setUnlockError(null);
            }}
            error={unlockError}
            onKeyDown={e => {
              if (e.key === 'Enter' && unlockPass.length >= 4) submitUnlock();
            }}
          />
          <Group justify='flex-end'>
            <Button
              variant='default'
              onClick={closeUnlockModal}
            >
              Cancelar
            </Button>
            <Button
              loading={processing}
              disabled={unlockPass.length < 4}
              onClick={submitUnlock}
            >
              Desbloquear nota
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

NotesIndex.layout = page => (
  <Layout title={currentProject ? `${currentProject.name} - Notes` : 'Notes'}>{page}</Layout>
);

export default NotesIndex;

import Layout from '@/layouts/MainLayout';
import { currentUrl, currentUrlParams, reloadWithQuery, reloadWithoutQueryParams } from '@/utils/route';
import { router, usePage } from '@inertiajs/react';
import {
    ActionIcon,
    Box,
    Button,
    Card,
    Checkbox,
    ColorSwatch,
    Combobox,
    Divider,
    Drawer,
    Group,
    Input,
    InputBase,
    Loader,
    Menu,
    Modal,
    ScrollArea,
    Select,
    Stack,
    Switch,
    Text,
    Textarea,
    TextInput,
    Title,
    Tooltip,
    useCombobox,
    rem,
} from '@mantine/core';
import { DateInput, TimeInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
import {
    IconAdjustmentsHorizontal,
    IconCalendarCheck,
    IconChevronLeft,
    IconChevronRight,
    IconCircleCheck,
    IconClockExclamation,
    IconPencil,
    IconPlus,
    IconTrash,
    IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useState, useRef } from 'react';
import * as React from 'react';
import classes from './css/Index.module.css';

dayjs.locale('es');

// ─── Helpers ──────────────────────────────────────────────────────

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}

// Recorta "HH:MM:SS" → "HH:MM" (la BD devuelve segundos)
function toHHMM(t) {
    return t ? String(t).slice(0, 5) : '';
}

// "HH:MM" → minutos desde las 00:00
function timeToMinutes(t) {
    const [h, m] = toHHMM(t).split(':').map(Number);
    return h * 60 + m;
}

// Texto de horario de una tarea: "09:00 – 11:30" (rango), "09:00" (puntual) o null (sin horario)
function formatTimeRange(task) {
    const start = toHHMM(task.scheduled_time);
    if (!start) return null;
    const end = toHHMM(task.scheduled_end_time);
    return end ? `${start} – ${end}` : start;
}

// Devuelve estilos de color según la prioridad (pastel, coherente con el sistema)
function getPriorityStyle(priority) {
    if (!priority) {
        return {
            bg:     'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-6))',
            border: 'light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-4))',
            color:  'var(--mantine-color-dimmed)',
            dot:    'var(--mantine-color-gray-5)',
        };
    }
    // Usa el color real de la prioridad del sistema (viene de task_priorities.color)
    const c = priority.color;
    return {
        bg:     `color-mix(in srgb, ${c} 12%, transparent)`,
        border: `color-mix(in srgb, ${c} 45%, transparent)`,
        color:  c,
        dot:    c,
    };
}

// ─── PrioritySelect (patrón TAHU) ────────────────────────────────

function PrioritySelect({ value, onChange, priorities }) {
    const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });
    const selected = priorities?.find(p => p.id === value) ?? null;

    return (
        <Box>
            <Input.Label>Prioridad</Input.Label>
            <Combobox
                store={combobox}
                onOptionSubmit={val => { onChange(val ? Number(val) : null); combobox.closeDropdown(); }}
                withinPortal={false}
            >
                <Combobox.Target>
                    <InputBase
                        component='button' type='button' pointer size='sm'
                        onClick={() => combobox.toggleDropdown()}
                        rightSection={
                            selected
                                ? <IconX size={14} style={{ cursor: 'pointer' }} onClick={e => { e.stopPropagation(); onChange(null); }} />
                                : <Combobox.Chevron />
                        }
                        rightSectionPointerEvents={selected ? 'all' : 'none'}
                    >
                        {selected ? (
                            <Group gap={7}>
                                <ColorSwatch color={selected.color} size={10} />
                                <Text size='sm'>{selected.label}</Text>
                            </Group>
                        ) : (
                            <Input.Placeholder>Sin prioridad</Input.Placeholder>
                        )}
                    </InputBase>
                </Combobox.Target>
                <Combobox.Dropdown>
                    <Combobox.Options>
                        {priorities?.map(p => (
                            <Combobox.Option key={p.id} value={p.id.toString()} active={value === p.id}>
                                <Group gap={7}>
                                    <ColorSwatch color={p.color} size={10} />
                                    <Text size='sm'>{p.label}</Text>
                                </Group>
                            </Combobox.Option>
                        ))}
                    </Combobox.Options>
                </Combobox.Dropdown>
            </Combobox>
        </Box>
    );
}

// ─── Drawer crear / editar ────────────────────────────────────────

function TaskDrawer({ opened, onClose, task, priorities, viewingDate }) {
    const isEditing = Boolean(task) && !task?._prefill;
    const empty = {
        description: '', notes: '', priority_id: null, scheduled_for: viewingDate,
        use_range: false, scheduled_time: '', scheduled_end_time: '',
    };
    const [form, setForm] = useState(empty);
    const [submitting, setSubmitting] = useState(false);

    const [prevOpened, setPrevOpened] = useState(false);
    if (opened !== prevOpened) {
        setPrevOpened(opened);
        if (opened) {
            if (task?._prefill) {
                // Drag-to-create: rango horario activado y ambas horas pre-cargadas.
                // La tarea NO se crea acá: el usuario todavía debe completar y guardar.
                setForm({
                    ...empty,
                    scheduled_for:      viewingDate,
                    use_range:          true,
                    scheduled_time:     toHHMM(task.scheduled_time),
                    scheduled_end_time: toHHMM(task.scheduled_end_time),
                });
            } else if (isEditing) {
                setForm({
                    description:    task.description ?? '',
                    notes:          task.notes ?? '',
                    priority_id:    task.priority_id ?? null,
                    scheduled_for:  task.scheduled_for ? task.scheduled_for.split('T')[0] : viewingDate,
                    use_range:      Boolean(task.scheduled_end_time),
                    scheduled_time: toHHMM(task.scheduled_time),
                    scheduled_end_time: toHHMM(task.scheduled_end_time),
                });
            } else {
                setForm({ ...empty, scheduled_for: viewingDate });
            }
        }
    }

    function update(field, value) { setForm(prev => ({ ...prev, [field]: value })); }

    // Al desactivar el rango se descarta la hora de fin (queda solo la hora puntual)
    function toggleRange(checked) {
        setForm(prev => ({
            ...prev,
            use_range: checked,
            scheduled_end_time: checked ? prev.scheduled_end_time : '',
        }));
    }

    // Con rango activado: comienzo y fin obligatorios, y fin posterior a comienzo
    const endBeforeStart = form.use_range && form.scheduled_time && form.scheduled_end_time
        && form.scheduled_end_time <= form.scheduled_time;
    const rangeInvalid = form.use_range
        && (!form.scheduled_time || !form.scheduled_end_time || endBeforeStart);

    function handleSubmit(e) {
        e.preventDefault();
        if (!form.description.trim() || rangeInvalid) return;
        setSubmitting(true);
        const payload = {
            description:    form.description.trim(),
            notes:          form.notes.trim() || null,
            priority_id:    form.priority_id || null,
            scheduled_for:  form.scheduled_for || viewingDate,
            scheduled_time: form.scheduled_time || null,
            scheduled_end_time: form.use_range ? (form.scheduled_end_time || null) : null,
        };
        const opts = { preserveScroll: true, onSuccess: () => onClose(), onFinish: () => setSubmitting(false) };
        if (isEditing) {
            router.put(route('personal-tasks.update', task.id), payload, opts);
        } else {
            router.post(route('personal-tasks.store'), payload, opts);
        }
    }

    return (
        <Drawer
            opened={opened} onClose={onClose}
            title={
                <Text fz={{ base: 'lg', sm: rem(22) }} fw={600} ml={{ base: 0, sm: 25 }} my='sm'>
                    {isEditing ? 'Editar tarea' : 'Nueva tarea'}
                </Text>
            }
            position='right' size={520}
            overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
            transitionProps={{ transition: 'slide-left', duration: 400, timingFunction: 'ease' }}
        >
            <form onSubmit={handleSubmit} className={classes.drawerForm}>
                <div className={classes.drawerContent}>
                    <TextInput
                        label='Título' placeholder='¿Qué tenés que hacer?'
                        required data-autofocus
                        value={form.description}
                        onChange={e => update('description', e.target.value)}
                        size='sm'
                    />
                    <Textarea
                        label='Descripción'
                        description='Opcional. Detalles, contexto o notas sobre la tarea.'
                        placeholder='Detalles adicionales...'
                        value={form.notes}
                        onChange={e => update('notes', e.target.value)}
                        autosize minRows={3} maxRows={8} size='sm'
                    />
                    <PrioritySelect
                        value={form.priority_id}
                        onChange={val => update('priority_id', val)}
                        priorities={priorities}
                    />
                    <DateInput
                        label='Fecha'
                        valueFormat='DD MMM YYYY'
                        placeholder='Seleccioná una fecha'
                        value={form.scheduled_for ? dayjs(form.scheduled_for).toDate() : null}
                        onChange={val => update('scheduled_for', val ? dayjs(val).format('YYYY-MM-DD') : viewingDate)}
                        size='sm' clearable
                    />
                    <Switch
                        label='Usar rango horario'
                        description='Definí hora de comienzo y de fin para que la tarea ocupe un intervalo.'
                        checked={form.use_range}
                        onChange={e => toggleRange(e.currentTarget.checked)}
                    />
                    {form.use_range ? (
                        <Group grow align='flex-start'>
                            <TimeInput
                                label='Hora de comienzo'
                                required
                                placeholder='09:00'
                                value={form.scheduled_time}
                                onChange={e => update('scheduled_time', e.target.value)}
                                size='sm'
                            />
                            <TimeInput
                                label='Hora de fin'
                                required
                                placeholder='11:30'
                                value={form.scheduled_end_time}
                                onChange={e => update('scheduled_end_time', e.target.value)}
                                error={endBeforeStart ? 'Debe ser posterior al comienzo' : undefined}
                                size='sm'
                            />
                        </Group>
                    ) : (
                        <Box>
                            <Input.Label>
                                Hora{' '}
                                <Text span size='xs' c='dimmed'>(opcional)</Text>
                            </Input.Label>
                            <TimeInput
                                placeholder='15:30'
                                value={form.scheduled_time}
                                onChange={e => update('scheduled_time', e.target.value)}
                                size='sm'
                                rightSection={
                                    form.scheduled_time
                                        ? <IconX size={14} style={{ cursor: 'pointer' }} onClick={() => update('scheduled_time', '')} />
                                        : null
                                }
                                rightSectionPointerEvents='all'
                            />
                        </Box>
                    )}
                </div>
                <Group justify='space-between' mt='xl' px={rem(20)} pb={rem(20)}>
                    <Button variant='transparent' onClick={onClose} disabled={submitting}>Cancelar</Button>
                    <Button type='submit' loading={submitting} disabled={!form.description.trim() || rangeInvalid}>
                        {isEditing ? 'Guardar cambios' : 'Agregar tarea'}
                    </Button>
                </Group>
            </form>
        </Drawer>
    );
}

// ─── Menú de acciones de tarea (⋮) ───────────────────────────────

function TaskMenu({ task, onEdit, visible }) {
    const [confirmDelete, { open: openDelete, close: closeDelete }] = useDisclosure(false);

    function handleDelete() {
        router.delete(route('personal-tasks.destroy', task.id), {
            preserveScroll: true,
            onSuccess: () => closeDelete(),
        });
    }

    return (
        <>
            <Menu shadow='md' position='bottom-end' withinPortal>
                <Menu.Target>
                    <ActionIcon
                        variant='subtle' color='gray' size='sm'
                        style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.12s ease', flexShrink: 0 }}
                    >
                        <svg width='14' height='14' viewBox='0 0 24 24' fill='currentColor'>
                            <circle cx='12' cy='5' r='1.5'/><circle cx='12' cy='12' r='1.5'/><circle cx='12' cy='19' r='1.5'/>
                        </svg>
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    <Menu.Item leftSection={<IconPencil size={13} />} onClick={() => onEdit(task)}>
                        Editar
                    </Menu.Item>
                    <Menu.Item leftSection={<IconTrash size={13} />} color='red' onClick={openDelete}>
                        Eliminar
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>

            <Modal opened={confirmDelete} onClose={closeDelete} title='Eliminar tarea' size='sm'>
                <Text size='sm' mb='lg'>¿Eliminar "{task.description}"? Esta acción no se puede deshacer.</Text>
                <Group justify='flex-end'>
                    <Button variant='default' onClick={closeDelete}>Cancelar</Button>
                    <Button color='red' onClick={handleDelete}>Eliminar</Button>
                </Group>
            </Modal>
        </>
    );
}

// ─── Toggle de checkbox con optimismo + sin NProgress ────────────

function useTaskToggle(task) {
    const [optimistic, setOptimistic] = useState(null);
    const [toggling, setToggling]     = useState(false);
    const isCompleted = optimistic !== null ? optimistic : task.completed_at !== null;

    function toggle() {
        setOptimistic(!isCompleted);
        setToggling(true);
        router.post(route('personal-tasks.toggle', task.id), {}, {
            preserveScroll: true,
            headers: { 'X-Silent': 'true' },
            onError:  () => { setOptimistic(null); setToggling(false); },
            onFinish: () => { setToggling(false); setOptimistic(null); },
        });
    }

    return { isCompleted, toggling, toggle };
}

// ─── Bloque de tarea en el cronograma ────────────────────────────

function ScheduledTaskBlock({ task, onEdit, rangeHeight }) {
    const { isCompleted, toggling, toggle } = useTaskToggle(task);
    const [hovered, setHovered] = useState(false);
    const style = getPriorityStyle(task.priority);
    const timeStr = formatTimeRange(task);
    // Subtítulo: horario y/o prioridad (las tareas sin horario muestran solo la prioridad)
    const metaStr = [timeStr, task.priority?.label].filter(Boolean).join(' · ');
    const isRange = Boolean(rangeHeight);
    // Rangos cortos: una sola línea (título + horario) para que el contenido entre en el bloque
    const compact = isRange && rangeHeight < 48;

    return (
        <div
            className={`${classes.taskBlock} ${isRange ? classes.taskBlockRange : ''} ${isCompleted ? classes.taskBlockCompleted : ''}`}
            style={{ borderLeftColor: style.border, backgroundColor: style.bg }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Group justify='space-between' align='flex-start' wrap='nowrap' gap='xs'>
                <Group gap='xs' align='flex-start' wrap='nowrap' style={{ flex: 1, minWidth: 0 }}>
                    <div className={classes.taskCheck}>
                        {toggling
                            ? <Loader size={13} />
                            : <Checkbox checked={isCompleted} onChange={toggle} size='xs' radius='sm' />
                        }
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <Text
                            size='sm' fw={isCompleted ? 400 : 500} lh={1.35}
                            c={isCompleted ? 'dimmed' : undefined}
                            td={isCompleted ? 'line-through' : undefined}
                            style={{ wordBreak: 'break-word' }}
                        >
                            {task.description}
                            {compact && metaStr && (
                                <Text span size='xs' c='dimmed' ml={6}>{metaStr}</Text>
                            )}
                        </Text>
                        {metaStr && !compact && (
                            <Text size='xs' c='dimmed' mt={2}>{metaStr}</Text>
                        )}
                        {task.notes && !isCompleted && !compact && (
                            <Text size='xs' c='dimmed' mt={1} lineClamp={1}>{task.notes}</Text>
                        )}
                    </div>
                </Group>
                <TaskMenu task={task} onEdit={onEdit} visible={hovered} />
            </Group>
        </div>
    );
}

// ─── Cronograma principal ─────────────────────────────────────────

const HOURS       = Array.from({ length: 24 }, (_, i) => i); // 0..23
const HOUR_HEIGHT = 64; // px por hora

// Convierte píxeles Y dentro del grid → minutos desde las 00:00, redondeado a 15 min
// (tope 23:59 para que el borde inferior del grid no dé "24:00")
function pxToMinutes(px) {
    const totalMinutes = (px / HOUR_HEIGHT) * 60;
    return Math.min(Math.round(totalMinutes / 15) * 15, 23 * 60 + 59);
}

function minutesToTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function pxToTime(px) {
    return minutesToTime(pxToMinutes(px));
}

// Altura visual mínima de un bloque puntual (coincide con min-height de .taskBlock)
const POINT_HEIGHT = 48;

// Rango vertical (px) que ocupa una tarea con hora dentro del grid
function taskVerticalSpan(task) {
    const top   = (timeToMinutes(task.scheduled_time) / 60) * HOUR_HEIGHT;
    const endMin = task.scheduled_end_time ? timeToMinutes(task.scheduled_end_time) : null;
    const isRange = endMin !== null && endMin > timeToMinutes(task.scheduled_time);
    const height  = isRange
        ? Math.max(20, ((endMin - timeToMinutes(task.scheduled_time)) / 60) * HOUR_HEIGHT)
        : POINT_HEIGHT;
    return { top, bottom: top + height, height, isRange };
}

// Reparte las tareas que se superponen en columnas lado a lado (estilo calendario).
// Devuelve Map<id, { col, cols }>: columna asignada y cantidad de columnas del grupo.
function layoutOverlaps(tasks) {
    const items = tasks
        .map(task => ({ task, ...taskVerticalSpan(task) }))
        .sort((a, b) => a.top - b.top || b.bottom - a.bottom);

    const result = new Map();
    let group = [];
    let groupBottom = -Infinity;

    function flush() {
        const colEnds = []; // fin (px) del último bloque de cada columna
        group.forEach(item => {
            let col = colEnds.findIndex(end => end <= item.top);
            if (col === -1) { col = colEnds.length; colEnds.push(item.bottom); }
            else colEnds[col] = item.bottom;
            item.col = col;
        });
        group.forEach(item => result.set(item.task.id, { col: item.col, cols: colEnds.length }));
        group = [];
        groupBottom = -Infinity;
    }

    items.forEach(item => {
        if (group.length && item.top >= groupBottom) flush();
        group.push(item);
        groupBottom = Math.max(groupBottom, item.bottom);
    });
    if (group.length) flush();

    return result;
}

function DailySchedule({ tasks, onEdit, onDragCreate }) {
    // Separar tareas con y sin hora
    const withTime    = tasks.filter(t => t.scheduled_time);
    const withoutTime = tasks.filter(t => !t.scheduled_time);

    // Para tareas con hora: calcular posición top en px
    function topForTime(timeStr) {
        return (timeToMinutes(timeStr) / 60) * HOUR_HEIGHT;
    }

    const totalHeight = 24 * HOUR_HEIGHT;
    const overlapLayout = layoutOverlaps(withTime);

    // ── Drag-to-create ──────────────────────────────────────────────
    const gridRef       = useRef(null);
    const [drag, setDrag] = useState(null);
    // drag = { startPx, currentPx } mientras se arrastra; null en reposo

    function getRelativeY(e) {
        const rect = gridRef.current.getBoundingClientRect();
        return Math.max(0, Math.min(e.clientY - rect.top, totalHeight));
    }

    function handleMouseDown(e) {
        // Solo clic izquierdo sobre el fondo del grid (no sobre bloques de tarea)
        if (e.button !== 0) return;
        if (e.target.closest('[data-task-block]')) return;
        e.preventDefault();
        const y = getRelativeY(e);
        setDrag({ startPx: y, currentPx: y });
    }

    function handleMouseMove(e) {
        if (!drag) return;
        setDrag(d => ({ ...d, currentPx: getRelativeY(e) }));
    }

    function handleMouseUp(e) {
        if (!drag) return;
        // La dirección del arrastre no importa: comienzo = menor, fin = mayor
        const minPx = Math.min(drag.startPx, drag.currentPx);
        const maxPx = Math.max(drag.startPx, drag.currentPx);

        // Si el drag fue muy corto (< 8px ~ clic accidental), ignorar
        if (maxPx - minPx >= 8) {
            let startMin = pxToMinutes(minPx);
            let endMin   = pxToMinutes(maxPx);

            // Tras redondear a 15 min podrían coincidir: garantizar un rango válido
            if (endMin <= startMin) {
                endMin = Math.min(startMin + 15, 23 * 60 + 59);
                if (endMin <= startMin) startMin = endMin - 15;
            }

            onDragCreate(minutesToTime(startMin), minutesToTime(endMin));
        }
        setDrag(null);
    }

    function handleMouseLeave() {
        if (drag) setDrag(null);
    }

    // Calcular la selección visual del drag
    const dragTop    = drag ? Math.min(drag.startPx, drag.currentPx) : 0;
    const dragHeight = drag ? Math.max(8, Math.abs(drag.currentPx - drag.startPx)) : 0;
    const dragLabel  = drag
        ? `${pxToTime(Math.min(drag.startPx, drag.currentPx))} – ${pxToTime(Math.max(drag.startPx, drag.currentPx))}`
        : '';

    return (
        <div className={classes.schedule}>
            {/* Sección sin horario */}
            {withoutTime.length > 0 && (
                <div className={classes.unscheduledSection}>
                    <Text size='xs' fw={600} tt='uppercase' c='dimmed' className={classes.unscheduledLabel}>
                        Sin horario ({withoutTime.length})
                    </Text>
                    <Stack gap={6} mt={8}>
                        {withoutTime.map(task => (
                            <ScheduledTaskBlock key={task.id} task={task} onEdit={onEdit} />
                        ))}
                    </Stack>
                </div>
            )}

            {/* Grid horario */}
            <div
                ref={gridRef}
                className={`${classes.timeGrid} ${drag ? classes.timeGridDragging : ''}`}
                style={{ height: totalHeight }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
            >
                {/* Líneas de hora */}
                {HOURS.map(h => (
                    <div
                        key={h}
                        className={classes.hourRow}
                        style={{ top: h * HOUR_HEIGHT }}
                    >
                        <span className={classes.hourLabel}>
                            {String(h).padStart(2, '0')}:00
                        </span>
                        <div className={classes.hourLine} />
                    </div>
                ))}

                {/* Selección visual de drag */}
                {drag && dragHeight >= 8 && (
                    <div
                        className={classes.dragSelection}
                        style={{ top: dragTop, height: dragHeight }}
                    >
                        <span className={classes.dragLabel}>{dragLabel}</span>
                    </div>
                )}

                {/* Bloques de tareas con hora: puntuales (altura automática) o rangos (altura = duración).
                    Si se superponen, se reparten en columnas lado a lado. */}
                {withTime.map(task => {
                    const { top, height, isRange } = taskVerticalSpan(task);
                    const { col, cols } = overlapLayout.get(task.id) ?? { col: 0, cols: 1 };
                    const rangeHeight = isRange ? height : null;

                    return (
                        <div
                            key={task.id}
                            data-task-block='true'
                            className={classes.taskBlockWrapper}
                            style={{
                                top,
                                '--col': col,
                                '--cols': cols,
                                ...(isRange ? { height: rangeHeight } : {}),
                            }}
                        >
                            <ScheduledTaskBlock task={task} onEdit={onEdit} rangeHeight={rangeHeight} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Card de pendientes anteriores ───────────────────────────────

function OverdueCard({ tasks, onEdit }) {
    if (!tasks.length) return null;

    return (
        <Card withBorder radius='md' p={0} className={classes.sideCard}>
            <div className={classes.sideCardHeader}>
                <Group gap='xs'>
                    <div className={`${classes.sideCardIcon} ${classes.sideCardIcon__overdue}`}>
                        <IconClockExclamation size={13} />
                    </div>
                    <Text size='xs' fw={700} tt='uppercase' c='dimmed'>
                        Pendientes anteriores
                    </Text>
                    <Text size='xs' c='dimmed'>({tasks.length})</Text>
                </Group>
            </div>
            <Stack gap={0} className={classes.sideCardBody}>
                {tasks.map((task, i) => (
                    <OverdueTaskRow key={task.id} task={task} onEdit={onEdit} last={i === tasks.length - 1} />
                ))}
            </Stack>
        </Card>
    );
}

function OverdueTaskRow({ task, onEdit, last }) {
    const { isCompleted, toggling, toggle } = useTaskToggle(task);
    const style = getPriorityStyle(task.priority);
    const sf    = task.scheduled_for ? dayjs(task.scheduled_for).format('D/MM') : '';
    const time  = formatTimeRange(task) ?? 'Sin horario';

    return (
        <div className={`${classes.sideRow} ${!last ? classes.sideRowBorder : ''}`}>
            <Group gap='xs' align='flex-start' wrap='nowrap'>
                <div className={classes.taskCheck} style={{ marginTop: 2 }}>
                    {toggling
                        ? <Loader size={13} />
                        : <Checkbox checked={isCompleted} onChange={toggle} size='xs' radius='sm' />
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        size='sm' fw={isCompleted ? 400 : 500} lh={1.3}
                        td={isCompleted ? 'line-through' : undefined}
                        c={isCompleted ? 'dimmed' : undefined}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {task.description}
                    </Text>
                    <Group gap={4} mt={3}>
                        {task.priority && (
                            <span className={classes.priorityChip} style={{ color: style.color, borderColor: style.border, backgroundColor: style.bg }}>
                                {task.priority.label}
                            </span>
                        )}
                        <Text size='xs' c='dimmed'>{sf} · {time}</Text>
                    </Group>
                </div>
                <TaskMenu task={task} onEdit={onEdit} />
            </Group>
        </div>
    );
}

// ─── Card de prioridades ──────────────────────────────────────────

function PrioritiesCard({ tasks, priorities, onEdit }) {
    // Agrupar por prioridad (en el orden del sistema), luego sin prioridad
    const groups = [];

    priorities.forEach(p => {
        const ts = tasks.filter(t => t.priority_id === p.id);
        if (ts.length) groups.push({ priority: p, tasks: ts });
    });

    const noPriority = tasks.filter(t => !t.priority_id);
    if (noPriority.length) groups.push({ priority: null, tasks: noPriority });

    if (!groups.length) return null;

    return (
        <Card withBorder radius='md' p={0} className={classes.sideCard}>
            <div className={classes.sideCardHeader}>
                <Text size='xs' fw={700} tt='uppercase' c='dimmed'>Prioridades</Text>
            </div>
            <div className={classes.sideCardBody}>
                {groups.map(({ priority, tasks: groupTasks }, gi) => {
                    const style = getPriorityStyle(priority);
                    return (
                        <div key={priority?.id ?? 'none'}>
                            {gi > 0 && <Divider my={8} />}
                            <Group gap={6} mb={6} px={12}>
                                <span className={classes.priorityDot} style={{ backgroundColor: style.dot }} />
                                <Text size='xs' fw={600} c={style.color !== 'var(--mantine-color-dimmed)' ? style.color : undefined}>
                                    {priority?.label ?? 'Sin prioridad'}
                                </Text>
                            </Group>
                            <Stack gap={0}>
                                {groupTasks.map((task, i) => (
                                    <PriorityTaskRow
                                        key={task.id} task={task} onEdit={onEdit}
                                        last={i === groupTasks.length - 1}
                                    />
                                ))}
                            </Stack>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

function PriorityTaskRow({ task, onEdit, last }) {
    const { isCompleted, toggling, toggle } = useTaskToggle(task);
    const [hovered, setHovered] = useState(false);
    const sf   = task.scheduled_for ? dayjs(task.scheduled_for).format('D/MM') : '';
    const time = formatTimeRange(task) ?? 'Sin horario';

    return (
        <div
            className={`${classes.sideRow} ${!last ? classes.sideRowBorder : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <Group gap='xs' align='flex-start' wrap='nowrap'>
                <div className={classes.taskCheck} style={{ marginTop: 2 }}>
                    {toggling
                        ? <Loader size={13} />
                        : <Checkbox checked={isCompleted} onChange={toggle} size='xs' radius='sm' />
                    }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Text
                        size='sm' fw={isCompleted ? 400 : 500} lh={1.3}
                        td={isCompleted ? 'line-through' : undefined}
                        c={isCompleted ? 'dimmed' : undefined}
                        style={{ wordBreak: 'break-word' }}
                    >
                        {task.description}
                    </Text>
                    <Text size='xs' c='dimmed' mt={2}>{sf} · {time}</Text>
                </div>
                <TaskMenu task={task} onEdit={onEdit} visible={hovered} />
            </Group>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────

const PersonalTasksIndex = () => {
    const { dateTasks, overdueTasks, completedTasks, priorities, viewingDate, today, isToday } = usePage().props;

    const params       = currentUrlParams();
    const prioritySort = params.sort_priority ?? null;

    const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false);
    const [editingTask, setEditingTask] = useState(null);

    function handleNewTask() { setEditingTask(null); openDrawer(); }
    function handleEdit(task) { setEditingTask(task); openDrawer(); }
    function handleDrawerClose() { closeDrawer(); setEditingTask(null); }

    // Drag-to-create: abre el drawer con rango horario y ambas horas pre-cargadas
    function handleDragCreate(startTime, endTime) {
        setEditingTask({ _prefill: true, scheduled_time: startTime, scheduled_end_time: endTime });
        openDrawer();
    }

    // Navegación entre fechas — usa currentUrl() de las utilidades existentes
    function navigateTo(dateStr) {
        const newParams = { ...params };
        if (dateStr === today) {
            delete newParams.date;
        } else {
            newParams.date = dateStr;
        }
        router.get(currentUrl(), newParams, { preserveState: true, preserveScroll: true, replace: true });
    }

    function goToPrev()  { navigateTo(dayjs(viewingDate).subtract(1, 'day').format('YYYY-MM-DD')); }
    function goToNext()  { navigateTo(dayjs(viewingDate).add(1, 'day').format('YYYY-MM-DD')); }
    function goToToday() { navigateTo(today); }

    // Ordenamiento (aplica a la sección "sin horario" y a la card de prioridades)
    const sortOptions = [
        { value: 'default', label: 'Predeterminado' },
        { value: 'asc',     label: 'Alta → Baja'    },
        { value: 'desc',    label: 'Baja → Alta'    },
    ];
    function handleSortChange(val) {
        if (!val || val === 'default') reloadWithoutQueryParams({ exclude: ['sort_priority'] });
        else reloadWithQuery({ sort_priority: val }, true);
    }

    const [clearingCompleted, setClearingCompleted] = useState(false);
    function handleClearCompleted() {
        setClearingCompleted(true);
        router.delete(route('personal-tasks.clear-completed'), {
            data: { date: viewingDate },
            preserveScroll: true,
            onFinish: () => setClearingCompleted(false),
        });
    }

    // Todas las tareas del día (pendientes + completadas) para el cronograma
    const allDayTasks = [...dateTasks, ...completedTasks];

    const viewingDayjs = dayjs(viewingDate);
    const dateLabel    = capitalize(viewingDayjs.format('dddd, D [de] MMMM [de] YYYY'));

    const hasCompleted = completedTasks.length > 0;

    return (
        <>
            {/* ── Cabecera ── */}
            <div className={classes.pageHeader}>
                <Title order={2} fw={700}>Tareas Personales</Title>
                <Text size='sm' c='dimmed'>Tus tareas y pendientes del día a día.</Text>
            </div>

            {/* ── Toolbar ── */}
            <div className={classes.toolbar}>
                {/* Navegación de fecha */}
                <Group gap='xs' align='center'>
                    <ActionIcon variant='subtle' color='gray' size='sm' onClick={goToPrev}>
                        <IconChevronLeft size={15} />
                    </ActionIcon>
                    <Group gap={6} align='center' className={classes.dateChip}>
                        <IconCalendarCheck size={14} className={classes.dateChipIcon} />
                        <Text size='sm' fw={500}>{dateLabel}</Text>
                    </Group>
                    <ActionIcon variant='subtle' color='gray' size='sm' onClick={goToNext}>
                        <IconChevronRight size={15} />
                    </ActionIcon>
                    {!isToday && (
                        <Button size='xs' variant='light' onClick={goToToday}>Hoy</Button>
                    )}
                </Group>

                {/* Limpiar completadas + Ordenamiento + Nueva tarea */}
                <Group gap='md' align='center'>
                    {hasCompleted && (
                        <Button
                            variant='light' color='red' size='xs'
                            leftSection={<IconCircleCheck size={14} />}
                            loading={clearingCompleted}
                            onClick={handleClearCompleted}
                        >
                            Limpiar tareas completadas ({completedTasks.length})
                        </Button>
                    )}
                    <Group gap='xs' align='center'>
                        <IconAdjustmentsHorizontal size={14} color='var(--mantine-color-dimmed)' />
                        <Text size='xs' c='dimmed' fw={500}>Ordenar por:</Text>
                        <Select
                            size='xs'
                            data={sortOptions}
                            value={prioritySort ?? 'default'}
                            onChange={handleSortChange}
                            w={165}
                            allowDeselect={false}
                        />
                    </Group>
                    <Button leftSection={<IconPlus size={15} />} onClick={handleNewTask} size='sm'>
                        Nueva tarea
                    </Button>
                </Group>
            </div>

            {/* ── Layout: cronograma + sidebar ── */}
            <div className={classes.layout}>

                {/* Cronograma principal */}
                <div className={classes.mainCol}>
                    <ScrollArea
                        type='scroll'
                        offsetScrollbars
                        style={{ position: 'absolute', inset: 0 }}
                    >
                        <DailySchedule
                            tasks={allDayTasks}
                            onEdit={handleEdit}
                            onDragCreate={handleDragCreate}
                        />
                    </ScrollArea>
                </div>

                {/* Sidebar */}
                <div className={classes.sidebar}>
                    <OverdueCard tasks={overdueTasks} onEdit={handleEdit} />
                    <PrioritiesCard tasks={dateTasks} priorities={priorities} onEdit={handleEdit} />
                </div>
            </div>

            <TaskDrawer
                opened={drawerOpened}
                onClose={handleDrawerClose}
                task={editingTask}
                priorities={priorities}
                viewingDate={viewingDate}
            />
        </>
    );
};

PersonalTasksIndex.layout = page => <Layout title='Tareas Personales'>{page}</Layout>;

export default PersonalTasksIndex;
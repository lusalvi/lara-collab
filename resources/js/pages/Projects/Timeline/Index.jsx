import Layout from '@/layouts/MainLayout';
import { redirectTo } from '@/utils/route';
import { router, usePage } from '@inertiajs/react';
import { ActionIcon, Button, Group, ScrollArea, Title, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconLayoutList } from '@tabler/icons-react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);
import { useEffect, useMemo, useRef, useState } from 'react';
import './css/timeline.css';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar/Sidebar';
import Header from './components/Header';
import Grid from './components/Grid';
import Bars from './components/Bars';

dayjs.extend(isoWeek);
dayjs.extend(quarterOfYear);

let currentProject = null;

// --- Configuración de cada modo de zoom -------------------------------
// unit: la unidad de tiempo que representa UNA columna de la grilla.
// dayWidth: ancho por día DENTRO del período (la columna se estira según
//   cuántos días tenga ese período específico: un mes de 31 no mide igual que uno de 28).
// groupFormat: cómo se agrupan las columnas en el header superior (año).
// showSubHeader: si hay una fila de días bajo el header (solo texto informativo,
//   sin bordes de grilla — se usa en "week").
const ZOOM_CONFIG = {
  week: {
    unit: 'isoWeek',
    dayWidth: 24, // 7 días × 24px ≈ 168px por semana
    groupFormat: 'MMMM YYYY',
    showSubHeader: true,
  },
  month: {
    unit: 'month',
    dayWidth: 5, // mes de 30 días ≈ 150px
    groupFormat: 'YYYY',
    showSubHeader: false,
  },
  quarter: {
    unit: 'quarter',
    dayWidth: 1.4, // trimestre de ~91 días ≈ 127px
    groupFormat: 'YYYY',
    showSubHeader: false,
  },
};

function buildRange(tasks) {
  const today = dayjs().startOf('day');

  // Mostrar siempre desde 1 mes atrás hasta 2 años adelante
  let start = today.subtract(1, 'month');
  let end = today.add(2, 'year');

  // Si existen tareas fuera de ese rango, extenderlo
  tasks.forEach(task => {
    if (task.start_on && dayjs(task.start_on).isBefore(start)) {
      start = dayjs(task.start_on);
    }

    if (task.due_on && dayjs(task.due_on).isAfter(end)) {
      end = dayjs(task.due_on);
    }
  });

  return {
    start: start.startOf('month'),
    end: end.endOf('month'),
  };
}

// Genera un array de columnas donde cada una representa un período completo
// (semana / mes / trimestre) según el zoom, en vez de un día individual.
function buildPeriodColumns(start, end, config) {
  const columns = [];
  let cursor;

  if (config.unit === 'isoWeek') {
    cursor = start.startOf('isoWeek');
  } else if (config.unit === 'month') {
    cursor = start.startOf('month');
  } else {
    cursor = start.startOf('quarter');
  }

  const rangeEnd =
    config.unit === 'isoWeek'
      ? end.endOf('isoWeek')
      : config.unit === 'month'
        ? end.endOf('month')
        : end.endOf('quarter');

  while (cursor.isBefore(rangeEnd) || cursor.isSame(rangeEnd, 'day')) {
    let periodEnd;

    if (config.unit === 'isoWeek') {
      periodEnd = cursor.endOf('isoWeek');
    } else if (config.unit === 'month') {
      periodEnd = cursor.endOf('month');
    } else {
      periodEnd = cursor.endOf('quarter');
    }

    columns.push({
      start: cursor,
      end: periodEnd,
      days: periodEnd.diff(cursor, 'day') + 1,
    });

    cursor = periodEnd.add(1, 'day');
  }

  return columns;
}

// Agrupa columnas consecutivas que comparten el mismo "format" (ej: mismo año)
// para dibujar la fila superior del header.
function buildGroupedHeader(columnStarts, format) {
  const groups = [];
  columnStarts.forEach(start => {
    const key = start.format(format);
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.count += 1;
    } else {
      groups.push({ key, count: 1, label: key });
    }
  });
  return groups;
}

export default function TimelineIndex() {
  const { project, tasks: initialTasks, taskGroups } = usePage().props;
  const [tasks, setTasks] = useState(initialTasks);
  currentProject = project;

  const [zoom, setZoom] = useState('month');
  const config = ZOOM_CONFIG[zoom];

  const { start, end } = useMemo(() => buildRange(tasks), [tasks]);

  const periodColumns = useMemo(() => buildPeriodColumns(start, end, config), [start, end, config]);

  const groupedHeader = useMemo(
    () =>
      buildGroupedHeader(
        periodColumns.map(c => c.start),
        config.groupFormat
      ),
    [periodColumns, config.groupFormat]
  );

  const totalWidth = useMemo(
    () => periodColumns.reduce((sum, col) => sum + col.days * config.dayWidth, 0),
    [periodColumns, config.dayWidth]
  );

  const today = dayjs().startOf('day');
  const todayOffset = today.diff(start, 'day') * config.dayWidth;

  const ganttScrollRef = useRef(null);
  const listScrollRef = useRef(null);

  const syncScroll = (source, targetRef) => {
    if (!targetRef.current) return;
    targetRef.current.scrollTop = source.scrollTop;
  };

  const scrollToToday = () => {
    if (!ganttScrollRef.current) return;
    const container = ganttScrollRef.current;
    const targetLeft = Math.max(todayOffset - container.clientWidth / 2, 0);
    container.scrollTo({ left: targetLeft, behavior: 'smooth' });
  };

  const handleTaskChange = (taskId, changes) => {
    setTasks(prev => prev.map(task => (task.id === taskId ? { ...task, ...changes } : task)));
  };

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    scrollToToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const [columns, setColumns] = useState(INITIAL_COLUMNS);

  const listWidth = columns.activity + columns.assignee + columns.status;

  const resizingPanel = useRef(false);
  const resizingColumn = useRef(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const dragStartColumns = useRef(null);

  const startPanelResize = e => {
    e.preventDefault();
    resizingPanel.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = columns.activity + columns.assignee + columns.status;
    dragStartColumns.current = { ...columns };
    document.body.style.cursor = 'col-resize';
  };

  const startColumnResize = column => e => {
    e.preventDefault();
    e.stopPropagation();
    resizingColumn.current = column;
    dragStartX.current = e.clientX;
    dragStartWidth.current = columns[column];
    document.body.style.cursor = 'col-resize';
  };

  useEffect(() => {
    const handleMouseMove = e => {
      const delta = e.clientX - dragStartX.current;

      if (resizingColumn.current) {
        const column = resizingColumn.current;
        const newWidth = Math.max(dragStartWidth.current + delta, MIN_COLUMNS[column]);
        setColumns(prev => ({ ...prev, [column]: newWidth }));
      }

      if (resizingPanel.current) {
        const newPanelWidth = dragStartWidth.current + delta;

        const initial = dragStartColumns.current;

        const initialWidth = initial.activity + initial.assignee + initial.status;

        const factor = newPanelWidth / initialWidth;

        const next = {
          activity: Math.max(initial.activity * factor, MIN_COLUMNS.activity),
          assignee: Math.max(initial.assignee * factor, MIN_COLUMNS.assignee),
          status: Math.max(initial.status * factor, MIN_COLUMNS.status),
        };

        setColumns(next);
      }
    };

    const handleMouseUp = () => {
      resizingPanel.current = false;
      resizingColumn.current = null;
      document.body.style.cursor = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div>
        <Button
          variant='transparent'
          radius='xl'
          size='sm'
          color='gray'
          pl={0}
          leftSection={<IconArrowLeft size={14} />}
          onClick={() => router.get(route('projects.tasks', project.id))}
        >
          Back to tasks
        </Button>

        <Group
          justify='space-between'
          align='end'
          mt={4}
          mb='lg'
        >
          <Title order={1}>{project.name}</Title>

          <Group>
            <Tooltip
              label='Vista de tareas'
              openDelay={500}
              withArrow
            >
              <ActionIcon
                variant='default'
                size='lg'
                onClick={() => redirectTo('projects.tasks', project.id)}
              >
                <IconLayoutList
                  style={{ width: '60%', height: '60%' }}
                  stroke={1.5}
                />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </div>

      <div className='timeline-wrapper'>
        <Sidebar
          project={project}
          tasks={tasks}
          taskGroups={taskGroups}
          columns={columns}
          onTaskChange={handleTaskChange}
          listWidth={listWidth}
          listScrollRef={listScrollRef}
          ganttScrollRef={ganttScrollRef}
          syncScroll={syncScroll}
          startColumnResize={startColumnResize}
        />

        <div
          className='timeline-panel-resize-handle'
          onMouseDown={startPanelResize}
        />

        <div className='timeline-gantt'>
          <Toolbar
            zoom={zoom}
            setZoom={setZoom}
            scrollToToday={scrollToToday}
          />

          <ScrollArea
            type='auto'
            viewportRef={ganttScrollRef}
            onScrollPositionChange={() => syncScroll(ganttScrollRef.current, listScrollRef)}
          >
            <div
              className='timeline-gantt-inner'
              style={{ width: totalWidth }}
            >
              <Header
                groupedHeader={groupedHeader}
                periodColumns={periodColumns}
                config={config}
                today={today}
              />

              <div
                className='timeline-body'
                style={{ height: Math.max(tasks.length * 44, 120) }}
              >
                <Grid
                  periodColumns={periodColumns}
                  config={config}
                />

                <div
                  className='timeline-today-line'
                  style={{ left: todayOffset }}
                />

                <Bars
                  tasks={tasks}
                  start={start}
                  config={config}
                  project={project}
                />
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

TimelineIndex.layout = page => <Layout title={currentProject?.name}>{page}</Layout>;

const MIN_COLUMNS = {
  activity: 180,
  assignee: 150,
  status: 140,
};

const INITIAL_COLUMNS = {
  activity: 260,
  assignee: 180,
  status: 150,
};

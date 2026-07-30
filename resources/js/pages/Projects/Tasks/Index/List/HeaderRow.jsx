import { Checkbox } from '@mantine/core';

import ColumnHeader from './Components/ColumnHeader';
import ResizeHandle from './Components/ResizeHandle';

import classes from './ListView.module.css';

export default function HeaderRow({ widths, setWidth }) {
  return (
    <div className={`${classes.row} ${classes.header}`}>
      <div className={classes.dragHandle}></div>

      <div className={classes.checkbox}>
        <Checkbox size="xs" />
      </div>

      <ColumnHeader
        className={classes.key}
        title="N°"
      />

      <ColumnHeader
        className={classes.summary}
        title="Tarea"
      >
        <ResizeHandle
          column="summary"
          width={widths.summary}
          onResize={setWidth}
        />
      </ColumnHeader>

      <ColumnHeader
        className={classes.assignee}
        title="Responsable"
      />

      <ColumnHeader
        className={classes.priority}
        title="Prioridad"
      />

      <ColumnHeader
        className={classes.status}
        title="Estado"
      />

      <ColumnHeader
        className={classes.due}
        title="Vencimiento"
      />

      <div className={classes.actions}></div>
    </div>
  );
}
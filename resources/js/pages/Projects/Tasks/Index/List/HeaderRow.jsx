import { Checkbox } from '@mantine/core';

import ColumnHeader from './Components/ColumnHeader';

import classes from './ListView.module.css';

export default function HeaderRow() {
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
      />

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
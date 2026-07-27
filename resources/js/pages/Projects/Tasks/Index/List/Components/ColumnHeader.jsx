import { Text } from '@mantine/core';

import classes from '../ListView.module.css';

export default function ColumnHeader({
  title,
  className,
  children,
}) {
  return (
    <div className={className}>
      <div className={classes.columnHeader}>
        <Text className={classes.headerText}>
          {title}
        </Text>

        {children}
      </div>
    </div>
  );
}
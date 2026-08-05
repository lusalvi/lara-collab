import { Paper } from '@mantine/core';
import classes from './css/ContainerBox.module.css';

export default function ContainerBox({ children, ...props }) {
  return (
    <Paper
      px={{ base: 'md', sm: 'lg', md: 40 }}
      py={{ base: 'md', sm: 'xl', md: 30 }}
      className={classes.box}
      {...props}
    >
      {children}
    </Paper>
  );
}
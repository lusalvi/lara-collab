import { Pill } from "@mantine/core";
import { forwardRef } from "react";
import { getGroupSelectColorName } from "@/utils/taskGroupColors";
 
export default forwardRef(function TaskGroupLabel({ taskGroup, children, ...props }, ref) {
  const colorName = taskGroup ? getGroupSelectColorName(taskGroup) : 'gray';
  
  const colorMap = {
    gray: { light: 'gray.1', dark: 'gray.8' },
    blue: { light: 'blue.1', dark: 'blue.8' },
    yellow: { light: 'yellow.1', dark: 'yellow.8' },
    green: { light: 'green.1', dark: 'green.8' },
    red: { light: 'red.1', dark: 'red.8' },
  };
  
  const colors = colorMap[colorName] || colorMap.gray;
 
  return (
    <Pill
      ref={ref}
      size="xs"
      bg={`var(--mantine-color-${colorName}-1)`}
      c={`var(--mantine-color-${colorName}-8)`}
      fw={600}
      {...props}
    >
      {children}
    </Pill>
  );
});
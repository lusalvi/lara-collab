import dayjs from "dayjs";

export const isOverdue = (task) => {
  if (!task.due_on || task.completed_at) return false;
  
  // Crear una fecha con la string ISO, interpretar como UTC
  // Luego comparar solo la fecha (ignorar hora)
  const taskDate = new Date(task.due_on);
  const today = new Date();
  
  // Comparar solo las fechas (sin hora)
  const taskDateOnly = new Date(taskDate.getUTCFullYear(), taskDate.getUTCMonth(), taskDate.getUTCDate());
  const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  return todayDateOnly > taskDateOnly;
};

export const isDueSoon = (task) => {
  if (!task.due_on || task.completed_at) return false;
  
  // Mañana según UTC
  const taskDate = new Date(task.due_on);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Comparar solo las fechas (sin hora)
  const taskDateOnly = new Date(taskDate.getUTCFullYear(), taskDate.getUTCMonth(), taskDate.getUTCDate());
  const tomorrowDateOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());
  
  return taskDateOnly.getTime() === tomorrowDateOnly.getTime();
};
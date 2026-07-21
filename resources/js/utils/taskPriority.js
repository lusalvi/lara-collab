export const priorityConfig = {
  1: { color: "red", label: "Alta" },
  2: { color: "yellow", label: "Media" },
  3: { color: "emerald", label: "Baja" },
};

export function getTaskPriorityConfig(priority) {
  if (!priority || !priorityConfig[priority]) {
    return null;
  }

  return priorityConfig[priority];
}

export function getTaskPriorityOptions() {
  return Object.entries(priorityConfig).map(([value, config]) => ({
    value: value.toString(),
    label: config.label,
    color: config.color,
  }));
}


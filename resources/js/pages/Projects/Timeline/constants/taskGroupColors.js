
export const DEFAULT_GROUP_COLOR_NAMES = {
  backlog: 'gray',
  'por hacer': 'gray',
  todo: 'gray',

  'en curso': 'blue',
  'in progress': 'blue',

  'en revisión': 'yellow',
  review: 'yellow',

  finalizado: 'green',
  done: 'green',

  desplegado: 'cyan',
  deployed: 'cyan',
};

const FALLBACK_COLOR_NAME = 'gray';

function resolveColorName(groupName) {
  const normalized = groupName?.trim().toLowerCase();
  return DEFAULT_GROUP_COLOR_NAMES[normalized] || FALLBACK_COLOR_NAME;
}

export function getGroupBarColor(group) {
  if (group?.color) return group.color;

  const colorName = resolveColorName(group?.name);
  return `var(--mantine-color-${colorName}-5)`;
}

export function getGroupSelectColorName(group) {
  if (group?.color) return group.color;

  return resolveColorName(group?.name);
}
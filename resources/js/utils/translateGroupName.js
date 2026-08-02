const GROUP_NAME_TRANSLATIONS = {
  Backlog: "Backlog",
  Todo: "Por hacer",
  "In progress": "En curso",
  QA: "En revisión",
  Done: "Finalizado",
};

export default function translateGroupName(name) {
  return GROUP_NAME_TRANSLATIONS[name] ?? name;
}
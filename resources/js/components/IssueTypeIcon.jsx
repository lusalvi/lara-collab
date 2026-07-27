import {
  IconBolt,
  IconBookmark,
  IconFileDescription,
  IconHierarchy2,
} from "@tabler/icons-react";

export default function IssueTypeIcon({ type, size = 18 }) {
  switch (type) {
    case "Epica":
      return (
        <IconBolt
          size={size}
          color="#8B5CF6"
          stroke={2}
        />
      );

    case "Historia":
      return (
        <IconBookmark
          size={size}
          color="#10B981"
          stroke={2}
        />
      );

    case "Tarea":
      return (
        <IconFileDescription
          size={size}
          color="#2563EB"
          stroke={2}
        />
      );

    case "Subtarea":
      return (
        <IconHierarchy2
          size={size}
          color="#6B7280"
          stroke={2}
        />
      );

    default:
      return (
        <IconFileDescription
          size={size}
          color="#6B7280"
          stroke={2}
        />
      );
  }
}
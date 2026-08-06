import IssueTypeIcon from "@/components/IssueTypeIcon";
import { isOverdue } from "@/utils/task";
import { shortName } from "@/utils/user";

import {
  Button,
  Checkbox,
  Group,
  Pill,
  Text,
  Tooltip,
} from "@mantine/core";

import {
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";

import classes from "../Task/css/TaskRow.module.css";
import TaskActions from "../TaskActions";

export default function ArchivedTask({
  task,
  depth = 0,
  hasChildren = false,
  collapsed = false,
  onToggle,
  selectable = false,
  selected = false,
  onToggleSelect,
}) {
  const paddingLeft = depth * 24;

  const ToggleButton = hasChildren ? (
    <Button
      variant="subtle"
      size="xs"
      p={0}
      w={24}
      h={24}
      onClick={onToggle}
    >
      {collapsed ? (
        <IconChevronRight size={16} />
      ) : (
        <IconChevronDown size={16} />
      )}
    </Button>
  ) : (
    <div style={{ width: 24 }} />
  );

  const CheckboxOrSpace = selectable ? (
    <Checkbox
      checked={selected}
      onChange={() => onToggleSelect(task.id)}
    />
  ) : (
    <div style={{ width: 18 }} />
  );

  return (
    <div
      className={classes.archivedCard}
      style={{ marginLeft: paddingLeft }}
    >
      <div className={classes.archivedHeader}>
        <Group gap="xs" wrap="nowrap">
          {ToggleButton}

          {CheckboxOrSpace}

          <IssueTypeIcon
            type={task.issue_type}
            size={16}
          />

          <Text fw={600}>
            #{task.number}
          </Text>
        </Group>

        <TaskActions task={task} />
      </div>

      <Text
        className={classes.archivedName}
        fw={500}
        c={
          isOverdue(task) && task.completed_at === null
            ? "red"
            : undefined
        }
      >
        {task.name}
      </Text>

      <div className={classes.archivedFooter}>
        {task.assigned_to_user ? (
          <Tooltip
            label={task.assigned_to_user.name}
            withArrow
          >
            <Pill
              size="sm"
              className={classes.user}
            >
              {shortName(task.assigned_to_user.name)}
            </Pill>
          </Tooltip>
        ) : (
          <Text
            size="xs"
            c="dimmed"
          >
            Sin responsable
          </Text>
        )}
      </div>
    </div>
  );
}
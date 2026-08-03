import { Label } from "@/components/Label";
import IssueTypeIcon from "@/components/IssueTypeIcon";
import { isOverdue } from "@/utils/task";
import { shortName } from "@/utils/user";
import { Link } from "@inertiajs/react";
import { Checkbox, Flex, Group, Pill, Text, Tooltip, Button } from "@mantine/core";
import { IconChevronRight, IconChevronDown } from "@tabler/icons-react";
import classes from "../Task/css/TaskRow.module.css";
import TaskActions from "../TaskActions";

export default function ArchivedTask({ task, depth = 0, hasChildren = false, collapsed = false, onToggle }) {
  const paddingLeft = depth * 24;

  return (
    <Flex 
      className={`${classes.task} ${task.completed_at !== null && classes.completed}`}
      style={{ paddingLeft: `${paddingLeft}px` }}
      gap="xs"
      align="center"
    >
      {hasChildren && (
        <Button
          variant="subtle"
          size="xs"
          p={0}
          w={24}
          h={24}
          onClick={onToggle}
          title={collapsed ? "Expandir" : "Contraer"}
        >
          {collapsed ? (
            <IconChevronRight size={16} />
          ) : (
            <IconChevronDown size={16} />
          )}
        </Button>
      )}
      {!hasChildren && <div style={{ width: 24 }} />}

      <Group gap="sm" flex={1} wrap="nowrap">
        <Checkbox
          size="sm"
          radius="xl"
          color="green"
          defaultChecked={task.completed_at !== null}
          className={classes.disabledCheckbox}
        />

        <IssueTypeIcon type={task.issue_type} size={16} />

        {task.assigned_to_user && (
          <Link href={route("users.edit", task.assigned_to_user.id)}>
            <Tooltip label={task.assigned_to_user.name} openDelay={1000} withArrow>
              <Pill size="sm" className={classes.user}>
                {shortName(task.assigned_to_user.name)}
              </Pill>
            </Tooltip>
          </Link>
        )}

        <Text
          key={task.id}
          className={classes.name}
          style={{ cursor: "default" }}
          size="sm"
          fw={500}
          c={isOverdue(task) && task.completed_at === null ? "red" : ""}
          flex={1}
        >
          #{task.number + ": " + task.name}
        </Text>

        <Group gap={12} ml={8} wrap="nowrap">
          {task.labels.map((label) => (
            <Label key={label.id} name={label.name} color={label.color} />
          ))}
        </Group>

        <TaskActions task={task} />
      </Group>
    </Flex>
  );
}
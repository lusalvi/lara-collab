import { Group, Text } from "@mantine/core";
import TaskGroupActions from "../TaskGroupActions";
import classes from "../css/TaskGroup.module.css";
import translateGroupName from "@/utils/translateGroupName";

export default function ArchivedTaskGroup({ group }) {
  return (
    <div className={classes.group}>
      <Group>
        <Text size="xl" fw={700}>
          {translateGroupName(group.name)}
        </Text>
        <TaskGroupActions group={group} className={classes.actions} />
      </Group>
    </div>
  );
}

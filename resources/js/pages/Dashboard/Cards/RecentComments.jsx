import Card from "@/components/Card";
import EmptyWithIcon from "@/components/EmptyWithIcon";
import { dateTime, diffForHumans } from "@/utils/datetime";
import { redirectTo } from "@/utils/route";
import {
  Avatar,
  Box,
  Center,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconMessage } from "@tabler/icons-react";
import classes from "./css/RecentComments.module.css";

export default function RecentComments({ comments }) {
  return (
    <Card bg="none">
      <Group gap={10} wrap="nowrap" className={classes.highlight}>
        <ThemeIcon size={28} radius="md" variant="light" color="hospitalSecondary">
          <IconMessage size={16} />
        </ThemeIcon>
        <Title order={4} fz={15}>
          Comentarios recientes
        </Title>
      </Group>

      <Divider my={14} />

      {comments.length > 0 ? (
        <ScrollArea h={300} scrollbarSize={7}>
          <Stack gap={6}>
            {comments.map((comment) => (
              <Box
                key={comment.id}
                className={classes.item}
                onClick={() =>
                  redirectTo("projects.tasks.open", [comment.task.project_id, comment.task_id])
                }
              >
                <Group justify="space-between">
                  <Group gap="xs" align="start">
                    <Avatar src={comment.user.avatar} radius="xl" color="hospitalPrimary" />
                    <div>
                      <Text size="sm" c="hospitalPrimary" fw={600}>
                        {comment.user.name}
                      </Text>
                      <Text fz={11} fw={500} c="dimmed">
                        {comment.task.project.name}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label={dateTime(comment.created_at)} openDelay={250} withArrow>
                    <Text size="xs">{diffForHumans(comment.created_at)}</Text>
                  </Tooltip>
                </Group>
                <Text
                  pl={49}
                  fz={11}
                  mt={5}
                  className={classes.comment}
                  dangerouslySetInnerHTML={{ __html: comment.content }}
                ></Text>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      ) : (
        <Center my={30}>
          <EmptyWithIcon title="No comments" subtitle="On your tasks" icon={IconMessage} />
        </Center>
      )}
    </Card>
  );
}
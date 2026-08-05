import { openConfirmModal } from "@/components/ConfirmModal";
import useForm from "@/hooks/useForm";
import { router } from "@inertiajs/react";
import { ActionIcon, Menu, rem } from "@mantine/core";
import { IconArchive, IconArchiveOff, IconDots, IconPencil, IconUsers } from "@tabler/icons-react";
import UserAccessModal from "./Modals/UserAccessModal.jsx";

export default function ProjectCardActions({ item }) {
  const [archiveForm] = useForm("delete", route("projects.destroy", item.id));
  const [restoreForm] = useForm("post", route("projects.restore", item.id));

  const openArchiveModal = () =>
    openConfirmModal({
      type: "danger",
      title: "Archivar proyecto",
      content: `¿Estás seguro de que deseas archivar este proyecto? Los usuarios no podrán acceder a él hasta que se restaure.`,
      confirmLabel: "Archivar",
      confirmProps: { color: "red" },
      onConfirm: () => archiveForm.submit({ preserveScroll: true }),
    });

  const openRestoreModal = () =>
    openConfirmModal({
      type: "info",
      title: "Restaurar proyecto",
      content: `¿Estás seguro de que deseas restaurar este proyecto?`,
      confirmLabel: "Restaurar",
      confirmProps: { color: "hospitalPrimary" },
      onConfirm: () => restoreForm.submit({ preserveScroll: true }),
    });

  const openUserAccess = () => UserAccessModal(item);

  return (
    <>
      {(can("edit project user access") ||
        can("edit project") ||
        can("restore project") ||
        can("archive project")) && (
        <Menu
          withArrow
          position="bottom-end"
          shadow="md"
          transitionProps={{ duration: 100, transition: "pop-top-right" }}
          offset={{ mainAxis: 3, alignmentAxis: 5 }}
          data-ignore-link
        >
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" data-ignore-link>
              <IconDots style={{ width: rem(20), height: rem(20) }} stroke={1.5} data-ignore-link />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {can("edit project user access") && (
              <Menu.Item
                leftSection={
                  <IconUsers
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    data-ignore-link
                  />
                }
                onClick={openUserAccess}
                data-ignore-link
              >
                Administrar acceso
              </Menu.Item>
            )}
            {can("edit project") && (
              <Menu.Item
                leftSection={
                  <IconPencil
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    data-ignore-link
                  />
                }
                onClick={() => router.visit(route("projects.edit", item.id))}
                data-ignore-link
              >
                Editar
              </Menu.Item>
            )}
            {can("restore project") && route().params.archived && (
              <Menu.Item
                leftSection={
                  <IconArchiveOff
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    data-ignore-link
                  />
                }
                color="hospitalPrimary"
                onClick={openRestoreModal}
                data-ignore-link
              >
                Restaurar
              </Menu.Item>
            )}
            {can("archive project") && !route().params.archived && (
              <Menu.Item
                leftSection={
                  <IconArchive
                    style={{ width: rem(16), height: rem(16) }}
                    stroke={1.5}
                    data-ignore-link
                  />
                }
                color="red"
                onClick={openArchiveModal}
                data-ignore-link
              >
                Archivar
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );
}

import { isImage, isViewable } from "@/utils/file";
import { Group, SimpleGrid, Text, rem } from "@mantine/core";
import { Dropzone as MantineDropzone } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { IconFiles, IconUpload, IconX } from "@tabler/icons-react";
import JsFileDownloader from "js-file-downloader";
import { useState } from "react";
import { openConfirmModal } from "./ConfirmModal";
import FileThumbnail from "./FileThumbnail";
import ImageModal from "./ImageModal";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function Dropzone({ selected, onChange, remove, ...props }) {
  const [opened, { close, open }] = useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectedFiles, setRejectedFiles] = useState([]);

  const confirmDeleteAttachment = (index) => {
    openConfirmModal({
      type: "danger",
      title: "Delete attachment",
      content: `Are you sure you want to delete this attachment?`,
      confirmLabel: "Delete",
      confirmProps: { color: "red" },
      onConfirm: () => remove(index),
    });
  };

  const openFile = (file) => {
    if (isImage(file)) {
      setSelectedImage(file);
      open();
    } else if (isViewable(file)) {
      window.open(file.path, "_blank");
    } else {
      new JsFileDownloader({
        url: file.path,
        filename: file.name,
        contentType: file.type,
        nativeFallbackOnError: true,
      }).catch((error) => console.error("Failed to download file", error));
    }
  };

  const handleReject = (files) => {
    setRejectedFiles(files.map((f) => f.file.name));
    setTimeout(() => setRejectedFiles([]), 4000);
  };

  return (
    <>
      <ImageModal image={selectedImage} opened={opened} close={close} />

      <MantineDropzone
        onDrop={(files) => {
          setRejectedFiles([]);
          onChange([...selected, ...files]);
        }}
        onReject={handleReject}
        maxSize={MAX_FILE_SIZE_BYTES}
        {...props}
      >
        <Group justify="center" gap="md" mih={50} style={{ pointerEvents: "none" }}>
          <MantineDropzone.Accept>
            <IconUpload
              style={{
                width: rem(42),
                height: rem(42),
                color: "var(--mantine-color-hospitalPrimary-6)",
              }}
              stroke={1.5}
            />
          </MantineDropzone.Accept>
          <MantineDropzone.Reject>
            <IconX
              style={{
                width: rem(42),
                height: rem(42),
                color: "var(--mantine-color-red-6)",
              }}
              stroke={1.5}
            />
          </MantineDropzone.Reject>
          <MantineDropzone.Idle>
            <IconFiles
              style={{
                width: rem(42),
                height: rem(42),
                color: "var(--mantine-color-dimmed)",
              }}
              stroke={1.5}
            />
          </MantineDropzone.Idle>

          <div>
            <Text size="md" inline>
              Arrastrá archivos acá o hacé clic para seleccionar
            </Text>
            <Text size="xs" c="dimmed" inline mt={7}>
              Máximo {MAX_FILE_SIZE_MB} MB por archivo
            </Text>
          </div>
        </Group>
      </MantineDropzone>

      {rejectedFiles.length > 0 && (
        <Text size="xs" c="red" mt="xs">
          {rejectedFiles.length === 1
            ? `"${rejectedFiles[0]}" supera el límite de ${MAX_FILE_SIZE_MB} MB y no fue agregado.`
            : `${rejectedFiles.length} archivos superan el límite de ${MAX_FILE_SIZE_MB} MB y no fueron agregados.`}
        </Text>
      )}

      <SimpleGrid cols={2} mt="lg">
        {selected.map((file, index) => (
          <FileThumbnail
            key={index}
            index={index}
            file={file}
            remove={() => confirmDeleteAttachment(index)}
            open={() => openFile(file)}
          />
        ))}
      </SimpleGrid>
    </>
  );
}

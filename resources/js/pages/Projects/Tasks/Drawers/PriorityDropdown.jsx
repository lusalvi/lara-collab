import { usePage } from '@inertiajs/react';
import {
  Box,
  ColorSwatch,
  Combobox,
  Group,
  Input,
  InputBase,
  Text,
  useCombobox,
} from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export default function PriorityDropdown({ value, onChange, ...props }) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const { priorities } = usePage().props;
  const selectedPriority = priorities?.find((p) => p.id === value);

  const handleSelect = (val) => {
    onChange(val ? Number(val) : null);
    combobox.closeDropdown();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <Box {...props}>
      <Input.Label>Prioridad</Input.Label>
      <Combobox
        store={combobox}
        onOptionSubmit={handleSelect}
        withinPortal={false}
        disabled={!can('edit task')}
      >
        <Combobox.Target>
          <InputBase
            component='button'
            type='button'
            pointer
            onClick={() => combobox.toggleDropdown()}
            rightSection={
              selectedPriority && can('edit task') ? (
                <IconX
                  size={14}
                  style={{ cursor: 'pointer' }}
                  onClick={handleClear}
                />
              ) : (
                <Combobox.Chevron />
              )
            }
            rightSectionPointerEvents={selectedPriority ? 'all' : 'none'}
          >
            {selectedPriority ? (
              <Group gap={7}>
                <ColorSwatch
                  color={selectedPriority.color}
                  size={10}
                />
                <Text size='sm'>{selectedPriority.label}</Text>
              </Group>
            ) : (
              <Input.Placeholder>Selecciona el nivel</Input.Placeholder>
            )}
          </InputBase>
        </Combobox.Target>

        <Combobox.Dropdown>
          <Combobox.Options>
            {priorities?.map((priority) => (
              <Combobox.Option
                value={priority.id.toString()}
                key={priority.id}
                active={value === priority.id}
              >
                <Group gap={7}>
                  <ColorSwatch
                    color={priority.color}
                    size={10}
                  />
                  <Text size='sm'>{priority.label}</Text>
                </Group>
              </Combobox.Option>
            ))}
          </Combobox.Options>
        </Combobox.Dropdown>
      </Combobox>
    </Box>
  );
}

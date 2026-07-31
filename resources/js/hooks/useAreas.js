import { usePage } from '@inertiajs/react';

export default function useAreas() {
  const { areas } = usePage().props.shared;

  const getDropdownValues = () => {
    return (areas ?? []).map(area => ({
      value: String(area.id),
      label: area.name,
    }));
  };

  return { areas, getDropdownValues };
}
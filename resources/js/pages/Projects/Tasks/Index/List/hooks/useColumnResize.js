import { useState } from 'react';

const DEFAULT_WIDTHS = {
  key: 50,
  summary: 450,
  creator: 180,
  assignee: 180,
  priority: 140,
  status: 160,
  due: 140,
};

export default function useColumnResize() {
  const [widths, setWidths] = useState(DEFAULT_WIDTHS);

  const setWidth = (column, width) => {
    setWidths(prev => ({
      ...prev,
      [column]: Math.max(width, 120), // ancho mínimo
    }));
  };

  return {
    widths,
    setWidth,
  };
}
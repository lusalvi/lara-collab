import { useCallback, useEffect, useRef, useState } from 'react';

import classes from '../ListView.module.css';

export default function ResizeHandle({ column, width, onResize }) {
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handlePointerDown = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();

      startXRef.current = e.clientX;
      startWidthRef.current = width;
      setIsDragging(true);
    },
    [width]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = e => {
      const delta = e.clientX - startXRef.current;
      onResize(column, startWidthRef.current + delta);
    };

    const handlePointerUp = () => setIsDragging(false);

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, column, onResize]);

  return (
    <div
      className={`${classes.resizeHandle} ${isDragging ? classes.resizeHandleActive : ''}`}
      onPointerDown={handlePointerDown}
      onClick={e => e.stopPropagation()}
    />
  );
}
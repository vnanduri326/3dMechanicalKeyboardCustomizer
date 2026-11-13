import { useCallback, useEffect, useRef, useState } from 'react';

interface Options {
  initial?: number;
  min?: number;
  maxFraction?: number; // 1/3 of the viewport by default
  side?: 'left' | 'right';
}

export function useResizablePanel({
  initial = 288,
  min = 220,
  maxFraction = 1 / 3,
  side = 'left',
}: Options = {}) {
  const [width, setWidth] = useState(initial);
  const [dragging, setDragging] = useState(false);
  const start = useRef({ x: 0, w: 0 });

  const getMax = useCallback(
    () => Math.max(min, Math.floor(window.innerWidth * maxFraction)),
    [min, maxFraction]
  );
  const clamp = useCallback(
    (w: number) => Math.min(Math.max(w, min), getMax()),
    [min, getMax]
  );

  // Re-clamp when the window shrinks so the panel never exceeds 1/3
  useEffect(() => {
    const onResize = () => setWidth((w) => clamp(w));
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [clamp]);

  // Prevent text selection while dragging
  useEffect(() => {
    if (!dragging) return;
    const prev = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      document.body.style.userSelect = prev;
      document.body.style.cursor = '';
    };
  }, [dragging]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    start.current = { x: e.clientX, w: width };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const delta = e.clientX - start.current.x;
    setWidth(clamp(side === 'left' ? start.current.w + delta : start.current.w - delta));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };

  // Keyboard resizing for accessibility
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 40 : 10;
    if (e.key === 'ArrowLeft') setWidth((w) => clamp(side === 'left' ? w - step : w + step));
    if (e.key === 'ArrowRight') setWidth((w) => clamp(side === 'left' ? w + step : w - step));
  };

  return {
    width,
    dragging,
    min,
    max: getMax(),
    handleProps: { onPointerDown, onPointerMove, onPointerUp, onKeyDown },
  };
}
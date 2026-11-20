import { useEffect, useState, type KeyboardEvent, type PointerEvent } from 'react';

interface UseResizablePanelOptions {
    side: 'left' | 'right';
    initial: number;
    min: number;
}

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

export function useResizablePanel({ side, initial, min: requestedMin }: UseResizablePanelOptions) {
    const [viewportWidth, setViewportWidth] = useState(
        () => (typeof window === 'undefined' ? 1024 : window.innerWidth),
    );
    const max = Math.max(1, Math.floor(viewportWidth / 3));
    const min = Math.min(requestedMin, max);
    const [width, setWidth] = useState(() => clamp(initial, min, max));
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        const updateViewportWidth = () => setViewportWidth(window.innerWidth);
        window.addEventListener('resize', updateViewportWidth);
        return () => window.removeEventListener('resize', updateViewportWidth);
    }, []);

    useEffect(() => {
        setWidth((current) => clamp(current, min, max));
    }, [min, max]);

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!dragging) return;
        const nextWidth = side === 'right'
            ? window.innerWidth - event.clientX
            : event.clientX;
        setWidth(clamp(nextWidth, min, max));
    };

    const stopDragging = () => setDragging(false);

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        const step = event.shiftKey ? 40 : 10;
        if (event.key === 'Home') {
            event.preventDefault();
            setWidth(min);
        } else if (event.key === 'End') {
            event.preventDefault();
            setWidth(max);
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const direction = event.key === 'ArrowLeft' ? -1 : 1;
            const sideDirection = side === 'right' ? -direction : direction;
            setWidth((current) => clamp(current + sideDirection * step, min, max));
        }
    };

    return {
        width,
        dragging,
        min,
        max,
        handleProps: {
            onPointerDown: handlePointerDown,
            onPointerMove: handlePointerMove,
            onPointerUp: stopDragging,
            onPointerCancel: stopDragging,
            onLostPointerCapture: stopDragging,
            onKeyDown: handleKeyDown,
        },
    };
}

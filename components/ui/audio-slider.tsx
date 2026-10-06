"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

export const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

/* -------------------------------------------------------------------------- */
/*  Pointer-driven slider (used for waveform scrubber and volume control)      */
/* -------------------------------------------------------------------------- */

export interface SliderProps {
  value: number;
  max: number;
  step?: number;
  ariaLabel: string;
  ariaValueText?: string;
  className?: string;
  onChange: (value: number) => void;
  /** Fired once when the user releases pointer or finishes key press */
  onCommit?: (value: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
  children: (state: { percent: number; dragging: boolean }) => React.ReactNode;
}

export function Slider({
  value,
  max,
  step = 1,
  ariaLabel,
  ariaValueText,
  className,
  onChange,
  onCommit,
  onDraggingChange,
  children,
}: SliderProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);
  const latestRef = useRef(value);
  const [dragging, setDragging] = useState(false);

  const percent = max > 0 ? clamp((value / max) * 100, 0, 100) : 0;

  const valueFromPointer = (clientX: number) => {
    const el = rootRef.current;
    if (!el) return 0;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return 0;
    return clamp((clientX - rect.left) / rect.width, 0, 1) * max;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (max <= 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture is not supported
    }
    draggingRef.current = true;
    setDragging(true);
    onDraggingChange?.(true);
    const v = valueFromPointer(e.clientX);
    latestRef.current = v;
    onChange(v);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const v = valueFromPointer(e.clientX);
    latestRef.current = v;
    onChange(v);
  };

  const endDrag = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    onDraggingChange?.(false);
    onCommit?.(latestRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        next = value + step;
        break;
      case "ArrowLeft":
      case "ArrowDown":
        next = value - step;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = max;
        break;
    }
    if (next === null) return;
    e.preventDefault();
    next = clamp(next, 0, max);
    latestRef.current = next;
    onChange(next);
    onCommit?.(next);
  };

  return (
    <div
      ref={rootRef}
      role="slider"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(max)}
      aria-valuenow={Math.round(value)}
      aria-valuetext={ariaValueText}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative touch-none select-none cursor-pointer rounded-md outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}
    >
      {children({ percent, dragging })}
    </div>
  );
}

export const AudioSlider = Slider;

import React from "react";
import { createPortal } from "react-dom";
import {
  useFloatingToolbarSelectionState,
  useFloatingToolbarState,
} from "@udecode/plate-floating";
import { type PlateFloatingToolbarProps } from "@udecode/plate-floating/dist/components/PlateFloatingToolbar";

import { cn } from "@/lib/utils";

export interface FloatingToolbarProps
  extends PlateFloatingToolbarProps,
    React.HTMLAttributes<HTMLDivElement> {}

export function FloatingToolbar({
  open,
  portalElement,
  state,
  floatingOptions,
  placement = "top",
  selectionState,
  children,
  className,
  style,
  ...props
}: FloatingToolbarProps) {
  state = useFloatingToolbarState({
    open,
    state,
    floatingOptions: {
      placement,
      ...floatingOptions,
    },
  });

  selectionState = useFloatingToolbarSelectionState(selectionState);

  const isOpen = state.open && !selectionState.isCollapsed; 

  // Don't render if not open or selection is collapsed
  if (!isOpen) return null;

  const el = (
    <div
      className={cn(
        "fixed flex z-50 p-1 bg-white dark:bg-zinc-800 rounded-md border border-zinc-200 dark:border-zinc-700 shadow-md",
        className
      )}
      ref={state.refs.setFloating}
      style={{
        ...style,
        position: state.strategy,
        top: state.y ?? 0,
        left: state.x ?? 0,
      }}
      {...props}
    >
      {children}
    </div>
  );

  return portalElement ? createPortal(el, portalElement) : el;
} 
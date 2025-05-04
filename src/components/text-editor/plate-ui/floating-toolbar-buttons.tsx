import React from "react";
import { ToggleMarkButton, ToggleNodeButton } from "@udecode/plate-ui-toolbar";
import { MARK_BOLD, MARK_ITALIC, MARK_STRIKETHROUGH, MARK_UNDERLINE } from "@udecode/plate-basic-marks";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icons"; // Adjust if you don't have this component

export interface FloatingToolbarButtonsProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export function FloatingToolbarButtons({
  className,
  ...props
}: FloatingToolbarButtonsProps) {
  const iconClasses = "h-4 w-4";

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <ToggleMarkButton
        nodeType={MARK_BOLD}
        tooltip="Bold (⌘+B)"
        className="h-8 w-8 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm"
      >
        <Icons.bold className={iconClasses} />
      </ToggleMarkButton>
      
      <ToggleMarkButton
        nodeType={MARK_ITALIC}
        tooltip="Italic (⌘+I)"
        className="h-8 w-8 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm"
      >
        <Icons.italic className={iconClasses} />
      </ToggleMarkButton>
      
      <ToggleMarkButton
        nodeType={MARK_UNDERLINE}
        tooltip="Underline (⌘+U)"
        className="h-8 w-8 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm"
      >
        <Icons.underline className={iconClasses} />
      </ToggleMarkButton>
      
      <ToggleMarkButton
        nodeType={MARK_STRIKETHROUGH}
        tooltip="Strikethrough"
        className="h-8 w-8 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm"
      >
        <Icons.strikethrough className={iconClasses} />
      </ToggleMarkButton>
    </div>
  );
}

// Add ListToolbarButton component
export interface ListToolbarButtonProps {
  tooltip?: string;
  nodeType: string;
  children: React.ReactNode;
}

export function ListToolbarButton({
  tooltip,
  nodeType,
  children,
}: ListToolbarButtonProps) {
  return (
    <ToggleNodeButton
      nodeType={nodeType}
      tooltip={tooltip}
      className="h-8 w-8 p-1 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-sm"
    >
      {children}
    </ToggleNodeButton>
  );
} 
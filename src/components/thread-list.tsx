import type { FC } from "react";
// Remove imports from @assistant-ui/react
// import {
//   ThreadListItemPrimitive,
//   ThreadListPrimitive,
// } from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/tooltip-icon-button";

// Simplified ThreadList component that doesn't rely on @assistant-ui/react
export const ThreadList: FC = () => {
  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <Button className="flex items-center justify-start gap-1 rounded-lg px-2.5 py-2 text-start" variant="ghost">
        <PlusIcon />
        New Thread
      </Button>
      
      <div className="mt-2">
        <ThreadListItem title="New Chat" />
        <ThreadListItem title="Weather Discussion" />
        <ThreadListItem title="AI Design Patterns" />
      </div>
    </div>
  );
};

export default ThreadList;

// Simple thread list item component
const ThreadListItem: FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center gap-2 rounded-lg hover:bg-muted transition-all">
      <button className="flex-grow px-3 py-2 text-start">
        <p className="text-sm">{title}</p>
      </button>
      <TooltipIconButton
        className="ml-auto mr-3 size-4 p-0 text-foreground hover:text-primary"
        variant="ghost"
        tooltip="Archive thread"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </div>
  );
};

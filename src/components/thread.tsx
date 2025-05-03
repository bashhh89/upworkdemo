import type { FC } from "react";
import {
  ArrowDownIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon,
  PencilIcon,
  RefreshCwIcon,
  SendHorizontalIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TooltipIconButton } from "@/components/tooltip-icon-button";

export const Thread: FC = () => {
  return (
    <div className="bg-background box-border flex h-full flex-col overflow-hidden">
      <div className="flex h-full flex-col items-center overflow-y-scroll scroll-smooth bg-inherit px-4 pt-8">
        <div className="flex w-full max-w-[42rem] flex-grow flex-col">
          <div className="flex w-full flex-grow flex-col items-center justify-center">
            <p className="mt-4 font-medium">
              How can I help you today?
            </p>
          </div>
          <div className="mt-3 flex w-full items-stretch justify-center gap-4">
            <div className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in">
              <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
                What is the weather in Tokyo?
              </span>
            </div>
            <div className="hover:bg-muted/80 flex max-w-sm grow basis-0 flex-col items-center justify-center rounded-lg border p-3 transition-colors ease-in">
              <span className="line-clamp-2 text-ellipsis text-sm font-semibold">
                What is assistant-ui?
              </span>
            </div>
          </div>
        </div>

        <div className="min-h-8 flex-grow"></div>

        <div className="sticky bottom-0 mt-3 flex w-full max-w-[42rem] flex-col items-center justify-end rounded-t-lg bg-inherit pb-4">
          <Button 
            variant="outline" 
            className="absolute -top-8 rounded-full"
          >
            <ArrowDownIcon />
          </Button>
          
          <div className="flex w-full flex-wrap items-end rounded-lg border bg-inherit px-2.5 shadow-sm transition-colors ease-in">
            <Textarea
              rows={1}
              autoFocus
              placeholder="Write a message..."
              className="placeholder:text-muted-foreground max-h-40 flex-grow resize-none border-none bg-transparent px-2 py-4 text-sm outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
            <Button 
              variant="default"
              className="my-2.5 size-8 p-2 transition-opacity ease-in"
            >
              <SendHorizontalIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CircleStopIcon = () => {
  return (
    <div className="relative h-[18px] w-[18px]">
      <div className="absolute h-full w-full rounded-full border-2 border-current" />
      <div className="absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 rounded-sm bg-current" />
    </div>
  );
};

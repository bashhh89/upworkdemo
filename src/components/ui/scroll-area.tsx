import * as React from "react";

export const ScrollArea = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, style, ...props }, ref) => (
  <div
    ref={ref}
    className={`overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-700 scrollbar-track-[#18181b] ${className || ""}`}
    style={{ maxHeight: "100%", ...style }}
    {...props}
  />
));
ScrollArea.displayName = "ScrollArea"; 
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid gap-2", className)}
        {...props}
      />
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, id, ...props }, ref) => {
    return (
      <div className="relative w-4 h-4">
        <input
          type="radio"
          ref={ref}
          value={value}
          id={id}
          className="sr-only peer"
          {...props}
        />
        <div className={cn(
          "absolute inset-0 rounded-full border border-gray-400",
          "peer-focus:ring-2 peer-focus:ring-gray-400 peer-focus:ring-offset-1",
          "peer-checked:bg-white peer-checked:border-white",
          className
        )}>
          <div className="hidden peer-checked:block w-2 h-2 rounded-full bg-black absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem }; 
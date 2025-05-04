import React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-gray-200 text-gray-600": variant === "secondary",
          "bg-red-100 text-red-800": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
} 
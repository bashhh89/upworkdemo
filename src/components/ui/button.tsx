import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400",
          "disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && [
            "bg-white text-black hover:bg-gray-200",
            "shadow active:scale-95"
          ],
          variant === "outline" && [
            "border border-gray-400 text-white",
            "hover:bg-white/10",
            "active:scale-95"
          ],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button }; 
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

import { X } from "lucide-react";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
}

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative pointer-events-auto flex w-full max-w-md items-center justify-between overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
          variant === "default" && "border-gray-600 bg-[#111111] text-white",
          variant === "destructive" && "border-red-500 bg-red-950 text-white",
          className
        )}
        {...props}
      />
    );
  }
);
Toast.displayName = "Toast";

export interface ToasterToastProps extends React.ComponentPropsWithoutRef<typeof Toast> {
  id: string;
}

const ToastClose = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 text-gray-400",
        "opacity-70 transition-opacity hover:text-white hover:opacity-100 focus:opacity-100",
        "group-hover:opacity-100",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </button>
  )
);
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
);
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm opacity-90", className)}
      {...props}
    />
  )
);
ToastDescription.displayName = "ToastDescription";

export { Toast, ToastClose, ToastTitle, ToastDescription }; 
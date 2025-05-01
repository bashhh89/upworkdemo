"use client";

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useEffect } from "react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.open) {
        const timeout = setTimeout(() => {
          dismiss(toast.id);
        }, 5000);

        return () => clearTimeout(timeout);
      }
    });
  }, [toasts, dismiss]);

  return (
    <div className="fixed top-0 z-[100] flex flex-col items-end gap-2 p-6 max-h-screen">
      {toasts
        .filter((toast) => toast.open)
        .map(({ id, title, description, variant }) => (
          <Toast key={id} variant={variant}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => dismiss(id)} />
          </Toast>
        ))}
    </div>
  );
} 
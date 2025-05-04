import * as React from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children, ...props }: DialogProps) {
  return (
    <div
      {...props}
      aria-hidden={!open}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 transition-opacity ${
        open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => onOpenChange(false)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child, { onClick: (e: React.MouseEvent) => e.stopPropagation() })
          : child
      )}
    </div>
  );
}

export function DialogContent({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`bg-gray-900 rounded-lg shadow-lg max-h-[90vh] overflow-auto w-full max-w-3xl p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function DialogHeader({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 {...props} className={`text-2xl font-bold ${className}`}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...props} className={`text-sm text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

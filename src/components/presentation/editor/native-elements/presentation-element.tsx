import React from 'react';
import { PlateElement, type PlateElementProps } from '@udecode/plate-common';
import { cn } from '@/lib/utils'; // Assuming cn utility is in lib/utils

export const PresentationElement = React.forwardRef<
  HTMLDivElement,
  PlateElementProps & {
    className?: string;
  }
>(({ className, children, ...props }, ref) => {
  // Basic pass-through component - can be enhanced later for themes
  return (
    <PlateElement
      ref={ref}
      className={cn(className)}
      style={{
        color: 'var(--theme-text-color)',
        // Apply body font - ensure variable is correctly defined/applied in CSS
        // fontFamily: 'var(--theme-body-font)' // Uncomment if needed and var is set
      }}
      {...props}
    >
      {children}
    </PlateElement>
  );
});
PresentationElement.displayName = 'PresentationElement';
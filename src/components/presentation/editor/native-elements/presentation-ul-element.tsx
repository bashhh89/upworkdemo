import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps } from '@udecode/plate-common'; // Corrected import path
// Import { PresentationElement } from './presentation-element'; // Optional: Use base element

// Use PresentationElement or PlateElement as base
export const PresentationUlElement = withRef<typeof PlateElement, PlateElementProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement // Or PresentationElement
        ref={ref}
        as="ul" // Render as a <ul> tag
        className={cn(
          'my-2 list-disc pl-8 space-y-1 text-zinc-200', // Example styling: margin, use disc bullets, add padding-left, space items, text color
           className
         )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
PresentationUlElement.displayName = 'PresentationUlElement'; 
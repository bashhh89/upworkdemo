import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps } from '@udecode/plate-common'; // Corrected import path
// import { PresentationElement } from './presentation-element'; // Optional: Use base element

// Use PresentationElement or PlateElement as base
export const PresentationLiElement = withRef<typeof PlateElement, PlateElementProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateElement // Or PresentationElement
        ref={ref}
        as="li" // Render as an <li> tag
        className={cn(
          'leading-normal', // Example styling: Adjust line height if needed
          className
        )}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }
);
PresentationLiElement.displayName = 'PresentationLiElement'; 
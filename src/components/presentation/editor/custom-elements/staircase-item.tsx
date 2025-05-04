import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps, TElement } from '@udecode/plate-common';

interface StairItemProps extends PlateElementProps {
  index: number;
  totalItems: number; // May not be needed for basic alternating style
  element: TElement;
}

export const StairItem = withRef<typeof PlateElement, StairItemProps>(
  ({ children, index, element, className, ...props }, ref) => {
    const isEven = index % 2 === 0;
    // Basic alternating alignment and margin for staircase effect
    const alignmentClass = isEven ? 'text-left mr-auto' : 'text-right ml-auto';
    const marginClass = index > 0 ? (isEven ? 'mt-2' : 'mt-2') : ''; // Add margin between steps

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn(
            "border rounded-lg p-4 shadow-sm bg-card/50", // Basic styling
            "w-1/2", // Make item take up half width
            alignmentClass, // Apply alternating alignment
            marginClass, // Apply margin
            className
        )}
        {...props}
      >
        {/* Render the actual content of the item */}
        {children}
      </PlateElement>
    );
  }
);
StairItem.displayName = 'StairItem'; 
import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps, TElement } from '@udecode/plate-common';

interface CycleItemProps extends PlateElementProps {
  index: number;
  totalItems: number;
  element: TElement;
}

export const CycleItem = withRef<typeof PlateElement, CycleItemProps>(
  ({ children, index, totalItems, element, className, ...props }, ref) => {
    // Basic item styling - can be enhanced later
    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn("border rounded-lg p-4 shadow-sm bg-card/50", className)} // Example styling
        {...props}
      >
        {/* Render the actual content of the item (e.g., paragraphs) */}
        {children}
      </PlateElement>
    );
  }
);
CycleItem.displayName = 'CycleItem'; 
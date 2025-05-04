import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps, TElement } from '@udecode/plate-common';

interface VisualizationItemProps extends PlateElementProps {
  element: TElement; // Basic element type for now
}

export const VisualizationItemElement = withRef<typeof PlateElement, VisualizationItemProps>(
  ({ children, element, className, ...props }, ref) => {
    // Basic item styling - can be enhanced later (e.g., add icon, progress bar based on element props)
    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn(
            "flex items-center justify-between p-3 border-b last:border-b-0 border-zinc-700", // Example: Item with bottom border
             className
        )}
        {...props}
      >
        {/* Render the content of the item (e.g., paragraphs for label/value) */}
        <div className="flex-grow text-zinc-200">{children}</div>
        {/* Placeholder for potential visual like progress bar or icon */}
        {/* <div className="w-1/3 h-4 bg-muted rounded ml-4"></div> */}
      </PlateElement>
    );
  }
);
VisualizationItemElement.displayName = 'VisualizationItemElement'; 
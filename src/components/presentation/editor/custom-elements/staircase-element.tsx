"use client";

import React, { type ReactNode } from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PresentationElement } from "../native-elements/presentation-element"; // Corrected Import

// Import StairItem and constants
import { StairItem } from "./staircase-item"; // Import the component created above
import { STAIR_ITEM_ELEMENT, STAIRCASE_ELEMENT } from "../lib"; // Import constants from lib.ts

export interface StaircaseElementProps extends TElement { // Use different name from component
  type: typeof STAIRCASE_ELEMENT;
}

// Main staircase component with withRef pattern
export const StaircaseElement = withRef<typeof PresentationElement>( // Use correct base element type
  ({ element, children, className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children as ReactNode);
    const items = element.children; // These should be StairItem elements
    const totalItems = items.length;

    return (
      <PresentationElement // Use correct base element
        ref={ref}
        element={element}
        // Add max-width and centering to the container for the half-width items
        className={cn("my-8 mx-auto max-w-3xl", className)}
        {...props}
      >
        {/* Simple div container; layout logic is in StairItem */}
        <div>
          {childrenArray.map((child, index) => (
            <StairItem
              key={index}
              index={index}
              totalItems={totalItems}
              element={items[index] as TElement} // Pass element data for the item
            >
              {child}
            </StairItem>
          ))}
        </div>
      </PresentationElement> // Use correct base element
    );
  },
);
StaircaseElement.displayName = 'StaircaseElement';

// Define Plate plugins for Staircase and StairItem
export const StaircasePlugin = createPlatePlugin({
  key: STAIRCASE_ELEMENT,
  node: { isElement: true }, // Component association happens in override
});

export const StairItemPlugin = createPlatePlugin({
  key: STAIR_ITEM_ELEMENT,
  node: { isElement: true }, // Component association happens via StaircaseElement rendering StairItem
}); 
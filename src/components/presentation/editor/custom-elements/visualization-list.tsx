"use client";

import React from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
// Use PresentationElement from native-elements
import { PresentationElement } from "../native-elements/presentation-element";

// Import constants
import { VISUALIZATION_LIST_ELEMENT, VISUALIZATION_ITEM_ELEMENT } from "../lib"; // Import constants from lib.ts
// Import the item component (though it's rendered via Plate override mechanism)
// Note: Direct import isn't strictly necessary if rendered via override, but good for reference
// import { VisualizationItemElement } from "./visualization-item";


export interface VisualizationListElementProps extends TElement { // Use different name from component
  type: typeof VISUALIZATION_LIST_ELEMENT;
}

// Main list container component
export const VisualizationListElement = withRef<typeof PresentationElement>(
  ({ element, children, className, ...props }, ref) => {
    return (
      <PresentationElement
        ref={ref}
        element={element}
        className={cn(
            "my-6 border rounded-lg shadow-sm bg-card/30 border-zinc-700", // Container styling
             className
        )}
        {...props}
      >
        {/* Render children (VisualizationItem elements) */}
        {children}
      </PresentationElement>
    );
  },
);
VisualizationListElement.displayName = 'VisualizationListElement';

// Define Plate plugins for List and Item
export const VisualizationListPlugin = createPlatePlugin({
  key: VISUALIZATION_LIST_ELEMENT,
  node: { isElement: true }, // Component association happens in override
});

export const VisualizationItemPlugin = createPlatePlugin({
  key: VISUALIZATION_ITEM_ELEMENT,
  node: { isElement: true }, // Component association happens in override
}); 
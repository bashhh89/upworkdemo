"use client";

import React from "react";
import { cn, withRef } from "@udecode/cn";
import { type TElement } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-core/react";
import { PresentationElement } from "../native-elements/presentation-element"; // Corrected base element import

// Import constants
import { ICONS_ELEMENT, ICON_ITEM_ELEMENT } from "../lib";
// Import the item component (though rendered via override)
// import { IconItemElement } from './icon-item';

export interface IconsElementProps extends TElement {
  type: typeof ICONS_ELEMENT;
}

// Main icons container component
export const IconsElement = withRef<typeof PresentationElement>(
  ({ element, children, className, ...props }, ref) => {
    return (
      <PresentationElement
        ref={ref}
        element={element}
        className={cn(
          "my-6 flex flex-row flex-wrap justify-center gap-4", // Arrange items in a wrapping row, centered
          className
        )}
        {...props}
      >
        {children}
      </PresentationElement>
    );
  },
);
IconsElement.displayName = 'IconsElement';

// Define Plate plugins for Icons container and Item
export const IconsPlugin = createPlatePlugin({
  key: ICONS_ELEMENT,
  node: { isElement: true },
});

export const IconItemPlugin = createPlatePlugin({
  key: ICON_ITEM_ELEMENT,
  node: { isElement: true },
}); 
"use client";

import React from "react";
import { cn, withRef, withVariants } from "@udecode/cn";
import { cva, type VariantProps } from "class-variance-authority";
import { PresentationElement } from "./presentation-element"; // Import the base element
import { PlateElement, PlateElementProps } from '@udecode/plate-common';

const headingVariants = cva(
  "relative mb-1 font-[var(--theme-heading-font)]",
  {
    variants: {
      variant: {
        h1: "pb-1 text-5xl font-bold",
        h2: "pb-px text-3xl font-semibold tracking-tight",
        h3: "pb-px text-2xl font-semibold tracking-tight",
        h4: "text-xl font-semibold tracking-tight",
        h5: "text-lg font-semibold tracking-tight",
        h6: "text-base font-semibold tracking-tight",
      },
    },
    defaultVariants: {
      variant: 'h3'
    }
  }
);

const HeadingElementVariants = withVariants(
  PresentationElement, // Use the base PresentationElement
  headingVariants,
  ["variant"],
);

// Ensure props type includes Plate-specific ones if needed, though spread usually works
export const PresentationHeadingElement = withRef<
  typeof HeadingElementVariants
>(({ children, as = "h1", className, ...props }, ref) => {
  return (
    <HeadingElementVariants
      ref={ref}
      as={as} // Use 'as' for the semantic tag
      variant={as as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"} // Use 'as' to determine styling variant
      className={cn("presentation-heading", className)}
      {...props} // Spread Plate props (like element, attributes)
    >
      {children}
    </HeadingElementVariants>
  );
});
PresentationHeadingElement.displayName = 'PresentationHeadingElement'; 
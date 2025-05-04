import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, type PlateElementProps, useElement } from '@udecode/plate-common/react';
import { type TImageElement, useMediaState } from '@udecode/plate-media/react'; // Import specific types/hooks if needed
import { PresentationElement } from './presentation-element'; // Optional: Use base element for consistency

// Define props including potential Plate image element specifics
interface PresentationImageElementProps extends PlateElementProps {
  element: TImageElement; // Use TImageElement for type safety
}

export const PresentationImageElement = withRef<
  typeof PlateElement, // Or typeof PresentationElement if using base
  PresentationImageElementProps
>(({ children, className, element, ...props }, ref) => {
  const { url } = element; // Get URL from the element node
  const { focused, selected } = useMediaState(); // Plate hook for focus/selection styles

  return (
    <PresentationElement // Use base element or PlateElement directly
      ref={ref}
      className={cn("py-2.5", className)} // Add some vertical padding
      {...props}
      // Do not render Plate's default children here for void elements like images
    >
      <figure className="group relative m-0" contentEditable={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="" // Alt text could be added later if available in element data
          className={cn(
            "block max-w-full max-h-[40em] w-full h-auto object-contain", // Basic image styling
            focused && selected && "ring-2 ring-ring ring-offset-2" // Add ring when focused/selected
          )}
          draggable={false} // Prevent native image drag
        />
         {/* Render Plate's children inside the figure but hidden - needed for Plate internals */}
        <span style={{display: 'none'}}>{children}</span>
      </figure>
    </PresentationElement>
  );
});
PresentationImageElement.displayName = 'PresentationImageElement'; 
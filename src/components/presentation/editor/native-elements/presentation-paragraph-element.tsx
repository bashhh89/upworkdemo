import React from 'react';
import { withRef } from '@udecode/cn';
import { PresentationElement } from './presentation-element'; // Import the base element

// Simple paragraph based on PresentationElement
export const PresentationParagraphElement = withRef<
  typeof PresentationElement
>(({ children, className, ...props }, ref) => {
  return (
    <PresentationElement
      ref={ref}
      as="p" // Render as a <p> tag
      className={className} // Pass through className
      {...props} // Spread Plate props
    >
      {children}
    </PresentationElement>
  );
});
PresentationParagraphElement.displayName = 'PresentationParagraphElement'; 
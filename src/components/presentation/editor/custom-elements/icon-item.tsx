import React from 'react';
import { cn, withRef } from '@udecode/cn';
import { PlateElement, PlateElementProps, TElement } from '@udecode/plate-common';
import * as Icons from 'lucide-react'; // Import all lucide icons

// Define element props structure expecting iconName
interface IconItemElementData extends TElement {
  iconName?: string;
}
interface IconItemProps extends PlateElementProps {
  element: IconItemElementData;
}

// Helper to get Lucide icon component by name (case-insensitive)
const getIcon = (name?: string): React.ComponentType<Icons.LucideProps> | null => {
  if (!name) return Icons.HelpCircle; // Default to HelpCircle if no name
  // Attempt to find case-insensitively, but prioritize exact match then PascalCase
  const lowerName = name.toLowerCase();
  const iconKey = Object.keys(Icons).find(key => key.toLowerCase() === lowerName);
  
  if (iconKey) {
    return (Icons as any)[iconKey];
  }
  
  return Icons.HelpCircle; // Return fallback if not found
};


export const IconItemElement = withRef<typeof PlateElement, IconItemProps>(
  ({ children, element, className, ...props }, ref) => {
    const IconComponent = getIcon(element.iconName);

    return (
      <PlateElement
        ref={ref}
        element={element}
        className={cn(
          "flex flex-col items-center text-center p-4 gap-2 text-zinc-200", // Center icon and text vertically
          className
        )}
        {...props}
      >
        {/* Render the Lucide icon */}
        {IconComponent && (
          <IconComponent className="w-8 h-8 mb-1 text-cyan-400" /> // Example size/color
        )}
        {/* Render text content */}
        <div>{children}</div>
      </PlateElement>
    );
  }
);
IconItemElement.displayName = 'IconItemElement'; 
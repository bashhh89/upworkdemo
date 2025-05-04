"use client";
import React from 'react';
import { cn } from '@/lib/utils';

// Define SlideData interface
interface SlideData {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType?: string;
  items?: string[];
}

interface PresentationSlideEditorProps {
  slideData: SlideData | null | undefined;
}

export const PresentationSlideEditor: React.FC<PresentationSlideEditorProps> = ({ slideData }) => {
  // Default placeholder content if no slide data is provided
  const title = slideData?.title || 'Slide Title';
  const content = slideData?.textContent || 'Slide Content';
  const imageUrl = slideData?.imageUrl;
  const items = slideData?.items || [];
  
  // Determine layout and if side image should be shown
  const layoutType = slideData?.layoutType || 'standard';
  const showSideImage = imageUrl && (layoutType === 'image_left' || layoutType === 'image_right');
  
  // Determine content layout class
  const containerFlexClass = 
    layoutType === 'image_left' ? 'flex-row-reverse' : // Image visually first (content on right)
    layoutType === 'image_right' ? 'flex-row' :        // Image visually second (content on left)
    'flex-col'; // Default vertical layout (standard, cycle, staircase)

  // Function to render list items when the layout includes items
  const renderItems = () => {
    if (items.length === 0) return null;
    
    return (
      <ul className="list-disc pl-5 mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={index} className="text-base">{item}</li>
        ))}
      </ul>
    );
  };

  // Function to render appropriate content based on layout type
  const renderContent = () => {
    switch (layoutType) {
      case 'cycle':
        return (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <div className="grid grid-cols-2 gap-4">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'staircase':
        return (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-3">{title}</h2>
            <div className="space-y-2">
              {items.map((item, index) => (
                <div 
                  key={index} 
                  className="p-2 rounded-md bg-gray-100 dark:bg-gray-800"
                  style={{ marginLeft: `${index * 1.5}rem` }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="prose dark:prose-invert">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="mt-4">{content}</p>
            {renderItems()}
          </div>
        );
    }
  };

  // Component now acts as a preview/template for slides, not a full editor
  return (
    <div
      className={cn(
        "relative border rounded-md shadow h-full flex",
        containerFlexClass
      )}
      style={{
        backgroundColor: 'var(--theme-bg-color, #ffffff)',
        borderRadius: 'var(--presentation-border-radius, 0.5rem)'
      }}
    >
      {/* Main content area */}
      <div className="flex-grow overflow-auto p-4 md:p-6 lg:p-8">
        {renderContent()}
      </div>
      
      {/* Conditional Image Column */}
      {showSideImage && (
        <div className="w-1/2 flex-shrink-0 p-4 flex items-center justify-center"> 
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl || ''}
            alt="Slide image"
            className="object-contain w-full h-full max-h-[80vh] rounded-md shadow-md"
          />
        </div>
      )}
      
      {/* Edit mode indicator */}
      <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 text-xs rounded-full">
        Preview Mode
      </div>
    </div>
  );
}; 
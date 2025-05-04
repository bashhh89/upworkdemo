import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// SlideData type
export interface SlideData {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType?: string;
  items?: string[];
}

export interface PresentationViewerProps {
  slides: SlideData[];
  initialSlideIndex?: number;
  onExit: () => void;
  themeClass?: string;
}

export const PresentationViewer: React.FC<PresentationViewerProps> = ({
  slides,
  initialSlideIndex = 0,
  onExit,
  themeClass = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const slideData = slides[currentIndex];

  // Layout logic
  const layoutType = slideData?.layoutType || 'standard';
  const imageUrl = slideData?.imageUrl;
  const showSideImage = imageUrl && (layoutType === 'image_left' || layoutType === 'image_right');
  const containerFlexClass =
    layoutType === 'image_left' ? 'flex-row-reverse'
    : layoutType === 'image_right' ? 'flex-row'
    : 'flex-col';

  // Navigation
  const goToPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goToNext = () => setCurrentIndex((i) => Math.min(slides.length - 1, i + 1));

  return (
    <div className={cn('fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90', themeClass)}>
      <div className="absolute top-4 right-4 z-10">
        <Button variant="destructive" onClick={onExit} size="sm">
          Exit
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center w-full h-full max-w-5xl mx-auto p-4">
        <div className={cn('flex w-full h-full', containerFlexClass)}>
          {showSideImage && (
            <div className="w-1/2 flex-shrink-0 flex items-center justify-center p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Slide image"
                className="object-contain w-full h-full max-h-[80vh] rounded-md shadow-md"
              />
            </div>
          )}
          <div className={cn('flex-grow min-w-0 flex flex-col items-center justify-center p-4')}>  
            <div className="w-full">
              <h1 className="text-3xl font-bold mb-6 text-cyan-200">{slideData.title}</h1>
              <div className="text-xl text-gray-100 space-y-4">
                {slideData.textContent && (
                  <p>{slideData.textContent}</p>
                )}
                {slideData.items && slideData.items.length > 0 && (
                  <ul className="list-disc pl-5 space-y-2">
                    {slideData.items.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full mt-8 gap-4">
          <Button onClick={goToPrev} disabled={currentIndex === 0} variant="outline" size="sm">
            Previous
          </Button>
          <span className="text-cyan-200 font-semibold">
            Slide {currentIndex + 1} of {slides.length}
          </span>
          <Button onClick={goToNext} disabled={currentIndex === slides.length - 1} variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
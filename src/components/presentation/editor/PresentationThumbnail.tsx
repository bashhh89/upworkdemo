import React from 'react';
import { cn } from '@/lib/utils'; // Adjust path

// Define the interface directly here or import if defined elsewhere
interface SlideData {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType?: string;
  items?: string[];
}

interface PresentationThumbnailProps {
  slideData: SlideData;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export const PresentationThumbnail: React.FC<PresentationThumbnailProps> = ({
  slideData,
  index,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "border rounded-md p-2 cursor-pointer mb-2 bg-card hover:bg-card/80 transition-colors duration-150",
        isSelected && "border-cyan-400 border-2 shadow-lg" // Highlight if selected
      )}
    >
      <div className="text-xs font-semibold mb-1 text-cyan-300">Slide {index + 1}</div>
      {slideData.imageUrl ? (
         // eslint-disable-next-line @next/next/no-img-element
        <img
          src={slideData.imageUrl}
          alt={`Slide ${index + 1} preview`}
          className="w-full aspect-video object-cover rounded-sm mb-1 border border-zinc-700"
        />
      ) : (
        <div className="w-full aspect-video bg-muted rounded-sm mb-1 flex items-center justify-center text-muted-foreground text-xs border border-zinc-700">
          No Image
        </div>
      )}
      <p className="text-xs truncate text-zinc-300">{slideData.title || 'Untitled Slide'}</p>
    </div>
  );
}; 
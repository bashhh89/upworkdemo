// Updated simplified version without Plate dependencies
// Interfaces
interface SlideData {
  title: string;
  textContent: string;
  imageUrl: string | null;
  layoutType?: 'standard' | 'image_left' | 'image_right' | 'cycle' | 'staircase' | string;
  items?: string[]; 
}

// Function that doesn't transform - just returns the slide data directly
// This is used as a compatibility layer since we removed Plate
export const transformToPlateValue = (slideData: SlideData | null | undefined): SlideData | null | undefined => {
  return slideData;
}; 
import React, { useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
// Import new slide layouts
import VideoLayoutHero from "./slide_layouts/VideoLayoutHero";
import VideoLayoutTwoColumn from "./slide_layouts/VideoLayoutTwoColumn";
import VideoLayoutThreeCards from "./slide_layouts/VideoLayoutThreeCards";

interface PresentationViewProps {
  presentationData: Array<{
    title: string;
    textContent: string;
    imageUrl: string | null;
    layoutType?: string;
    points?: string[];
  }>;
  initialSlideIndex?: number;
  onExit: () => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ presentationData, initialSlideIndex = 0, onExit }) => {
  const [currentViewIndex, setCurrentViewIndex] = React.useState(initialSlideIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        setCurrentViewIndex((idx) => Math.min(idx + 1, presentationData.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentViewIndex((idx) => Math.max(idx - 1, 0));
      } else if (e.key === "Escape") {
        onExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [presentationData.length, onExit]);

  const slide = presentationData[currentViewIndex];
  let slideContent;
  switch (slide.layoutType) {
    case 'hero':
      slideContent = <VideoLayoutHero {...slide} />;
      break;
    case 'three_cards':
      slideContent = <VideoLayoutThreeCards {...slide} />;
      break;
    case 'two_column':
    default:
      slideContent = <VideoLayoutTwoColumn {...slide} />;
      break;
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a] text-white min-h-screen min-w-full"
      style={{ fontSize: "1.25rem" }}
    >
      {/* Exit button */}
      <button
        className="absolute top-6 right-8 text-cyan-400 hover:text-white bg-[#18181b] rounded-full p-3 shadow-lg z-50"
        onClick={onExit}
        aria-label="Exit presentation"
      >
        <X className="w-7 h-7" />
      </button>
      {/* Slide navigation */}
      <button
        className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white bg-[#18181b] rounded-full p-3 shadow-lg z-50"
        onClick={() => setCurrentViewIndex((idx) => Math.max(idx - 1, 0))}
        disabled={currentViewIndex === 0}
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>
      <button
        className="absolute right-6 top-1/2 -translate-y-1/2 text-cyan-400 hover:text-white bg-[#18181b] rounded-full p-3 shadow-lg z-50"
        onClick={() => setCurrentViewIndex((idx) => Math.min(idx + 1, presentationData.length - 1))}
        disabled={currentViewIndex === presentationData.length - 1}
        aria-label="Next slide"
      >
        <ChevronRight className="w-7 h-7" />
      </button>
      {/* Slide content */}
      <div className="w-full max-w-5xl h-[90vh] flex items-center justify-center px-4">
        {slideContent}
      </div>
      {/* Slide number indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cyan-300 text-lg bg-[#18181b] px-4 py-2 rounded-full shadow">
        Slide {currentViewIndex + 1} / {presentationData.length}
      </div>
    </div>
  );
};

export default PresentationView; 
import React, { useState } from "react";
import { Card, CardContent, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";
import { Play, Save, Share2 } from "lucide-react";
import PresentationView from "./PresentationView";
import { v4 as uuidv4 } from 'uuid';
// Import new slide layouts
import VideoLayoutHero from "./slide_layouts/VideoLayoutHero";
import VideoLayoutTwoColumn from "./slide_layouts/VideoLayoutTwoColumn";
import VideoLayoutThreeCards from "./slide_layouts/VideoLayoutThreeCards";

export interface PresentationEditorProps {
  presentationData: Array<{
    title: string;
    textContent: string;
    imageUrl: string | null;
    layoutType?: string;
    points?: string[];
  }>;
  topic?: string;
}

const STORAGE_KEY = 'aiActionLaunchpad_savedPresentations';

const PresentationEditor: React.FC<PresentationEditorProps> = ({ presentationData, topic }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const currentSlide = presentationData[currentSlideIndex];

  const handleSave = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      let presentations = [];
      if (saved) {
        try { presentations = JSON.parse(saved); } catch { presentations = []; }
      }
      const newPresentation = {
        id: uuidv4(),
        title: topic || presentationData[0]?.title || 'Untitled Presentation',
        savedAt: Date.now(),
        presentationData
      };
      presentations.push(newPresentation);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presentations));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      alert('Failed to save presentation.');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(presentationData, null, 2));
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    } catch (err) {
      alert('Failed to copy presentation data.');
    }
  };

  // Determine which layout to use for the current slide
  let slideContent;
  switch (currentSlide.layoutType) {
    case 'hero':
      slideContent = <VideoLayoutHero {...currentSlide} />;
      break;
    case 'three_cards':
      slideContent = <VideoLayoutThreeCards {...currentSlide} />;
      break;
    case 'two_column':
    default:
      slideContent = <VideoLayoutTwoColumn {...currentSlide} />;
      break;
  }

  return (
    <>
      <div className="flex h-full min-h-0 bg-[#0a0a0a] rounded-lg shadow-lg overflow-hidden border border-[#222] relative">
        {/* Left Panel: Thumbnails */}
        <div className="w-24 md:w-48 border-r border-[#222] bg-[#111] flex flex-col">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-2 p-2">
              {presentationData.map((slide, idx) => (
                <div
                  key={idx}
                  className={`cursor-pointer rounded-lg border-2 p-1 flex flex-col items-center transition-colors duration-150 ${
                    idx === currentSlideIndex
                      ? "border-cyan-400 bg-[#18181b]"
                      : "border-[#222] hover:border-cyan-700 bg-[#18181b]"
                  }`}
                  onClick={() => setCurrentSlideIndex(idx)}
                >
                  <div className="text-xs text-cyan-300 font-semibold mb-1">{idx + 1}</div>
                  {slide.imageUrl ? (
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      className="w-full aspect-video object-cover rounded"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-[#222] flex items-center justify-center rounded text-gray-500 text-xs">
                      No Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        {/* Right Panel: Main Slide View */}
        <div className="flex-1 flex items-center justify-center bg-[#18181b] relative">
          <div className="absolute top-4 right-8 z-10 flex gap-2">
            <Button
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
              onClick={() => setIsPresenting(true)}
            >
              <Play className="w-4 h-4" /> Present
            </Button>
            <Button
              variant="secondary"
              className="bg-[#222] hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
              onClick={handleSave}
            >
              <Save className="w-4 h-4" /> Save
            </Button>
            <Button
              variant="secondary"
              className="bg-[#222] hover:bg-cyan-900 text-cyan-300 border border-cyan-700 font-semibold px-4 py-2 rounded shadow flex items-center gap-2"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" /> Share
            </Button>
          </div>
          {/* Render the chosen layout */}
          <div className="w-full max-w-4xl mx-auto bg-[#18181b] shadow-2xl p-0 flex items-center justify-center">
            {slideContent}
          </div>
        </div>
      </div>
      {saveSuccess && (
        <div className="fixed top-8 right-8 bg-cyan-900 text-cyan-100 px-4 py-2 rounded shadow-lg z-50">Presentation saved!</div>
      )}
      {shareSuccess && (
        <div className="fixed top-20 right-8 bg-cyan-800 text-cyan-100 px-4 py-2 rounded shadow-lg z-50">
          Presentation data (JSON) copied to clipboard. You can share this text, but true link sharing requires saving to the cloud (feature coming soon).
        </div>
      )}
      {isPresenting && (
        <PresentationView
          presentationData={presentationData}
          initialSlideIndex={currentSlideIndex}
          onExit={() => setIsPresenting(false)}
        />
      )}
    </>
  );
};

export default PresentationEditor; 
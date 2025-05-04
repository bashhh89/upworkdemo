import React from "react";
import { Sparkles, CheckCircle, Lightbulb } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface VideoLayoutThreeCardsProps {
  title: string;
  textContent: string;
  imageUrl?: string | null; // Not used in this layout for now
}

const VideoLayoutThreeCards: React.FC<VideoLayoutThreeCardsProps> = ({ title, textContent }) => {
  // Icons for each card
  const cardIcons = [
    <Sparkles key="sparkles" className="h-8 w-8 text-cyan-400 mb-4" />,
    <CheckCircle key="check" className="h-8 w-8 text-cyan-400 mb-4" />,
    <Lightbulb key="bulb" className="h-8 w-8 text-cyan-400 mb-4" />
  ];

  return (
    <div className="flex flex-col w-full h-full bg-[#18181b] rounded-lg overflow-hidden p-8">
      {/* Title Area - Full Width */}
      <div className="w-full mb-10 text-center">
        <h2 className="text-4xl font-bold text-cyan-400 tracking-tight">{title}</h2>
      </div>
      
      {/* Three Cards Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
        {[0, 1, 2].map((index) => (
          <div 
            key={index}
            className="flex flex-col items-center bg-zinc-800 p-6 rounded-lg border border-zinc-700 shadow-md"
          >
            {/* Card Icon */}
            {cardIcons[index]}
            
            {/* Card Content - Just showing the full textContent in each card for now */}
            <div className="text-base text-zinc-200 leading-relaxed text-center">
              <ReactMarkdown>{textContent}</ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLayoutThreeCards; 
import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface VideoLayoutHeroProps {
  title: string;
  textContent: string;
  imageUrl?: string | null;
}

const VideoLayoutHero: React.FC<VideoLayoutHeroProps> = ({ title, textContent, imageUrl }) => {
  return (
    <div className="flex flex-col w-full h-full bg-[#18181b] rounded-lg overflow-hidden">
      {/* Hero Image Area - Takes up top 60% */}
      <div className="w-full h-3/5 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800 border-b border-zinc-700">
            <ImageIcon className="h-20 w-20 text-zinc-600" />
          </div>
        )}
        {/* Optional: Add a semi-transparent gradient overlay at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#18181b] to-transparent"></div>
      </div>
      
      {/* Content Area */}
      <div className="w-full flex flex-col p-8 space-y-6">
        <h2 className="text-4xl font-bold text-cyan-400 tracking-tight">{title}</h2>
        <div className="text-lg text-zinc-200 leading-relaxed">
          <ReactMarkdown>{textContent}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default VideoLayoutHero; 
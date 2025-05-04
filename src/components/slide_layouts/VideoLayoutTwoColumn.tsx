import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface VideoLayoutTwoColumnProps {
  title: string;
  textContent: string;
  imageUrl?: string | null;
}

const VideoLayoutTwoColumn: React.FC<VideoLayoutTwoColumnProps> = ({ title, textContent, imageUrl }) => {
  return (
    <div className="flex flex-col w-full h-full bg-[#18181b] rounded-lg overflow-hidden p-8">
      {/* Title Area - Full Width */}
      <div className="w-full mb-8">
        <h2 className="text-4xl font-bold text-cyan-400 tracking-tight">{title}</h2>
      </div>
      
      {/* Two Column Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 h-full">
        {/* Text Column */}
        <div className="flex flex-col justify-center">
          <div className="text-lg text-zinc-200 leading-relaxed bg-zinc-900/30 rounded-lg p-6 border border-zinc-800">
            <ReactMarkdown>{textContent}</ReactMarkdown>
          </div>
        </div>
        
        {/* Image Column */}
        <div className="flex items-center justify-center h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full h-full aspect-video flex items-center justify-center bg-zinc-800 rounded-lg border border-zinc-700">
              <ImageIcon className="h-20 w-20 text-zinc-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoLayoutTwoColumn; 
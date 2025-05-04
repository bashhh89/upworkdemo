import React from "react";
import { Image as ImageIcon } from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface DefaultLayoutProps {
  title: string;
  textContent: string;
  imageUrl?: string | null;
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({ title, textContent, imageUrl }) => {
  return (
    <div className="flex flex-col md:flex-row w-full h-full gap-8 items-center justify-center bg-[#18181b] rounded-lg">
      {/* Text Area */}
      <div className="md:w-1/2 w-full flex flex-col justify-center items-start p-8 space-y-6">
        <h2 className="text-3xl font-semibold text-cyan-400 mb-2">{title}</h2>
        <div className="text-base text-zinc-200 leading-relaxed w-full border border-zinc-800 rounded-md bg-transparent p-4">
          <ReactMarkdown>{textContent}</ReactMarkdown>
        </div>
      </div>
      {/* Image Area */}
      <div className="md:w-1/2 w-full flex items-center justify-center h-full">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="aspect-video w-full h-full object-cover rounded-md border border-zinc-700 bg-zinc-900"
          />
        ) : (
          <div className="aspect-video w-full h-full flex items-center justify-center bg-zinc-800 rounded-md border border-zinc-700">
            <ImageIcon className="h-16 w-16 text-zinc-600" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DefaultLayout; 
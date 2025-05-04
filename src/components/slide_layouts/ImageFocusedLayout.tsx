import React from "react";
import { Image as ImageIcon } from "lucide-react";

interface ImageFocusedLayoutProps {
  title: string;
  textContent: string;
  imageUrl?: string | null;
}

const ImageFocusedLayout: React.FC<ImageFocusedLayoutProps> = ({ title, textContent, imageUrl }) => {
  return (
    <div className="flex flex-col w-full h-full p-10 items-center justify-center bg-[#18181b] rounded-lg">
      <h2 className="text-3xl font-extrabold text-cyan-400 mb-8 w-full text-center leading-tight">{title}</h2>
      <div className="w-full flex items-center justify-center mb-6 relative">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full max-w-2xl h-96 object-cover rounded-lg border-2 border-cyan-700 bg-[#111] shadow-2xl"
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-11/12 md:w-3/4 bg-[#18181bcc] backdrop-blur-md rounded-lg p-6 mb-4 shadow-lg border border-cyan-800">
              <div className="text-white text-lg leading-relaxed text-center">
                {textContent}
              </div>
            </div>
          </>
        ) : (
          <div className="w-full max-w-2xl h-96 flex items-center justify-center bg-[#222] rounded-lg border-2 border-cyan-900">
            <ImageIcon className="h-16 w-16 text-cyan-700 opacity-60" />
          </div>
        )}
      </div>
      {!imageUrl && (
        <div className="w-full text-white text-lg leading-relaxed text-center mt-6">
          {textContent}
        </div>
      )}
    </div>
  );
};

export default ImageFocusedLayout; 
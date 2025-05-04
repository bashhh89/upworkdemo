import React from "react";
import { Sparkles, Image as ImageIcon } from "lucide-react";

interface ThreePointsLayoutProps {
  title: string;
  textContent: string;
  imageUrl?: string | null;
  points?: string[];
}

const ThreePointsLayout: React.FC<ThreePointsLayoutProps> = ({ title, textContent, imageUrl, points }) => {
  // Use points if provided, else split textContent by newlines or periods
  const displayPoints = points && points.length > 0
    ? points.slice(0, 3)
    : textContent.split(/[\n\.]/).map(pt => pt.trim()).filter(Boolean).slice(0, 3);

  return (
    <div className="flex flex-col w-full h-full p-8 items-center justify-center bg-[#18181b] rounded-lg">
      {imageUrl ? (
        <div className="w-full flex justify-center mb-6">
          <img
            src={imageUrl}
            alt={title}
            className="w-full max-w-lg h-40 object-cover rounded-lg border-2 border-cyan-700 shadow-md bg-[#111]"
          />
        </div>
      ) : (
        <div className="w-full flex justify-center mb-6">
          <div className="w-full max-w-lg h-40 flex items-center justify-center bg-[#222] rounded-lg border-2 border-cyan-900">
            <ImageIcon className="h-10 w-10 text-cyan-700 opacity-60" />
          </div>
        </div>
      )}
      <h2 className="text-3xl font-extrabold text-cyan-400 mb-8 w-full text-center leading-tight">
        {title}
      </h2>
      <div className="flex flex-row gap-6 w-full justify-center mb-2">
        {displayPoints.map((pt, idx) => (
          <div key={idx} className="flex-1 bg-[#18181b] border-2 border-cyan-700 rounded-lg p-6 flex flex-col items-center shadow-lg min-w-[140px] max-w-xs mx-2">
            <Sparkles className="h-7 w-7 text-cyan-400 mb-3" />
            <div className="text-white text-lg font-medium text-center break-words leading-relaxed">
              {pt}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreePointsLayout; 
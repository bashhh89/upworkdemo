"use client";

import { useState, useEffect } from 'react';
import { Thread } from "@/components/thread";

export const PollinationsAssistant = () => {
  const [mounted, setMounted] = useState(false);

  // Set mounted state after client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render content until after client-side hydration
  if (!mounted) {
    return <div className="flex h-full items-center justify-center p-8">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat interface without the sidebar */}
      <div className="flex-1 overflow-hidden">
        <Thread />
      </div>
    </div>
  );
}; 
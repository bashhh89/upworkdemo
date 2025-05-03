'use client';

import React from 'react';
import { Button } from "@/components/ui/button"; // Import Button component
import { Card, CardContent } from "@/components/ui/card"; // Import Card components
import { cn } from '@/lib/utils'; // Import cn

export function HomePage({ onNavigate }: { onNavigate: (id: string) => void }) {
  // Placeholder data for quick access and recent activity
  const quickAccessItems = [
    { label: "AI Agent Studio", action: () => window.location.href = "/agent-studio" },
    { label: "Run Deal Writer", action: () => onNavigate('deal-writer') },
    { label: "Generate Image", action: () => onNavigate('image-generator') },
    { label: "Check Website Intel", action: () => onNavigate('website-intel') },
  ];

  const recentActivity = [
    { id: 1, description: "Generated image", timestamp: "2024-01-01 10:00 AM" },
    { id: 2, description: "Wrote deal draft", timestamp: "2024-01-01 09:30 AM" },
    { id: 3, description: "Scanned website", timestamp: "2024-01-01 09:00 AM" },
    { id: 4, description: "Ran ROI analysis", timestamp: "2024-01-01 08:45 AM" },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-12 min-h-screen bg-[#0a0a0a]"> {/* Main container with background */}
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
          Welcome, Ahmad.
        </h1>
        <p className="text-lg text-gray-400">
          Ready to build.
        </p>
      </div>

      {/* Quick Access Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-4">
          QUICK ACCESS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickAccessItems.map((item, index) => (
            <Button
              key={index}
              onClick={item.action}
              className="w-full h-20 bg-[#000000] text-white text-lg font-semibold border border-[#333333] hover:bg-[#1a1a1a] transition-colors duration-150 rounded-none" // Styled button
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          RECENT ACTIVITY
        </h2>
        <div className="flex flex-col gap-4">
          {recentActivity.map((activity) => (
            <Card key={activity.id} className="bg-[#000000] border border-[#333333] text-white rounded-none">
              <CardContent className="p-4 flex justify-between items-center">
                <span className="text-sm">{activity.description}</span>
                <span className="text-xs text-gray-500">{`[${activity.timestamp}]`}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

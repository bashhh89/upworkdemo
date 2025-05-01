'use client';

import React, { useState } from 'react';
import { ScorecardSectionV2 } from './ScorecardSectionV2';
import { ScorecardSectionV3 } from './ScorecardSectionV3';
import { Button } from "@/components/ui/button";
import { Lightbulb } from 'lucide-react';

export function ScorecardTabs() {
  const [activeTab, setActiveTab] = useState<string>('fixed');
  
  return (
    <div className="container mx-auto py-8">
      <div className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">AI Efficiency Scorecard</h1>
            <p className="text-gray-400">Assess your organization's AI readiness and get actionable recommendations</p>
          </div>
          
          {/* Custom tab switcher */}
          <div className="flex bg-black/50 border border-gray-800 rounded-lg p-1">
            <Button 
              variant={activeTab === 'fixed' ? "default" : "ghost"}
              onClick={() => setActiveTab('fixed')}
              className={`rounded-md px-4 py-2 ${activeTab === 'fixed' ? 'bg-sky-900/30 text-sky-400' : 'text-gray-400 hover:text-white'}`}
            >
              Standard Assessment
            </Button>
            <Button 
              variant={activeTab === 'dynamic' ? "default" : "ghost"}
              onClick={() => setActiveTab('dynamic')}
              className={`rounded-md px-4 py-2 ${activeTab === 'dynamic' ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-400 hover:text-white'}`}
            >
              Dynamic AI Assessment
            </Button>
          </div>
        </div>
        
        {/* Info box to explain the difference */}
        <div className="mb-8 bg-black/40 border border-gray-800 rounded-lg p-4">
          <div className="flex items-start">
            <Lightbulb className="h-5 w-5 text-amber-400 mt-1 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-white font-medium mb-1">
                {activeTab === 'fixed' 
                  ? 'Standard Assessment: Fixed Questions'
                  : 'Dynamic Assessment: AI-Generated Questions'}
              </h3>
              <p className="text-sm text-gray-400">
                {activeTab === 'fixed' 
                  ? 'This assessment uses a standardized set of 20 questions to evaluate your AI readiness. All users receive the same questions in the same order, enabling consistent benchmarking.'
                  : 'This assessment uses AI to dynamically generate personalized questions based on your previous answers. Each assessment is unique and adapts to your specific situation.'}
              </p>
            </div>
          </div>
        </div>
        
        {/* Tab content */}
        <div className="mt-0">
          {activeTab === 'fixed' && <ScorecardSectionV2 />}
          {activeTab === 'dynamic' && <ScorecardSectionV3 />}
        </div>
      </div>
    </div>
  );
} 
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Import cn for conditional class names
import SidebarNav from "@/components/SidebarNav";
import RoadmapSection from "@/app/sections/RoadmapSection";
import { ScorecardTabs } from '@/app/sections/ScorecardTabs';
import GeneratorSection from "@/app/sections/GeneratorSection";
import RoiSection from "@/app/sections/RoiSection";
import ResourcesSection from "@/app/sections/ResourcesSection";
import KanbanSection from "@/app/sections/KanbanSection";
import ImageGeneratorSection from "@/app/sections/ImageGeneratorSection";
import { VoiceoverGeneratorSection } from '@/app/sections/VoiceoverGeneratorSection';
import { CritiqueSection } from '@/app/sections/CritiqueSection';
import { ObjectionHandlerSection } from '@/app/sections/ObjectionHandlerSection';
import { WebsiteScraperSection } from './sections/WebsiteScraperSection';
import { BrandFoundationSection } from './sections/BrandFoundationSection';
// Removed HomePage import
import { ScorecardSectionV3 } from './sections/ScorecardSectionV3';
import { ExecutivePersonaSection } from './sections/ExecutivePersonaSection';
import { IdealCustomerProfileSection } from './sections/IdealCustomerProfileSection';
import { TalkToWebsiteSection } from './sections/TalkToWebsiteSection';
import { ContextualDealWriterSection } from './sections/ContextualDealWriterSection';
// Additional imports used by AiLandingPage (kept as they might be used in tool sections)
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, FileTextIcon, GlobeIcon, LightbulbIcon, MessageSquare } from 'lucide-react'; // Imported specific Lucide icons
import ChatSection from './sections/ChatSection';

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // State for sidebar expansion

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  const handleToggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Map section IDs to components
  const sectionComponents: Record<string, React.ReactNode> = {
    // Removed home: <HomePage ... />,
    roadmap: <RoadmapSection />,
    scorecard: <ScorecardSectionV3 />,
    generator: <GeneratorSection />,
    roi: <RoiSection />,
    resources: <ResourcesSection />,
    kanban: <KanbanSection />,
    voiceover_generator: <VoiceoverGeneratorSection />,
    image_generator: <ImageGeneratorSection />,
    critique: <CritiqueSection />,
    objection_handler: <ObjectionHandlerSection />,
    website_scanner: <WebsiteScraperSection />,
    talk_to_website: <TalkToWebsiteSection />,
    brand_foundation: <BrandFoundationSection />,
    executive_persona: <ExecutivePersonaSection />,
    ideal_customer_profile: <IdealCustomerProfileSection />,
    'contextual-deal-writer': <ContextualDealWriterSection />,
    'pollinations-assistant': <ChatSection />
  };

  const renderMainContent = () => {
    if (activeSection === 'home') {
      return (
        <div className="w-full max-w-7xl mx-auto py-12 px-4 flex flex-col gap-12"> {/* Container with max width, centered, generous vertical spacing, added horizontal padding */}

          {/* Welcome/Status Section - Keep this as a primary title block */}
          <div className="flex flex-col gap-2"> {/* Vertical spacing within section */}
            <h2 className="text-4xl md:text-5xl font-bold text-white">Welcome, Ahmad.</h2> {/* Sharp welcome message */}
            <p className="text-lg text-[#a0a0a0]">Ready to execute powerful AI actions.</p> {/* Subtle status */}
          </div>

          {/* AI Action Launchpad Section */}
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-semibold text-white uppercase tracking-wider">AI ACTION LAUNCHPAD</h3> {/* Sharp header */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Responsive grid with generous gap */}
              {/* Action Tiles */}
              <div 
                className="bg-[#0a0a0a] text-white border border-[#333333] p-8 flex flex-col items-start gap-4 hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer rounded-none"
                onClick={() => handleSectionChange('pollinations-assistant')}
              > 
                <MessageSquare className="w-8 h-8 text-white" /> {/* MessageSquare icon */}
                <span className="font-semibold text-xl">Chat Assistant</span>
              </div>
              <div className="bg-[#0a0a0a] text-white border border-[#333333] p-8 flex flex-col items-start gap-4 hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer rounded-none"> {/* Sharp tile styling */}
                <ImageIcon className="w-8 h-8 text-white" /> {/* Image icon */}
                <span className="font-semibold text-xl">Generate Image</span>
              </div>
              <div className="bg-[#0a0a0a] text-white border border-[#333333] p-8 flex flex-col items-start gap-4 hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer rounded-none">
                 <FileTextIcon className="w-8 h-8 text-white" /> {/* File text icon */}
                <span className="font-semibold text-xl">Write Deal Snippet</span>
              </div>
              <div className="bg-[#0a0a0a] text-white border border-[#333333] p-8 flex flex-col items-start gap-4 hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer rounded-none">
                <GlobeIcon className="w-8 h-8 text-white" /> {/* Globe icon */}
                <span className="font-semibold text-xl">Analyze Website</span>
              </div>
               {/* Corrected: Wrapped LightbulbIcon and span in its own tile div */}
              <div className="bg-[#0a0a0a] text-white border border-[#333333] p-8 flex flex-col items-start gap-4 hover:bg-[#1a1a1a] transition-colors duration-150 cursor-pointer rounded-none">
                 <LightbulbIcon className="w-8 h-8 text-white" /> {/* Lightbulb icon */}
                <span className="font-semibold text-xl">Generate Idea</span>
              </div>
              {/* Add more tiles as needed */}
            </div>
          </div>
        </div>
      );
    } else if (activeSection === 'pollinations-assistant') {
      return sectionComponents[activeSection];
    } else {
      return sectionComponents[activeSection] || <div className="text-white">Coming soon: {activeSection}</div>;
    }
  };


  return (
    <div className="grid min-h-screen" style={{ gridTemplateColumns: isSidebarExpanded ? "16rem 1fr" : "5rem 1fr" }}> {/* Use CSS Grid with dynamic column width */}
      {/* Sidebar */}
      <aside className={cn("bg-[#0a0a0a] border-r border-[#333333] p-6 h-screen overflow-y-auto transition-all duration-300 ease-in-out")}> {/* Removed width class here, controlled by grid */}
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          isExpanded={isSidebarExpanded} // Pass state
          onToggleExpand={handleToggleSidebar} // Pass toggle function
        />
      </aside>

      {/* Main Content Area */}
      <main className="bg-[#000000] p-6 h-screen overflow-y-auto"> {/* Removed flex-1, ml-, and transition classes */}
        {renderMainContent()} {/* Render dynamic content based on active section */}
      </main>
    </div>
  );
}

// Removed the old AiLandingPage component entirely

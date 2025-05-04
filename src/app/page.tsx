'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils'; // Import cn for conditional class names
import SidebarNav from "@/components/SidebarNav";
import RoadmapSection from "@/app/sections/RoadmapSection";
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
import { ScorecardSectionV3 } from './sections/ScorecardSectionV3';
import { ExecutivePersonaSection } from './sections/ExecutivePersonaSection';
import { IdealCustomerProfileSection } from './sections/IdealCustomerProfileSection';
import { TalkToWebsiteSection } from './sections/TalkToWebsiteSection';
import { ContextualDealWriterSection } from './sections/ContextualDealWriterSection';
// Import the actual Agent Studio page
import AgentStudioPage from './agent-studio/page';
// Additional imports used by AiLandingPage (kept as they might be used in tool sections)
import Link from 'next/link';
import { MessageSquare, Globe, Users, Target, ArrowRight, Sparkles } from 'lucide-react'; // Imported specific Lucide icons
import ChatSection from './sections/ChatSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PresentationGeneratorSection from "@/sections/PresentationGeneratorSection";
import { HomeSection } from './sections/HomeSection';

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
    home: <HomeSection onSectionChange={handleSectionChange} />,
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
    'pollinations-assistant': <ChatSection />,
    'agent-studio': <AgentStudioPage />,
    'presentation-generator': <PresentationGeneratorSection />
  };

  const renderMainContent = () => {
    if (activeSection === 'home') {
      return sectionComponents['home'];
    } else if (activeSection === 'pollinations-assistant') {
      return sectionComponents[activeSection];
    } else {
      return sectionComponents[activeSection] || <div className="text-white">Coming soon: {activeSection}</div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      <SidebarNav
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isExpanded={isSidebarExpanded}
        onToggleExpand={handleToggleSidebar}
      />
      <main className="flex-1 min-h-0 overflow-y-auto">
        {renderMainContent()}
      </main>
    </div>
  );
}

// Removed the old AiLandingPage component entirely

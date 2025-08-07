'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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
import { ICPBuilderSection } from './sections/ICPBuilderSection';
// Import the actual Agent Studio page
import AgentStudioPage from './agent-studio/page';
// Additional imports used by AiLandingPage (kept as they might be used in tool sections)
import Link from 'next/link';
import { MessageSquare, Globe, Users, Target, ArrowRight, Sparkles } from 'lucide-react'; // Imported specific Lucide icons
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import PresentationGeneratorSection from "./sections/PresentationGeneratorSection";
import { PortfolioHomeSection } from './sections/PortfolioHomeSection';
import { AboutSection } from './sections/AboutSection';
import ChatSection from './sections/ChatSection';
import AdminDashboard from './admin/page';
import CompanyAnalysisPage from './company-analysis/page';
import ProposalStudioPage from './proposal-studio/page';

export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(true); // State for sidebar expansion

  const handleToggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const handleSectionChange = (sectionId: string) => {
    console.log('handleSectionChange called with:', sectionId);
    setActiveSection(sectionId);
    
    // Update URL without page reload
    let newUrl;
    if (sectionId === 'home') {
      newUrl = '/';
    } else if (sectionId === 'admin-dashboard') {
      newUrl = '/admin';
    } else {
      newUrl = `/?tool=${sectionId}`;
    }
    window.history.pushState({}, '', newUrl);
  };

  // Map section IDs to components - Portfolio focused
  const sectionComponents: Record<string, React.ReactNode> = {
    // Admin Dashboard
    'proposal-studio': <ProposalStudioPage />,
    'company-analysis': <CompanyAnalysisPage />,
    'admin-dashboard': <AdminDashboard />,
    
    // Portfolio sections
    home: <PortfolioHomeSection onSectionChange={handleSectionChange} />,
    about: <AboutSection />,
    services: <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Services</h1>
        <p className="text-zinc-400 mb-8">Check out my live AI tools above - they show exactly what I can build for you.</p>
        <button 
          onClick={() => handleSectionChange('home')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          View Portfolio
        </button>
      </div>
    </div>,
    contact: <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Let's Connect</h1>
        <p className="text-zinc-400 mb-8">Ready to turn your AI ideas into systems that actually work?</p>
        <button 
          onClick={() => window.open('https://www.linkedin.com/in/abashh/', '_blank')}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Message Me on LinkedIn
        </button>
      </div>
    </div>,
    
    // Working demos
    'pollinations-assistant': <ChatSection />,
    website_scanner: <WebsiteScraperSection />,
    executive_persona: <ExecutivePersonaSection />,
    image_generator: <ImageGeneratorSection />,
    voiceover_generator: <VoiceoverGeneratorSection />,
    
    // Business tools
    scorecard: <ScorecardSectionV3 />,
    ideal_customer_profile: <IdealCustomerProfileSection />,
    critique: <CritiqueSection />,
    brand_foundation: <BrandFoundationSection />,
    
    // Decisions tools
    icp_builder: <ICPBuilderSection />,
    
    // Advanced features
    'agent-studio': <AgentStudioPage />,
    talk_to_website: <TalkToWebsiteSection />,
    objection_handler: <ObjectionHandlerSection />
  };

  // Initialize active section from URL parameter on component mount
  useEffect(() => {
    const toolFromUrl = searchParams.get('tool');
    if (toolFromUrl && sectionComponents[toolFromUrl]) {
      setActiveSection(toolFromUrl);
    } else if (!toolFromUrl) {
      setActiveSection('home');
    }
  }, [searchParams, sectionComponents]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const toolFromUrl = urlParams.get('tool');
      if (toolFromUrl && sectionComponents[toolFromUrl]) {
        setActiveSection(toolFromUrl);
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [sectionComponents]);

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

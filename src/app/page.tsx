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
import { ImageIcon, FileTextIcon, GlobeIcon, LightbulbIcon, MessageSquare, Globe, Users, Target, Wrench, ArrowRight } from 'lucide-react'; // Imported specific Lucide icons
import ChatSection from './sections/ChatSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        <div className="min-h-screen bg-[#0a0a0a] text-white">
          <header className="py-16 bg-gradient-to-r from-[#111] to-[#0a0a0a]">
            <div className="container mx-auto px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-center mb-6">
                Deliver AI Assistant
              </h1>
              <p className="text-xl text-center text-gray-400 max-w-3xl mx-auto">
                Your intelligent partner for marketing and sales tasks with specialized tools
              </p>
              <div className="flex justify-center mt-10 gap-4">
                <Link href="/chat">
                  <Button size="lg" className="gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Open Chat
                  </Button>
                </Link>
                <Link href="/test-tools">
                  <Button size="lg" variant="outline" className="gap-2">
                    <Wrench className="h-5 w-5" />
                    Explore Tools
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="py-16 container mx-auto px-4">
            <section className="mb-16">
              <h2 className="text-3xl font-bold mb-10 text-center">Specialized Tools</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="bg-[#111] border-blue-800 hover:border-blue-600 transition-colors">
                  <CardHeader>
                    <Globe className="h-8 w-8 text-blue-500 mb-2" />
                    <CardTitle>Website Intelligence Scanner</CardTitle>
                    <CardDescription>
                      Analyze any website to extract business intelligence and insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Extract key information about competitors, industry trends, and marketing strategies from any website.
                    </p>
                    <code className="block bg-[#0a0a0a] p-3 rounded text-sm font-mono border border-[#222] mt-4">
                      Analyze website: example.com
                    </code>
                  </CardContent>
                  <CardFooter>
                    <Link href="/chat?tool=website" className="w-full">
                      <Button variant="outline" className="w-full border-blue-800 hover:bg-blue-900/20">
                        Use Tool <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="bg-[#111] border-purple-800 hover:border-purple-600 transition-colors">
                  <CardHeader>
                    <Users className="h-8 w-8 text-purple-500 mb-2" />
                    <CardTitle>Executive Persona</CardTitle>
                    <CardDescription>
                      Create detailed executive profiles for targeted communications
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Generate communication profiles for executives to craft personalized outreach that resonates with their priorities.
                    </p>
                    <code className="block bg-[#0a0a0a] p-3 rounded text-sm font-mono border border-[#222] mt-4">
                      Create an executive persona for John Smith, CEO at Acme Inc
                    </code>
                  </CardContent>
                  <CardFooter>
                    <Link href="/chat?tool=executive" className="w-full">
                      <Button variant="outline" className="w-full border-purple-800 hover:bg-purple-900/20">
                        Use Tool <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>

                <Card className="bg-[#111] border-green-800 hover:border-green-600 transition-colors">
                  <CardHeader>
                    <Target className="h-8 w-8 text-green-500 mb-2" />
                    <CardTitle>Contextual Deal Writer</CardTitle>
                    <CardDescription>
                      Generate tailored deal proposals based on company and industry
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 mb-4">
                      Create customized deal proposals that address specific pain points and opportunities for any industry or company size.
                    </p>
                    <code className="block bg-[#0a0a0a] p-3 rounded text-sm font-mono border border-[#222] mt-4">
                      Write a deal proposal for TechCorp in the Technology industry
                    </code>
                  </CardContent>
                  <CardFooter>
                    <Link href="/chat?tool=deal" className="w-full">
                      <Button variant="outline" className="w-full border-green-800 hover:bg-green-900/20">
                        Use Tool <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </div>
            </section>

            <section className="mt-20 text-center">
              <h2 className="text-3xl font-bold mb-6">Get Started Now</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-8">
                Start a conversation with our AI assistant and use specialized tools to power up your marketing and sales efforts.
              </p>
              <Link href="/chat">
                <Button size="lg" className="px-8">
                  Open Chat Interface
                </Button>
              </Link>
            </section>
          </main>

          <footer className="py-10 border-t border-[#222] mt-20">
            <div className="container mx-auto px-4 text-center text-gray-500">
              <p>Deliver AI Assistant © 2024 | Powered by advanced AI tools for marketing and sales</p>
            </div>
          </footer>
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

'use client';

import React, { useState } from 'react';
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
import { HomePage } from './sections/HomePage';
import { ScorecardSectionV3 } from './sections/ScorecardSectionV3';
import { ExecutivePersonaSection } from './sections/ExecutivePersonaSection';
import { IdealCustomerProfileSection } from './sections/IdealCustomerProfileSection';
import { TalkToWebsiteSection } from './sections/TalkToWebsiteSection';
import { ContextualDealWriterSection } from './sections/ContextualDealWriterSection';
// Additional imports used by AiLandingPage
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Gauge, Wand2 } from 'lucide-react';

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('home');

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };

  // Map section IDs to components
  const sectionComponents: Record<string, React.ReactNode> = {
    home: <HomePage onNavigate={handleSectionChange} />,
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
    'contextual-deal-writer': <ContextualDealWriterSection />
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-[#333333] p-6 h-screen">
        <SidebarNav activeSection={activeSection} onSectionChange={handleSectionChange} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 bg-[#000000] p-6 h-screen overflow-y-auto"> {/* Added overflow-y-auto for scrolling if content exceeds height */}
        {sectionComponents[activeSection] || <div className="text-white">Coming soon: {activeSection}</div>}
      </main>
    </div>
  );
}

export function AiLandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-4 py-16 md:py-24 max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Stop Downloading PDFs. Start Implementing AI.
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-3xl mb-10">
          Get your personalized 90-Day AI Roadmap, Efficiency Scorecard, and AI-powered tools – all within one interactive platform designed for marketing leaders.
        </p>
        
        <div className="w-full max-w-3xl mb-10">
          <div className="relative aspect-video rounded-lg border border-gray-800 overflow-hidden">
            <Image 
              src="/images/image_0a918c.jpg" 
              alt="AI Implementation Platform" 
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
        
        <Link 
          href="#access" 
          className="bg-white text-black font-semibold px-8 py-4 rounded-md hover:bg-gray-100 transition-colors"
          scroll={true}
        >
          Get Instant Access
        </Link>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-16 md:py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            What You Get
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <MapPin size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Dynamic Roadmap</h3>
              <p className="text-gray-400 text-center">
                A tailored 90-day implementation plan designed specifically for your business needs and resources.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <Gauge size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">Instant Scorecard</h3>
              <p className="text-gray-400 text-center">
                Evaluate your current AI readiness with our efficiency scorecard, providing actionable insights.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="border border-gray-800 rounded-lg p-6 hover:border-gray-700 hover:bg-[#111] transition-all">
              <div className="flex justify-center mb-6">
                <div className="p-3 rounded-full bg-[#111] border border-gray-800">
                  <Wand2 size={24} />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-center">AI-Powered Tools</h3>
              <p className="text-gray-400 text-center">
                Access to a suite of specialized AI tools designed to enhance your marketing operations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access/Form Placeholder Section */}
      <section id="access" className="py-16 md:py-24 px-4">
        <div className="max-w-md mx-auto border border-gray-800 rounded-lg p-8 bg-[#0a0a0a]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Unlock Your Personalized AI Toolkit
          </h2>
          
          <p className="text-gray-400 text-center mb-8">
            Enter your details below to gain instant access...
          </p>
          
          <div className="space-y-6">
            <div className="w-full">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="w-full px-4 py-3 bg-[#111] border border-gray-800 rounded-md text-gray-500 cursor-not-allowed">
                example@company.com
              </div>
            </div>
            
            <button 
              disabled
              className="w-full bg-gray-700 text-gray-300 font-semibold px-5 py-3 rounded-md cursor-not-allowed"
            >
              Get Instant Access (Demo Only)
            </button>
          </div>
        </div>
        
        {/* Social Proof */}
        <p className="text-gray-400 italic text-center mt-12">
          Trusted by innovative marketing teams.
        </p>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-gray-500 text-sm text-center">
            © 2025 AI Implementation Platform
          </p>
        </div>
      </footer>
    </div>
  );
}

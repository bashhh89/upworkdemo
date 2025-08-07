'use client';

import React from 'react';
import { PortfolioHomeSection } from '@/app/sections/PortfolioHomeSection';

export default function GliflashPage() {
  const handleSectionChange = (sectionId: string) => {
    // For this test page, we'll just log to console and potentially scroll.
    // In a real app, this would navigate to a different section or page.
    console.log(`Navigating to section: ${sectionId}`);
    // For simplicity, we'll just scroll to top if it's an internal section link
    // or if it's one of the known demo tools, we can link to their respective paths.
    if (sectionId === 'pollinations-assistant' || sectionId === 'chat') {
      window.location.href = '/chat';
    } else if (sectionId === 'website_scanner' || sectionId === 'scraper') {
      window.location.href = '/tools/website-scraper'; // Assuming this path exists or will exist
    } else if (sectionId === 'executive_persona') {
      window.location.href = '/tools/executive-persona'; // Assuming this path exists or will exist
    } else if (sectionId === 'contextual-deal-writer') {
      window.location.href = '/tools/contextual-deal-writer'; // Assuming this path exists or will exist
    } else if (sectionId === 'image_generator') {
      window.location.href = '/tools/image-generator'; // Assuming this path exists or will exist
    } else if (sectionId === 'voiceover_generator') {
      window.location.href = '/tools/voiceover-generator'; // Assuming this path exists or will exist
    } else {
      // For other sections, just scroll to top for now.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <main>
      <PortfolioHomeSection onSectionChange={handleSectionChange} />
    </main>
  );
}

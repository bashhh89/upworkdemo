import { NextResponse } from 'next/server';
import { createToolResult } from '@/lib/tool-utils';

export async function POST(request: Request) {
  try {
    const { company, industry, dealSize } = await request.json();
    
    if (!company || !industry || !dealSize) {
      return NextResponse.json(
        { error: 'Company, industry, and dealSize are required' },
        { status: 400 }
      );
    }
    
    // Mock data for demo purposes
    // In a real implementation, this would call an AI model to generate the proposal
    const mockData = {
      proposal: {
        company,
        industry,
        dealSize,
        title: `Strategic Partnership Proposal for ${company}`,
        summary: `A customized ${dealSize} partnership proposal for ${company} in the ${industry} industry, focused on delivering measurable business outcomes.`,
        sections: [
          {
            title: 'Executive Summary',
            content: `This proposal outlines a comprehensive partnership between our company and ${company}, designed to address key challenges in the ${industry} industry and deliver substantial business value.`
          },
          {
            title: 'Understanding Your Business',
            content: `As a leading organization in the ${industry} sector, ${company} faces unique challenges including market competition, operational efficiency, and digital transformation. Our solution is tailored to address these specific needs.`
          },
          {
            title: 'Proposed Solution',
            content: `We propose a ${dealSize} implementation of our platform, customized for ${company}'s specific requirements. This includes integrated modules for analytics, automation, and optimization that align with your strategic objectives.`
          },
          {
            title: 'Expected Outcomes',
            content: `By implementing our solution, ${company} can expect to achieve 15-20% improvement in operational efficiency, 25% reduction in process time, and significant enhancements in data-driven decision making capabilities.`
          },
          {
            title: 'Investment and ROI',
            content: `The proposed partnership represents a strategic investment with expected ROI within 6-9 months. The pricing structure is designed to accommodate your ${dealSize} requirements while delivering maximum value.`
          },
          {
            title: 'Implementation Roadmap',
            content: `Our proven implementation methodology ensures a smooth transition with minimal disruption to your existing operations. The process includes discovery, configuration, testing, training, and ongoing support phases.`
          }
        ],
        callToAction: `Let's schedule a detailed discovery session to discuss how this proposal can be further customized to ${company}'s specific needs and objectives.`
      },
      customizations: {
        industryInsights: [
          `${industry} organizations are increasingly focusing on digital transformation`,
          `Regulatory changes in the ${industry} sector present both challenges and opportunities`,
          `Market competition in ${industry} is driving innovation and efficiency initiatives`
        ],
        companySizing: dealSize,
        potentialROI: dealSize.includes('Small') ? '150-200%' : 
                     dealSize.includes('Medium') ? '200-250%' : 
                     dealSize.includes('Large') ? '250-300%' : '300-400%'
      }
    };
    
    // Create a summary
    const summary = `
Contextual Deal Proposal for ${company} (${industry})

A tailored ${dealSize} partnership proposal focused on delivering measurable business outcomes. 
Key features include customized solution components, implementation roadmap, and expected ROI of ${mockData.customizations.potentialROI}.

The proposal addresses specific ${industry} industry challenges and includes a strategic implementation plan aligned with ${company}'s business objectives.
    `.trim();
    
    // Create a tool result
    const result = createToolResult(
      'Contextual Deal Writer',
      mockData,
      summary,
      { company, industry, dealSize }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in contextual deal writer API:', error);
    return NextResponse.json(
      { error: 'Failed to generate deal proposal' },
      { status: 500 }
    );
  }
} 
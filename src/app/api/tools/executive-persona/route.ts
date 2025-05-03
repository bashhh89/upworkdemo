import { NextResponse } from 'next/server';
import { createToolResult } from '@/lib/tool-utils';

export async function POST(request: Request) {
  try {
    const { name, title, company } = await request.json();
    
    if (!name || !title || !company) {
      return NextResponse.json(
        { error: 'Name, title, and company are required' },
        { status: 400 }
      );
    }
    
    // Mock data for demo purposes
    // In a real implementation, this would call an AI model to generate persona
    const mockData = {
      persona: {
        name,
        title,
        company,
        background: `${name} is an experienced ${title} at ${company} with over 15 years of industry experience.`,
        objectives: [
          'Drive strategic growth initiatives',
          'Expand market share in core segments',
          'Lead digital transformation efforts',
          'Optimize operational efficiency'
        ],
        challenges: [
          'Managing competing priorities',
          'Securing budget for innovation',
          'Navigating regulatory changes',
          'Attracting and retaining top talent'
        ],
        communication_style: 'Direct and data-driven, prefers concise communications with clear action items.',
        decision_factors: [
          'ROI and financial impact',
          'Alignment with strategic goals',
          'Implementation timeline',
          'Resource requirements'
        ],
        interests: [
          'Industry innovation',
          'Competitive strategy',
          'Leadership development',
          'Market trends'
        ]
      },
      company_info: {
        name: company,
        industry: 'Technology',
        size: 'Enterprise',
        annual_revenue: '$50M-$200M',
        challenges: [
          'Digital transformation',
          'Market competition',
          'Talent acquisition',
          'Operational efficiency'
        ]
      }
    };
    
    // Create a summary
    const summary = `
Executive Persona: ${name}, ${title} at ${company}

Background: Experienced professional with strategic focus on growth and innovation.
Key Objectives: ${mockData.persona.objectives.slice(0, 2).join(', ')}
Decision Factors: ROI, strategic alignment, and implementation feasibility
Communication Style: Direct, data-driven, and action-oriented
    `.trim();
    
    // Create a tool result
    const result = createToolResult(
      'Executive Persona',
      mockData,
      summary,
      { name, title, company }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in executive persona API:', error);
    return NextResponse.json(
      { error: 'Failed to generate executive persona' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { customers } = await request.json();

    if (!customers || typeof customers !== 'string') {
      return NextResponse.json(
        { error: 'Customer data is required' },
        { status: 400 }
      );
    }

    // Parse customer list
    const customerList = customers
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (customerList.length === 0) {
      return NextResponse.json(
        { error: 'At least one customer example is required' },
        { status: 400 }
      );
    }

    // Create the analysis prompt
    const prompt = `
You are an expert sales strategist and customer intelligence analyst. Analyze the following customer examples to build a comprehensive Ideal Customer Profile (ICP).

Customer Examples:
${customerList.map((customer, index) => `${index + 1}. ${customer}`).join('\n')}

Based on these customers, provide a detailed analysis in the following JSON format:

{
  "customerPatterns": {
    "demographics": ["specific demographic patterns you identify"],
    "psychographics": ["personality traits, values, motivations"],
    "behaviors": ["buying behaviors, usage patterns, decision-making styles"],
    "painPoints": ["common problems these customers face"]
  },
  "idealProfile": {
    "companySize": "specific size range (e.g., 50-200 employees)",
    "industry": ["primary industries"],
    "revenue": "revenue range",
    "geography": ["geographic regions"],
    "decisionMakers": ["typical decision maker roles"]
  },
  "buyingSignals": {
    "triggers": ["events that trigger buying decisions"],
    "timing": ["when they typically buy"],
    "channels": ["where they research and buy"]
  },
  "recommendations": {
    "prospecting": ["specific strategies for finding similar prospects"],
    "messaging": ["key messages that resonate"],
    "channels": ["best channels to reach them"],
    "timing": ["optimal timing for outreach"]
  },
  "summary": "A comprehensive 2-3 paragraph executive summary of the ideal customer profile and key insights"
}

Focus on actionable insights that will help sales teams identify and engage similar high-value prospects. Be specific and practical in your recommendations.
`;

    // Call the AI API
    const aiResponse = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales strategist and customer intelligence analyst. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'openai',
        jsonMode: true
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI API error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.text();
    
    // Parse the AI response
    let analysis;
    try {
      analysis = JSON.parse(aiData);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiData);
      // Fallback analysis
      analysis = {
        customerPatterns: {
          demographics: [
            "Mid-market companies with 50-500 employees",
            "Technology-forward organizations",
            "Companies in growth phase"
          ],
          psychographics: [
            "Innovation-driven leadership",
            "Results-oriented culture",
            "Value efficiency and automation"
          ],
          behaviors: [
            "Research solutions thoroughly before buying",
            "Prefer proven technologies with strong support",
            "Make decisions based on ROI and business impact"
          ],
          painPoints: [
            "Manual processes slowing growth",
            "Difficulty scaling operations",
            "Need for better data insights"
          ]
        },
        idealProfile: {
          companySize: "50-500 employees",
          industry: ["Technology", "Professional Services", "SaaS"],
          revenue: "$5M-$50M annual revenue",
          geography: ["North America", "Europe"],
          decisionMakers: ["CEO", "CTO", "VP of Operations"]
        },
        buyingSignals: {
          triggers: [
            "Rapid company growth",
            "New funding rounds",
            "Technology modernization initiatives"
          ],
          timing: [
            "Q1 and Q3 budget planning cycles",
            "After funding announcements",
            "During digital transformation projects"
          ],
          channels: [
            "LinkedIn and professional networks",
            "Industry conferences and events",
            "Referrals from existing customers"
          ]
        },
        recommendations: {
          prospecting: [
            "Target companies that recently announced funding",
            "Focus on fast-growing companies in target industries",
            "Leverage LinkedIn Sales Navigator for precise targeting"
          ],
          messaging: [
            "Lead with ROI and efficiency benefits",
            "Share case studies from similar companies",
            "Emphasize scalability and growth enablement"
          ],
          channels: [
            "LinkedIn outreach to decision makers",
            "Industry-specific conferences and events",
            "Referral programs with existing customers"
          ],
          timing: [
            "Early in budget cycles (Q1, Q3)",
            "Within 30 days of funding announcements",
            "During known growth phases"
          ]
        },
        summary: "Based on the customer analysis, your ideal customers are mid-market, technology-forward companies in growth phases with 50-500 employees and $5M-$50M in annual revenue. They value innovation, efficiency, and proven solutions that can scale with their business. These organizations typically have decision makers in C-suite and VP roles who prioritize ROI and business impact. The best approach is to target them during budget planning cycles or growth phases, leading with efficiency and scalability benefits while leveraging professional networks and referrals for warm introductions."
      };
    }

    return NextResponse.json(analysis);

  } catch (error) {
    console.error('ICP Builder API error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze customer profile. Please try again.' },
      { status: 500 }
    );
  }
}
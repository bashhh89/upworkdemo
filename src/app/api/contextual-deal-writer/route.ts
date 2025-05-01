import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs
import fs from 'fs/promises';
import path from 'path';

// Note: Please install uuid if not already installed: npm install uuid

// Define path for saving proposals
const PROPOSALS_FILE = path.join(process.cwd(), 'data', 'proposals.json');

// Ensure the data directory exists
async function ensureDataDirectoryExists() {
  const dataDir = path.join(process.cwd(), 'data');
  try {
    await fs.access(dataDir);
  } catch (error) {
    if ((error as any).code === 'ENOENT') {
      console.log('Data directory not found, creating...');
      await fs.mkdir(dataDir);
    } else {
      throw error;
    }
  }
}

/**
 * Analyzes a website URL using the existing scraper functionality
 */
async function analyzeWebsite(url: string): Promise<any> {
  console.log(`Analyzing website: ${url}`);
  
  try {
    // Ensure the URL has a protocol
    let urlToAnalyze = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      urlToAnalyze = 'https://' + url;
      console.log(`Added https protocol to URL: ${urlToAnalyze}`);
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/scraper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: urlToAnalyze })
    });
    
    if (!response.ok) {
      console.warn(`Website analysis returned status ${response.status}. Using fallback data.`);
      // Provide fallback data when scraper fails
      return {
        url: urlToAnalyze,
        title: extractDomainFromUrl(urlToAnalyze),
        description: "Website content could not be analyzed in detail. Using general information.",
        analysis: {
          "Company Name & Brand Identity": extractDomainFromUrl(urlToAnalyze),
          "Products/Services Offered": "General business products/services",
          "Target Audience/Market": "Business professionals and organizations",
          "Company Mission/Values/About": "Delivering value to customers through quality products/services",
          "Unique Value Propositions": "Professional solutions tailored to customer needs",
          "Technologies Used": "Modern business technology solutions"
        },
        usedFallback: true
      };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in website analysis:', error);
    // Return fallback data instead of throwing an error
    return {
      url: url,
      title: extractDomainFromUrl(url),
      description: "Website content could not be analyzed. Proceeding with limited information.",
      analysis: {
        "Company Name & Brand Identity": extractDomainFromUrl(url),
        "Products/Services Offered": "General business products/services",
        "Target Audience/Market": "Business professionals and organizations",
        "Company Mission/Values/About": "Delivering value to customers through quality products/services",
        "Unique Value Propositions": "Professional solutions tailored to customer needs",
        "Technologies Used": "Modern business technology solutions"
      },
      usedFallback: true
    };
  }
}

/**
 * Extract domain name from URL for use in fallback data
 */
function extractDomainFromUrl(url: string): string {
  try {
    // Remove protocol and www
    let domain = url.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
    // Remove path, query string, and hash
    domain = domain.split('/')[0];
    // Remove port if present
    domain = domain.split(':')[0];
    
    // Format nicely for display
    return domain.charAt(0).toUpperCase() + domain.slice(1);
  } catch (error) {
    return url;
  }
}

/**
 * Analyzes a LinkedIn profile for executive insights
 */
async function analyzeLinkedInProfile(executiveName: string, companyName: string): Promise<any> {
  console.log(`Analyzing LinkedIn profile for: ${executiveName} at ${companyName}`);
  
  const promptText = `
    Find publicly available professional information, focusing on LinkedIn if possible, for executive "${executiveName}" at company "${companyName}".
    
    Analyze their profile summary, job titles, company information, and any recent public posts or articles. 
    Based ONLY on this public information, infer their likely professional communication style and personality traits.
    
    Generate a concise report as a JSON object with these exact keys:
    - profileSummary: String summarizing key career points/focus found
    - inferredStyle: String describing likely communication preferences
    - communicationTips: Array of 5 actionable tips for effectively engaging with this person
    - preferencesAndTraits: Object containing communication preferences with scores (1-10) and descriptions
      - data_orientation: How strongly they prefer data/facts
      - relationship_focus: How important relationships are to them
      - decision_speed: How quickly they tend to make decisions
      - risk_tolerance: Their approach to risk-taking
      - communication_formality: How formal their communication style is
    - discProfile: Object containing DISC personality profile assessment
      - primaryType: The dominant DISC type (Dominance, Influence, Steadiness, or Conscientiousness)
      - secondaryType: Secondary DISC type, if applicable
      - description: Detailed explanation of their DISC style and how it manifests
      - strengths: Array of 3-5 strengths associated with this DISC profile
      - challenges: Array of 3-5 potential challenges or blind spots
    - insightsByContext: Object with keys representing different business contexts, values are insights
      - sales: Tips for selling to this executive
      - presentations: How to structure presentations for this executive
      - email: Tips for effective email communication

    Format the response as a VALID JSON object with the structure described above.
  `;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/pollinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "searchgpt",
        messages: [
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      console.warn(`LinkedIn analysis returned status ${response.status}. Using fallback data.`);
      // Return fallback data
      return getFallbackExecutiveProfile(executiveName, companyName);
    }
    
    const data = await response.json();
    
    if (data.content) {
      try {
        return JSON.parse(data.content);
      } catch (parseError) {
        console.error("Failed to parse profile data:", parseError);
        // Return fallback data on parse error
        return getFallbackExecutiveProfile(executiveName, companyName);
      }
    } else {
      console.warn("Invalid response format from LinkedIn analysis API. Using fallback data.");
      return getFallbackExecutiveProfile(executiveName, companyName);
    }
  } catch (error) {
    console.error('Error in LinkedIn profile analysis:', error);
    // Return fallback data on any error
    return getFallbackExecutiveProfile(executiveName, companyName);
  }
}

/**
 * Provides fallback executive profile data when the analysis fails
 */
function getFallbackExecutiveProfile(executiveName: string, companyName: string): any {
  return {
    profileSummary: `${executiveName} is a business professional at ${companyName}. Limited information is available from public sources.`,
    inferredStyle: "Professional and business-oriented communication style",
    communicationTips: [
      "Focus on clear, concise communication",
      "Emphasize the business value of your offering",
      "Be respectful of their time",
      "Provide relevant case studies or examples",
      "Follow up appropriately after meetings"
    ],
    preferencesAndTraits: {
      data_orientation: {
        score: 7,
        description: "Likely values data-backed proposals and clear metrics"
      },
      relationship_focus: {
        score: 6,
        description: "Balanced approach to relationships and business outcomes"
      },
      decision_speed: {
        score: 6,
        description: "Makes reasonably timely decisions with adequate information"
      },
      risk_tolerance: {
        score: 5,
        description: "Moderate approach to risk, looks for balanced solutions"
      },
      communication_formality: {
        score: 7,
        description: "Generally formal in business communications"
      }
    },
    discProfile: {
      primaryType: "Conscientiousness",
      secondaryType: "Dominance",
      description: "Likely values accuracy, quality, and expertise. May prefer detailed information and logical arguments.",
      strengths: [
        "Analytical thinking",
        "Attention to detail",
        "Process-oriented",
        "Problem-solving abilities",
        "Quality focus"
      ],
      challenges: [
        "May overanalyze decisions",
        "Could be perceived as overly critical",
        "Might resist rapid change without sufficient data"
      ]
    },
    insightsByContext: {
      sales: "Present clear value propositions with supporting evidence. Avoid overpromising and focus on realistic deliverables.",
      presentations: "Use well-organized, data-driven presentations with clear sections and supporting evidence.",
      email: "Keep emails professional, concise, and well-structured with clear action items or questions."
    },
    usedFallback: true
  };
}

/**
 * Generate a deal proposal based on website and executive analysis
 */
async function generateDealProposal(
  websiteData: any, 
  executiveProfile: any, 
  offeringDetails: string,
  format: string,
  proposalGoal: string
): Promise<string> {
  console.log('Generating deal proposal with combined data');
  
  const analysis = websiteData.analysis || {};
  
  // Create a comprehensive prompt for Pollinations
  const promptText = `
    I need to write a highly personalized business proposal. I have analyzed the prospect's website and the executive's LinkedIn profile, and I need you to craft a compelling, persuasive proposal based on this data.
    
    ## WEBSITE INTELLIGENCE:
    Company: ${websiteData.title || 'Unknown'}
    Website: ${websiteData.url || 'Unknown'}
    Description: ${websiteData.description || 'No description found'}
    
    Company & Brand Identity: ${analysis["Company Name & Brand Identity"] || 'Unknown'}
    Products/Services: ${analysis["Products/Services Offered"] || 'Unknown'}
    Target Audience: ${analysis["Target Audience/Market"] || 'Unknown'}
    Mission/Values: ${analysis["Company Mission/Values/About"] || 'Unknown'}
    UVP: ${analysis["Unique Value Propositions"] || 'Unknown'}
    Technologies: ${analysis["Technologies Used"] || 'Unknown'}
    
    ## EXECUTIVE PROFILE:
    Name: ${executiveProfile.profileSummary ? executiveProfile.profileSummary.split('.')[0] : 'Unknown Executive'}
    Profile Summary: ${executiveProfile.profileSummary || 'Unknown'}
    Communication Style: ${executiveProfile.inferredStyle || 'Unknown'}
    Primary DISC Type: ${executiveProfile.discProfile?.primaryType || 'Unknown'}
    DISC Description: ${executiveProfile.discProfile?.description || 'Unknown'}
    
    Communication Preferences:
    - Data Orientation: ${executiveProfile.preferencesAndTraits?.data_orientation?.description || 'Unknown'}
    - Relationship Focus: ${executiveProfile.preferencesAndTraits?.relationship_focus?.description || 'Unknown'}
    - Decision Speed: ${executiveProfile.preferencesAndTraits?.decision_speed?.description || 'Unknown'}
    - Risk Tolerance: ${executiveProfile.preferencesAndTraits?.risk_tolerance?.description || 'Unknown'}
    - Communication Formality: ${executiveProfile.preferencesAndTraits?.communication_formality?.description || 'Unknown'}
    
    Sales Approach: ${executiveProfile.insightsByContext?.sales || 'Unknown'}
    Presentation Style: ${executiveProfile.insightsByContext?.presentations || 'Unknown'}
    
    ## MY OFFERING:
    ${offeringDetails}
    
    ## SPECIFIC PROPOSAL GOAL:
    ${proposalGoal}
    
    ## GUIDELINES:
    1. Write a highly personalized ${format} proposal addressed directly to this executive.
    2. Tailor your tone, structure, and content to match their DISC profile and communication preferences.
    3. Demonstrate understanding of their business challenges based on website data.
    4. Connect my offering directly to their specific needs, pain points, and goals.
    5. Use their preferred communication style (data-driven, relationship-focused, etc.).
    6. Include specific insights from their company's website that show I've done my homework.
    7. Keep the proposal concise but impactful, focusing on value and ROI.
    8. Make it conversational but professional, matching their formality level.
    9. Include a clear, specific call to action aligned with their decision-making style.
    10. Ensure the proposal directly addresses the specific proposal goal provided above.
    
    Format the proposal as a finished, ready-to-send document with appropriate sections. I should be able to use this proposal immediately without editing.
  `;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/pollinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "azure-openai",
        messages: [
          { role: "user", content: promptText }
        ],
        temperature: 0.7
      })
    });
    
    if (!response.ok) {
      console.warn(`Proposal generation returned status ${response.status}. Using fallback proposal.`);
      // Return fallback proposal instead of throwing an error
      return generateFallbackProposal(websiteData, executiveProfile, offeringDetails, format, proposalGoal);
    }
    
    const data = await response.json();
    if (!data.content) {
      console.warn("Invalid response format from proposal generation API. Using fallback proposal.");
      return generateFallbackProposal(websiteData, executiveProfile, offeringDetails, format, proposalGoal);
    }

    return data.content;
  } catch (error) {
    console.error('Error generating proposal:', error);
    // Return fallback proposal on any error
    return generateFallbackProposal(websiteData, executiveProfile, offeringDetails, format, proposalGoal);
  }
}

/**
 * Generates a basic fallback proposal when the AI proposal generation fails
 */
function generateFallbackProposal(
  websiteData: any,
  executiveProfile: any, 
  offeringDetails: string,
  format: string,
  proposalGoal: string
): string {
  const companyName = websiteData.title || websiteData.analysis?.["Company Name & Brand Identity"] || "your company";
  const executiveName = executiveProfile.profileSummary ? executiveProfile.profileSummary.split('.')[0] : "Valued Executive";
  
  // Create a generic but useful proposal based on the available information
  return `# ${format.charAt(0).toUpperCase() + format.slice(1)} Proposal for ${companyName}

Dear ${executiveName},

## Introduction

I'm reaching out to discuss how our services can help address your business needs. After reviewing your company information, I believe there's a strong opportunity for us to collaborate.

## Our Understanding of Your Business

From our research, we understand that ${companyName} ${websiteData.description ? `is ${websiteData.description}` : "is focused on delivering value to your customers"}. ${websiteData.analysis?.["Products/Services Offered"] ? `You offer ${websiteData.analysis?.["Products/Services Offered"]}.` : ""}

## Our Offering

${offeringDetails}

## How We Can Help Achieve Your Goals

Our primary goal is to: ${proposalGoal}

Based on our understanding of your company, we believe we can provide significant value by:
- Delivering tailored solutions that address your specific business challenges
- Providing expertise and support throughout implementation
- Ensuring measurable results aligned with your business objectives

## Next Steps

I would welcome the opportunity to discuss this proposal in more detail. Please let me know if you're available for a brief call next week to explore how we might work together.

Thank you for considering our proposal. I look forward to the possibility of working with ${companyName}.

Best regards,
[Your Name]
[Your Title]
[Contact Information]
`;
}

export async function POST(request: Request) {
  // Ensure data directory exists
  await ensureDataDirectoryExists();
  
  try {
    const requestData = await request.json();
    const { companyUrl, executiveName, companyName, offeringDetails, format = 'email', proposalGoal } = requestData;
    
    if (!companyUrl || !executiveName || !companyName || !offeringDetails || !proposalGoal) {
      return NextResponse.json(
        { error: 'Required fields missing', details: 'Please provide companyUrl, executiveName, companyName, offeringDetails, and proposalGoal' },
        { status: 400 }
      );
    }
    
    // Track progress for each step
    const progress = {
      status: 'analyzing_website',
      progress: 10,
      message: 'Analyzing company website...'
    };
    
    // Step 1: Analyze the company website
    let websiteData;
    try {
      websiteData = await analyzeWebsite(companyUrl);
      progress.status = 'analyzing_executive';
      progress.progress = 40;
      progress.message = 'Analyzing executive profile...';
    } catch (error) {
      console.error('Website analysis failed:', error);
      return NextResponse.json(
        { error: 'Website analysis failed', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
    
    // Step 2: Analyze the executive's LinkedIn profile
    let executiveProfile;
    try {
      executiveProfile = await analyzeLinkedInProfile(executiveName, companyName);
      progress.status = 'generating_proposal';
      progress.progress = 70;
      progress.message = 'Generating personalized proposal...';
    } catch (error) {
      console.error('Executive profile analysis failed:', error);
      return NextResponse.json(
        { error: 'Executive profile analysis failed', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      );
    }
    
    // Step 3: Generate the proposal - this function now handles errors internally with fallbacks
    progress.status = 'generating_proposal';
    progress.progress = 70;
    progress.message = 'Generating personalized proposal...';
    const proposal = await generateDealProposal(websiteData, executiveProfile, offeringDetails, format, proposalGoal);
    progress.status = 'completed';
    progress.progress = 100;
    progress.message = 'Proposal generation complete!';
    
    // Step 4: Save the proposal and generate a shareable URL
    const id = uuidv4(); // Generate unique ID
    const timestamp = new Date().toISOString();
    
    // Create proposal data object to save
    const proposalData = {
      id,
      timestamp,
      input: {
        companyUrl,
        executiveName,
        companyName,
        offeringDetails,
        format,
        proposalGoal
      },
      websiteAnalysis: websiteData,
      executiveProfile,
      proposal
    };
    
    // Read existing proposals or create empty array if file doesn't exist
    let proposals = [];
    try {
      const fileContent = await fs.readFile(PROPOSALS_FILE, 'utf-8');
      proposals = JSON.parse(fileContent);
      
      // Ensure it's an array
      if (!Array.isArray(proposals)) {
        proposals = [];
      }
    } catch (error) {
      // If file doesn't exist or can't be read, start with empty array
      if ((error as any).code === 'ENOENT') {
        console.log('Proposals file not found, creating new one.');
      } else {
        console.error('Error reading proposals file:', error);
      }
    }
    
    // Add new proposal to array and save
    proposals.push(proposalData);
    
    try {
      await fs.writeFile(PROPOSALS_FILE, JSON.stringify(proposals, null, 2), 'utf-8');
      console.log(`Proposal saved with ID: ${id}`);
    } catch (error) {
      console.error('Error saving proposal:', error);
      // Continue with request even if saving fails
    }
    
    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';
    const shareableUrl = `${baseUrl}/proposal/${id}`;
    
    // Track what happened during analysis for display to the user
    const analysisSteps = {
      website: {
        url: companyUrl,
        success: !!(websiteData && !websiteData.error),
        foundData: websiteData?.analysis && Object.values(websiteData.analysis).some(val => val && !val.includes("Unknown")),
        usedFallback: websiteData?.usedFallback || false
      },
      executive: {
        name: executiveName,
        company: companyName,
        success: !!(executiveProfile && !executiveProfile.error),
        usedFallback: executiveProfile?.profileSummary?.includes("Limited information is available") || false
      },
      proposal: {
        format: format,
        goal: proposalGoal.substring(0, 50) + (proposalGoal.length > 50 ? '...' : ''),
        length: proposal.length,
        usedFallback: proposal.includes("[Your Name]")
      }
    };
    
    // Return the complete results with ID and shareable URL
    return NextResponse.json({
      proposal,
      websiteAnalysis: websiteData,
      executiveProfile,
      id,
      shareableUrl,
      generatedAt: timestamp,
      analysisSteps
    });
    
  } catch (error) {
    console.error('Error in contextual deal writer:', error);
    return NextResponse.json(
      { error: 'Contextual deal writer failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 
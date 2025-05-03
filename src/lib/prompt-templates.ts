// src/lib/prompt-templates.ts

export interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  promptText: string;
}

export const marketingPromptTemplates: PromptTemplate[] = [
  {
    id: 'pas-hook-generator',
    title: 'PAS Copywriting Hooks',
    description: 'Generates Problem-Agitate-Solution hooks for ad copy or landing pages based on a target audience pain point.',
    category: 'Direct Response Copy',
    promptText: `Generate 5-10 Problem-Agitate-Solution (PAS) hooks for ad copy or a landing page.

Target Audience: [Describe your target audience, e.g., small business owners struggling with lead generation]
Pain Point: [Specify the main pain point, e.g., inconsistent lead flow]`,
  },
  {
    id: 'seo-content-brief-outline',
    title: 'SEO Content Brief Outline',
    description: 'Provides a detailed outline for an SEO-optimized content piece based on a target keyword and user intent.',
    category: 'Content Strategy',
    promptText: `Create a comprehensive content brief outline for an SEO-optimized article or blog post.

Target Keyword: [Specify the main keyword]
Target Audience: [Describe the intended reader]
User Intent: [Explain the user's goal when searching this keyword, e.g., informational, commercial, navigational]
Desired Content Format: [e.g., Blog post, landing page, guide]
Key Competitors (Optional): [List 2-3 competitor URLs ranking for the keyword]

Include sections for:
- Title & Meta Description (with keyword)
- Target Keyword & Semantic Keywords
- User Intent Analysis
- Recommended Word Count Range
- Main Headings (H1, H2, H3 structure based on keyword and intent)
- Key Questions to Answer
- Internal and External Linking Opportunities
- Call to Action (CTA) suggestions`,
  },
  {
    id: 'aida-ad-copy-structure',
    title: 'AIDA Ad Copy Structure',
    description: 'Structures ad copy using the AIDA (Attention, Interest, Desire, Action) framework for various platforms.',
    category: 'Social Ads',
    promptText: `Write ad copy following the AIDA framework for [Specify platform, e.g., Facebook, Google Ads, LinkedIn].

Product/Service: [Describe your product/service]
Target Audience: [Describe your target audience]
Key Benefit/Offer: [What is the main value proposition or offer?]
Call to Action (CTA): [What do you want the user to do? e.g., Learn More, Shop Now, Sign Up]
Tone of Voice: [e.g., Professional, casual, urgent]

A: Attention (Hook the reader)
I: Interest (Present compelling information)
D: Desire (Create emotional connection/highlight benefits)
A: Action (Clear call to action)`,
  },
  {
    id: 'email-subject-line-variations',
    title: 'Email Subject Line Variations',
    description: 'Generates various email subject line options using different psychological triggers.',
    category: 'Email Marketing',
    promptText: `Generate 10-15 variations of email subject lines for a [Specify email type, e.g., promotional email, newsletter, abandoned cart reminder].

Email Topic/Content: [Briefly describe the email content]
Key Benefit/Offer: [What is the main takeaway or offer?]
Target Audience: [Describe who the email is for]
Desired Action: [What should the recipient do after opening?]

Include variations using:
- Curiosity
- Urgency/Scarcity
- Benefit-driven language
- Personalization ([Name] placeholder)
- Questions
- Numbers/Lists`,
  },
  {
    id: 'uvp-definition-framework',
    title: 'Unique Value Proposition (UVP) Framework',
    description: 'Helps define a clear and compelling Unique Value Proposition for a product or service.',
    category: 'Brand Foundation',
    promptText: `Define a clear and compelling Unique Value Proposition (UVP) for our [Product/Service Name] using the following framework:

Our [Product/Service Name] helps [Target Customer] who [Customer Problem] by [Key Benefit 1] and [Key Benefit 2]. Unlike [Main Competitor/Alternative], we [Point of Difference].

Provide the following information:
Product/Service Name: [Your product or service name]
Target Customer: [Who is your ideal customer?]
Customer Problem: [What specific problem do you solve for them?]
Key Benefit 1: [The primary advantage of your solution]
Key Benefit 2: [Another significant advantage]
Main Competitor/Alternative: [Who is your biggest competitor or what is the common alternative?]
Point of Difference: [What makes you uniquely better or different?]

Based on this, write out the full UVP statement.`,
  },
  {
    id: 'social-media-post-ideas',
    title: 'Social Media Post Ideas',
    description: 'Brainstorms engaging social media post ideas based on a topic and platform.',
    category: 'Social Media Marketing',
    promptText: `Generate 10-15 social media post ideas for [Specify platform, e.g., Instagram, Twitter, LinkedIn, Facebook].

Topic: [Specify the main topic or theme]
Goal: [What do you want to achieve with these posts? e.g., Increase engagement, drive traffic, build brand awareness]
Target Audience: [Describe your audience]
Key Message (Optional): [Is there a specific message you want to convey?]

Include a mix of formats (e.g., questions, tips, behind-the-scenes, promotions, user-generated content ideas).`,
  },
];
import { NextResponse } from 'next/server';
import { createToolResult } from '@/lib/tool-utils';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Basic URL validation and formatting
    let formattedUrl = url;
    try {
      // Add protocol if missing
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        formattedUrl = `https://${url}`;
      }
      
      new URL(formattedUrl);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please enter a valid website URL.' },
        { status: 400 }
      );
    }
    
    // Extract domain for more realistic mock data
    const domain = new URL(formattedUrl).hostname;
    const domainParts = domain.split('.');
    const baseDomain = domainParts.length > 1 ? domainParts[domainParts.length - 2] : domain;
    
    // Generate semi-realistic mock data based on the actual URL
    const mockData = {
      url: formattedUrl,
      title: `Website Analysis for ${domain}`,
      categories: generateCategories(baseDomain),
      links: generateLinks(formattedUrl, domain),
      images: generateImages(domain),
      content: generateSampleContent(domain, baseDomain),
      metadata: {
        description: `${capitalizeFirstLetter(baseDomain)} is a leading provider of innovative solutions in the technology space.`,
        keywords: ['website', 'analysis', baseDomain, 'business', 'technology']
      }
    };
    
    // Create a summary
    const summary = `
Analysis of ${domain} complete:
• Found ${mockData.categories.length} business categories
• Discovered ${mockData.links.length} links (both internal and external)
• Identified ${mockData.images.length} images
• Website appears to be in the ${mockData.categories.join(', ')} sectors
    `.trim();
    
    // Create a tool result with a unique ID
    const result = createToolResult(
      'Website Intelligence Scanner',
      mockData,
      summary,
      { url: formattedUrl },
      formattedUrl,
      uuidv4() // Generate a unique ID for the result
    );
    
    // Save the result to localStorage via client-side code
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in website scanner API:', error);
    return NextResponse.json(
      { error: 'Failed to process website analysis. Please try again.' },
      { status: 500 }
    );
  }
}

// Helper functions to generate more realistic mock data
function generateCategories(domain: string) {
  const baseCats = ['Technology', 'Business'];
  const extraCats = [
    'SaaS', 'E-commerce', 'Marketing', 'Finance', 'Education', 
    'Healthcare', 'Media', 'Entertainment', 'B2B', 'Consulting'
  ];
  
  // Add 2-3 random categories plus the domain
  const randomCats = [];
  for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
    const idx = Math.floor(Math.random() * extraCats.length);
    randomCats.push(extraCats[idx]);
    extraCats.splice(idx, 1); // Remove so we don't pick it twice
  }
  
  return [...baseCats, ...randomCats, capitalizeFirstLetter(domain)];
}

function generateLinks(baseUrl: string, domain: string) {
  const commonPaths = ['about', 'contact', 'pricing', 'features', 'blog', 'support', 'products', 'solutions'];
  const socialLinks = [
    'https://twitter.com/',
    'https://linkedin.com/company/',
    'https://facebook.com/',
    'https://instagram.com/'
  ];
  
  const url = new URL(baseUrl);
  const links = commonPaths.map(path => `${url.protocol}//${domain}/${path}`);
  
  // Add some social links
  socialLinks.forEach(social => {
    if (Math.random() > 0.3) { // 70% chance to add each social link
      links.push(`${social}${domain.split('.')[0]}`);
    }
  });
  
  return links;
}

function generateImages(domain: string) {
  const commonImages = [
    { src: '/logo.png', alt: `${domain} Logo` },
    { src: '/hero.jpg', alt: 'Hero Image' },
    { src: '/product.png', alt: 'Product Screenshot' }
  ];
  
  const extraImages = [
    { src: '/team.jpg', alt: 'Team Photo' },
    { src: '/office.jpg', alt: 'Office Location' },
    { src: '/customer.jpg', alt: 'Customer Testimonial' },
    { src: '/dashboard.png', alt: 'Product Dashboard' },
    { src: '/features.png', alt: 'Feature Overview' },
    { src: '/mobile-app.png', alt: 'Mobile Application' }
  ];
  
  // Add 2-5 random extra images
  const numExtra = 2 + Math.floor(Math.random() * 4);
  const randomImages = [];
  for (let i = 0; i < numExtra; i++) {
    if (extraImages.length > 0) {
      const idx = Math.floor(Math.random() * extraImages.length);
      randomImages.push(extraImages[idx]);
      extraImages.splice(idx, 1);
    }
  }
  
  return [...commonImages, ...randomImages];
}

function generateSampleContent(domain: string, baseDomain: string) {
  return `
Welcome to ${domain}

${capitalizeFirstLetter(baseDomain)} provides innovative solutions for businesses of all sizes. Our platform helps organizations streamline their operations, increase efficiency, and drive growth.

Our Products:
- ${capitalizeFirstLetter(baseDomain)} Analytics: Real-time data insights
- ${capitalizeFirstLetter(baseDomain)} Connect: Seamless integration platform
- ${capitalizeFirstLetter(baseDomain)} Pro: Enterprise-grade solutions

Founded in ${2010 + Math.floor(Math.random() * 12)}, we've helped over ${1000 + Math.floor(Math.random() * 9000)} customers achieve their business goals.

Contact us today to learn how we can help your business succeed.
`.trim();
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
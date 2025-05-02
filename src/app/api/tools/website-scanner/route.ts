import { NextRequest, NextResponse } from 'next/server';

// Function to extract domain from URL
function extractDomain(url: string): string {
  // Add https if not present
  if (!url.startsWith('http')) {
    url = 'https://' + url;
  }
  
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (error) {
    return url;
  }
}

// Mock function to analyze a website
async function analyzeWebsite(url: string) {
  // Add protocol if not present
  if (!url.match(/^https?:\/\//i)) {
    url = 'https://' + url;
  }
  
  try {
    // For demo purposes, we'll generate mock data
    // In a real implementation, this would involve:
    // 1. Fetching the website content
    // 2. Parsing HTML
    // 3. Extracting data
    // 4. Running analysis
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const domain = extractDomain(url);
    
    // Generate random number of links
    const linkCount = Math.floor(Math.random() * 30) + 5;
    const links = [];
    
    // Generate mock links
    for (let i = 0; i < linkCount; i++) {
      if (Math.random() > 0.5) {
        links.push(`https://${domain}/page-${i}`);
      } else {
        const externalDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'github.com', 'google.com'];
        const randomDomain = externalDomains[Math.floor(Math.random() * externalDomains.length)];
        links.push(`https://${randomDomain}/some-path-${i}`);
      }
    }
    
    // Generate random number of images
    const imageCount = Math.floor(Math.random() * 15) + 2;
    const images = [];
    
    // Generate mock image URLs
    for (let i = 0; i < imageCount; i++) {
      images.push(`https://${domain}/images/image-${i}.jpg`);
    }
    
    // Generate mock content categories
    const possibleCategories = [
      'E-commerce',
      'Business',
      'Technology',
      'Marketing',
      'Software',
      'Services',
      'Portfolio',
      'Blog',
      'News',
      'Education',
      'Finance',
      'Healthcare',
      'Real Estate',
      'Travel',
      'Food',
      'Fashion',
      'Sports',
      'Entertainment'
    ];
    
    // Select random categories
    const categoryCount = Math.floor(Math.random() * 5) + 1;
    const categories = [];
    for (let i = 0; i < categoryCount; i++) {
      const randomCategory = possibleCategories[Math.floor(Math.random() * possibleCategories.length)];
      if (!categories.includes(randomCategory)) {
        categories.push(randomCategory);
      }
    }
    
    // Mock page content sample
    const content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${domain} - Website</title>
</head>
<body>
  <header>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/services">Services</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main>
    <h1>Welcome to ${domain}</h1>
    <p>This is a sample content extracted from the website.</p>
    <!-- More content would appear here -->
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${domain}. All rights reserved.</p>
  </footer>
</body>
</html>`;
    
    return {
      url,
      domain,
      links,
      images,
      categories,
      content,
      analyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error analyzing website:', error);
    throw new Error('Failed to analyze website');
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    const analysis = await analyzeWebsite(url);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error in website scanner API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze website' },
      { status: 500 }
    );
  }
} 
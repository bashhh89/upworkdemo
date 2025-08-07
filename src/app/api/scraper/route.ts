import { NextResponse } from 'next/server';

// Serper API configuration
const SERPER_API_KEY = 'c6fa01a9e3f82dea3113ac50dcb3fea0e34617c4';
const SERPER_URL = 'https://google.serper.dev/search';

// List of common CORS proxies (fallback)
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url='
];

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Extract domain for search
    const domain = parsedUrl.hostname.replace('www.', '');
    const companyName = domain.split('.')[0];

    // Fetch the website with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    // First, try direct fetch
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'none',
          'Sec-Fetch-User': '?1',
          'Cache-Control': 'max-age=0',
          'Referer': 'https://www.google.com/'
        },
        signal: controller.signal
      });
      
      // If the direct fetch works, proceed with it
      if (response.ok) {
        clearTimeout(timeoutId);
        const html = await response.text();
        return processHtml(html, url);
      }
      
      // If we got a 403/401 error, try using proxies
      if (response.status === 403 || response.status === 401) {
        console.log(`Got ${response.status}, trying CORS proxies...`);
        
        // Try each proxy in sequence until one works
        for (const proxy of CORS_PROXIES) {
          try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            console.log(`Trying proxy: ${proxyUrl}`);
            
            const proxyResponse = await fetch(proxyUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
              },
              signal: controller.signal
            });
            
            if (proxyResponse.ok) {
              clearTimeout(timeoutId);
              const html = await proxyResponse.text();
              return processHtml(html, url);
            }
          } catch (proxyError) {
            console.error(`Proxy error with ${proxy}:`, proxyError);
            // Continue to the next proxy
          }
        }
        
        // If all proxies failed, return the original error
        return NextResponse.json(
          { 
            error: `Failed to fetch website: ${response.status} ${response.statusText}`,
            details: response.status === 403 ? 
              "The website is blocking access. We tried using proxies but couldn't bypass the restriction. Try a different URL or check if the site allows scraping." :
              `HTTP status code ${response.status}`
          },
          { status: response.status }
        );
      }
      
      // For other errors, return them directly
      return NextResponse.json(
        { 
          error: `Failed to fetch website: ${response.status} ${response.statusText}`,
          details: response.status === 403 ? 
            "The website is blocking access. Try a different URL or check if the site allows scraping." :
            `HTTP status code ${response.status}`
        },
        { status: response.status }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Website fetch timed out after 30 seconds' },
          { status: 408 }
        );
      }
      throw fetchError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error('Website scraper error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to analyze website';
    let statusCode = 500;
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to connect to the website';
      statusCode = 503;
    } else if (error instanceof Error && error.name === 'AbortError') {
      errorMessage = 'Request timed out after 30 seconds';
      statusCode = 408;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: statusCode }
    );
  }
}

// Create analysis from real Serper data and website content
function createAnalysisFromData(title: string, description: string, serperData: any, html: string) {
  const analysis: Record<string, string> = {};
  
  // Extract company name from title
  const companyName = title.split(' - ')[0].split(' | ')[0].trim();
  
  // 1. Company Name & Brand Identity
  analysis['Company Name & Brand Identity'] = serperData?.knowledgeGraph?.title || companyName || 'Company name extracted from website title';
  
  // 2. Products/Services Offered
  const services = [];
  if (serperData?.knowledgeGraph?.description) {
    services.push(serperData.knowledgeGraph.description);
  }
  if (description && description !== 'No description found') {
    services.push(description);
  }
  // Extract services from organic results
  serperData?.organic?.slice(0, 3).forEach((result: any) => {
    if (result.snippet) services.push(result.snippet);
  });
  analysis['Products/Services Offered'] = services.length > 0 ? services.join('. ') : 'Information not available from current sources';
  
  // 3. Target Audience/Market
  const marketInfo = [];
  if (serperData?.knowledgeGraph?.type) {
    marketInfo.push(`Industry: ${serperData.knowledgeGraph.type}`);
  }
  analysis['Target Audience/Market'] = marketInfo.length > 0 ? marketInfo.join('. ') : 'Market information not available from current sources';
  
  // 4. Company Mission/Values/About
  analysis['Company Mission/Values/About'] = serperData?.knowledgeGraph?.description || description || 'Mission and values information not available from current sources';
  
  // 5. Team Members & Structure
  analysis['Team Members & Structure'] = 'Team information not available from current sources';
  
  // 6. Technologies Used
  const techStack = [];
  if (html.includes('react')) techStack.push('React');
  if (html.includes('angular')) techStack.push('Angular');
  if (html.includes('vue')) techStack.push('Vue.js');
  if (html.includes('wordpress')) techStack.push('WordPress');
  if (html.includes('shopify')) techStack.push('Shopify');
  analysis['Technologies Used'] = techStack.length > 0 ? techStack.join(', ') : 'Technology stack not identifiable from current sources';
  
  // 7. Content Strategy Analysis
  analysis['Content Strategy Analysis'] = 'Content strategy analysis requires deeper website crawling not available from current sources';
  
  // 8. Marketing Approach
  analysis['Marketing Approach'] = 'Marketing approach analysis not available from current sources';
  
  // 9. Unique Value Propositions
  analysis['Unique Value Propositions'] = serperData?.knowledgeGraph?.description || 'Value propositions not clearly identifiable from current sources';
  
  // 10. Competitive Positioning
  analysis['Competitive Positioning'] = 'Competitive analysis not available from current sources';
  
  // 11. Contact Information & Locations
  const contactInfo = [];
  if (serperData?.knowledgeGraph?.address) {
    contactInfo.push(`Address: ${serperData.knowledgeGraph.address}`);
  }
  if (serperData?.knowledgeGraph?.phone) {
    contactInfo.push(`Phone: ${serperData.knowledgeGraph.phone}`);
  }
  analysis['Contact Information & Locations'] = contactInfo.length > 0 ? contactInfo.join(', ') : 'Contact information not available from current sources';
  
  // 12. Social Media Presence
  analysis['Social Media Presence'] = 'Social media analysis not available from current sources';
  
  // 13. Blog/Content Topics
  analysis['Blog/Content Topics'] = 'Blog content analysis not available from current sources';
  
  // 14. SEO Analysis
  analysis['SEO Analysis'] = `Title: ${title}, Description: ${description}`;
  
  // 15. Customer Testimonials/Case Studies
  analysis['Customer Testimonials/Case Studies'] = 'Testimonials and case studies not available from current sources';
  
  // 16. Market Position & Industry Context
  const marketContext = [];
  if (serperData?.organic?.length > 0) {
    marketContext.push(`Found ${serperData.organic.length} related search results`);
  }
  if (serperData?.relatedSearches?.length > 0) {
    marketContext.push(`Related searches: ${serperData.relatedSearches.slice(0, 3).map((s: any) => s.query).join(', ')}`);
  }
  analysis['Market Position & Industry Context'] = marketContext.length > 0 ? marketContext.join('. ') : 'Market context not available from current sources';
  
  // 17. Recent News & Public Perception
  const newsInfo = [];
  if (serperData?.news?.length > 0) {
    newsInfo.push(`Recent news coverage: ${serperData.news.length} articles found`);
    serperData.news.slice(0, 2).forEach((news: any) => {
      if (news.title) newsInfo.push(`- ${news.title}`);
    });
  }
  analysis['Recent News & Public Perception'] = newsInfo.length > 0 ? newsInfo.join('. ') : 'No recent news coverage found';
  
  // 18. Search Visibility & Online Presence
  const searchInfo = [];
  if (serperData?.organic?.length > 0) {
    searchInfo.push(`Search visibility: ${serperData.organic.length} organic results found`);
  }
  if (serperData?.knowledgeGraph) {
    searchInfo.push('Knowledge graph presence detected');
  }
  analysis['Search Visibility & Online Presence'] = searchInfo.length > 0 ? searchInfo.join('. ') : 'Limited search visibility data available';
  
  return analysis;
}

// Serper API integration
async function getSerperData(url: string, title: string) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    const companyName = title.split(' - ')[0].split(' | ')[0].trim();
    
    // Search for company information using Serper
    const companySearchData = {
      q: `"${companyName}" company business site:${domain}`
    };

    const companyResponse = await fetch(SERPER_URL, {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companySearchData)
    });

    let companyData = null;
    if (companyResponse.ok) {
      companyData = await companyResponse.json();
    }
    
    // Get news about the company using Serper
    const newsSearchData = {
      q: `"${companyName}" news`
    };

    const newsResponse = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsSearchData)
    });

    let newsData = null;
    if (newsResponse.ok) {
      newsData = await newsResponse.json();
    }
    
    return {
      organic: companyData?.organic || [],
      knowledgeGraph: companyData?.knowledgeGraph || null,
      news: newsData?.news || [],
      relatedSearches: companyData?.relatedSearches || []
    };
  } catch (error) {
    console.error('Serper API error:', error);
    return null;
  }
}

// Helper function to process HTML content
async function processHtml(html: string, url: string) {
  
  // Basic metadata extraction from HTML
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found';
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 
                    html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i)?.[1] || 
                    'No description found';
  
  // Get Serper data for enhanced analysis
  const serperData = await getSerperData(url, title);
  
  // Extract links
  const links = [];
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    const text = linkMatch[2].replace(/<[^>]*>/g, '').trim();
    if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && text) {
      links.push({ href, text });
    }
  }

  // Extract images
  const images = [];
  // Try to match different image tag formats
  const imgPatterns = [
    /<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/gi,
    /<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi,
    /<img[^>]*src="([^"]*)"[^>]*>/gi
  ];

  // Process with each pattern
  for (const pattern of imgPatterns) {
    let imgMatch;
    if (pattern.toString().includes('alt="([^"]*)"[^>]*src')) {
      // Handle pattern where alt comes before src
      while ((imgMatch = pattern.exec(html)) !== null) {
        const alt = imgMatch[1] || '';
        const src = imgMatch[2] || '';
        if (src && !src.startsWith('data:')) {
          // Check if this image is already added (avoid duplicates)
          if (!images.some(img => img.src === src)) {
            images.push({ src, alt });
          }
        }
      }
    } else if (pattern.toString().includes('src="([^"]*)"[^>]*$')) {
      // Handle pattern with only src attribute
      while ((imgMatch = pattern.exec(html)) !== null) {
        const src = imgMatch[1] || '';
        if (src && !src.startsWith('data:')) {
          // Check if this image is already added (avoid duplicates)
          if (!images.some(img => img.src === src)) {
            images.push({ src, alt: '' });
          }
        }
      }
    } else {
      // Standard pattern with src before alt
      while ((imgMatch = pattern.exec(html)) !== null) {
        const src = imgMatch[1] || '';
        const alt = imgMatch[2] || '';
        if (src && !src.startsWith('data:')) {
          // Check if this image is already added (avoid duplicates)
          if (!images.some(img => img.src === src)) {
            images.push({ src, alt });
          }
        }
      }
    }
  }
  
  // Use Pollinations searchgpt for analysis
  let analysis = null;
  if (html.length > 0) {
    try {
      const analysisPrompt = `
      Analyze this website HTML from ${url}:
      
      Title: ${title}
      Description: ${description}
      
      ${serperData ? `
      ADDITIONAL SERPER RESEARCH DATA:
      
      Knowledge Graph: ${serperData.knowledgeGraph ? JSON.stringify(serperData.knowledgeGraph, null, 2) : 'Not available'}
      
      Recent News: ${serperData.news.length > 0 ? 
        serperData.news.slice(0, 5).map(news => `- ${news.title}: ${news.snippet || news.link}`).join('\n') : 
        'No recent news found'}
      
      Related Search Terms: ${serperData.relatedSearches.length > 0 ? 
        serperData.relatedSearches.map(search => search.query).join(', ') : 
        'None found'}
      
      Top Search Results: ${serperData.organic.length > 0 ? 
        serperData.organic.slice(0, 3).map(result => `- ${result.title}: ${result.snippet}`).join('\n') : 
        'None found'}
      ` : ''}
      
      Provide a comprehensive business intelligence analysis of this company or organization with the following structure:
      1. Company Name & Brand Identity
      2. Products/Services Offered (with detailed descriptions)
      3. Target Audience/Market
      4. Company Mission/Values/About
      5. Team Members & Structure (if available)
      6. Technologies Used (analyze the website tech stack)
      7. Content Strategy Analysis
      8. Marketing Approach
      9. Unique Value Propositions
      10. Competitive Positioning
      11. Contact Information & Locations
      12. Social Media Presence
      13. Blog/Content Topics (general themes if present)
      14. SEO Analysis (keywords focus, meta descriptions)
      15. Customer Testimonials/Case Studies
      16. Market Position & Industry Context (use SerpAPI data)
      17. Recent News & Public Perception (use SerpAPI news data)
      18. Search Visibility & Online Presence (use SerpAPI search data)

      Based on the website content and Serper research data, provide a comprehensive business intelligence analysis. Focus on factual information extracted from the sources rather than speculation.`;

      // Create analysis directly from Serper data and website content
      analysis = createAnalysisFromData(title, description, serperData, html);
    } catch (aiError) {
      console.error('Analysis error:', aiError);
      // Continue without analysis rather than failing completely
      if (aiError.name === 'AbortError') {
        console.log('AI analysis timed out, continuing without analysis');
      }
    }
  }

  return NextResponse.json({
    url,
    title,
    description,
    links: links.slice(0, 25), // Limit to 25 links to avoid overwhelming response
    images: images.slice(0, 15), // Limit to 15 images
    analysis,
    serperData, // Include Serper data
    scrapedAt: new Date().toISOString(),
    proxyUsed: true
  });
} 
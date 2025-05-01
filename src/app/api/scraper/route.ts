import { NextResponse } from 'next/server';

// List of common CORS proxies
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
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

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
        const html = await response.text();
        return processHtml(html, url, controller);
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
              const html = await proxyResponse.text();
              return processHtml(html, url, controller);
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
    return NextResponse.json(
      { error: 'Failed to analyze website', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// Helper function to ensure consistent analysis format
const normalizeAnalysisData = (analysis: any): Record<string, string> => {
  if (!analysis) return {};
  
  const normalized: Record<string, string> = {};
  
  // Ensure all analysis fields are strings
  Object.entries(analysis).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalized[key] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Convert nested objects to formatted strings
      normalized[key] = JSON.stringify(value, null, 2);
    } else {
      normalized[key] = String(value || 'No information available');
    }
  });
  
  return normalized;
};

// Helper function to process HTML content
async function processHtml(html: string, url: string, controller: AbortController) {
  // We don't need to clear timeout here since the controller is passed from caller
  // and the caller is responsible for clearing their own timeout
  
  // Basic metadata extraction from HTML
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found';
  const description = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i)?.[1] || 
                    html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i)?.[1] || 
                    'No description found';
  
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

      Format the response as a JSON object with these categories as keys. For each section, provide detailed insights rather than just extracted text. If information for a specific category is not available, include a note explaining this rather than leaving it blank.`;

      // Use Pollinations API with searchgpt model
      const pollinationsResponse = await fetch('https://text.pollinations.ai/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "searchgpt",
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.3
        })
      });

      if (pollinationsResponse.ok) {
        const pollinationsData = await pollinationsResponse.json();
        if (pollinationsData.choices && 
            pollinationsData.choices[0] && 
            pollinationsData.choices[0].message && 
            pollinationsData.choices[0].message.content) {
          try {
            const parsedAnalysis = JSON.parse(pollinationsData.choices[0].message.content);
            // Normalize the analysis data to ensure consistent format
            analysis = normalizeAnalysisData(parsedAnalysis);
          } catch (parseError) {
            console.error('Error parsing Pollinations analysis JSON:', parseError);
            // Return without analysis rather than failing completely
          }
        }
      } else {
        const errorText = await pollinationsResponse.text();
        console.error('Pollinations API error:', errorText);
      }
    } catch (aiError) {
      console.error('Analysis error:', aiError);
      // Continue without analysis rather than failing completely
    }
  }

  return NextResponse.json({
    url,
    title,
    description,
    links: links.slice(0, 25), // Limit to 25 links to avoid overwhelming response
    images: images.slice(0, 15), // Limit to 15 images
    analysis,
    scrapedAt: new Date().toISOString(),
    proxyUsed: true
  });
} 
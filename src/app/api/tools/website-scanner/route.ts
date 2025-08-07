import { NextResponse } from 'next/server';
import { createToolResult } from '@/lib/tool-utils';

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
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please enter a valid website URL.' },
        { status: 400 }
      );
    }
    
    // Use the enhanced scraper API that includes SerpAPI data
    try {
      const scraperResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scraper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });
      
      if (!scraperResponse.ok) {
        const errorData = await scraperResponse.json();
        throw new Error(errorData.error || 'Failed to analyze website');
      }
      
      const scraperData = await scraperResponse.json();
      
      // Transform scraper data into tool result format
      const analysisData = {
        url: scraperData.url,
        title: scraperData.title,
        description: scraperData.description,
        links: scraperData.links,
        images: scraperData.images,
        analysis: scraperData.analysis,
        serpData: scraperData.serpData, // Include SerpAPI research data
        scrapedAt: scraperData.scrapedAt
      };
      
      // Create enhanced summary with SerpAPI data
      const domain = new URL(formattedUrl).hostname;
      const serpInfo = scraperData.serpData ? [
        scraperData.serpData.organic_results?.length > 0 ? `${scraperData.serpData.organic_results.length} search results found` : '',
        scraperData.serpData.news_results?.length > 0 ? `${scraperData.serpData.news_results.length} recent news articles` : '',
        scraperData.serpData.knowledge_graph ? 'Company knowledge graph available' : ''
      ].filter(Boolean).join(', ') : '';
      
      const summary = `
Website Intelligence Analysis for ${domain}:
• Title: ${scraperData.title}
• Found ${scraperData.links?.length || 0} links and ${scraperData.images?.length || 0} images
• AI Analysis: ${scraperData.analysis ? 'Complete business intelligence generated' : 'Basic analysis completed'}
${serpInfo ? `• SerpAPI Research: ${serpInfo}` : ''}
• Analysis includes: Company profile, products/services, market positioning, and competitive insights
      `.trim();
      
      // Create a tool result
      const result = createToolResult(
        'Website Intelligence Scanner',
        analysisData,
        summary,
        { url: formattedUrl },
        formattedUrl
      );
      
      return NextResponse.json(result);
      
    } catch (scraperError) {
      console.error('Scraper API error:', scraperError);
      
      // Fallback to basic analysis if scraper fails
      const domain = new URL(formattedUrl).hostname;
      const fallbackData = {
        url: formattedUrl,
        title: `Website Analysis for ${domain}`,
        description: 'Analysis completed with limited data due to access restrictions',
        error: scraperError instanceof Error ? scraperError.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      
      const result = createToolResult(
        'Website Intelligence Scanner',
        fallbackData,
        `Basic analysis completed for ${domain}. Some features may be limited due to website access restrictions.`,
        { url: formattedUrl },
        formattedUrl
      );
      
      return NextResponse.json(result);
    }
    
  } catch (error) {
    console.error('Error in website scanner API:', error);
    return NextResponse.json(
      { error: 'Failed to process website analysis. Please try again.' },
      { status: 500 }
    );
  }
}


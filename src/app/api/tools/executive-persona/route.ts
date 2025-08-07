import { NextResponse } from 'next/server';
import { createToolResult } from '@/lib/tool-utils';

const SERPER_API_KEY = 'c6fa01a9e3f82dea3113ac50dcb3fea0e34617c4';

async function getExecutiveData(name: string, company: string) {
  try {
    // Search for executive information using Serper
    const executiveSearchData = {
      q: `"${name}" "${company}" executive CEO founder LinkedIn`
    };

    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(executiveSearchData)
    });

    if (!response.ok) throw new Error(`Serper API error: ${response.status}`);
    const data = await response.json();
    
    // Search for company information
    const companySearchData = {
      q: `"${company}" company business about`
    };

    const companyResponse = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(companySearchData)
    });

    const companyData = companyResponse.ok ? await companyResponse.json() : null;
    
    // Search for recent news about the executive
    const newsSearchData = {
      q: `"${name}" "${company}"`
    };

    const newsResponse = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newsSearchData)
    });

    const newsData = newsResponse.ok ? await newsResponse.json() : null;
    
    return {
      organic: data.organic || [],
      knowledgeGraph: data.knowledgeGraph || null,
      companyInfo: companyData?.organic || [],
      companyKnowledgeGraph: companyData?.knowledgeGraph || null,
      news: newsData?.news || [],
      relatedSearches: data.relatedSearches || []
    };
  } catch (error) {
    console.error('Serper API executive search error:', error);
    return null;
  }
}

function createPersonaFromSerperData(name: string, title: string, company: string, serperData: any) {
  // Extract background from search results
  const background = serperData?.organic?.[0]?.snippet || 
                    serperData?.knowledgeGraph?.description ||
                    `${name} serves as ${title} at ${company}. Professional background information available from search results.`;

  // Extract company information
  const companyDescription = serperData?.companyKnowledgeGraph?.description ||
                            serperData?.companyInfo?.[0]?.snippet ||
                            `${company} - Professional services organization`;

  // Extract recent news
  const recentNews = serperData?.news?.slice(0, 3).map((news: any) => ({
    title: news.title,
    snippet: news.snippet || news.link,
    date: news.date || 'Recent'
  })) || [];

  // Determine industry from company data
  const industry = serperData?.companyKnowledgeGraph?.type || 
                  (serperData?.companyInfo?.[0]?.snippet?.includes('technology') ? 'Technology' : 'Business Services');

  return {
    persona: {
      name,
      title,
      company,
      background,
      professional_summary: `${name} is ${title} at ${company}. ${background}`,
      search_results_found: serperData?.organic?.length || 0,
      news_coverage: recentNews.length,
      has_knowledge_graph: !!serperData?.knowledgeGraph,
      recent_news: recentNews,
      related_searches: serperData?.relatedSearches?.slice(0, 5).map((s: any) => s.query) || []
    },
    company_info: {
      name: company,
      description: companyDescription,
      industry,
      knowledge_graph_available: !!serperData?.companyKnowledgeGraph,
      website: serperData?.companyKnowledgeGraph?.website || '',
      search_results_found: serperData?.companyInfo?.length || 0
    },
    research_metadata: {
      executive_search_results: serperData?.organic?.length || 0,
      company_search_results: serperData?.companyInfo?.length || 0,
      news_articles_found: serperData?.news?.length || 0,
      has_executive_knowledge_graph: !!serperData?.knowledgeGraph,
      has_company_knowledge_graph: !!serperData?.companyKnowledgeGraph,
      data_source: 'serper_api',
      search_timestamp: new Date().toISOString()
    }
  };
}

export async function POST(request: Request) {
  try {
    const { name, title, company } = await request.json();
    
    if (!name || !title || !company) {
      return NextResponse.json(
        { error: 'Name, title, and company are required' },
        { status: 400 }
      );
    }
    
    // Get real data from Serper
    const serperData = await getExecutiveData(name, company);
    
    // Create persona directly from Serper data (no AI needed)
    const personaData = createPersonaFromSerperData(name, title, company, serperData);
    
    // Create a summary based on actual search results
    const summary = `
Executive Research: ${name}, ${title} at ${company}

Search Results: ${personaData.research_metadata.executive_search_results} executive results, ${personaData.research_metadata.company_search_results} company results
News Coverage: ${personaData.research_metadata.news_articles_found} recent articles found
Knowledge Graph: ${personaData.research_metadata.has_executive_knowledge_graph ? 'Executive profile available' : 'Limited executive data'}, ${personaData.research_metadata.has_company_knowledge_graph ? 'Company profile available' : 'Limited company data'}

Background: ${personaData.persona.background}
Company: ${personaData.company_info.description}
Industry: ${personaData.company_info.industry}
    `.trim();
    
    // Create a tool result
    const result = createToolResult(
      'Executive Persona',
      personaData,
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
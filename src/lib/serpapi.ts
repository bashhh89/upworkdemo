// SerpAPI utility for enhanced research and analysis
const SERPAPI_KEY = 'c6fa01a9e3f82dea3113ac50dcb3fea0e34617c4';
const SERPAPI_BASE_URL = 'https://serpapi.com/search';

export interface SerpSearchResult {
  title: string;
  link: string;
  snippet: string;
  position: number;
}

export interface SerpNewsResult {
  title: string;
  link: string;
  snippet: string;
  date: string;
  source: string;
}

export interface SerpImageResult {
  title: string;
  link: string;
  original: string;
  thumbnail: string;
}

export interface SerpCompanyInfo {
  name: string;
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  hours?: string;
}

// General web search
export async function searchWeb(query: string, num: number = 10): Promise<SerpSearchResult[]> {
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      api_key: SERPAPI_KEY,
      num: num.toString(),
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${params}`);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
    
    const data = await response.json();
    return data.organic_results?.map((result: any, index: number) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      position: index + 1
    })) || [];
  } catch (error) {
    console.error('SerpAPI web search error:', error);
    return [];
  }
}

// News search
export async function searchNews(query: string, num: number = 10): Promise<SerpNewsResult[]> {
  try {
    const params = new URLSearchParams({
      engine: 'google_news',
      q: query,
      api_key: SERPAPI_KEY,
      num: num.toString(),
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${params}`);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
    
    const data = await response.json();
    return data.news_results?.map((result: any) => ({
      title: result.title || '',
      link: result.link || '',
      snippet: result.snippet || '',
      date: result.date || '',
      source: result.source || ''
    })) || [];
  } catch (error) {
    console.error('SerpAPI news search error:', error);
    return [];
  }
}

// Company/business search
export async function searchCompany(companyName: string): Promise<SerpCompanyInfo | null> {
  try {
    const params = new URLSearchParams({
      engine: 'google',
      q: `"${companyName}" company business`,
      api_key: SERPAPI_KEY,
      num: '5',
      gl: 'us',
      hl: 'en'
    });

    const response = await fetch(`${SERPAPI_BASE_URL}?${params}`);
    if (!response.ok) throw new Error(`SerpAPI error: ${response.status}`);
    
    const data = await response.json();
    
    // Try to extract company info from knowledge graph
    if (data.knowledge_graph) {
      const kg = data.knowledge_graph;
      return {
        name: kg.title || companyName,
        description: kg.description,
        website: kg.website,
        address: kg.address,
        phone: kg.phone,
        rating: kg.rating,
        reviews: kg.reviews,
        hours: kg.hours
      };
    }
    
    // Fallback to first organic result
    if (data.organic_results && data.organic_results.length > 0) {
      const first = data.organic_results[0];
      return {
        name: companyName,
        description: first.snippet,
        website: first.link
      };
    }
    
    return null;
  } catch (error) {
    console.error('SerpAPI company search error:', error);
    return null;
  }
}

// Executive/person search
export async function searchExecutive(name: string, company?: string): Promise<SerpSearchResult[]> {
  const query = company ? `"${name}" "${company}" executive CEO founder` : `"${name}" executive CEO founder`;
  return searchWeb(query, 5);
}

// Industry analysis search
export async function searchIndustryTrends(industry: string): Promise<SerpSearchResult[]> {
  const query = `${industry} industry trends 2024 market analysis`;
  return searchWeb(query, 8);
}

// Competitor analysis search
export async function searchCompetitors(companyName: string, industry?: string): Promise<SerpSearchResult[]> {
  const query = industry 
    ? `"${companyName}" competitors "${industry}" alternatives`
    : `"${companyName}" competitors alternatives`;
  return searchWeb(query, 10);
}

// Technology stack search
export async function searchTechStack(companyName: string): Promise<SerpSearchResult[]> {
  const query = `"${companyName}" technology stack tools software uses`;
  return searchWeb(query, 5);
}

// Recent company news
export async function searchCompanyNews(companyName: string): Promise<SerpNewsResult[]> {
  return searchNews(`"${companyName}"`, 8);
}

// Enhanced website analysis with SerpAPI data
export async function enhanceWebsiteAnalysis(url: string, companyName?: string) {
  const results: any = {
    serpData: {},
    companyInfo: null,
    news: [],
    competitors: [],
    industryTrends: []
  };

  try {
    // If we have a company name, get comprehensive data
    if (companyName) {
      const [companyInfo, news, competitors] = await Promise.all([
        searchCompany(companyName),
        searchCompanyNews(companyName),
        searchCompetitors(companyName)
      ]);
      
      results.companyInfo = companyInfo;
      results.news = news;
      results.competitors = competitors;
    }

    // Search for the specific URL/domain
    const domain = new URL(url).hostname.replace('www.', '');
    const domainSearch = await searchWeb(`site:${domain}`, 5);
    results.serpData.siteSearch = domainSearch;

    return results;
  } catch (error) {
    console.error('Enhanced website analysis error:', error);
    return results;
  }
}
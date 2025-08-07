'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Globe, 
  Search, 
  AlertCircle, 
  Clipboard, 
  Download, 
  Check, 
  ArrowUpRight, 
  Building, 
  Users, 
  Target, 
  MessageSquareQuote, 
  Landmark, 
  Briefcase, 
  FileText, 
  Navigation, 
  Layers, 
  Phone, 
  Image as ImageIcon,
  Link,
  Zap,
  BatteryCharging,
  Megaphone,
  Heart
} from 'lucide-react';

// Define types for our scraped data
interface WebsiteAnalysis {
  "Company Name & Brand Identity": string;
  "Products/Services Offered": string;
  "Target Audience/Market": string;
  "Company Mission/Values/About": string;
  "Team Members & Structure": string;
  "Technologies Used": string;
  "Content Strategy Analysis": string;
  "Marketing Approach": string;
  "Unique Value Propositions": string;
  "Competitive Positioning": string;
  "Contact Information & Locations": string;
  "Social Media Presence": string;
  "Blog/Content Topics": string;
  "SEO Analysis": string;
  "Customer Testimonials/Case Studies": string;
  [key: string]: string;
}

interface WebsiteData {
  url: string;
  title: string;
  description: string;
  links: Array<{ href: string; text: string; }>;
  images: Array<{ src: string; alt: string; }>;
  analysis: WebsiteAnalysis;
  scrapedAt: string;
  proxyUsed?: boolean;
}

// Category icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  "Company Name & Brand Identity": <Building className="h-5 w-5" />,
  "Products/Services Offered": <Briefcase className="h-5 w-5" />,
  "Target Audience/Market": <Target className="h-5 w-5" />,
  "Company Mission/Values/About": <Landmark className="h-5 w-5" />,
  "Team Members & Structure": <Users className="h-5 w-5" />,
  "Technologies Used": <Zap className="h-5 w-5" />,
  "Content Strategy Analysis": <FileText className="h-5 w-5" />,
  "Marketing Approach": <Megaphone className="h-5 w-5" />,
  "Unique Value Propositions": <BatteryCharging className="h-5 w-5" />,
  "Competitive Positioning": <Navigation className="h-5 w-5" />,
  "Contact Information & Locations": <Phone className="h-5 w-5" />,
  "Social Media Presence": <Globe className="h-5 w-5" />,
  "Blog/Content Topics": <Layers className="h-5 w-5" />,
  "SEO Analysis": <Search className="h-5 w-5" />,
  "Customer Testimonials/Case Studies": <MessageSquareQuote className="h-5 w-5" />,
};

// Color mapping for sections
const categoryColors: Record<string, { bg: string, border: string, text: string }> = {
  "Company Name & Brand Identity": { bg: "bg-blue-900/10", border: "border-blue-800/30", text: "text-blue-400" },
  "Products/Services Offered": { bg: "bg-purple-900/10", border: "border-purple-800/30", text: "text-purple-400" },
  "Target Audience/Market": { bg: "bg-teal-900/10", border: "border-teal-800/30", text: "text-teal-400" },
  "Company Mission/Values/About": { bg: "bg-amber-900/10", border: "border-amber-800/30", text: "text-amber-400" },
  "Team Members & Structure": { bg: "bg-indigo-900/10", border: "border-indigo-800/30", text: "text-indigo-400" },
  "Technologies Used": { bg: "bg-emerald-900/10", border: "border-emerald-800/30", text: "text-emerald-400" },
  "Content Strategy Analysis": { bg: "bg-sky-900/10", border: "border-sky-800/30", text: "text-sky-400" },
  "Marketing Approach": { bg: "bg-pink-900/10", border: "border-pink-800/30", text: "text-pink-400" },
  "Unique Value Propositions": { bg: "bg-lime-900/10", border: "border-lime-800/30", text: "text-lime-400" },
  "Competitive Positioning": { bg: "bg-amber-900/10", border: "border-amber-800/30", text: "text-amber-400" },
  "Contact Information & Locations": { bg: "bg-blue-900/10", border: "border-blue-800/30", text: "text-blue-400" },
  "Social Media Presence": { bg: "bg-purple-900/10", border: "border-purple-800/30", text: "text-purple-400" },
  "Blog/Content Topics": { bg: "bg-teal-900/10", border: "border-teal-800/30", text: "text-teal-400" },
  "SEO Analysis": { bg: "bg-indigo-900/10", border: "border-indigo-800/30", text: "text-indigo-400" },
  "Customer Testimonials/Case Studies": { bg: "bg-emerald-900/10", border: "border-emerald-800/30", text: "text-emerald-400" },
};

// Error display component
function ErrorDisplay({ error, onRetry }: { error: any, onRetry: () => void }) {
  return (
    <Card className="bg-near-black border-light-gray p-6 text-white">
      <CardHeader>
        <div className="flex items-center">
          <AlertCircle className="text-red-400 mr-2" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{error.message || "An unexpected error occurred"}</p>
        {error.details && (
          <div className="mt-4 p-4 bg-black/30 rounded-md text-sm text-gray-400 border border-red-900/20">
            <p className="mb-2 text-red-400 font-medium text-xs uppercase">Details:</p>
            {typeof error.details === 'string' && error.details.includes("website is blocking access") ? (
              <>
                <p className="mb-2">{error.details}</p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <p>• Try using a different website that doesn't block scrapers</p>
                  <p>• Some websites use protection systems like Cloudflare or robots.txt</p>
                  <p>• Corporate and banking websites typically block automated access</p>
                </div>
              </>
            ) : (
              <p>{error.details}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-3">
        <Button onClick={onRetry}>Try Again</Button>
        {typeof error.details === 'string' && error.details.includes("website is blocking access") && (
          <Button variant="outline" onClick={() => window.open('https://google.com', '_blank')}>
            Search Alternative Sites
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Function to ensure image URL is absolute
const getFullImageUrl = (src: string, baseUrl: string): string => {
  try {
    // If it's already an absolute URL, return it as is
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src;
    }
    
    // Parse the base URL
    const urlObj = new URL(baseUrl);
    
    // Handle different types of relative paths
    if (src.startsWith('/')) {
      // Absolute path from the domain root
      return `${urlObj.protocol}//${urlObj.host}${src}`;
    } else {
      // Relative path from the current directory
      // Remove the filename portion if there is one
      const basePathParts = urlObj.pathname.split('/');
      basePathParts.pop(); // Remove the last part (file or empty)
      const basePath = basePathParts.join('/');
      
      return `${urlObj.protocol}//${urlObj.host}${basePath}/${src}`;
    }
  } catch (e) {
    // If there's any error, return a placeholder
    return 'https://placehold.co/400x300/111827/6B7280/png?text=Invalid+Image+URL';
  }
};

// Helper function to safely display analysis content that could be a string or object
const formatAnalysisContent = (content: any, depth: number = 0): string => {
  // Base case: if content is undefined or null
  if (content === undefined || content === null) {
    return 'No data available';
  }
  
  // Handle strings, including JSON strings
  if (typeof content === 'string') {
    // Try to parse it as JSON if it looks like JSON
    if ((content.trim().startsWith('{') && content.trim().endsWith('}')) || 
        (content.trim().startsWith('[') && content.trim().endsWith(']'))) {
      try {
        const parsed = JSON.parse(content);
        return formatAnalysisContent(parsed, depth);
      } catch (e) {
        // If it's not valid JSON, just return the string
        return content;
      }
    }
    return content;
  }
  
  // Handle arrays
  if (Array.isArray(content)) {
    if (content.length === 0) return 'Empty list';
    return content
      .map(item => {
        const formattedItem = typeof item === 'object' && item !== null 
          ? formatAnalysisContent(item, depth + 1) 
          : String(item);
        return `${' '.repeat(depth * 2)}• ${formattedItem.split('\n').join('\n' + ' '.repeat(depth * 2 + 2))}`;
      })
      .join('\n');
  }
  
  // Handle objects
  if (typeof content === 'object') {
    const entries = Object.entries(content);
    if (entries.length === 0) return 'Empty object';
    
    return entries
      .map(([key, value]) => {
        const formattedValue = typeof value === 'object' && value !== null 
          ? '\n' + formatAnalysisContent(value, depth + 1) 
          : ' ' + String(value);
        return `${' '.repeat(depth * 2)}• ${key}:${formattedValue.split('\n').join('\n' + ' '.repeat(depth * 2 + 2))}`;
      })
      .join('\n');
  }
  
  // Handle primitives
  return String(content);
};

export function WebsiteScraperSection() {
  const [url, setUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('analysis');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setError({ message: "Please enter a URL" });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setWebsiteData(null);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 800);
    
    try {
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Request failed with status ${response.status}`,
          { cause: errorData.details || "No additional details provided" }
        );
      }
      
      const data = await response.json();
      setWebsiteData(data);
    } catch (error) {
      console.error('Error scraping website:', error);
      
      let errorMessage = "Failed to analyze website";
      let errorDetails = "Unknown error details";
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = "Network connection failed";
        errorDetails = "Unable to connect to the website. Please check your internet connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errorDetails = error.cause ? String(error.cause) : error.stack || "No additional details available";
      }
      
      setError({
        message: errorMessage,
        details: errorDetails
      });
    } finally {
      setIsLoading(false);
      // Reset progress after a delay
      setTimeout(() => setProgress(0), 500);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };
  
  // Download report as text
  const handleDownload = () => {
    if (!websiteData) return;
    
    let reportText = `
WEBSITE ANALYSIS REPORT
=======================
URL: ${websiteData.url}
Title: ${websiteData.title}
Description: ${websiteData.description}
Analyzed on: ${new Date(websiteData.scrapedAt).toLocaleString()}
`;

    if (websiteData.analysis && Object.entries(websiteData.analysis).length > 0) {
      reportText += `\nCOMPREHENSIVE BUSINESS INTELLIGENCE\n==================================\n`;
      
      Object.entries(websiteData.analysis).forEach(([category, content]) => {
        reportText += `\n## ${category}\n${formatAnalysisContent(content)}\n`;
      });
    } else {
      reportText += `\nNO DETAILED ANALYSIS AVAILABLE\n===============================\nThe AI analysis wasn't able to generate detailed insights for this website.\n`;
    }

    reportText += `
\nWEBSITE METADATA
=================
- Title: ${websiteData.title}
- Meta Description: ${websiteData.description}

LINKS (TOP ${websiteData.links.length})
===============
${websiteData.links.map(link => `- ${link.text}: ${link.href}`).join('\n')}

IMAGES (TOP ${websiteData.images.length})
================
${websiteData.images.map(img => `- ${img.alt || 'Unnamed image'}: ${img.src}`).join('\n')}

Generated by: Deliver AI Platform
Date: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([reportText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `website-analysis-${new URL(websiteData.url).hostname}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Reset the form
  const handleReset = () => {
    setUrl('');
    setWebsiteData(null);
    setError(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Website Intelligence <span className="text-sky-400">Scanner</span></h2>
      <p className="text-muted-gray mb-6">Enter any website URL to get comprehensive business intelligence and detailed analysis.</p>
      
      {/* Input form */}
      <Card className="bg-near-black border-light-gray mb-8 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                <Input
                  type="url"
                  placeholder="Enter website URL (e.g., https://example.com)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="pl-10 bg-black border-light-gray text-white placeholder:text-muted-gray h-12"
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 h-12"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <Search className="mr-2 h-5 w-5" />
                    Analyze Website
                  </>
                )}
              </Button>
            </div>
            
            {/* Pollinations info notice */}
            <div className="mt-4 bg-sky-950/20 border border-sky-800/30 rounded-md p-3 text-sm">
              <div className="flex items-center">
                <Zap className="h-4 w-4 text-sky-400 mr-2 flex-shrink-0" />
                <p className="text-sky-300">
                  Powered by Pollinations AI using the searchgpt model for comprehensive website analysis and competitive intelligence.
                </p>
              </div>
            </div>
            
            {/* Progress bar for loading state */}
            {isLoading && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-gray">Scraping and analyzing website data</span>
                  <span className="text-sky-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
              </div>
            )}
          </CardContent>
        </form>
      </Card>
      
      {/* Error display */}
      {error && (
        <div className="mb-6">
          <ErrorDisplay error={error} onRetry={() => handleSubmit(new Event('submit') as any)} />
        </div>
      )}
      
      {/* Results display */}
      {websiteData && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Website header/preview */}
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <div className="bg-gradient-to-r from-sky-900/20 to-indigo-900/20 p-4 sm:p-6 border-b border-light-gray">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white truncate">{websiteData.title}</h3>
                  <a 
                    href={websiteData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-400 hover:text-sky-300 text-sm flex items-center mt-1"
                  >
                    {websiteData.url}
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(
                      JSON.stringify(websiteData, null, 2), 
                      "JSON"
                    )}
                    className="h-9"
                  >
                    {copiedText === "JSON" ? (
                      <>
                        <Check className="mr-1 h-4 w-4 text-green-400" />
                        <span className="text-green-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="mr-1 h-4 w-4" />
                        Copy JSON
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleDownload}
                    className="h-9"
                  >
                    <Download className="mr-1 h-4 w-4" />
                    Download Report
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                    className="h-9"
                  >
                    <Search className="mr-1 h-4 w-4" />
                    New Search
                  </Button>
                </div>
              </div>
              
              <p className="text-gray-400 text-sm mt-2">{websiteData.description}</p>
            </div>
            
            {/* Site metadata stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-light-gray/30">
              <div className="p-4 text-center">
                <p className="text-sm text-muted-gray">Links</p>
                <p className="text-2xl font-bold text-white">{websiteData.links.length}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-gray">Images</p>
                <p className="text-2xl font-bold text-white">{websiteData.images.length}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-gray">Analysis Categories</p>
                <p className="text-2xl font-bold text-white">{Object.keys(websiteData.analysis).length}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-sm text-muted-gray">Analyzed</p>
                <p className="text-lg font-medium text-white">{new Date(websiteData.scrapedAt).toLocaleString()}</p>
              </div>
            </div>
            
            {/* Show proxy notice if used */}
            {websiteData.proxyUsed && (
              <div className="px-4 py-2 bg-indigo-900/20 border-t border-light-gray/30 text-xs text-indigo-300 flex items-center justify-center">
                <Zap className="h-3 w-3 mr-1 text-indigo-400" />
                A proxy service was used to bypass website access restrictions
              </div>
            )}
          </Card>
          
          {/* Tabbed content for different sections */}
          <Tabs defaultValue="analysis" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="analysis" className="data-[state=active]:bg-sky-900/20">
                <FileText className="h-4 w-4 mr-2" />
                Business Analysis
              </TabsTrigger>
              <TabsTrigger value="links" className="data-[state=active]:bg-indigo-900/20">
                <Link className="h-4 w-4 mr-2" />
                Links
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-purple-900/20">
                <ImageIcon className="h-4 w-4 mr-2" />
                Images
              </TabsTrigger>
            </TabsList>
            
            {/* Analysis tab */}
            <TabsContent value="analysis" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                {websiteData.analysis && Object.entries(websiteData.analysis).length > 0 ? (
                  Object.entries(websiteData.analysis).map(([category, content]) => {
                    const colors = categoryColors[category] || { 
                      bg: "bg-gray-900/10", 
                      border: "border-gray-800/30", 
                      text: "text-white" 
                    };
                    
                    return (
                      <Card key={category} className={`bg-near-black border-light-gray overflow-hidden`}>
                        <CardHeader className={`${colors.bg} border-b ${colors.border}`}>
                          <div className="flex justify-between items-start">
                            <CardTitle className={`flex items-center ${colors.text}`}>
                              {categoryIcons[category] || <FileText className="h-5 w-5 mr-2" />}
                              <span className="ml-2">{category}</span>
                            </CardTitle>
                            
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-2"
                              onClick={() => handleCopy(formatAnalysisContent(content), category)}
                            >
                              {copiedText === category ? (
                                <Check className="h-4 w-4 text-green-400" />
                              ) : (
                                <Clipboard className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-4">
                          <div className="text-gray-300 text-sm whitespace-pre-line">
                            {formatAnalysisContent(content)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="bg-near-black border-light-gray">
                    <CardContent className="p-8 text-center">
                      <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-white mb-2">No Analysis Data Available</h3>
                      <p className="text-muted-gray text-sm mb-6">
                        The AI couldn't analyze this website. This could be due to restricted content, 
                        website structure, or an API issue. Try with a different website.
                      </p>
                      
                      <div className="flex justify-center">
                        <Button 
                          variant="outline"
                          onClick={async () => {
                            setIsLoading(true);
                            setProgress(0);
                            const progressInterval = setInterval(() => {
                              setProgress(prev => {
                                if (prev >= 90) {
                                  clearInterval(progressInterval);
                                  return prev;
                                }
                                return prev + Math.floor(Math.random() * 10);
                              });
                            }, 800);
                            
                            try {
                              const response = await fetch('/api/scraper', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ url: websiteData.url })
                              });
                              
                              clearInterval(progressInterval);
                              setProgress(100);
                              
                              if (!response.ok) {
                                throw new Error(`Request failed with status ${response.status}`);
                              }
                              
                              const data = await response.json();
                              setWebsiteData(data);
                            } catch (error) {
                              console.error('Error retrying analysis:', error);
                              setError({
                                message: "Failed to analyze website on retry",
                                details: error instanceof Error ? error.message : "Unknown error"
                              });
                            } finally {
                              setIsLoading(false);
                              setTimeout(() => setProgress(0), 500);
                            }
                          }}
                          disabled={isLoading}
                          className="flex items-center"
                        >
                          {isLoading ? (
                            <span className="flex items-center">
                              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                              Retrying Analysis...
                            </span>
                          ) : (
                            <>Retry Analysis</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
            
            {/* Links tab */}
            <TabsContent value="links" className="mt-0">
              <Card className="bg-near-black border-light-gray">
                <CardHeader className="border-b border-light-gray">
                  <CardTitle className="text-white flex items-center">
                    <Link className="h-5 w-5 text-indigo-400 mr-2" />
                    Top Links Found
                  </CardTitle>
                  <CardDescription>
                    Extracted hyperlinks from the website (maximum 25 shown)
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-light-gray/30 bg-black/30">
                          <th className="px-4 py-2 text-left text-xs text-muted-gray font-medium">Link Text</th>
                          <th className="px-4 py-2 text-left text-xs text-muted-gray font-medium">URL</th>
                          <th className="px-4 py-2 text-center w-20 text-xs text-muted-gray font-medium">Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {websiteData.links.map((link, index) => (
                          <tr key={index} className={`border-b border-light-gray/10 ${index % 2 === 1 ? 'bg-black/20' : ''}`}>
                            <td className="px-4 py-3 text-gray-300 text-sm">{link.text}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              <span className="truncate block max-w-xs">{link.href}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <a 
                                href={link.href.startsWith('http') ? link.href : `${websiteData.url}${link.href}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/20 text-indigo-400 hover:bg-indigo-900/40 transition-colors"
                              >
                                <ArrowUpRight className="h-4 w-4" />
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Images tab */}
            <TabsContent value="images" className="mt-0">
              <Card className="bg-near-black border-light-gray">
                <CardHeader className="border-b border-light-gray">
                  <CardTitle className="text-white flex items-center">
                    <ImageIcon className="h-5 w-5 text-purple-400 mr-2" />
                    Images Found
                  </CardTitle>
                  <CardDescription>
                    Images extracted from the website (maximum 15 shown)
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="p-4">
                  {websiteData.images.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {websiteData.images.map((image, index) => (
                        <div key={index} className="border border-light-gray/30 rounded-md overflow-hidden bg-black/30">
                          <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center overflow-hidden">
                            <img 
                              src={getFullImageUrl(image.src, websiteData.url)} 
                              alt={image.alt || 'Website image'} 
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x300/111827/6B7280/png?text=Image+Not+Available'}
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-gray-300 text-sm truncate">{image.alt || 'No description'}</p>
                            <p className="text-gray-500 text-xs mt-1 truncate">{image.src}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <ImageIcon className="h-10 w-10 text-gray-600 mb-4" />
                      <p className="text-muted-gray">No images found on this website</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 my-6">
            <Button
              onClick={handleReset}
              variant="outline"
              className="rounded-md h-10 px-6 border-indigo-400/50 text-indigo-400 hover:bg-indigo-950/30"
            >
              Analyze Another Website
            </Button>
            
            <Button
              onClick={handleDownload}
              variant="default"
              className="rounded-md h-10 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-0"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Full Report
            </Button>
          </div>
          
          {/* Bottom branding */}
          <div className="text-center text-xs text-muted-gray/60 mt-6">
            <p>Generated by Deliver AI Platform • {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
} 
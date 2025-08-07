'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, ArrowLeft, Check, Share2, Globe, Users, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToolResult } from '@/types/tools';

export default function SharedToolResultPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [result, setResult] = useState<ToolResult | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load saved tool results from localStorage
    const loadResult = () => {
      try {
        const savedItems = localStorage.getItem('toolResults');
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems).map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }));
          
          const found = parsedItems.find((item: ToolResult) => item.id === id);
          
          if (found) {
            setResult(found);
          } else {
            // If not found in localStorage, check for mock data in a simulated "database"
            // In a real app, this would be an API call to backend storage
            const mockResult = createMockResult(id as string);
            if (mockResult) {
              setResult(mockResult);
            } else {
              setNotFound(true);
            }
          }
        } else {
          // Create a mock result if nothing in localStorage
          const mockResult = createMockResult(id as string);
          if (mockResult) {
            setResult(mockResult);
          } else {
            setNotFound(true);
          }
        }
      } catch (error) {
        console.error('Error loading saved tool result:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadResult();
  }, [id]);
  
  // Function to create a mock result if none exists (for demo purposes)
  const createMockResult = (resultId: string): ToolResult | null => {
    // Only create mock for specific IDs (like demo-123)
    if (!resultId.includes('demo')) return null;
    
    return {
      id: resultId,
      toolName: 'Website Intelligence Scanner',
      content: {
        url: 'https://example.com',
        title: 'Website Analysis for example.com',
        categories: ['Technology', 'Marketing', 'SaaS', 'B2B'],
        links: [
          'https://example.com/about',
          'https://example.com/pricing',
          'https://example.com/contact',
          'https://example.com/blog',
          'https://twitter.com/example',
          'https://linkedin.com/company/example'
        ],
        images: [
          { src: '/logo.png', alt: 'Logo' },
          { src: '/hero.jpg', alt: 'Hero Image' },
          { src: '/product.png', alt: 'Product Screenshot' }
        ],
        content: 'This is a sample website content for example.com.',
        metadata: {
          description: 'A sample website description',
          keywords: ['sample', 'website', 'analysis']
        }
      },
      summary: 'Analysis of example.com complete',
      parameters: { url: 'https://example.com' },
      url: 'https://example.com',
      createdAt: new Date()
    };
  };
  
  const copyShareLink = () => {
    if (result) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast({
        title: "Share link copied!",
        description: "Share this link to give others access to this tool result.",
        action: (
          <Button 
            onClick={() => toast.dismiss()} 
            className="bg-transparent hover:bg-white/10"
          >
            Dismiss
          </Button>
        )
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };
  
  const generateEmbedCode = () => {
    return `<iframe src="${window.location.href}/embed" width="100%" height="500" frameborder="0"></iframe>`;
  };
  
  const copyEmbedCode = () => {
    if (result) {
      const embedCode = generateEmbedCode();
      navigator.clipboard.writeText(embedCode);
      toast({
        title: "Embed code copied!",
        description: "Paste this code into your website to embed this result.",
        action: (
          <Button 
            onClick={() => toast.dismiss()} 
            className="bg-transparent hover:bg-white/10"
          >
            Dismiss
          </Button>
        )
      });
    }
  };
  
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'Website Intelligence Scanner':
        return <Globe className="h-6 w-6 text-blue-500" />;
      case 'Executive Persona':
        return <Users className="h-6 w-6 text-purple-500" />;
      default:
        return <AlertCircle className="h-6 w-6 text-gray-500" />;
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render the Website Intelligence result
  const renderWebsiteIntelligence = () => {
    if (!result || !result.content) return null;
    
    const { content } = result;
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Website Overview</CardTitle>
            <CardDescription>Key information about {result.url}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 rounded-md">
                <h3 className="text-sm font-medium text-gray-700">Links</h3>
                <p className="text-2xl font-bold">{content.links?.length || 0}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-md">
                <h3 className="text-sm font-medium text-gray-700">Images</h3>
                <p className="text-2xl font-bold">{content.images?.length || 0}</p>
              </div>
              <div className="p-4 bg-gray-100 rounded-md">
                <h3 className="text-sm font-medium text-gray-700">Categories</h3>
                <p className="text-2xl font-bold">{content.categories?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="analysis">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {content.categories?.map((category: string, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      {category}
                    </div>
                  )) || <p>No categories found</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>External & Internal Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {content.links?.map((link: string, index: number) => (
                    <div key={index} className="p-2 border-b border-gray-100">
                      <a href={link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                        {link}
                      </a>
                    </div>
                  )) || <p>No links found</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Page Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-md whitespace-pre-wrap font-mono text-sm">
                  {content.content || "No content available"}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  // Render the Executive Persona result
  const renderExecutivePersona = () => {
    if (!result || !result.content) return null;
    
    const { content } = result;
    const persona = content.persona || {};
    
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Executive Profile</CardTitle>
            <CardDescription>{persona.name}, {persona.title} at {persona.company}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Background</h3>
                <p className="text-gray-800">{persona.background}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Objectives</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {persona.objectives?.map((objective: string, index: number) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Challenges</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {persona.challenges?.map((challenge: string, index: number) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Communication Style</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800">{persona.communication_style}</p>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Decision Factors</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-800">
                  {persona.decision_factors?.map((factor: string, index: number) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Company</h3>
                    <p className="text-gray-800">{content.company_info?.name}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Industry</h3>
                    <p className="text-gray-800">{content.company_info?.industry}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Size</h3>
                    <p className="text-gray-800">{content.company_info?.size}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500">Revenue</h3>
                    <p className="text-gray-800">{content.company_info?.annual_revenue}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Company Challenges</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-800">
                    {content.company_info?.challenges?.map((challenge: string, index: number) => (
                      <li key={index}>{challenge}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  // Determine which tool result renderer to use
  const renderToolResult = () => {
    if (!result) return null;
    
    switch (result.toolName) {
      case 'Website Intelligence Scanner':
        return renderWebsiteIntelligence();
      case 'Executive Persona':
        return renderExecutivePersona();
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Tool Result</CardTitle>
              <CardDescription>No specific viewer available for this tool type</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap overflow-auto max-h-96">
                {JSON.stringify(result.content, null, 2)}
              </pre>
            </CardContent>
          </Card>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tool result...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Tool Result Not Found</h1>
          <p className="text-gray-600 mb-6">
            The tool result you're looking for could not be found. It may have been deleted or the link might be incorrect.
          </p>
          <Link href="/chat" legacyBehavior>
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Chat
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="sm" 
            onClick={() => router.back()}
            className="h-9 gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {result && getToolIcon(result.toolName)}
              <span>{result?.toolName}</span>
            </h1>
            <p className="text-gray-500 text-sm">
              {result && formatDate(result.createdAt)}
              {result?.url && (
                <span className="ml-2">
                  • <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{result.url}</a>
                </span>
              )}
            </p>
          </div>
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={copyShareLink}
          className="h-9"
        >
          {linkCopied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied to clipboard
            </>
          ) : (
            <>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{result?.summary}</p>
      </div>
      
      {renderToolResult()}
    </div>
  );
}

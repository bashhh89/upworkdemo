'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Copy, ArrowLeft, Check, Share2, Globe, Users, Target, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ToolResult {
  id: string;
  toolName: string;
  url?: string;
  content: any;
  summary: string;
  createdAt: Date;
  shareUrl?: string;
}

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
            setNotFound(true);
          }
        } else {
          setNotFound(true);
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
  
  const copyShareLink = () => {
    if (result) {
      const url = window.location.href;
      navigator.clipboard.writeText(url);
      setLinkCopied(true);
      toast({
        title: "Share link copied!",
        description: "Share this link to give others access to this tool result.",
      });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };
  
  const getToolIcon = (toolName: string) => {
    switch (toolName) {
      case 'Website Intelligence':
        return <Globe className="h-6 w-6 text-blue-500" />;
      case 'Executive Persona':
        return <Users className="h-6 w-6 text-purple-500" />;
      case 'Customer Profile':
        return <Target className="h-6 w-6 text-green-500" />;
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Executive Persona: {content.role}</CardTitle>
          <CardDescription>Industry: {content.industry}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Background</h3>
              <p className="text-gray-700">{persona.background || "Not available"}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Goals & Priorities</h3>
              <ul className="list-disc pl-5 space-y-1">
                {persona.goals?.map((goal: string, index: number) => (
                  <li key={index} className="text-gray-700">{goal}</li>
                )) || <li>No goals available</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Challenges</h3>
              <ul className="list-disc pl-5 space-y-1">
                {persona.challenges?.map((challenge: string, index: number) => (
                  <li key={index} className="text-gray-700">{challenge}</li>
                )) || <li>No challenges available</li>}
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Decision-Making Factors</h3>
              <ul className="list-disc pl-5 space-y-1">
                {persona.decisionFactors?.map((factor: string, index: number) => (
                  <li key={index} className="text-gray-700">{factor}</li>
                )) || <li>No decision factors available</li>}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  // Render based on the type of tool result
  const renderToolResult = () => {
    if (!result) return null;
    
    switch (result.toolName) {
      case 'Website Intelligence':
        return renderWebsiteIntelligence();
      case 'Executive Persona':
        return renderExecutivePersona();
      // Add other tool renderers as needed
      default:
        return (
          <div className="p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Raw Result Data</h3>
            <pre className="bg-white p-4 rounded border overflow-auto max-h-96">
              {JSON.stringify(result.content, null, 2)}
            </pre>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-700">Loading tool result...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Result Not Found</h1>
          <p className="text-gray-600 mb-6">
            The tool result you're looking for doesn't exist or may have been deleted.
          </p>
          <Button onClick={() => router.push('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-6xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => router.push('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {result?.toolName}
                </h1>
                <p className="text-sm text-gray-500">
                  {result?.createdAt && formatDate(result.createdAt)}
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={copyShareLink}
            >
              {linkCopied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </>
              )}
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-4 mb-6">
            {result && getToolIcon(result.toolName)}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {result?.toolName}
              </h2>
              <p className="text-gray-600 mt-1">
                {result?.summary}
              </p>
              {result?.url && (
                <a 
                  href={result.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm mt-2 inline-block"
                >
                  {result.url}
                </a>
              )}
            </div>
          </div>
          
          {/* Render the result based on tool type */}
          {renderToolResult()}
        </div>
      </main>
    </div>
  );
} 
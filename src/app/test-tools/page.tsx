'use client';

import { useState, useEffect } from 'react';
import { Globe, Users, Target, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

interface Tool {
  name: string;
  description: string;
  apiEndpoint: string;
}

export default function TestToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/tools/debug');
        if (!response.ok) {
          throw new Error(`Error fetching tools: ${response.status}`);
        }
        const data = await response.json();
        setTools(data.tools);
        console.log('Tools available:', data.tools);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching tools');
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTools();
  }, []);
  
  // Get tool icon based on name
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('Website')) return <Globe className="h-6 w-6 text-blue-400" />;
    if (toolName.includes('Executive')) return <Users className="h-6 w-6 text-purple-400" />;
    return null;
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-pulse">Loading tools...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="text-red-500">Error: {error}</div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Tool Testing Center</h1>
        <div className="flex gap-4">
          <Link href="/tools-test" legacyBehavior>
            <Button variant="outline">
              Advanced Testing Page
            </Button>
          </Link>
          <Link href="/chat" legacyBehavior>
            <Button>
              Back to Chat
            </Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Card key={tool.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center gap-3">
              {getToolIcon(tool.name)}
              <CardTitle>{tool.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">{tool.description}</p>
              <div className="mt-4 text-xs text-gray-500">
                <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                  {tool.apiEndpoint}
                </code>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/tools-test?tool=${encodeURIComponent(tool.name)}`} legacyBehavior>
                <Button variant="outline" size="sm">
                  Test Tool
                </Button>
              </Link>
              <Link
                href={`/chat?prompt=${encodeURIComponent(`Use the ${tool.name} tool to`)}`}
                legacyBehavior>
                <Button size="sm">
                  Use in Chat <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
      <div className="mt-12 p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Tool Command Reference</h2>
        <div className="grid gap-4">
          <div>
            <h3 className="text-lg font-semibold">Website Intelligence Scanner</h3>
            <div className="bg-black text-white p-3 rounded mt-2 font-mono">
              Analyze website: example.com
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Executive Persona</h3>
            <div className="bg-black text-white p-3 rounded mt-2 font-mono">
              Create an executive persona for John Smith, CEO at Acme Inc
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 text-center">
        <p className="text-gray-500">
          You can also use the slash command (/) in chat or the command button to access tools directly.
        </p>
      </div>
    </div>
  );
}

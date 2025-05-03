import { useState, useEffect } from 'react';
import { getSavedToolResults } from '@/lib/tool-utils';
import { ToolResult } from '@/types/tools';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Share2, ExternalLink, Globe, Users, Target, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';

export default function ToolResultsLibrary() {
  const [results, setResults] = useState<ToolResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [linkCopied, setLinkCopied] = useState<string | null>(null);
  
  useEffect(() => {
    const loadResults = () => {
      const savedResults = getSavedToolResults();
      setResults(savedResults);
    };
    
    loadResults();
    
    // Set up interval to refresh results periodically
    const interval = setInterval(loadResults, 10000);
    return () => clearInterval(interval);
  }, []);
  
  const filteredResults = results.filter(result => 
    result.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (result.url && result.url.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const copyShareLink = (result: ToolResult) => {
    const shareLink = `${window.location.origin}/shared/tool-result/${result.id}`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(result.id);
    toast({
      title: "Share link copied!",
      description: "Share this link to give others access to this tool result.",
    });
    setTimeout(() => setLinkCopied(null), 2000);
  };
  
  const getToolIcon = (toolName: string) => {
    if (toolName.includes('Website')) return <Globe className="h-5 w-5 text-blue-500" />;
    if (toolName.includes('Executive')) return <Users className="h-5 w-5 text-purple-500" />;
    if (toolName.includes('Deal') || toolName.includes('Proposal')) return <FileText className="h-5 w-5 text-green-500" />;
    return <Target className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search tool results..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9"
        />
      </div>
      {filteredResults.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tool results found. Use specialized tools in chat to generate results.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  {getToolIcon(result.toolName)}
                  <CardTitle className="text-base">{result.toolName}</CardTitle>
                </div>
                <CardDescription className="text-xs">
                  {formatDate(result.createdAt)}
                  {result.url && (
                    <span className="ml-2">
                      • <a href={result.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{result.url}</a>
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-700 line-clamp-2">{result.summary}</p>
              </CardContent>
              <CardFooter className="flex justify-between pt-1">
                <Link href={`/shared/tool-result/${result.id}`}>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => copyShareLink(result)}
                >
                  {linkCopied === result.id ? (
                    <>
                      <span className="text-green-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 
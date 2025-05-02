import { ToolResult } from '@/types/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Copy, Check, Globe, Users, Target, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ToolResultSummaryProps {
  result: ToolResult;
}

export default function ToolResultSummary({ result }: ToolResultSummaryProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  
  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/shared/tool-result/${result.id}`;
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    toast({
      title: "Share link copied!",
      description: "The link to this result has been copied to your clipboard.",
    });
    setTimeout(() => setLinkCopied(false), 2000);
  };
  
  const getToolIcon = () => {
    if (result.toolName.includes('Website')) return <Globe className="h-5 w-5 text-blue-500" />;
    if (result.toolName.includes('Executive')) return <Users className="h-5 w-5 text-purple-500" />;
    if (result.toolName.includes('Deal') || result.toolName.includes('Proposal')) return <FileText className="h-5 w-5 text-green-500" />;
    return <Target className="h-5 w-5 text-gray-500" />;
  };
  
  return (
    <Card className="w-full mb-2 mt-2 border-l-4" style={{ borderLeftColor: getToolColorClass() }}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {getToolIcon()}
          <CardTitle className="text-base">{result.toolName}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm whitespace-pre-wrap">{result.summary}</p>
      </CardContent>
      <CardFooter className="pt-0 flex gap-2">
        <Link href={`/shared/tool-result/${result.id}`} passHref>
          <Button variant="outline" size="sm" className="h-8">
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="h-8"
          onClick={copyShareLink}
        >
          {linkCopied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy Link
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
  
  function getToolColorClass() {
    if (result.toolName.includes('Website')) return '#3b82f6'; // blue-500
    if (result.toolName.includes('Executive')) return '#8b5cf6'; // purple-500
    if (result.toolName.includes('Deal') || result.toolName.includes('Proposal')) return '#22c55e'; // green-500
    return '#6b7280'; // gray-500
  }
} 
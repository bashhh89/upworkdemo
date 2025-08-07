import { ToolResult } from '@/types/tools';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ExternalLink, Copy, Check, Globe, Users, Target, FileText, MessageSquare, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

interface ToolResultSummaryProps {
  result: ToolResult;
  onAskAbout?: (question: string) => void;
}

export default function ToolResultSummary({ result, onAskAbout }: ToolResultSummaryProps) {
  const [linkCopied, setLinkCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
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
  
  const handleAskAbout = () => {
    if (onAskAbout) {
      const prompt = `Tell me more about the ${result.toolName} results for ${getResultSubject()}`;
      onAskAbout(prompt);
    }
  };
  
  const getResultSubject = () => {
    if (result.toolName === 'Website Intelligence Scanner' && result.parameters?.url) {
      return result.parameters.url;
    } else if (result.toolName === 'Executive Persona' && result.parameters?.name) {
      return `${result.parameters.name} at ${result.parameters.company}`;
    } else if (result.toolName === 'ICP Builder') {
      return 'customer analysis';
    }
    return 'this analysis';
  };
  
  const getToolIcon = () => {
    if (result.toolName.includes('Website')) return <Globe className="h-5 w-5 text-blue-500" />;
    if (result.toolName.includes('Executive')) return <Users className="h-5 w-5 text-purple-500" />;
    if (result.toolName.includes('ICP')) return <Target className="h-5 w-5 text-green-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };
  
  const getToolBgClass = () => {
    if (result.toolName.includes('Website')) return 'from-blue-900/20 to-blue-600/10 border-blue-800/40'; 
    if (result.toolName.includes('Executive')) return 'from-purple-900/20 to-purple-600/10 border-purple-800/40';
    if (result.toolName.includes('ICP')) return 'from-green-900/20 to-green-600/10 border-green-800/40';
    return 'from-gray-900/20 to-gray-600/10 border-gray-800/40';
  };
  
  const getToolColorClass = () => {
    if (result.toolName.includes('Website')) return '#3b82f6'; // blue-500
    if (result.toolName.includes('Executive')) return '#8b5cf6'; // purple-500
    if (result.toolName.includes('ICP')) return '#10b981'; // green-500
    return '#6b7280'; // gray-500
  };
  
  const getFormattedDate = () => {
    const date = new Date(result.createdAt);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };
  
  return (
    <Card className="w-full mb-2 mt-2 border shadow-lg overflow-hidden" style={{ borderColor: `${getToolColorClass()}40` }}>
      <CardHeader className={`pb-2 bg-gradient-to-r ${getToolBgClass()} border-b border-gray-800/60`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full" style={{ backgroundColor: getToolColorClass() }}>
              {getToolIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{result.toolName}</CardTitle>
              <CardDescription className="text-xs">
                {getFormattedDate()} • {getResultSubject()}
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 p-0" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg> : 
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent className={`pb-2 ${expanded ? '' : 'max-h-24 overflow-hidden'}`}>
        <div className={`text-sm whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
          {result.summary}
        </div>
        {!expanded && result.summary.length > 150 && (
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1a1a1a] to-transparent"></div>
        )}
      </CardContent>
      <CardFooter className="pt-3 pb-3 flex gap-2 flex-wrap border-t border-gray-800/60">
        <Link
          href={`/shared/tool-result/${result.id}`}
          target="_blank"
          passHref
          legacyBehavior>
          <Button variant="outline" size="sm" className="h-8">
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
        </Link>
        
        {onAskAbout && (
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8" 
            onClick={handleAskAbout}
          >
            <MessageSquare className="h-3 w-3 mr-1" />
            Ask About This
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 ml-auto"
          onClick={copyShareLink}
        >
          {linkCopied ? (
            <>
              <Check className="h-3 w-3 mr-1 text-green-500" />
              <span className="text-green-500">Copied</span>
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
  );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Globe, Search, Loader2, Send, MessagesSquare, Link2, Info, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface WebsiteData {
  title: string;
  description: string;
  url: string;
  content?: string;
  analyzed: boolean;
}

export function TalkToWebsiteSection() {
  const [url, setUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [websiteData, setWebsiteData] = useState<WebsiteData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset states when URL changes
  useEffect(() => {
    if (url !== websiteData?.url) {
      setWebsiteData(null);
      setMessages([]);
      setError(null);
    }
  }, [url, websiteData?.url]);

  // Handle website analysis
  const analyzeWebsite = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a website URL to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setWebsiteData(null);
    setMessages([]);

    try {
      // Try to parse and format the URL
      let formattedUrl = url.trim();
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      // Validate URL format
      new URL(formattedUrl);

      // Update URL with properly formatted version
      setUrl(formattedUrl);

      // Fetch and analyze website data
      const response = await fetch('/api/scraper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formattedUrl })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to analyze website: ${response.status}`);
      }

      const data = await response.json();
      
      // Set website data
      setWebsiteData({
        title: data.title || 'Unknown Title',
        description: data.description || 'No description available',
        url: formattedUrl,
        analyzed: true
      });

      // Set initial system and welcome messages
      setMessages([
        {
          role: 'system',
          content: `I've analyzed ${data.title}. What would you like to know about this website?`
        }
      ]);

    } catch (err) {
      console.error('Error analyzing website:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "Analysis Failed",
        description: err instanceof Error ? err.message : 'Failed to analyze the website',
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle sending message
  const sendMessage = async () => {
    if (!userInput.trim() || !websiteData || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: userInput
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsProcessing(true);

    try {
      // First, add a placeholder for the AI response
      setMessages(prev => [...prev, { role: 'assistant', content: '...' }]);

      console.log("Sending message to Pollinations API:", {
        model: "searchgpt",
        url: websiteData.url,
        messageCount: messages.length + 1
      });

      // Call Pollinations search API through our backend
      const response = await fetch('/api/pollinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "searchgpt",
          messages: [
            { 
              role: "system", 
              content: `You are an AI assistant answering questions about the website: ${websiteData.title} (${websiteData.url}).
              Provide helpful, accurate information based only on the content of this website.
              If you don't know the answer, say so - don't make up information.
              Keep responses concise and focused on the website content.` 
            },
            ...messages.filter(m => m.role !== 'system'),
            userMessage
          ],
          temperature: 0.3,
          webpage_context: [websiteData.url]
        })
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error("API error:", responseData);
        throw new Error(responseData.error || `Failed to get response: ${response.status}`);
      }

      console.log("Received response from API:", responseData);
      
      // Replace the placeholder with actual response
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: responseData.content || "I couldn't analyze this website's content properly. Please try asking a different question or try another website."
        };
        return updated;
      });
    } catch (err) {
      console.error('Error getting AI response:', err);
      
      // Replace placeholder with error message
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: "Sorry, I encountered an error while processing your question. This could be because the website content couldn't be retrieved or analyzed properly. Please try a different question or website."
        };
        return updated;
      });
      
      toast({
        title: "Response Error",
        description: err instanceof Error ? err.message : 'Failed to get a response',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Talk To Website <span className="text-sky-400">AI</span></h2>
      <p className="text-muted-gray mb-6">Enter any website URL to have a conversation about its content. Ask questions and get answers about the website.</p>
      
      {/* URL Input Form */}
      <Card className="bg-near-black border-light-gray mb-8 overflow-hidden">
        <form onSubmit={(e) => { e.preventDefault(); analyzeWebsite(); }}>
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
                  disabled={isAnalyzing}
                />
              </div>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 h-12"
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
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
            
            {error && (
              <div className="mt-4 p-3 bg-red-950/30 border border-red-500/30 rounded-md text-red-400 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </form>
      </Card>

      {/* Chat Interface - Only show if website has been analyzed */}
      {websiteData?.analyzed && (
        <div className="grid grid-cols-1 gap-6">
          {/* Website Info Header */}
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="p-4 border-b border-light-gray/30 bg-black/20">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-white">{websiteData.title}</CardTitle>
                  <a 
                    href={websiteData.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 mt-1"
                  >
                    <Link2 className="h-3 w-3" />
                    {websiteData.url}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 text-sm text-muted-gray">
              <p>{websiteData.description}</p>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="bg-near-black border-light-gray flex flex-col h-[500px]">
            <CardHeader className="p-4 border-b border-light-gray/30 bg-black/20">
              <CardTitle className="text-lg text-white flex items-center">
                <MessagesSquare className="h-5 w-5 mr-2 text-sky-400" />
                Website Conversation
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 flex-grow overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "flex",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                        message.role === 'user' 
                          ? "bg-indigo-900/40 text-white" 
                          : "bg-black/40 text-muted-gray border border-light-gray/30"
                      )}
                    >
                      {message.content === '...' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                      ) : (
                        message.content
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            
            {/* Input Area */}
            <div className="p-4 border-t border-light-gray/30 mt-auto">
              <form 
                onSubmit={(e) => { 
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  type="text"
                  placeholder="Ask anything about this website..."
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="flex-grow bg-black border-light-gray text-white placeholder:text-muted-gray"
                  disabled={isProcessing}
                />
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500"
                  disabled={isProcessing || !userInput.trim()}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
      
      {/* Info Box when no website is analyzed yet */}
      {!websiteData?.analyzed && !isAnalyzing && (
        <Card className="bg-near-black border-light-gray p-8 text-center">
          <Info className="h-12 w-12 mx-auto text-sky-400 mb-4 opacity-70" />
          <h3 className="text-xl font-medium text-white mb-2">How It Works</h3>
          <p className="text-muted-gray max-w-md mx-auto mb-6">
            Enter any website URL above to analyze its content. Once analyzed, you can ask questions and have a conversation about the website's information.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="p-4 bg-black/30 rounded-lg border border-light-gray/30">
              <p className="text-sm text-white font-medium mb-1">1. Enter URL</p>
              <p className="text-xs text-muted-gray">Input any website you want to explore</p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg border border-light-gray/30">
              <p className="text-sm text-white font-medium mb-1">2. AI Analysis</p>
              <p className="text-xs text-muted-gray">Our AI extracts and processes the content</p>
            </div>
            <div className="p-4 bg-black/30 rounded-lg border border-light-gray/30">
              <p className="text-sm text-white font-medium mb-1">3. Ask Questions</p>
              <p className="text-xs text-muted-gray">Chat with the AI about the website</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 
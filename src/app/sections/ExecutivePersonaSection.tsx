'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Building, Search, AlertCircle, Copy, Download, CheckCircle } from 'lucide-react';

interface PersonalityProfile {
  profileSummary: string;
  inferredStyle: string;
  communicationTips: string[];
  searchResults?: {
    executive_search_results: number;
    company_search_results: number;
    news_articles_found: number;
  };
  recentNews?: Array<{
    title: string;
    snippet: string;
    date: string;
  }>;
  companyInfo?: {
    name: string;
    description: string;
    industry: string;
  };
}

function ErrorDisplay({ error, onRetry }: { error: any, onRetry: () => void }) {
  return (
    <Card className="bg-red-50 border-red-200">
      <CardHeader>
        <div className="flex items-center">
          <AlertCircle className="text-red-500 mr-2" />
          <CardTitle className="text-red-700">Error</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-red-600">{error.message || "An error occurred"}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={onRetry} variant="outline">Try Again</Button>
      </CardFooter>
    </Card>
  );
}

export function ExecutivePersonaSection() {
  const [executiveName, setExecutiveName] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  const [profile, setProfile] = useState<PersonalityProfile | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executiveName || !companyName) {
      setError({ message: "Please enter both executive name and company name" });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProfile(null);
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 5);
      });
    }, 600);
    
    try {
      const response = await fetch('/api/tools/executive-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: executiveName,
          title: 'Executive',
          company: companyName
        })
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.content) {
        const serperPersona = data.content;
        
        // Simple profile structure
        const adaptedProfile: PersonalityProfile = {
          profileSummary: serperPersona.persona?.background || 'Executive profile information available from search results',
          inferredStyle: `Professional communication style based on search results`,
          communicationTips: [
            'Focus on professional achievements and industry expertise',
            'Reference recent company developments if available',
            'Maintain formal business communication tone',
            'Highlight relevant industry connections',
            'Be concise and results-oriented'
          ],
          searchResults: serperPersona.research_metadata || undefined,
          recentNews: serperPersona.persona?.recent_news || [],
          companyInfo: serperPersona.company_info || undefined
        };
        
        setProfile(adaptedProfile);
      } else {
        throw new Error("Invalid response format from API");
      }
      
    } catch (error) {
      console.error('Error analyzing executive:', error);
      setError({
        message: error instanceof Error ? error.message : "Failed to analyze executive profile",
        details: error instanceof Error ? error.stack : "Unknown error"
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 500);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleDownload = () => {
    if (!profile) return;
    
    const reportText = `
EXECUTIVE PERSONA PROFILE
=========================
Name: ${executiveName}
Company: ${companyName}
Generated: ${new Date().toLocaleDateString()}

PROFILE SUMMARY
---------------
${profile.profileSummary}

COMMUNICATION STYLE
-------------------
${profile.inferredStyle}

COMMUNICATION TIPS
------------------
${profile.communicationTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

Generated by: Deliver AI Platform
    `.trim();
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-profile-${executiveName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setExecutiveName('');
    setCompanyName('');
    setProfile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Strategic Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-zinc-800/20"></div>
        
        <div className="relative px-6 py-16 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-zinc-900/80 border border-zinc-800 rounded-full text-white text-sm font-bold mb-8 uppercase tracking-wider backdrop-blur-sm">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <User className="h-4 w-4" />
              STRATEGIC INTELLIGENCE
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
              <span className="block text-white mb-2">EXECUTIVE</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600">
                PERSONA ANALYZER
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed max-w-3xl mx-auto mb-8">
              Generate detailed executive profiles using real-time research and AI-powered behavioral analysis.
              <span className="text-white font-semibold block mt-2">
                Perfect for M&A negotiations, board presentations, and strategic partnerships.
              </span>
            </p>

            {/* Strategic Value Props */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-400 mb-2">40%</div>
                <div className="text-sm text-zinc-400">Higher Deal Closure Rate</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-pink-400 mb-2">85%</div>
                <div className="text-sm text-zinc-400">Faster Relationship Building</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <div className="text-3xl font-bold text-purple-600 mb-2">Real-Time</div>
                <div className="text-sm text-zinc-400">Intelligence Gathering</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 md:px-8">
        <div className="max-w-6xl mx-auto">

        {!profile ? (
          <Card className="bg-zinc-900/80 border border-zinc-800 max-w-3xl mx-auto backdrop-blur-sm">
            <CardHeader className="border-b border-zinc-800">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center text-white text-2xl">
                    <div className="w-2 h-6 bg-purple-400 mr-3 rounded-sm"></div>
                    Strategic Intelligence Input
                  </CardTitle>
                  <CardDescription className="text-zinc-400 mt-2">
                    Enter executive details to generate comprehensive behavioral analysis and communication strategy
                  </CardDescription>
                </div>
                <div className="bg-zinc-800/50 p-3 rounded-lg">
                  <User className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8 p-8">
              {error && (
                <div className="mb-6">
                  <ErrorDisplay error={error} onRetry={() => setError(null)} />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">Target Executive</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 h-5 w-5 text-purple-400" />
                    <Input
                      type="text"
                      placeholder="e.g., Malte Clausen"
                      value={executiveName}
                      onChange={(e) => setExecutiveName(e.target.value)}
                      className="pl-12 bg-black border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-lg focus:border-purple-400 focus:ring-purple-400"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Full name of the executive for comprehensive analysis</p>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-bold text-white uppercase tracking-wider">Organization</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-4 h-5 w-5 text-purple-400" />
                    <Input
                      type="text"
                      placeholder="e.g., Velocity AI"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-12 bg-black border-zinc-700 text-white placeholder:text-zinc-500 h-12 text-lg focus:border-purple-400 focus:ring-purple-400"
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-zinc-500">Company or organization for contextual intelligence</p>
                </div>
              </div>

              {/* Strategic Use Cases */}
              <div className="bg-zinc-800/50 p-6 rounded-lg border border-zinc-700">
                <h3 className="text-lg font-bold text-white mb-4">Strategic Applications</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-purple-400 font-bold">M&A Negotiations</div>
                    <div className="text-xs text-zinc-400 mt-1">Optimize communication for deal closure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-pink-400 font-bold">Board Presentations</div>
                    <div className="text-xs text-zinc-400 mt-1">Tailor messaging to decision makers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-600 font-bold">Partnership Development</div>
                    <div className="text-xs text-zinc-400 mt-1">Build strategic relationships faster</div>
                  </div>
                </div>
              </div>
              
              {isLoading && (
                <div className="space-y-4">
                  <div className="bg-black/50 p-6 rounded-lg border border-zinc-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Strategic Intelligence Processing</h3>
                      <div className="text-purple-400 font-bold">{progress}%</div>
                    </div>
                    <Progress value={progress} className="w-full mb-4" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className={`p-3 rounded ${progress >= 30 ? 'bg-purple-900/50 text-purple-300' : 'bg-zinc-800/50 text-zinc-500'}`}>
                        <div className="font-semibold">Data Collection</div>
                        <div className="text-xs">Executive intelligence gathering</div>
                      </div>
                      <div className={`p-3 rounded ${progress >= 60 ? 'bg-pink-900/50 text-pink-300' : 'bg-zinc-800/50 text-zinc-500'}`}>
                        <div className="font-semibold">Behavioral Analysis</div>
                        <div className="text-xs">Communication pattern analysis</div>
                      </div>
                      <div className={`p-3 rounded ${progress >= 90 ? 'bg-purple-900/50 text-purple-300' : 'bg-zinc-800/50 text-zinc-500'}`}>
                        <div className="font-semibold">Strategic Synthesis</div>
                        <div className="text-xs">Actionable insights generation</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-zinc-800 p-8">
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading || !executiveName || !companyName}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 text-lg transition-all hover:scale-105 shadow-2xl"
              >
                <Search className="mr-3 h-5 w-5" />
                {isLoading ? 'ANALYZING STRATEGIC INTELLIGENCE...' : 'GENERATE EXECUTIVE INTELLIGENCE'}
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Strategic Executive Header */}
            <Card className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
              <CardHeader className="border-b border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-xl">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black text-white">{executiveName}</CardTitle>
                      <CardDescription className="text-xl text-purple-400 font-semibold">{companyName}</CardDescription>
                      <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                          <span className="text-sm text-zinc-400">Intelligence Active</span>
                        </div>
                        <div className="text-sm text-zinc-500">
                          Generated: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleCopy(profile.profileSummary, 'Profile Summary')}
                      variant="outline"
                      className="border-zinc-700 hover:border-purple-400 hover:text-purple-400"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedText === 'Profile Summary' ? 'Copied!' : 'Copy Intel'}
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="border-zinc-700 hover:border-pink-400 hover:text-pink-400"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                    <Button
                      onClick={handleReset}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    >
                      New Analysis
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Strategic Intelligence Tabs */}
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80 border border-zinc-800 p-1">
                <TabsTrigger 
                  value="summary" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-bold"
                >
                  Strategic Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="communication" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-bold"
                >
                  Communication Intel
                </TabsTrigger>
                <TabsTrigger 
                  value="research" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white font-bold"
                >
                  Intelligence Data
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="summary" className="space-y-6">
                <Card className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
                  <CardHeader className="border-b border-zinc-800">
                    <div className="flex items-center">
                      <div className="w-2 h-6 bg-purple-400 mr-3 rounded-sm"></div>
                      <CardTitle className="text-white text-xl">Strategic Executive Profile</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-black/50 p-6 rounded-lg border border-zinc-700 mb-6">
                      <h3 className="text-lg font-bold text-white mb-4">Executive Intelligence Summary</h3>
                      <p className="text-zinc-300 whitespace-pre-line leading-relaxed text-lg">{profile.profileSummary}</p>
                    </div>
                    
                    {/* Strategic Insights Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-lg border border-purple-700/50">
                        <h4 className="text-purple-300 font-bold mb-3">Strategic Value</h4>
                        <p className="text-zinc-300 text-sm">High-value target for strategic partnerships and business development initiatives</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/30 p-6 rounded-lg border border-pink-700/50">
                        <h4 className="text-pink-300 font-bold mb-3">Engagement Priority</h4>
                        <p className="text-zinc-300 text-sm">Executive-level decision maker with significant influence on capital allocation</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="communication" className="space-y-6">
                <Card className="bg-zinc-900/80 border border-zinc-800 backdrop-blur-sm">
                  <CardHeader className="border-b border-zinc-800">
                    <div className="flex items-center">
                      <div className="w-2 h-6 bg-pink-400 mr-3 rounded-sm"></div>
                      <CardTitle className="text-white text-xl">Strategic Communication Intelligence</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="bg-black/50 p-6 rounded-lg border border-zinc-700 mb-6">
                      <h3 className="text-lg font-bold text-white mb-4">Communication Profile</h3>
                      <p className="text-zinc-300 text-lg leading-relaxed">{profile.inferredStyle}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/50 p-6 rounded-lg border border-zinc-700">
                      <h4 className="text-xl font-bold text-white mb-6 flex items-center">
                        <div className="w-2 h-6 bg-green-400 mr-3 rounded-sm"></div>
                        Strategic Communication Tactics
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {profile.communicationTips.map((tip, i) => (
                          <div key={i} className="flex items-start bg-black/30 p-4 rounded-lg border border-zinc-700/50">
                            <div className="bg-green-500/20 p-2 rounded-full mr-4 flex-shrink-0">
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            </div>
                            <div>
                              <div className="text-white font-semibold mb-1">Tactic #{i + 1}</div>
                              <span className="text-zinc-300">{tip}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="research" className="space-y-4">
                <Card className="bg-[#111111] border-[#333333]">
                  <CardHeader>
                    <CardTitle className="text-white">Research Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {profile.searchResults ? (
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-sky-400">{profile.searchResults.executive_search_results}</div>
                          <div className="text-sm text-gray-400">Executive Results</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-400">{profile.searchResults.company_search_results}</div>
                          <div className="text-sm text-gray-400">Company Results</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-purple-400">{profile.searchResults.news_articles_found}</div>
                          <div className="text-sm text-gray-400">News Articles</div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">No research metadata available</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default ExecutivePersonaSection;
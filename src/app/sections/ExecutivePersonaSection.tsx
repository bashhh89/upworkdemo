'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Search, User, Briefcase, Clipboard, Check, Download, ArrowUpRight, CheckCircle, MessageSquare, ArrowRight, FileSpreadsheet, Mail, Phone, Calendar, Zap, BarChart, BookOpen, ChevronDown, PieChart, Target, Brain, Sparkles } from 'lucide-react';

interface PersonalityProfile {
  profileSummary: string;
  inferredStyle: string;
  communicationTips: string[];
  preferencesAndTraits?: {
    [key: string]: {
      score: number; // 1-10
      description: string;
    }
  };
  relatedTopics?: string[];
  discProfile?: {
    primaryType: string;
    secondaryType?: string;
    description: string;
    strengths: string[];
    challenges: string[];
    typeBreakdown: {
      dominance: number; // 0-100
      influence: number;
      steadiness: number;
      conscientiousness: number;
    };
  };
  insightsByContext?: {
    [key: string]: string;
  };
}

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
            <p>{error.details}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onRetry}>Try Again</Button>
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

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!executiveName || !companyName) {
      setError({ message: "Please enter both executive name and company name" });
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setProfile(null);
    
    // Simulate progress updates
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
      const promptText = `
        Find publicly available professional information, focusing on LinkedIn if possible, for executive "${executiveName}" at company "${companyName}".
        
        Analyze their profile summary, job titles, company information, and any recent public posts or articles. 
        Based ONLY on this public information, infer their likely professional communication style and personality traits.
        
        Generate a concise report as a JSON object with these exact keys:
        - profileSummary: String summarizing key career points/focus found
        - inferredStyle: String describing likely communication preferences
        - communicationTips: Array of 5 actionable tips for effectively engaging with this person
        - preferencesAndTraits: Object containing communication preferences with scores (1-10) and descriptions
          - data_orientation: How strongly they prefer data/facts
          - relationship_focus: How important relationships are to them
          - decision_speed: How quickly they tend to make decisions
          - risk_tolerance: Their approach to risk-taking
          - communication_formality: How formal their communication style is
        - relatedTopics: Array of 3-5 business topics likely of interest to them (based on industry/role)
        - discProfile: Object containing DISC personality profile assessment
          - primaryType: The dominant DISC type (Dominance, Influence, Steadiness, or Conscientiousness)
          - secondaryType: Secondary DISC type, if applicable
          - description: Detailed explanation of their DISC style and how it manifests
          - strengths: Array of 3-5 strengths associated with this DISC profile
          - challenges: Array of 3-5 potential challenges or blind spots
          - typeBreakdown: Object with numerical scores (0-100) for each DISC component
            - dominance: Score for Dominance traits
            - influence: Score for Influence traits  
            - steadiness: Score for Steadiness traits
            - conscientiousness: Score for Conscientiousness traits
        - insightsByContext: Object with keys representing different business contexts, values are insights
          - sales: Tips for selling to this executive
          - meetings: Advice for effective meetings with this person
          - negotiations: Strategies for successful negotiations
          - presentations: How to structure presentations for this executive
          - email: Tips for effective email communication

        Format the response as a VALID JSON object with the structure described above. Assess confidence based ONLY on available data. 
        If insufficient information is found, provide reasonable estimates based on their role, company, and industry trends, but be clear when you're making inferences rather than working from direct evidence.
      `;
      
      const response = await fetch('/api/pollinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "searchgpt",
          messages: [
            { role: "user", content: promptText }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
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
        try {
          const parsedProfile = JSON.parse(data.content);
          setProfile(parsedProfile);
        } catch (parseError) {
          console.error("Failed to parse profile data:", parseError);
          throw new Error("Failed to parse executive profile results");
        }
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
    if (!profile) return;
    
    let reportText = `
EXECUTIVE PERSONA PROFILE
=========================
Name: ${executiveName}
Company: ${companyName}
Generated: ${new Date().toLocaleDateString()}

PROFILE SUMMARY
--------------
${profile.profileSummary}

COMMUNICATION STYLE
------------------
${profile.inferredStyle}

${profile.discProfile ? `
DISC PROFILE
-----------
Primary Type: ${profile.discProfile.primaryType}
${profile.discProfile.secondaryType ? `Secondary Type: ${profile.discProfile.secondaryType}` : ''}

${profile.discProfile.description}

Strengths:
${profile.discProfile.strengths.map(s => `• ${s}`).join('\n')}

Challenges:
${profile.discProfile.challenges.map(c => `• ${c}`).join('\n')}

Type Breakdown:
• Dominance: ${profile.discProfile.typeBreakdown.dominance}%
• Influence: ${profile.discProfile.typeBreakdown.influence}%
• Steadiness: ${profile.discProfile.typeBreakdown.steadiness}%
• Conscientiousness: ${profile.discProfile.typeBreakdown.conscientiousness}%
` : ''}

COMMUNICATION TIPS
-----------------
${profile.communicationTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

${profile.insightsByContext ? `
CONTEXTUAL INSIGHTS
------------------
Sales Approach: ${profile.insightsByContext.sales}

Meeting Strategies: ${profile.insightsByContext.meetings}

Negotiation Tactics: ${profile.insightsByContext.negotiations}

Presentation Style: ${profile.insightsByContext.presentations}

Email Communication: ${profile.insightsByContext.email}
` : ''}

PREFERENCES & TRAITS
-------------------
${profile.preferencesAndTraits ? 
  Object.entries(profile.preferencesAndTraits).map(([trait, data]) => 
    `${trait.replace('_', ' ').toUpperCase()}: ${data.score}/10\n${data.description}`
  ).join('\n\n') : 
  'No detailed traits available'}

LIKELY TOPICS OF INTEREST
------------------------
${profile.relatedTopics ? profile.relatedTopics.join(', ') : 'No topics identified'}

Generated by: Deliver AI Platform
Note: This profile is based on publicly available information and AI inference. It is meant as a communication aid, not a definitive assessment.
`;

    const blob = new Blob([reportText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `executive-profile-${executiveName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Reset form
  const handleReset = () => {
    setExecutiveName('');
    setCompanyName('');
    setProfile(null);
    setError(null);
  };

  // Render trait score bars
  const renderTraitScore = (score: number, color: string) => {
    return (
      <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${score * 10}%` }}
        ></div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Executive Persona <span className="text-sky-400">Analyzer</span></h2>
      <p className="text-muted-gray mb-6">Generate AI-powered personality insights and communication guidelines for executives.</p>
      
      {/* Input form */}
      {!profile && (
        <Card className="bg-near-black border-light-gray mb-8 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <User className="h-5 w-5 text-sky-400 mr-2" />
                Executive Information
              </CardTitle>
              <CardDescription>
                Enter the executive's name and company to generate a communication profile
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {error && (
                <div className="mb-4">
                  <ErrorDisplay error={error} onRetry={() => setError(null)} />
                </div>
              )}
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Executive Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="e.g., Satya Nadella"
                      value={executiveName}
                      onChange={(e) => setExecutiveName(e.target.value)}
                      className="pl-10 bg-black border-light-gray text-white placeholder:text-muted-gray h-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-300">Company</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                    <Input
                      type="text"
                      placeholder="e.g., Microsoft"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10 bg-black border-light-gray text-white placeholder:text-muted-gray h-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
              
              <div className="bg-sky-950/20 border border-sky-800/30 rounded-md p-3 text-sm">
                <div className="flex items-start">
                  <Search className="h-4 w-4 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sky-300">
                    This tool uses AI to analyze publicly available information about executives to generate communication insights.
                  </p>
                </div>
              </div>
              
              {/* Progress bar for loading state */}
              {isLoading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-gray">Analyzing executive profile</span>
                    <span className="text-sky-400">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-1" />
                  <p className="text-xs text-muted-gray mt-2 italic">
                    {progress < 30 ? "Searching for executive information..." : 
                     progress < 60 ? "Analyzing career history and communication patterns..." : 
                     progress < 90 ? "Generating communication profile..." : 
                     "Finalizing persona insights..."}
                  </p>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="border-t border-light-gray pt-4 flex justify-end">
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 h-10"
                disabled={isLoading || !executiveName || !companyName}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Generate Persona
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      )}
      
      {/* Results display */}
      {profile && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Executive profile card */}
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <div className="bg-gradient-to-r from-sky-900/20 to-indigo-900/20 p-4 sm:p-6 border-b border-light-gray">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{executiveName}</h3>
                  <p className="text-sky-400 text-sm">{companyName}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleCopy(JSON.stringify(profile, null, 2), "JSON")}
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
                    Download
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleReset}
                    className="h-9"
                  >
                    <ArrowRight className="mr-1 h-4 w-4" />
                    New Search
                  </Button>
                </div>
              </div>
              
              {/* DISC Profile Badge */}
              {profile.discProfile && (
                <div className="mt-4 flex items-center">
                  <div className="px-3 py-1.5 bg-indigo-900/30 border border-indigo-700/30 rounded flex items-center">
                    <PieChart className="h-4 w-4 text-indigo-400 mr-2" />
                    <span className="text-indigo-300 text-sm font-medium">
                      DISC Profile: {profile.discProfile.primaryType}
                      {profile.discProfile.secondaryType && ` / ${profile.discProfile.secondaryType}`}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tabbed content UI */}
            <Tabs defaultValue="overview" className="w-full">
              <div className="border-b border-light-gray/30 bg-black/40">
                <TabsList className="p-1 bg-black/60 h-16 w-full justify-start border border-light-gray/30 rounded-t-lg mx-4 mt-2 shadow-lg">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-md text-base font-medium py-2 px-6 data-[state=active]:bg-sky-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-all duration-200"
                  >
                    <User className="h-5 w-5 mr-2" />
                    Overview
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="disc-profile" 
                    className="rounded-md text-base font-medium py-2 px-6 data-[state=active]:bg-indigo-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400 transition-all duration-200"
                  >
                    <PieChart className="h-5 w-5 mr-2" />
                    DISC Profile
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="communication" 
                    className="rounded-md text-base font-medium py-2 px-6 data-[state=active]:bg-emerald-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 transition-all duration-200"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Communication
                  </TabsTrigger>
                  
                  <TabsTrigger 
                    value="contexts" 
                    className="rounded-md text-base font-medium py-2 px-6 data-[state=active]:bg-amber-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-amber-400 transition-all duration-200"
                  >
                    <Target className="h-5 w-5 mr-2" />
                    Contextual Insights
                  </TabsTrigger>
                </TabsList>
              </div>
                
              {/* Overview Tab */}
              <TabsContent value="overview" className="p-6 pt-6 focus-visible:outline-none focus-visible:ring-0">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Profile summary - left column */}
                  <div className="lg:col-span-2">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2 text-sky-400" />
                      Profile Summary
                    </h4>
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <p className="text-gray-300 whitespace-pre-line text-sm">
                        {profile.profileSummary}
                      </p>
                    </div>
                  </div>
                  
                  {/* Likely interests - right column */}
                  <div className="lg:col-span-1">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-400" />
                      Topics of Interest
                    </h4>
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4 h-full">
                      <div className="flex flex-wrap gap-2">
                        {profile.relatedTopics ? (
                          profile.relatedTopics.map((topic, i) => (
                            <span key={i} className="px-2 py-1 bg-purple-900/30 border border-purple-800/30 rounded-full text-xs text-purple-300">
                              {topic}
                            </span>
                          ))
                        ) : (
                          <p className="text-gray-500 text-sm">No topics identified</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Communication style section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2 text-indigo-400" />
                    Communication Style
                  </h4>
                  <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                    <p className="text-gray-300 whitespace-pre-line text-sm">
                      {profile.inferredStyle}
                    </p>
                  </div>
                </div>
                
                {/* Personality traits */}
                {profile.preferencesAndTraits && (
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <BarChart className="h-5 w-5 mr-2 text-amber-400" />
                      Communication Preferences
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(profile.preferencesAndTraits).map(([trait, data], i) => {
                        // Generate a different color for each trait
                        const colors = [
                          "bg-sky-500", "bg-indigo-500", "bg-purple-500", 
                          "bg-amber-500", "bg-emerald-500", "bg-rose-500"
                        ];
                        return (
                          <div key={trait} className="bg-black/30 rounded-md border border-light-gray/30 p-3">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className="text-sm font-medium text-white capitalize">
                                {trait.replace(/_/g, ' ')}
                              </h5>
                              <span className="text-xs font-medium text-white">{data.score}/10</span>
                            </div>
                            {renderTraitScore(data.score, colors[i % colors.length])}
                            <p className="text-gray-400 text-xs mt-2">{data.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              {/* DISC Profile Tab */}
              <TabsContent value="disc-profile" className="p-6 pt-6 focus-visible:outline-none focus-visible:ring-0">
                {profile.discProfile ? (
                  <div className="space-y-6">
                    {/* DISC profile header */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                          <PieChart className="h-5 w-5 mr-2 text-indigo-400" />
                          DISC Profile Analysis
                        </h4>
                        <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                          <div className="mb-3">
                            <h5 className="text-indigo-300 font-medium">
                              {profile.discProfile.primaryType}
                              {profile.discProfile.secondaryType && ` / ${profile.discProfile.secondaryType}`}
                            </h5>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {profile.discProfile.description}
                          </p>
                        </div>
                      </div>
                      
                      {/* DISC visual chart */}
                      <div className="w-full md:w-64 md:flex-shrink-0">
                        <div className="bg-black/50 rounded-md border border-light-gray/50 p-5 h-full shadow-lg">
                          <h5 className="text-base font-semibold text-white mb-4 text-center">DISC Type Breakdown</h5>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-medium">D: Dominance</span>
                                <span className="text-white font-bold">{profile.discProfile.typeBreakdown.dominance}%</span>
                              </div>
                              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-red-500 rounded-full shadow-inner"
                                  style={{ width: `${profile.discProfile.typeBreakdown.dominance}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-medium">I: Influence</span>
                                <span className="text-white font-bold">{profile.discProfile.typeBreakdown.influence}%</span>
                              </div>
                              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-yellow-500 rounded-full shadow-inner"
                                  style={{ width: `${profile.discProfile.typeBreakdown.influence}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-medium">S: Steadiness</span>
                                <span className="text-white font-bold">{profile.discProfile.typeBreakdown.steadiness}%</span>
                              </div>
                              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-green-500 rounded-full shadow-inner"
                                  style={{ width: `${profile.discProfile.typeBreakdown.steadiness}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-white font-medium">C: Conscientiousness</span>
                                <span className="text-white font-bold">{profile.discProfile.typeBreakdown.conscientiousness}%</span>
                              </div>
                              <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full shadow-inner"
                                  style={{ width: `${profile.discProfile.typeBreakdown.conscientiousness}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-center text-xs text-gray-400">
                              Primary type: <span className="text-white font-medium">{profile.discProfile.primaryType}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Strengths and challenges */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div>
                        <h4 className="text-base font-medium text-white mb-3 flex items-center">
                          <Sparkles className="h-4 w-4 mr-2 text-emerald-400" />
                          Strengths
                        </h4>
                        <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                          <div className="space-y-3">
                            {profile.discProfile.strengths.map((strength, i) => (
                              <div key={i} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center mr-3 mt-0.5">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                                <p className="text-gray-300 text-sm">{strength}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {/* Challenges */}
                      <div>
                        <h4 className="text-base font-medium text-white mb-3 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-400" />
                          Potential Challenges
                        </h4>
                        <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                          <div className="space-y-3">
                            {profile.discProfile.challenges.map((challenge, i) => (
                              <div key={i} className="flex items-start">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mr-3 mt-0.5">
                                  {i + 1}
                                </div>
                                <p className="text-gray-300 text-sm">{challenge}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <PieChart className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-white font-medium mb-2">DISC Profile Not Available</h3>
                    <p className="text-muted-gray text-sm max-w-md">
                      Unable to generate a DISC profile with the available information.
                    </p>
                  </div>
                )}
              </TabsContent>
              
              {/* Communication Tab */}
              <TabsContent value="communication" className="p-6 pt-6 focus-visible:outline-none focus-visible:ring-0">
                {/* Communication tips section */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-emerald-400" />
                    Engagement Strategies
                  </h4>
                  <div className="bg-black/30 rounded-md border border-light-gray/30 p-4 mb-6">
                    <div className="space-y-3">
                      {profile.communicationTips.map((tip, i) => (
                        <div key={i} className="flex items-start">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/30 text-emerald-400 flex items-center justify-center mr-3 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-gray-300 text-sm">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Email template generator */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <Mail className="h-5 w-5 mr-2 text-sky-400" />
                    Communication Tools
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-sky-400" />
                        Email Template
                      </h5>
                      <p className="text-gray-400 text-xs mb-3">
                        A personalized email template based on this executive's communication preferences
                      </p>
                      <div className="bg-black/50 rounded p-3 text-gray-300 text-xs font-mono mb-3">
                        <p>Subject: Meeting Request - Value Proposition for {companyName}</p>
                        <br />
                        <p>Hi {executiveName.split(' ')[0]},</p>
                        <br />
                        <p>I hope this email finds you well.</p>
                        <br />
                        <p>I've been following {companyName}'s recent initiatives in {profile.relatedTopics ? profile.relatedTopics[0] : 'your industry'} and believe we can offer significant value in this area.</p>
                        <br />
                        <p>Our solution has helped similar companies achieve [specific benefit relevant to their interests].</p>
                        <br />
                        <p>Would you be available for a brief 15-minute call next week to discuss how we might support your objectives?</p>
                        <br />
                        <p>Best regards,</p>
                        <p>[Your Name]</p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => {
                          const subject = encodeURIComponent(`Meeting Request - Value Proposition for ${companyName}`);
                          const body = encodeURIComponent(`
Hi ${executiveName.split(' ')[0]},

I hope this email finds you well.

I've been following ${companyName}'s recent initiatives in ${profile.relatedTopics ? profile.relatedTopics[0] : 'your industry'} and believe we can offer significant value in this area.

Our solution has helped similar companies achieve [specific benefit relevant to their interests].

Would you be available for a brief 15-minute call next week to discuss how we might support your objectives?

Best regards,
[Your Name]
                          `);
                          window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                        }}
                      >
                        <Mail className="mr-2 h-3 w-3" />
                        Open in Email Client
                      </Button>
                    </div>
                    
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h5 className="text-sm font-medium text-white mb-3 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        Meeting Agenda
                      </h5>
                      <p className="text-gray-400 text-xs mb-3">
                        A suggested meeting structure optimized for this executive's preferences
                      </p>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-2 text-xs">
                            1
                          </div>
                          <div>
                            <p className="text-white font-medium">Introduction (2 min)</p>
                            <p className="text-gray-400">Brief company introduction with focus on relevance to {companyName}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-2 text-xs">
                            2
                          </div>
                          <div>
                            <p className="text-white font-medium">Value Proposition (5 min)</p>
                            <p className="text-gray-400">Clear, concise explanation of specific benefits with {profile.preferencesAndTraits?.data_orientation?.score ?? 5 > 7 ? 'quantifiable metrics' : 'practical examples'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-2 text-xs">
                            3
                          </div>
                          <div>
                            <p className="text-white font-medium">Discussion (10 min)</p>
                            <p className="text-gray-400">Focus on {profile.discProfile?.primaryType === 'Dominance' ? 'results and ROI' : profile.discProfile?.primaryType === 'Influence' ? 'strategic vision and possibilities' : profile.discProfile?.primaryType === 'Steadiness' ? 'implementation process and reliability' : 'details and accuracy'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-2 text-xs">
                            4
                          </div>
                          <div>
                            <p className="text-white font-medium">Next Steps (3 min)</p>
                            <p className="text-gray-400">Clear action items with specific timelines</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-light-gray/20">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => handleCopy("Meeting Agenda for " + executiveName + ":\n\n1. Introduction (2 min)\n2. Value Proposition (5 min)\n3. Discussion (10 min)\n4. Next Steps (3 min)", "Agenda")}
                        >
                          {copiedText === "Agenda" ? (
                            <>
                              <Check className="mr-1 h-3 w-3 text-green-400" />
                              <span className="text-green-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Clipboard className="mr-1 h-3 w-3" />
                              Copy Agenda
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Contextual Insights Tab */}
              <TabsContent value="contexts" className="p-6 pt-6 focus-visible:outline-none focus-visible:ring-0">
                {profile.insightsByContext ? (
                  <div className="space-y-6">
                    {/* Sales approach section */}
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h4 className="text-base font-medium text-white mb-2 flex items-center">
                        <FileSpreadsheet className="h-4 w-4 mr-2 text-sky-400" />
                        Sales Approach
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {profile.insightsByContext.sales}
                      </p>
                    </div>
                    
                    {/* Meeting strategies section */}
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h4 className="text-base font-medium text-white mb-2 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-400" />
                        Meeting Strategies
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {profile.insightsByContext.meetings}
                      </p>
                    </div>
                    
                    {/* Negotiation tactics section */}
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h4 className="text-base font-medium text-white mb-2 flex items-center">
                        <Target className="h-4 w-4 mr-2 text-amber-400" />
                        Negotiation Tactics
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {profile.insightsByContext.negotiations}
                      </p>
                    </div>
                    
                    {/* Presentation style section */}
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h4 className="text-base font-medium text-white mb-2 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-amber-400" />
                        Presentation Style
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {profile.insightsByContext.presentations}
                      </p>
                    </div>
                    
                    {/* Email communication section */}
                    <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                      <h4 className="text-base font-medium text-white mb-2 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                        Email Communication
                      </h4>
                      <p className="text-gray-300 text-sm">
                        {profile.insightsByContext.email}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Target className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-white font-medium mb-2">Contextual Insights Not Available</h3>
                    <p className="text-muted-gray text-sm max-w-md">
                      Unable to generate contextual insights with the available information.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {/* Action buttons */}
            <div className="p-6 border-t border-light-gray/30">
              <div className="flex flex-wrap justify-center gap-4">
                <Button 
                  className="rounded-md px-4 text-sm flex items-center"
                  onClick={() => {
                    const subject = encodeURIComponent(`Meeting with ${executiveName}`);
                    const body = encodeURIComponent(`
Hi ${executiveName.split(' ')[0]},

I hope this email finds you well.

I'd like to schedule some time to discuss how we might be able to help ${companyName}.

Best regards,
[Your Name]
                    `);
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Draft Email
                </Button>
                
                <Button 
                  variant="outline"
                  className="rounded-md px-4 text-sm flex items-center"
                  onClick={() => window.open(`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(executiveName + ' ' + companyName)}`, '_blank')}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  LinkedIn Search
                </Button>
                
                <Button 
                  variant="outline"
                  className="rounded-md px-4 text-sm flex items-center"
                  onClick={handleReset}
                >
                  <Search className="mr-2 h-4 w-4" />
                  New Executive Search
                </Button>
              </div>

              {/* Disclaimer notice */}
              <div className="mt-8 text-xs text-gray-500 border-t border-light-gray/30 pt-4">
                <p>
                  <strong>Disclaimer:</strong> This executive profile is generated using AI based on publicly available information. 
                  It provides insights to help with communication but should not be considered a definitive assessment of an individual's personality or preferences.
                </p>
              </div>
            </div>
          </Card>
          
          {/* Branding footer */}
          <div className="text-center text-xs text-muted-gray/60 mt-6">
            <p>Generated by Deliver AI Platform • {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </div>
  );
} 
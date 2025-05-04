 'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import {
  Palette,
  MessageSquare,
  Target,
  Sparkles,
  Download,
  ArrowRight,
  Check,
  Image as ImageIcon,
  Clipboard,
  PenTool,
  Eye,
  Layout,
  FileText,
  AlertCircle
} from 'lucide-react';

// Define interfaces for our data structures
interface BrandQuestion {
  id: string;
  question: string;
  description: string;
  inputType: 'text' | 'textarea' | 'color';
  placeholder: string;
}

interface MessagePillar {
  title: string;
  description: string;
  topics: string[];
}

interface ColorSuggestion {
  name: string;
  hex: string;
  description?: string;
}

interface SocialMediaTemplate {
  type: string;
  prompt: string;
  imageUrl?: string;
  description?: string;
}

interface BrandReport {
  visionStatements: string[];
  missionStatements: string[];
  messagingPillars: MessagePillar[];
  brandKeywords: string[];
  suggestedColors: ColorSuggestion[];
  logoPrompts?: string[];
  logoUrls?: string[];
  socialMediaTemplates?: SocialMediaTemplate[];
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

export function BrandFoundationSection() {
  // Questions for the multi-step form
  const questions: BrandQuestion[] = [
    {
      id: 'product',
      question: 'What is your product or service?',
      description: 'Describe your business, startup idea or product in detail.',
      inputType: 'textarea',
      placeholder: 'E.g., We are building an AI-powered writing assistant that helps content creators overcome writer\'s block and generate high-quality content faster.'
    },
    {
      id: 'audience',
      question: 'Who is your target audience?',
      description: 'Describe your ideal customer persona, including demographics, interests, and needs.',
      inputType: 'textarea',
      placeholder: 'E.g., Professional content creators, marketers, and small business owners aged 25-45 who create content regularly but struggle with consistency and generating fresh ideas.'
    },
    {
      id: 'value',
      question: 'What problem does your product solve?',
      description: 'Describe the unique value proposition and how you\'re different from competitors.',
      inputType: 'textarea',
      placeholder: 'E.g., Our AI assistant eliminates writer\'s block by providing intelligent suggestions based on the user\'s unique voice and style, unlike generic AI tools that produce generic-sounding content.'
    },
    {
      id: 'personality',
      question: 'What is your desired brand personality?',
      description: 'How do you want your brand to be perceived? Select traits that describe your brand voice.',
      inputType: 'textarea',
      placeholder: 'E.g., Innovative, friendly, and professional. We want to come across as cutting-edge but approachable, with a focus on empowering creators rather than replacing them.'
    },
    {
      id: 'competitors',
      question: 'Who are your main competitors?',
      description: 'List 2-3 competitors and what differentiates your approach from theirs.',
      inputType: 'textarea',
      placeholder: 'E.g., 1. Jasper AI - We differentiate by focusing more on preserving the user\'s unique voice. 2. Copy.ai - Our tool integrates better with existing workflows.'
    }
  ];

  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  const [brandReport, setBrandReport] = useState<BrandReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>("brand-dna");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  const hasCurrentAnswer = currentQuestion && answers[currentQuestion.id]?.trim().length > 0;
  
  // Handle answer changes
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // Navigation
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleGenerateReport();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Generate the brand report
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 10);
      });
    }, 800);
    
    try {
      // Step 1: Generate brand report using searchgpt
      const promptForBrandAnalysis = `
        Analyze this brand information and generate a complete Brand DNA:
        
        Product/Service: ${answers.product}
        Target Audience: ${answers.audience}
        Value Proposition: ${answers.value}
        Brand Personality: ${answers.personality}
        Competitors: ${answers.competitors}
        
        Create a comprehensive, actionable Brand DNA with the following sections:
        1. Vision Statements (2-3 options, forward-looking and aspirational)
        2. Mission Statements (2-3 options, purpose-driven and practical)
        3. Messaging Pillars (5-7 key themes, each with description and 2-3 content topic suggestions)
        4. Brand Keywords (10-15 words that capture the brand essence)
        5. Suggested Color Palette (3-4 colors with hex codes that reflect the brand personality)
        
        Format as a valid JSON object with these exact keys:
        {
          "visionStatements": ["Vision 1", "Vision 2", "Vision 3"],
          "missionStatements": ["Mission 1", "Mission 2", "Mission 3"],
          "messagingPillars": [
            {
              "title": "Pillar Name",
              "description": "Short description of this pillar",
              "topics": ["Topic 1", "Topic 2", "Topic 3"]
            }
          ],
          "brandKeywords": ["Keyword1", "Keyword2", "Keyword3"],
          "suggestedColors": [
            {
              "name": "Primary Blue",
              "hex": "#3B82F6",
              "description": "Represents trust and reliability"
            }
          ]
        }
      `;
      
      const reportResponse = await fetch('/api/pollinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "searchgpt", // Using searchgpt for deeper analysis
          messages: [
            { 
              role: "user", 
              content: promptForBrandAnalysis 
            }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });
      
      if (!reportResponse.ok) {
        throw new Error(`Brand analysis failed with status: ${reportResponse.status}`);
      }
      
      const reportData = await reportResponse.json();
      let parsedReport: BrandReport | null = null;
      
      if (reportData.content) {
        try {
          parsedReport = JSON.parse(reportData.content);
        } catch (parseError) {
          console.error("Failed to parse brand report:", parseError);
          throw new Error("Failed to parse brand analysis results");
        }
      } else if (reportData.choices && reportData.choices[0] && reportData.choices[0].message) {
        try {
          parsedReport = JSON.parse(reportData.choices[0].message.content);
        } catch (parseError) {
          console.error("Failed to parse brand report:", parseError);
          throw new Error("Failed to parse brand analysis results");
        }
      } else {
        throw new Error("Invalid response format from API");
      }
      
      if (!parsedReport) {
        throw new Error("Could not generate brand report");
      }
      
      // Step 2: Generate logo prompts based on brand keywords and colors
      const logoPrompts = [];
      
      if (parsedReport.brandKeywords && parsedReport.brandKeywords.length > 0 && 
          parsedReport.suggestedColors && parsedReport.suggestedColors.length > 0) {
        
        // Select some keywords randomly for variety
        const getRandomKeywords = (count: number) => {
          const shuffled = [...parsedReport!.brandKeywords].sort(() => 0.5 - Math.random());
          return shuffled.slice(0, Math.min(count, shuffled.length)).join(', ');
        };
        
        // Create different logo prompts
        logoPrompts.push(
          `Minimalist logo concept for a ${getRandomKeywords(3)} brand, primary color ${parsedReport.suggestedColors[0].hex}, abstract, modern, clean lines, professional, vector style, white background, high quality`,
          `Geometric logo design, ${getRandomKeywords(4)}, using colors ${parsedReport.suggestedColors[0].hex} and ${parsedReport.suggestedColors.length > 1 ? parsedReport.suggestedColors[1].hex : parsedReport.suggestedColors[0].hex}, creative, unique, memorable, white background, professional, vector style`,
          `Brand logo for ${answers.product.split(' ').slice(0, 3).join(' ')}..., ${getRandomKeywords(3)}, ${parsedReport.suggestedColors[0].name.toLowerCase()} color scheme, professional, high-quality, white background, vector art`
        );
        
        parsedReport.logoPrompts = logoPrompts;
      }
      
      // Step 3: Generate social media template prompts
      const socialMediaTemplates: SocialMediaTemplate[] = [];
      const productName = answers.product.split(' ').slice(0, 3).join(' ');
      const mainColor = parsedReport.suggestedColors[0].hex;
      const secondaryColor = parsedReport.suggestedColors.length > 1 
        ? parsedReport.suggestedColors[1].hex 
        : parsedReport.suggestedColors[0].hex;
      
      // Create social media template configurations
      socialMediaTemplates.push(
        {
          type: "Instagram Post",
          description: "Perfect square format post that showcases your brand with a clean, modern aesthetic",
          prompt: `Instagram post for ${productName}, professional, modern design, ${mainColor} color scheme, includes brand elements, minimalist, high quality, product showcase, digital marketing`
        },
        {
          type: "LinkedIn Banner",
          description: "Professional header image for your brand's LinkedIn presence",
          prompt: `LinkedIn banner for ${productName}, professional, corporate style, ${mainColor} and ${secondaryColor} colors, abstract pattern, text overlay, business branding, digital marketing, high quality`
        },
        {
          type: "Twitter Header",
          description: "Eye-catching Twitter profile banner that aligns with your brand identity",
          prompt: `Twitter header for ${productName}, modern, ${parsedReport.brandKeywords.slice(0, 3).join(', ')}, gradient background from ${mainColor} to ${secondaryColor}, professional, digital marketing`
        },
        {
          type: "Facebook Ad",
          description: "Engaging Facebook advertisement template for your product or service",
          prompt: `Facebook ad for ${productName}, marketing, professional, eye-catching, ${mainColor} brand color, product showcase, digital marketing, high quality, call to action`
        }
      );
      
      // Step 4: Generate logo images using Pollinations API
      const logoUrls = [];
      
      if (logoPrompts.length > 0) {
        for (let prompt of logoPrompts) {
          try {
            // Direct URL approach - more reliable than API calls
            const encodedPrompt = encodeURIComponent(prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&noCache=true&model=turbo`;
            logoUrls.push(imageUrl);
            
            // Log for debugging
            console.log(`Added logo URL: ${imageUrl.substring(0, 100)}...`);
          } catch (imageError) {
            console.error("Error generating logo:", imageError);
            // Continue with other prompts even if one fails
          }
        }
        
        parsedReport.logoUrls = logoUrls;
      }
      
      // Step 5: Generate social media template images
      if (socialMediaTemplates.length > 0) {
        for (let template of socialMediaTemplates) {
          try {
            // Customize dimensions based on template type
            let width = 1080;
            let height = 1080;
            
            if (template.type === "LinkedIn Banner" || template.type === "Twitter Header") {
              width = 1500;
              height = 500;
            } else if (template.type === "Facebook Ad") {
              width = 1200;
              height = 628;
            }
            
            // Direct URL approach - more reliable than API calls
            const encodedPrompt = encodeURIComponent(template.prompt);
            const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&noCache=true&model=turbo`;
            template.imageUrl = imageUrl;
            
            // Log for debugging
            console.log(`Added ${template.type} URL: ${imageUrl.substring(0, 100)}...`);
          } catch (imageError) {
            console.error(`Error generating ${template.type}:`, imageError);
            // Continue with other templates even if one fails
          }
        }
        
        parsedReport.socialMediaTemplates = socialMediaTemplates;
      }
      
      // Set the final brand report
      setBrandReport(parsedReport);
      
      // Complete progress
      clearInterval(progressInterval);
      setGenerationProgress(100);
      
    } catch (error) {
      console.error("Error generating brand report:", error);
      clearInterval(progressInterval);
      setError({
        message: error instanceof Error ? error.message : "Failed to generate brand report",
        details: error instanceof Error ? error.stack : "Unknown error occurred"
      });
    } finally {
      setIsGenerating(false);
      // Reset progress after delay
      setTimeout(() => {
        if (generationProgress === 100) {
          setGenerationProgress(0);
        }
      }, 1000);
    }
  };
  
  // Copy to clipboard handler
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };
  
  // Download report handler
  const handleDownload = () => {
    if (!brandReport) return;
    
    let reportText = `
AI BRAND FOUNDATION REPORT
==========================

VISION STATEMENTS
----------------
${brandReport.visionStatements.map((vision, i) => `${i + 1}. ${vision}`).join('\n')}

MISSION STATEMENTS
-----------------
${brandReport.missionStatements.map((mission, i) => `${i + 1}. ${mission}`).join('\n')}

MESSAGING PILLARS
----------------
${brandReport.messagingPillars.map((pillar, i) => `
${i + 1}. ${pillar.title.toUpperCase()}
   ${pillar.description}
   
   Content Topics:
   ${pillar.topics.map(topic => `   - ${topic}`).join('\n')}
`).join('\n')}

BRAND KEYWORDS
-------------
${brandReport.brandKeywords.join(', ')}

COLOR PALETTE
------------
${brandReport.suggestedColors.map(color => `${color.name}: ${color.hex}${color.description ? ` - ${color.description}` : ''}`).join('\n')}

LOGO PROMPTS
-----------
${brandReport.logoPrompts ? brandReport.logoPrompts.map((prompt, i) => `${i + 1}. ${prompt}`).join('\n\n') : 'No logo prompts generated'}

SOCIAL MEDIA TEMPLATES
---------------------
${brandReport.socialMediaTemplates ? brandReport.socialMediaTemplates.map((template, i) => `
${i + 1}. ${template.type.toUpperCase()}
   Description: ${template.description}
   Prompt: ${template.prompt}
   ${template.imageUrl ? `   Image URL: ${template.imageUrl}` : ''}
`).join('\n') : 'No social media templates generated'}

Generated by: Deliver AI Brand Foundation Suite
Date: ${new Date().toLocaleDateString()}
`;

    const blob = new Blob([reportText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-brand-foundation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Reset handler
  const handleReset = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setBrandReport(null);
    setError(null);
  };

  // Render the questionnaire if no report yet
  if (!brandReport) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">AI Brand Foundation <span className="text-sky-400">Suite</span></h2>
        <p className="text-muted-gray mb-6">Create a comprehensive brand identity with AI-generated vision, mission, messaging pillars, and logo concepts.</p>
        
        {/* Error display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={handleGenerateReport} />
          </div>
        )}
        
        {/* Form card */}
        <Card className="bg-near-black border-light-gray animate-in fade-in duration-300">
          <CardHeader className="flex flex-row justify-between items-start border-b border-light-gray pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-sky-400 mb-1">Brand Questionnaire</CardTitle>
              <CardDescription className="text-xs text-muted-gray/70">
                Step {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </div>
            <div className="text-xs text-muted-gray bg-black px-2 py-1 rounded-sm border border-light-gray">
              Progress: {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
            </div>
          </CardHeader>
          
          <CardContent className="pt-6 pb-8">
            <Label className="text-lg font-medium text-white block mb-2 text-left">
              {currentQuestion.question}
            </Label>
            <p className="text-muted-gray mb-6 text-sm">{currentQuestion.description}</p>
            
            {currentQuestion.inputType === 'textarea' && (
              <Textarea
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="bg-black border-light-gray text-white placeholder:text-muted-gray min-h-[150px]"
              />
            )}
            
            {currentQuestion.inputType === 'text' && (
              <Input
                placeholder={currentQuestion.placeholder}
                value={answers[currentQuestion.id] || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                className="bg-black border-light-gray text-white placeholder:text-muted-gray"
              />
            )}
          </CardContent>
          
          <CardFooter className="justify-between border-t border-light-gray pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="rounded-md"
            >
              Previous
            </Button>
            
            <Button
              variant="default"
              onClick={handleNext}
              disabled={!hasCurrentAnswer || isGenerating}
              className={`rounded-md ${currentQuestionIndex === questions.length - 1 ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500' : ''}`}
            >
              {isGenerating ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                  Generating...
                </span>
              ) : currentQuestionIndex === questions.length - 1 ? (
                <>
                  Generate Brand Foundation <Sparkles className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ArrowRight className="ml-1 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Generation progress indicator */}
        {isGenerating && (
          <Card className="bg-near-black border-light-gray mt-6 p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-gray">Generating your AI Brand Foundation</span>
                <span className="text-sky-400">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="h-1" />
              <p className="text-xs text-muted-gray italic">
                {generationProgress < 30 ? "Analyzing brand information..." : 
                 generationProgress < 60 ? "Creating brand strategy elements..." : 
                 generationProgress < 90 ? "Generating visual concepts..." : 
                 "Finalizing your brand foundation..."}
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  }
  
  // Render the brand report
  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">AI Brand Foundation <span className="text-sky-400">Report</span></h2>
      <p className="text-muted-gray mb-6">Your complete brand foundation with strategic elements and visual concepts.</p>
      
      {/* Brand header card */}
      <Card className="bg-near-black border-light-gray mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-900/20 to-indigo-900/20 p-4 sm:p-6 border-b border-light-gray">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Brand Foundation</h3>
              <p className="text-sm text-gray-400 mt-1">
                Generated from your input on {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(JSON.stringify(brandReport, null, 2), "JSON")}
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
                <PenTool className="mr-1 h-4 w-4" />
                New Brand
              </Button>
            </div>
          </div>
          
          {/* Brand keywords display */}
          <div className="mt-4 flex flex-wrap gap-2">
            {brandReport.brandKeywords.map((keyword, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-sky-900/30 border border-sky-800/30 rounded-full text-xs text-sky-300"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
        
        {/* Color palette display */}
        <div className="p-4 border-b border-light-gray/30">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center">
            <Palette className="h-4 w-4 mr-2 text-purple-400" />
            Suggested Color Palette
          </h4>
          <div className="flex flex-wrap gap-3">
            {brandReport.suggestedColors.map((color, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className="w-8 h-8 rounded-full border border-light-gray/50 mr-2 cursor-pointer" 
                  style={{ backgroundColor: color.hex }}
                  onClick={() => handleCopy(color.hex, color.name)}
                  title={`Copy ${color.hex}`}
                />
                <div>
                  <p className="text-white text-xs font-medium">{color.name}</p>
                  <p className="text-gray-400 text-xs">{color.hex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      
      {/* Tabbed content */}
      <Tabs defaultValue="brand-dna" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 p-1 bg-black rounded-lg border border-light-gray/50 shadow-lg">
          <TabsTrigger 
            value="brand-dna" 
            className="text-base font-medium py-3 data-[state=active]:bg-sky-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-all duration-200"
          >
            <FileText className="h-5 w-5 mr-2" />
            Brand DNA
          </TabsTrigger>
          <TabsTrigger 
            value="messaging" 
            className="text-base font-medium py-3 data-[state=active]:bg-indigo-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400 transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Messaging
          </TabsTrigger>
          <TabsTrigger 
            value="visuals" 
            className="text-base font-medium py-3 data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 transition-all duration-200"
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Visual Concepts
          </TabsTrigger>
          <TabsTrigger 
            value="social-media" 
            className="text-base font-medium py-3 data-[state=active]:bg-emerald-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 transition-all duration-200"
          >
            <Layout className="h-5 w-5 mr-2" />
            Social Media
          </TabsTrigger>
        </TabsList>
        
        {/* Brand DNA Tab */}
        <TabsContent value="brand-dna" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Vision Statements */}
            <Card className="bg-near-black border-light-gray overflow-hidden">
              <CardHeader className="bg-sky-900/10 border-b border-sky-800/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-sky-400">
                    <Eye className="h-5 w-5 mr-2" />
                    <span>Vision Statements</span>
                  </CardTitle>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleCopy(brandReport.visionStatements.join('\n\n'), "Vision")}
                  >
                    {copiedText === "Vision" ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>
                  Forward-looking aspirational statements
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-light-gray/10">
                  {brandReport.visionStatements.map((vision, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-900/20 text-sky-400 flex items-center justify-center mr-3 text-sm">
                          {index + 1}
                        </span>
                        <p className="text-gray-300">{vision}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Mission Statements */}
            <Card className="bg-near-black border-light-gray overflow-hidden">
              <CardHeader className="bg-indigo-900/10 border-b border-indigo-800/30">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-indigo-400">
                    <Target className="h-5 w-5 mr-2" />
                    <span>Mission Statements</span>
                  </CardTitle>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2"
                    onClick={() => handleCopy(brandReport.missionStatements.join('\n\n'), "Mission")}
                  >
                    {copiedText === "Mission" ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Clipboard className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription>
                  Purpose-driven and practical statements
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="divide-y divide-light-gray/10">
                  {brandReport.missionStatements.map((mission, index) => (
                    <div key={index} className="p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-900/20 text-indigo-400 flex items-center justify-center mr-3 text-sm">
                          {index + 1}
                        </span>
                        <p className="text-gray-300">{mission}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Messaging Tab */}
        <TabsContent value="messaging" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-white flex items-center">
                <MessageSquare className="h-5 w-5 text-indigo-400 mr-2" />
                Messaging Pillars
              </CardTitle>
              <CardDescription>
                Key themes that form the foundation of your brand communication
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandReport.messagingPillars.map((pillar, index) => (
                  <Card key={index} className="bg-black/30 border-light-gray/30">
                    <CardHeader className="py-3 px-4 bg-indigo-900/10 border-b border-indigo-800/30">
                      <CardTitle className="text-base text-indigo-300">
                        {pillar.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="py-3 px-4">
                      <p className="text-gray-300 text-sm">{pillar.description}</p>
                      
                      <div className="mt-3 pt-3 border-t border-light-gray/10">
                        <p className="text-xs font-medium text-white mb-2">Content Topics:</p>
                        <ul className="space-y-1">
                          {pillar.topics.map((topic, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-start">
                              <span className="text-indigo-400 mr-2">•</span>
                              {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Visuals Tab */}
        <TabsContent value="visuals" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-white flex items-center">
                <ImageIcon className="h-5 w-5 text-purple-400 mr-2" />
                Logo Concepts
              </CardTitle>
              <CardDescription>
                AI-generated visual concepts based on your brand foundation
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4">
              {brandReport.logoUrls && brandReport.logoUrls.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {brandReport.logoUrls.map((url, index) => (
                    <div key={index} className="space-y-3">
                      <div className="aspect-square bg-white rounded-md overflow-hidden border border-light-gray flex items-center justify-center p-4">
                        <img 
                          src={url} 
                          alt={`Logo concept ${index + 1}`} 
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/111827/6B7280/png?text=Image+Not+Available'}
                        />
                      </div>
                      <div className="px-1">
                        <h4 className="text-sm font-medium text-white">Concept {index + 1}</h4>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {brandReport.logoPrompts?.[index] || "AI-generated logo concept"}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 w-full text-xs"
                            onClick={() => window.open(url, '_blank')}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-white font-medium mb-2">No logo concepts available</h3>
                  <p className="text-muted-gray text-sm max-w-md">
                    Logo generation could not be completed. This could be due to content restrictions or service availability.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Social Media Tab */}
        <TabsContent value="social-media" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-white flex items-center">
                <Layout className="h-5 w-5 text-emerald-400 mr-2" />
                Social Media Templates
              </CardTitle>
              <CardDescription>
                AI-generated social media visuals and templates for your brand
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4">
              {brandReport.socialMediaTemplates && brandReport.socialMediaTemplates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {brandReport.socialMediaTemplates.map((template, index) => (
                    <div key={index} className="border border-light-gray/30 rounded-md overflow-hidden">
                      <div className="p-3 border-b border-light-gray/30 bg-emerald-900/10">
                        <h4 className="text-sm font-medium text-emerald-300">{template.type}</h4>
                      </div>
                      
                      {template.imageUrl && (
                        <div className="aspect-video bg-black relative overflow-hidden">
                          <img 
                            src={template.imageUrl} 
                            alt={`${template.type} template`} 
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/800x450/111827/6B7280/png?text=Image+Not+Available'}
                          />
                        </div>
                      )}
                      
                      <div className="p-3">
                        <p className="text-xs text-gray-300 mb-3">{template.description}</p>
                        
                        <div className="flex gap-2">
                          {template.imageUrl && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={() => window.open(template.imageUrl, '_blank')}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => handleCopy(template.prompt, `${template.type}-prompt`)}
                          >
                            {copiedText === `${template.type}-prompt` ? (
                              <>
                                <Check className="h-3 w-3 mr-1 text-green-400" />
                                <span className="text-green-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Clipboard className="h-3 w-3 mr-1" />
                                Copy Prompt
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Layout className="h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-white font-medium mb-2">No social media templates available</h3>
                  <p className="text-muted-gray text-sm max-w-md">
                    Social media template generation could not be completed. This could be due to content restrictions or service availability.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 my-10">
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-md h-10 px-6 border-indigo-400/50 text-indigo-400 hover:bg-indigo-950/30"
        >
          Create New Brand
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
  );
} 
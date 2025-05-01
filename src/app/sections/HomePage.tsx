'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Globe, Image, Mic, MessageSquare, MessageSquareWarning, Calculator, BookOpen, ClipboardList, BrainCircuit, Palette, KanbanSquare, User, FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  isNew?: boolean;
  category: string;
}

export function HomePage({ onNavigate }: { onNavigate: (id: string) => void }) {
  const tools: ToolCard[] = [
    // Strategic Tools
    {
      id: 'roadmap',
      title: '90-Day Roadmap',
      description: 'Plan and track your AI implementation journey with a structured roadmap.',
      icon: <ClipboardList className="h-6 w-6" />,
      color: 'from-purple-600 to-violet-600',
      category: 'Strategic Tools'
    },
    {
      id: 'kanban',
      title: 'Kanban Task View',
      description: 'Organize and manage your AI implementation tasks with a visual board.',
      icon: <KanbanSquare className="h-6 w-6" />,
      color: 'from-fuchsia-600 to-purple-600',
      category: 'Strategic Tools'
    },
    {
      id: 'scorecard',
      title: 'AI Efficiency Scorecard',
      description: 'Assess your organization\'s AI readiness with a personalized questionnaire and detailed report.',
      icon: <BrainCircuit className="h-6 w-6" />,
      color: 'from-blue-600 to-sky-600',
      category: 'Strategic Tools'
    },
    {
      id: 'roi',
      title: 'ROI Calculator',
      description: 'Calculate the return on investment for your marketing and AI initiatives.',
      icon: <Calculator className="h-6 w-6" />,
      color: 'from-teal-600 to-emerald-600',
      category: 'Strategic Tools'
    },
    
    // Creative Tools
    {
      id: 'brand_foundation',
      title: 'AI Brand Foundation Suite',
      description: 'Create comprehensive brand identity with vision, mission, messaging pillars, and AI-generated logo concepts.',
      icon: <Palette className="h-6 w-6" />,
      color: 'from-violet-600 to-indigo-600',
      isNew: true,
      category: 'Creative Tools'
    },
    {
      id: 'generator',
      title: 'AI Idea Generator',
      description: 'Generate creative ideas and strategies for your marketing and business needs.',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'from-amber-600 to-yellow-600',
      category: 'Creative Tools'
    },
    {
      id: 'contextual-deal-writer',
      title: 'Contextual Deal Writer',
      description: 'Generate personalized business proposals based on prospect analysis and your offerings.',
      icon: <FileText className="h-6 w-6" />,
      color: 'from-blue-600 to-indigo-600',
      isNew: true,
      category: 'Creative Tools'
    },
    {
      id: 'image_generator',
      title: 'AI Image Generator',
      description: 'Create stunning visuals and graphics for your marketing materials with AI.',
      icon: <Image className="h-6 w-6" />,
      color: 'from-emerald-600 to-green-600',
      category: 'Creative Tools'
    },
    {
      id: 'voiceover_generator',
      title: 'AI Voiceover',
      description: 'Convert text to natural-sounding speech in multiple languages and voices.',
      icon: <Mic className="h-6 w-6" />,
      color: 'from-rose-600 to-pink-600',
      category: 'Creative Tools'
    },
    
    // Analysis & Insights
    {
      id: 'website_scanner',
      title: 'Website Intelligence Scanner',
      description: 'Analyze any website to extract business intelligence, competitive insights, and visual elements.',
      icon: <Globe className="h-6 w-6" />,
      color: 'from-sky-600 to-cyan-600',
      isNew: true,
      category: 'Analysis & Insights'
    },
    {
      id: 'executive_persona',
      title: 'Executive Persona Analyzer',
      description: 'Generate AI-powered personality insights and communication guidelines for engaging with executives.',
      icon: <User className="h-6 w-6" />,
      color: 'from-indigo-600 to-purple-600',
      isNew: true,
      category: 'Analysis & Insights'
    },
    {
      id: 'critique',
      title: 'AI Marketing Critique',
      description: 'Get expert feedback on your marketing materials and strategies.',
      icon: <MessageSquare className="h-6 w-6" />,
      color: 'from-orange-600 to-amber-600',
      category: 'Analysis & Insights'
    },
    {
      id: 'objection_handler',
      title: 'AI Objection Practice',
      description: 'Practice handling sales objections with AI-powered scenarios.',
      icon: <MessageSquareWarning className="h-6 w-6" />,
      color: 'from-red-600 to-orange-600',
      category: 'Analysis & Insights'
    },
    
    // Resources
    {
      id: 'resources',
      title: 'Resource Library',
      description: 'Access a curated collection of AI tools, guides, and learning resources.',
      icon: <BookOpen className="h-6 w-6" />,
      color: 'from-cyan-600 to-teal-600',
      category: 'Resources'
    }
  ];

  // Get unique categories
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-600">
          Deliver AI Platform
        </h1>
        <p className="text-muted-gray max-w-2xl mx-auto text-lg">
          Your complete suite of AI-powered tools to transform marketing, sales, and business operations
        </p>
      </div>

      {/* Featured - New AI Implementation Page */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <div className="w-2 h-8 bg-sky-500 mr-3 rounded-sm"></div>
          Featured
        </h2>
        
        <Card className="bg-near-black border-light-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-sky-900/20 hover:border-sky-900/50 mb-8">
          <div className="h-2 w-full bg-gradient-to-r from-purple-600 to-blue-600"></div>
          <CardHeader className="flex flex-row items-start space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg text-white flex items-center">
                AI Implementation Platform
                <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-sm">
                  NEW
                </span>
              </CardTitle>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-2 flex items-center justify-center text-white">
              <Sparkles className="h-6 w-6" />
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-muted-gray text-sm">
              Get your personalized 90-Day AI Roadmap, Efficiency Scorecard, and AI-powered tools – all within one interactive platform designed for marketing leaders.
            </CardDescription>
          </CardContent>
          <CardFooter>
            <Link href="/ai-implementation" className="w-full">
              <Button 
                variant="ghost" 
                className="w-full justify-between hover:bg-sky-900/20 hover:text-sky-400 transition-colors"
              >
                <span>Visit Implementation Platform</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Tools by Category */}
      {categories.map(category => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-2 h-8 bg-sky-500 mr-3 rounded-sm"></div>
            {category}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tools
              .filter(tool => tool.category === category)
              .map((tool) => (
                <Card 
                  key={tool.id} 
                  className="bg-near-black border-light-gray overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-sky-900/20 hover:border-sky-900/50"
                >
                  <div className={`h-2 w-full bg-gradient-to-r ${tool.color}`}></div>
                  <CardHeader className="flex flex-row items-start space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white flex items-center">
                        {tool.title}
                        {tool.isNew && (
                          <span className="ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-sky-600 to-indigo-600 text-white rounded-sm">
                            NEW
                          </span>
                        )}
                      </CardTitle>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${tool.color} p-2 flex items-center justify-center text-white`}>
                      {tool.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-gray text-sm min-h-[60px]">
                      {tool.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => onNavigate(tool.id)} 
                      variant="ghost" 
                      className="w-full justify-between hover:bg-sky-900/20 hover:text-sky-400 transition-colors"
                    >
                      <span>Open Tool</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <div className="mt-8 text-center text-xs text-muted-gray/60">
        <p>Deliver AI Platform • Transforming Businesses Through AI</p>
      </div>
    </div>
  );
} 
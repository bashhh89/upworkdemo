'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Globe, 
  TrendingUp, 
  Target, 
  Zap, 
  DollarSign,
  ArrowRight,
  CheckCircle,
  Building2,
  PieChart,
  Calculator,
  Search,
  Shield,
  Briefcase,
  MessageSquare,
  User,
  Image,
  Mic,
  Sparkles
} from 'lucide-react';

interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  businessValue: string;
  tech: string[];
  strategicUse: string;
}

interface Combination {
  id: string;
  name: string;
  tools: string[];
  description: string;
  reasoning: string[];
  viability: number;
  impact: 'OPERATIONAL EFFICIENCY' | 'STRATEGIC ADVANTAGE' | 'MARKET DISRUPTION';
  useCase: string;
  capitalImpact: string;
  timeToValue: string;
}

const tools: Tool[] = [
  {
    id: 'executive_persona',
    name: 'Executive Persona Analyzer',
    description: 'AI-driven executive personality analysis for strategic business communication',
    icon: User,
    businessValue: 'Improves deal closure rates by 40%, accelerates relationship building',
    tech: ['AI Profiling', 'DISC Analysis', 'Behavioral Intelligence'],
    strategicUse: 'Perfect for M&A negotiations, board presentations, and stakeholder management'
  },
  {
    id: 'website_scanner',
    name: 'Competitive Intelligence Scanner',
    description: 'AI-powered website analysis and competitive intelligence extraction',
    icon: Globe,
    businessValue: 'Reduces market research time by 85%, provides real-time competitive insights',
    tech: ['Web Scraping', 'AI Analysis', 'Market Intelligence'],
    strategicUse: 'Essential for market entry decisions, competitive positioning, and due diligence'
  },
  {
    id: 'pollinations-assistant',
    name: 'Strategic AI Assistant',
    description: 'Multi-model conversational AI with advanced reasoning and tool integration',
    icon: MessageSquare,
    businessValue: 'Accelerates strategic analysis by 60%, provides 24/7 decision support',
    tech: ['GPT-4', 'Claude', 'Multi-Model AI', 'Tool Integration'],
    strategicUse: 'Ideal for complex analysis, scenario planning, and strategic decision support'
  },
  {
    id: 'image_generator',
    name: 'Visual Strategy Creator',
    description: 'AI-powered visual content generation for presentations and strategic communications',
    icon: Image,
    businessValue: 'Reduces design costs by 70%, accelerates presentation creation',
    tech: ['Pollinations AI', 'DALL-E', 'Visual AI'],
    strategicUse: 'Perfect for investor presentations, board decks, and strategic communications'
  },
  {
    id: 'voiceover_generator',
    name: 'Executive Voice Synthesis',
    description: 'Professional AI voice generation for presentations and communications',
    icon: Mic,
    businessValue: 'Enables scalable communication, reduces production time by 80%',
    tech: ['Neural TTS', 'Voice Cloning', 'Audio AI'],
    strategicUse: 'Ideal for training materials, presentations, and scalable communications'
  }
];

export default function TestPortfolioPage() {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [generatedCombo, setGeneratedCombo] = useState<Combination | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev => 
      prev.includes(toolId) 
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-zinc-800/20"></div>
        
        <div className="relative px-6 py-20 md:px-8">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-white text-sm font-bold mb-12 uppercase tracking-wider backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <Building2 className="h-4 w-4" />
              STRATEGIC AI SYSTEMS
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-none">
              <span className="block text-white mb-4">AI-POWERED</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                CAPITAL DECISIONS
              </span>
            </h1>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed mb-4">
                What happens when you combine AI capabilities for strategic business intelligence?
              </p>
              <p className="text-xl md:text-2xl text-white font-semibold">
                Systems that transform how corporations make faster, smarter capital allocation decisions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <PieChart className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">25-40%</div>
                <div className="text-sm text-zinc-400">Capital Efficiency Improvement</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <Calculator className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">70%</div>
                <div className="text-sm text-zinc-400">Faster Decision Making</div>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <Shield className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-2">60%</div>
                <div className="text-sm text-zinc-400">Higher Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-16 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Strategic AI Capabilities
            </h2>
            <p className="text-zinc-400 text-lg max-w-3xl mx-auto">
              Select capabilities to combine into integrated decision-making systems. 
              Each tool is designed for enterprise-grade strategic applications.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isSelected = selectedTools.includes(tool.id);
              
              return (
                <Card 
                  key={tool.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-zinc-800 border-zinc-600 scale-105' 
                      : 'bg-zinc-900/80 border-zinc-800 hover:bg-zinc-800/80'
                  }`}
                  onClick={() => toggleTool(tool.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-zinc-700' : 'bg-zinc-800'}`}>
                        <Icon className="h-6 w-6 text-zinc-300" />
                      </div>
                      {isSelected && <CheckCircle className="h-5 w-5 text-green-400" />}
                    </div>
                    <CardTitle className="text-white text-lg">
                      {tool.name}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Business Value</div>
                      <div className="text-sm text-zinc-300">{tool.businessValue}</div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mb-12">
            <Button 
              disabled={selectedTools.length < 2 || isGenerating}
              className="px-12 py-6 bg-white text-black font-black text-lg uppercase tracking-wider transition-all hover:bg-zinc-200 hover:scale-105 rounded-xl shadow-2xl disabled:opacity-50"
            >
              <span className="flex items-center gap-3">
                GENERATE STRATEGIC SYSTEM
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
            {selectedTools.length < 2 && (
              <p className="text-zinc-500 text-sm mt-2">Select at least 2 capabilities to generate strategic combinations</p>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-16 md:px-8 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
              Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Capital Decisions?</span>
            </h2>
            
            <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
              These aren't just AI tools—they're strategic systems designed to give you the competitive edge 
              that comes from faster, smarter capital allocation decisions.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-zinc-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3">For Velocity AI</h3>
                <p className="text-zinc-300 text-sm">
                  Integrate these capabilities into your existing LLM infrastructure. 
                  Built for enterprise scale with your management insight approach.
                </p>
              </div>
              <div className="bg-zinc-800/50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-white mb-3">Proven Results</h3>
                <p className="text-zinc-300 text-sm">
                  Systems like these have delivered 25-40% improvements in capital efficiency 
                  for corporations making complex allocation decisions.
                </p>
              </div>
            </div>
            
            <Button 
              className="px-12 py-6 bg-white text-black font-black text-lg uppercase tracking-wider transition-all hover:bg-zinc-200 hover:scale-105 rounded-xl shadow-2xl"
            >
              <span className="flex items-center gap-3">
                DISCUSS INTEGRATION
                <ArrowRight className="h-5 w-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
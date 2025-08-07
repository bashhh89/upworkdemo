'use client';

import React from 'react';
import { ArrowRight, MessageSquare, Globe, User, ClipboardList, Image, Mic, Brain, Sparkles, Code, Zap, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioHomeSectionProps {
  onSectionChange?: (sectionId: string) => void;
}

export function PortfolioHomeSection({ onSectionChange }: PortfolioHomeSectionProps = {}) {
  const handleNavigate = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const featuredProjects = [
    {
      id: 'pollinations-assistant',
      title: 'AI Chat Assistant',
      description: 'Multi-model conversational AI with tool integration and thread management',
      icon: MessageSquare,
      tech: ['Next.js', 'TypeScript', 'OpenAI API', 'Pollinations AI'],
      status: 'Live Demo'
    },
    {
      id: 'icp_builder',
      title: 'ICP Builder',
      description: 'AI-powered ideal customer profile analysis for smarter sales targeting',
      icon: Target,
      tech: ['LLM Analysis', 'Customer Intelligence', 'Sales Strategy'],
      status: 'Live Demo'
    },
    {
      id: 'website_scanner',
      title: 'Website Intelligence',
      description: 'AI-powered website analysis and competitive intelligence tool',
      icon: Globe,
      tech: ['Web Scraping', 'AI Analysis', 'React', 'API Integration'],
      status: 'Live Demo'
    },
    {
      id: 'executive_persona',
      title: 'Executive Profiling',
      description: 'AI-driven executive personality analysis for better business communication',
      icon: User,
      tech: ['AI Profiling', 'DISC Analysis', 'Data Processing'],
      status: 'Live Demo'
    },
    {
      id: 'image_generator',
      title: 'AI Image Creator',
      description: 'Text-to-image generation for marketing and creative content',
      icon: Image,
      tech: ['Pollinations AI', 'Image Processing', 'Creative AI'],
      status: 'Live Demo'
    },
    {
      id: 'voiceover_generator',
      title: 'Voice Synthesis',
      description: 'AI-powered text-to-speech with multiple voice options',
      icon: Mic,
      tech: ['TTS API', 'Audio Processing', 'Voice Cloning'],
      status: 'Live Demo'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/20 via-transparent to-zinc-800/20"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-800/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-zinc-700/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative px-6 py-20 md:px-8 w-full">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              {/* Premium badge */}
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900/80 border border-zinc-800 rounded-full text-white text-sm font-bold mb-12 uppercase tracking-wider backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <Sparkles className="h-4 w-4" />
                $40/HR • AVAILABLE NOW
              </div>
              
              {/* Main headline with better typography */}
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-none">
                <span className="block text-white mb-4">I TURN AI INTO</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-300 to-zinc-500">
                  SYSTEMS THAT WORK
                </span>
              </h1>
              
              {/* Subtitle with better spacing */}
              <div className="max-w-4xl mx-auto mb-12">
                <p className="text-xl md:text-2xl text-zinc-400 leading-relaxed">
                  Most businesses see a massive gap between their day-to-day problems and the promise of AI.
                </p>
                <p className="text-xl md:text-2xl text-white font-semibold mt-4">
                  I live in that gap—and build the systems that bridge it.
                </p>
              </div>
            </div>

            {/* Stats Grid - Enhanced with better visual hierarchy */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
              <div className="group bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-black text-white mb-3 group-hover:text-zinc-200 transition-colors">10+</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">YEARS BUSINESS</div>
              </div>
              <div className="group bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-black text-white mb-3 group-hover:text-zinc-200 transition-colors">24/7</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">AGENT UPTIME</div>
              </div>
              <div className="group bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-black text-white mb-3 group-hover:text-zinc-200 transition-colors">90%</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">TIME SAVED</div>
              </div>
              <div className="group bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-800/80 transition-all duration-300 hover:scale-105">
                <div className="text-4xl font-black text-white mb-3 group-hover:text-zinc-200 transition-colors">ZERO</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider font-medium">FLUFF</div>
              </div>
            </div>
            
            {/* CTA Buttons - Made them stand out more */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                onClick={() => handleNavigate('pollinations-assistant')}
                className="group px-12 py-6 bg-white text-black font-black text-lg uppercase tracking-wider transition-all hover:bg-zinc-200 hover:scale-105 rounded-xl shadow-2xl"
              >
                <span className="flex items-center gap-3">
                  BUILD MY SOLUTION
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
              <Button 
                onClick={() => handleNavigate('pollinations-assistant')}
                className="group px-12 py-6 bg-zinc-900/80 border-2 border-zinc-700 text-white font-black text-lg uppercase tracking-wider transition-all hover:bg-zinc-800 hover:border-zinc-600 hover:scale-105 rounded-xl"
              >
                <span className="flex items-center gap-3">
                  VIEW PORTFOLIO
                  <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Separator */}
      <div className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-zinc-950 to-black"></div>
        <div className="relative flex items-center justify-center">
          <div className="w-px h-20 bg-gradient-to-b from-transparent via-zinc-600 to-transparent"></div>
        </div>
      </div>

      {/* Portfolio Highlights - RESULTS */}
      <div className="px-6 py-24 md:px-8 bg-gradient-to-b from-black via-zinc-950/50 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            {/* Section badge */}
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 text-sm font-bold mb-8 uppercase tracking-wider">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              PROVEN RESULTS
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
              PORTFOLIO <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">HIGHLIGHTS</span>
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-zinc-600 to-transparent mx-auto mb-8"></div>
            
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
              Real results for real businesses. No fluff, just measurable impact that transforms operations.
            </p>
          </div>
          
          {/* Results cards with staggered animation effect */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="text-5xl font-black text-white mb-6 group-hover:text-zinc-200 transition-colors">
                20HRS → 2HRS
              </div>
              <div className="text-white font-bold mb-4 text-lg uppercase tracking-wide">SOW GENERATOR</div>
              <div className="text-zinc-400 leading-relaxed mb-6">
                Cut proposal drafting time by 90% for a top-tier AI consultancy. Automated the entire statement of work generation process.
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-bold text-xs uppercase tracking-wide">90% TIME REDUCTION</span>
              </div>
            </div>

            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="text-5xl font-black text-white mb-6 group-hover:text-zinc-200 transition-colors">24/7</div>
              <div className="text-white font-bold mb-4 text-lg uppercase tracking-wide">AGENT OPS</div>
              <div className="text-zinc-400 leading-relaxed mb-6">
                Built bots to handle sales, onboarding, and 24/7 support with real scalability. Complete operational automation for growing businesses.
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 font-bold text-xs uppercase tracking-wide">24/7 AUTOMATION</span>
              </div>
            </div>

            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 text-center hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="text-5xl font-black text-white mb-6 group-hover:text-zinc-200 transition-colors">ZERO FLUFF</div>
              <div className="text-white font-bold mb-4 text-lg uppercase tracking-wide">N8N ARCHITECT</div>
              <div className="text-zinc-400 leading-relaxed mb-6">
                Designed resilient workflows that integrate marketing, support, and lead gen APIs with zero fluff. Enterprise-grade automation systems.
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-purple-400 font-bold text-xs uppercase tracking-wide">ENTERPRISE GRADE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* I Turn AI Into Systems That Get Shit Done */}
      <div className="px-6 py-16 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              I Turn AI Into Systems That Get Shit Done
            </h2>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              I'm not a developer. I'm the guy who spent 10 years in the trenches of Middle Eastern business operations - 
              from call centers to recruitment empires. <span className="text-white font-semibold">I've seen more "AI solutions" fail than most consultants have even built.</span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-zinc-300" />
                I Don't Speak Developer Jargon
              </h3>
              <p className="text-zinc-300 mb-4">I speak business results:</p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li>• Cut proposal drafting from 20 hours → 2 hours (for a top AI consultancy)</li>
                <li>• Built AI agents that handle sales, onboarding, and 24/7 support with real scalability</li>
                <li>• Designed n8n workflows that integrate marketing, support, and lead gen APIs with zero fluff</li>
              </ul>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-zinc-300" />
                My Process is Simple
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-zinc-300">I'll tell you if your idea is bullshit (I've been burned too many times)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-zinc-300">I'll build a working demo in 24-48 hours using tools you already use</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-zinc-700 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-zinc-300">I'll scale it into a system that your team will actually use (not some shelfware)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-4 text-center">Why Clients Trust Me</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-white text-sm font-medium">✅ I speak the language of business operators, not tech bros</div>
              </div>
              <div className="text-center">
                <div className="text-white text-sm font-medium">✅ I've lived the problems you're trying to solve</div>
              </div>
              <div className="text-center">
                <div className="text-white text-sm font-medium">✅ I build AI that respects how business actually gets done</div>
              </div>
              <div className="text-center">
                <div className="text-white text-sm font-medium">✅ I deliver working demos before I ask for payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why You'll Hate Me Section - FIRE */}
      <div className="px-6 py-16 md:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Why You'll Hate Me (Then Hire Me Anyway)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">I'll challenge your idea until it survives impact</h3>
                <p className="text-sm text-zinc-400">No fluff, no buzzwords. If it won't work, I'll tell you.</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">I don't build tools I wouldn't use myself</h3>
                <p className="text-sm text-zinc-400">Every system I create has to pass my own quality test.</p>
              </div>
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
                <h3 className="font-semibold text-white mb-2">If you're optimizing noise, not value—I'll walk</h3>
                <p className="text-sm text-zinc-400">I respect your time. I expect the same back.</p>
              </div>
            </div>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              <strong className="text-white">Interactive demos below.</strong> Click any project to try it live and see what $40/hr gets you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => {
              const Icon = project.icon;
              return (
                <Card 
                  key={project.id}
                  className="bg-zinc-900/80 border border-zinc-800 rounded-lg transition-all duration-300 cursor-pointer group"
                  onClick={() => handleNavigate(project.id)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="p-2 bg-zinc-800 rounded-lg">
                        <Icon className="h-6 w-6 text-zinc-300" />
                      </div>
                      <span className="text-xs text-zinc-300 font-medium">{project.status}</span>
                    </div>
                    <CardTitle className="text-white group-hover:text-zinc-300 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span 
                          key={tech}
                          className="px-2 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-md"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Skills & Expertise */}
      <div className="px-6 py-16 md:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">My Toolbox</h2>
            <p className="text-gray-400 text-lg">
              The weapons I use to turn your problems into solutions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-zinc-300" />
                AI & Agents
              </h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>OpenAI, LangChain, Botpress</div>
                <div>Gemini 2.5 Pro + Flash, Veo 3</div>
                <div>Rasa, Haystack</div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-zinc-300" />
                Automation
              </h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>n8n (Expert), Make.com</div>
                <div>Zapier, Autocode</div>
                <div>Custom CRM builds</div>
              </div>
            </div>

            <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-zinc-300" />
                Development
              </h3>
              <div className="space-y-2 text-sm text-zinc-400">
                <div>Supabase, Firebase, Hasura</div>
                <div>Next.js, React, TypeScript</div>
                <div>GitHub, API Integration</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Velocity AI - Noah System Benefits */}
      <div className="px-6 py-24 md:px-8 bg-gradient-to-b from-black via-zinc-950/50 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900/80 border border-zinc-800 rounded-full text-zinc-300 text-sm font-bold mb-8 uppercase tracking-wider">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              VELOCITY AI SHOWCASE
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white leading-tight">
              NOAH: THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">STRATEGIC SYNTHESIS ENGINE</span>
            </h2>
            
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto mb-8"></div>
            
            <p className="text-xl text-zinc-400 max-w-4xl mx-auto leading-relaxed">
              Meet Noah - my flagship AI system that transforms complex business challenges into structured, 
              data-driven executive briefs. This isn't just another chatbot - it's a strategic reasoning engine 
              built for C-suite decision-making.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Strategic Frameworks */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Brain className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Strategic Frameworks</h3>
                  <p className="text-sm text-zinc-400">MECE, PESTLE, COSO ERM</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Noah leverages proven consulting frameworks to structure analysis. Every brief follows MECE logic, 
                ensuring comprehensive coverage without overlap.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span className="text-blue-400 font-bold text-xs uppercase tracking-wide">CONSULTANT-GRADE</span>
              </div>
            </div>

            {/* Executive Briefs */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <ClipboardList className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Executive Briefs</h3>
                  <p className="text-sm text-zinc-400">Pyramid Principle Structure</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Transforms complex business challenges into structured executive summaries. 
                Each brief includes hypothesis, findings, recommendations, and risk mitigation strategies.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span className="text-purple-400 font-bold text-xs uppercase tracking-wide">C-SUITE READY</span>
              </div>
            </div>

            {/* Multi-Tool Integration */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Zap className="h-8 w-8 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Smart Tool Selection</h3>
                  <p className="text-sm text-zinc-400">Web Search, Data Analysis, Visualization</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Noah intelligently selects and activates tools based on input complexity. 
                From web research to data visualization - it knows when and how to use each tool.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-bold text-xs uppercase tracking-wide">ADAPTIVE AI</span>
              </div>
            </div>

            {/* Deep Reasoning */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-orange-500/20 rounded-xl">
                  <Target className="h-8 w-8 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Deep Reasoning Engine</h3>
                  <p className="text-sm text-zinc-400">Multi-Layer Analysis</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Uses advanced reasoning triggers to escalate analysis depth based on complexity. 
                Simple queries get focused answers, complex challenges get comprehensive strategic analysis.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-orange-400 font-bold text-xs uppercase tracking-wide">INTELLIGENT DEPTH</span>
              </div>
            </div>

            {/* Financial Modeling */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <div className="h-8 w-8 text-yellow-400 font-bold text-lg flex items-center justify-center">$</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Financial Integration</h3>
                  <p className="text-sm text-zinc-400">Budget Breakdowns & ROI</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Every strategic recommendation includes detailed financial summaries with pricing tables, 
                role allocations, and discount structures. Business decisions backed by numbers.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 font-bold text-xs uppercase tracking-wide">ROI FOCUSED</span>
              </div>
            </div>

            {/* Quality Assurance */}
            <div className="group bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/80 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <div className="h-8 w-8 text-red-400 font-bold text-lg flex items-center justify-center">✓</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Quality Matrix</h3>
                  <p className="text-sm text-zinc-400">17-Point Evaluation System</p>
                </div>
              </div>
              <p className="text-zinc-300 leading-relaxed mb-4">
                Every output is evaluated against a comprehensive 17-criteria performance matrix 
                across strategic alignment, quality, and professional polish.
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400 font-bold text-xs uppercase tracking-wide">ENTERPRISE QUALITY</span>
              </div>
            </div>
          </div>

          {/* Why This Matters */}
          <div className="bg-gradient-to-r from-zinc-900/80 to-zinc-800/80 border border-zinc-700 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">Why This Changes Everything</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-4xl font-black text-blue-400 mb-3">10x</div>
                <div className="text-white font-semibold mb-2">Faster Strategic Analysis</div>
                <div className="text-zinc-400 text-sm">What takes consultants weeks, Noah delivers in minutes</div>
              </div>
              <div>
                <div className="text-4xl font-black text-purple-400 mb-3">100%</div>
                <div className="text-white font-semibold mb-2">Consistent Quality</div>
                <div className="text-zinc-400 text-sm">Every brief follows proven frameworks and quality standards</div>
              </div>
              <div>
                <div className="text-4xl font-black text-green-400 mb-3">24/7</div>
                <div className="text-white font-semibold mb-2">Strategic Support</div>
                <div className="text-zinc-400 text-sm">C-suite level analysis available whenever you need it</div>
              </div>
            </div>
            <p className="text-zinc-300 text-lg max-w-3xl mx-auto">
              This isn't just another AI tool - it's a strategic reasoning engine that thinks like a top-tier consultant, 
              backed by proven frameworks and designed for executive decision-making.
            </p>
          </div>
        </div>
      </div>

      {/* Let's Build It, Or Kill It Quickly - FIRE CTA */}
      <div className="px-6 py-16 md:px-8 bg-black">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-8 md:p-12 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white">
                Let's Build It, Or <span className="text-white">Kill It Quickly</span>
              </h2>
              
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 mb-8">
                <p className="text-gray-300 text-center italic mb-4">
                  "When I built 'The Architect' prompt that transforms vague RFPs into bulletproof proposals, 
                  I wasn't playing with AI - I was encoding everything I learned from building businesses across borders 
                  where one cultural misstep kills deals."
                </p>
                <div className="text-center text-sm text-gray-400">
                  - Real client work, real results
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">Tell me your bottleneck.</h3>
                  <p className="text-gray-300">I'll automate it—or prove it's not worth the effort.</p>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-white mb-3">If your problem is real,</h3>
                  <p className="text-gray-300">I'll make your stack smarter. If you want buzzwords, there are others.</p>
                </div>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-center gap-8 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">$40/hr</div>
                    <div className="text-sm text-zinc-400">No BS Pricing</div>
                  </div>
                  <div className="w-px h-12 bg-zinc-600"></div>
                  <div>
                    <div className="text-2xl font-bold text-white">24-48hrs</div>
                    <div className="text-sm text-zinc-400">Response Time</div>
                  </div>
                  <div className="w-px h-12 bg-zinc-600"></div>
                  <div>
                    <div className="text-2xl font-bold text-white">Real Results</div>
                    <div className="text-sm text-zinc-400">Or Your Money Back</div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <Button 
                  onClick={() => handleNavigate('pollinations-assistant')}
                  className="px-8 py-4 bg-zinc-900/80 border border-zinc-800 rounded-lg text-white font-bold text-lg transition-all hover:bg-zinc-800"
                >
                  Test My AI Tools First
                  <Sparkles className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  onClick={() => window.open('https://www.linkedin.com/in/abashh/', '_blank')}
                  className="px-8 py-4 bg-zinc-900/80 border border-zinc-800 rounded-lg text-white font-bold text-lg transition-all hover:bg-zinc-800"
                >
                  Let's Connect on LinkedIn
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-400 italic">
                  P.S. I've worked in 10+ countries across the Middle East and Asia. Not because I'm a "cultural enthusiast" - 
                  because business doesn't stop at borders, and neither do I.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

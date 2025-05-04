'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, MessageSquare, Target, Globe, Sparkles, ChevronDown, ChevronUp, BarChart3, PieChart, RefreshCw, Brain, Zap, TrendingUp } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface HomeSectionProps {
  onSectionChange?: (sectionId: string) => void;
}

// Mock data generator for real-time stats
const generateRandomData = () => {
  return {
    activeProjects: Math.floor(Math.random() * 10) + 10,
    activeProjectsChange: Math.floor(Math.random() * 10) + 5,
    agentUsage: Math.floor(Math.random() * 20) + 25,
    agentUsageChange: Math.floor(Math.random() * 30) + 10,
    contentCreated: Math.floor(Math.random() * 50) + 70,
    contentCreatedChange: Math.floor(Math.random() * 15) + 5,
    performance: Math.floor(Math.random() * 10) + 90,
    performanceChange: Math.floor(Math.random() * 5) + 1,
  };
};

// AI insight generator mockup
const generateAIInsight = (metric: string, value: number, change: number) => {
  const insights = {
    activeProjects: [
      `You have ${value} active projects, ${change}% more than last month. Consider prioritizing the most impactful ones.`,
      `Project growth is healthy at +${change}%. AI analysis suggests focusing on the 3 projects in implementation phase.`,
      `Trend analysis shows your team maintains ${value} projects efficiently. Consider automating status reporting.`
    ],
    agentUsage: [
      `Your team is using AI agents ${change}% more frequently than last period, showing strong adoption.`,
      `${value} agent runs this month. The sales assistant is your most utilized agent.`,
      `AI agents are handling repetitive tasks well. Consider expanding usage to content generation.`
    ],
    contentCreated: [
      `You've created ${value} content pieces, a ${change}% increase. Quality scores remain high at 92%.`,
      `Content creation velocity has increased by ${change}%. Most effective content: case studies and product comparisons.`,
      `${value} content pieces created. Consider repurposing top-performing content across multiple channels.`
    ],
    performance: [
      `Overall performance at ${value}%, up ${change}% from benchmark. Key factor: improved response times.`,
      `${value}% efficiency achieved. AI suggests focusing on improving handoffs between marketing and sales.`,
      `Performance trending positively at ${value}%. Consider documenting your most effective workflows.`
    ]
  };
  
  // Return a random insight for the given metric
  const metricInsights = insights[metric as keyof typeof insights] || ["No insight available"];
  return metricInsights[Math.floor(Math.random() * metricInsights.length)];
};

export function HomeSection({ onSectionChange }: HomeSectionProps = {}) {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    activeProjects: 0,
    activeProjectsChange: 0,
    agentUsage: 0,
    agentUsageChange: 0,
    contentCreated: 0,
    contentCreatedChange: 0,
    performance: 0,
    performanceChange: 0,
  });
  const [insights, setInsights] = useState<Record<string, string | undefined>>({});
  const [refreshing, setRefreshing] = useState(false);

  const handleNavigate = (sectionId: string) => {
    if (onSectionChange) {
      onSectionChange(sectionId);
    }
  };

  const toggleCard = (cardId: string) => {
    // If already expanded, collapse it. Otherwise, expand the clicked card
    setExpandedCard(expandedCard === cardId ? null : cardId);
    
    // Generate AI insight for this card if not already done
    if (!insights[cardId] && expandedCard !== cardId) {
      setIsLoading(true);
      // Simulate API call delay
      setTimeout(() => {
        const value = dashboardData[cardId as keyof typeof dashboardData];
        const change = dashboardData[`${cardId}Change` as keyof typeof dashboardData];
        setInsights(prev => ({
          ...prev,
          [cardId]: generateAIInsight(cardId, value, change)
        }));
        setIsLoading(false);
      }, 800);
    }
  };

  const refreshDashboard = () => {
    setRefreshing(true);
    setTimeout(() => {
      setDashboardData(generateRandomData());
      setRefreshing(false);
    }, 1200);
  };

  useEffect(() => {
    // Generate initial data client-side after mount
    const initialData = generateRandomData();
    setDashboardData(initialData);

    // Generate initial insights for all cards
    const initialInsights: Record<string, string> = {};
    const cardIds = ['activeProjects', 'agentUsage', 'contentCreated', 'performance'];
    cardIds.forEach(cardId => {
      const value = initialData[cardId as keyof typeof initialData];
      const change = initialData[`${cardId}Change` as keyof typeof initialData];
      initialInsights[cardId] = generateAIInsight(cardId, value, change);
    });
    setInsights(initialInsights);


    // Auto-refresh data simulation
    const interval = setInterval(() => {
      // Small random adjustments to show "real-time" changes
      setDashboardData(prev => ({
        ...prev,
        activeProjects: Math.max(8, prev.activeProjects + (Math.random() > 0.5 ? 1 : -1)),
        agentUsage: Math.max(20, prev.agentUsage + (Math.random() > 0.5 ? 2 : -1)),
        contentCreated: Math.max(50, prev.contentCreated + (Math.random() > 0.6 ? 3 : -2)),
        performance: Math.max(85, Math.min(99, prev.performance + (Math.random() > 0.5 ? 1 : -1))),
      }));
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-8">
      {/* Stats Overview Section with Refresh Button */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <span className="h-6 w-1 bg-white rounded-full inline-block"></span>
            Dashboard Overview
          </h2>
          <Button 
            onClick={refreshDashboard} 
            variant="outline" 
            size="sm"
            disabled={refreshing}
            className="text-zinc-400 border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800 hover:border-zinc-700"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stat Card 1 - Active Projects */}
          <div className={`bg-zinc-900/80 rounded-lg border ${expandedCard === 'activeProjects' ? 'border-blue-700' : 'border-zinc-800'} p-5 hover:border-zinc-700 transition-all duration-300 cursor-pointer`}
            onClick={() => toggleCard('activeProjects')}>
            <div className="flex justify-between items-start">
              <p className="text-zinc-500 text-sm font-medium mb-1">Active Projects</p>
              {expandedCard === 'activeProjects' ? 
                <ChevronUp className="h-4 w-4 text-zinc-500" /> : 
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              }
            </div>
            <div className="flex items-baseline justify-between">
              <motion.h3 
                key={dashboardData.activeProjects}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                {dashboardData.activeProjects}
              </motion.h3>
              <div className="text-emerald-500 text-xs font-medium flex items-center">
                +{dashboardData.activeProjectsChange}% <span className="ml-1">↑</span>
              </div>
            </div>
            <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{width: `${Math.min(100, dashboardData.activeProjects * 5)}%`}}></div>
            </div>

            {/* Expanded content with AI insights */}
            <AnimatePresence>
              {expandedCard === 'activeProjects' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center text-xs text-zinc-400 mb-2">
                      <Brain className="h-3 w-3 mr-1" /> 
                      <span>AI INSIGHT</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4 bg-zinc-800" />
                        <Skeleton className="w-3/4 h-4 bg-zinc-800" />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{insights.activeProjects}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleNavigate('roadmap'); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        View Projects
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        <BarChart3 className="h-3 w-3 mr-1" /> Details
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Stat Card 2 - Agent Usage */}
          <div className={`bg-zinc-900/80 rounded-lg border ${expandedCard === 'agentUsage' ? 'border-purple-700' : 'border-zinc-800'} p-5 hover:border-zinc-700 transition-all duration-300 cursor-pointer`}
            onClick={() => toggleCard('agentUsage')}>
            <div className="flex justify-between items-start">
              <p className="text-zinc-500 text-sm font-medium mb-1">Agent Usage</p>
              {expandedCard === 'agentUsage' ? 
                <ChevronUp className="h-4 w-4 text-zinc-500" /> : 
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              }
            </div>
            <div className="flex items-baseline justify-between">
              <motion.h3 
                key={dashboardData.agentUsage}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                {dashboardData.agentUsage}
              </motion.h3>
              <div className="text-emerald-500 text-xs font-medium flex items-center">
                +{dashboardData.agentUsageChange}% <span className="ml-1">↑</span>
              </div>
            </div>
            <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{width: `${Math.min(100, dashboardData.agentUsage * 2)}%`}}></div>
            </div>

            {/* Expanded content with AI insights */}
            <AnimatePresence>
              {expandedCard === 'agentUsage' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center text-xs text-zinc-400 mb-2">
                      <Brain className="h-3 w-3 mr-1" /> 
                      <span>AI INSIGHT</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4 bg-zinc-800" />
                        <Skeleton className="w-3/4 h-4 bg-zinc-800" />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{insights.agentUsage}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleNavigate('agent-studio'); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        Agent Studio
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        <PieChart className="h-3 w-3 mr-1" /> Analytics
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Stat Card 3 - Content Created */}
          <div className={`bg-zinc-900/80 rounded-lg border ${expandedCard === 'contentCreated' ? 'border-green-700' : 'border-zinc-800'} p-5 hover:border-zinc-700 transition-all duration-300 cursor-pointer`}
            onClick={() => toggleCard('contentCreated')}>
            <div className="flex justify-between items-start">
              <p className="text-zinc-500 text-sm font-medium mb-1">Content Created</p>
              {expandedCard === 'contentCreated' ? 
                <ChevronUp className="h-4 w-4 text-zinc-500" /> : 
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              }
            </div>
            <div className="flex items-baseline justify-between">
              <motion.h3 
                key={dashboardData.contentCreated}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                {dashboardData.contentCreated}
              </motion.h3>
              <div className="text-emerald-500 text-xs font-medium flex items-center">
                +{dashboardData.contentCreatedChange}% <span className="ml-1">↑</span>
              </div>
            </div>
            <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{width: `${Math.min(100, dashboardData.contentCreated / 2)}%`}}></div>
            </div>

            {/* Expanded content with AI insights */}
            <AnimatePresence>
              {expandedCard === 'contentCreated' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center text-xs text-zinc-400 mb-2">
                      <Brain className="h-3 w-3 mr-1" /> 
                      <span>AI INSIGHT</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4 bg-zinc-800" />
                        <Skeleton className="w-3/4 h-4 bg-zinc-800" />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{insights.contentCreated}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleNavigate('generator'); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        Generate More
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        <BarChart3 className="h-3 w-3 mr-1" /> Analytics
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Stat Card 4 - Performance */}
          <div className={`bg-zinc-900/80 rounded-lg border ${expandedCard === 'performance' ? 'border-amber-700' : 'border-zinc-800'} p-5 hover:border-zinc-700 transition-all duration-300 cursor-pointer`}
            onClick={() => toggleCard('performance')}>
            <div className="flex justify-between items-start">
              <p className="text-zinc-500 text-sm font-medium mb-1">Performance</p>
              {expandedCard === 'performance' ? 
                <ChevronUp className="h-4 w-4 text-zinc-500" /> : 
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              }
            </div>
            <div className="flex items-baseline justify-between">
              <motion.h3 
                key={dashboardData.performance}
                initial={{ opacity: 0.5, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold"
              >
                {dashboardData.performance}%
              </motion.h3>
              <div className="text-emerald-500 text-xs font-medium flex items-center">
                +{dashboardData.performanceChange}% <span className="ml-1">↑</span>
              </div>
            </div>
            <div className="h-1 w-full bg-zinc-800 mt-4 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{width: `${dashboardData.performance}%`}}></div>
            </div>

            {/* Expanded content with AI insights */}
            <AnimatePresence>
              {expandedCard === 'performance' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center text-xs text-zinc-400 mb-2">
                      <Brain className="h-3 w-3 mr-1" /> 
                      <span>AI INSIGHT</span>
                    </div>
                    
                    {isLoading ? (
                      <div className="space-y-2">
                        <Skeleton className="w-full h-4 bg-zinc-800" />
                        <Skeleton className="w-3/4 h-4 bg-zinc-800" />
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-300">{insights.performance}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleNavigate('scorecard'); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        Scorecard
                      </Button>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); }} 
                        className="text-xs bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800">
                        <TrendingUp className="h-3 w-3 mr-1" /> Trends
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity - Column 1-2 */}
        <div className="lg:col-span-2 bg-zinc-900/80 rounded-lg border border-zinc-800 p-5 transition-colors relative group">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    // Simulate AI generating insights
                    setInsights(prev => ({
                      ...prev,
                      activitySummary: "Based on recent activity, your team focuses on sales enablement. The sales assistant agent is frequently used alongside deal proposals. Consider exploring content generation for case studies."
                    }));
                    setIsLoading(false);
                  }, 1500);
                }}
                variant="outline" 
                size="sm"
                disabled={isLoading}
                className="text-xs text-zinc-400 border-zinc-800 bg-zinc-800/50 hover:bg-zinc-800 hover:text-zinc-200"
              >
                <Zap className="h-3 w-3 mr-1" /> AI Summary
              </Button>
              <button className="text-zinc-400 hover:text-white text-sm flex items-center transition-colors">
                View All <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
          
          {/* AI-generated activity summary */}
          <AnimatePresence>
            {insights.activitySummary && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <div className="bg-zinc-800/50 border border-zinc-700/30 rounded-md p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-zinc-300">AI Activity Analysis</p>
                        <div className="ml-2 px-1.5 py-0.5 bg-zinc-700/50 rounded text-[10px] text-zinc-400">GPT-4</div>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">{insights.activitySummary}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {isLoading && !insights.activitySummary && (
            <div className="mb-4 bg-zinc-800/50 border border-zinc-700/30 rounded-md p-3">
              <div className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full bg-zinc-700" />
                <div className="flex-1">
                  <Skeleton className="w-1/3 h-4 mb-2 bg-zinc-700" />
                  <Skeleton className="w-full h-3 mb-1 bg-zinc-700" />
                  <Skeleton className="w-5/6 h-3 bg-zinc-700" />
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {/* Activity Item 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-4 p-3 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 truncate">Agent "Sales Assist" created</p>
                <p className="text-sm text-zinc-500">Custom agent created for outbound sales automation</p>
                <p className="text-xs text-zinc-600 mt-1">10 minutes ago</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Activity Item 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex items-start gap-4 p-3 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Target className="h-5 w-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 truncate">Deal proposal generated</p>
                <p className="text-sm text-zinc-500">Custom proposal for Acme Corp has been completed</p>
                <p className="text-xs text-zinc-600 mt-1">28 minutes ago</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Activity Item 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex items-start gap-4 p-3 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 truncate">Website analysis completed</p>
                <p className="text-sm text-zinc-500">Competitive analysis of 3 competitor websites</p>
                <p className="text-xs text-zinc-600 mt-1">2 hours ago</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
            
            {/* Activity Item 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-start gap-4 p-3 rounded-md hover:bg-zinc-800/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-5 w-5 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium mb-1 truncate">AI Chat session exported</p>
                <p className="text-sm text-zinc-500">Marketing strategy session exported to PDF</p>
                <p className="text-xs text-zinc-600 mt-1">4 hours ago</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800">
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
        
        {/* Right Column - Tools & Quick Actions */}
        <div className="space-y-6">
          {/* Your AI Tools - Enhanced */}
          <div className="bg-zinc-900/80 rounded-lg border border-zinc-800 p-5 transition-colors relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-blue-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-purple-500/5 rounded-full blur-3xl"></div>
            
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400" />
              Your AI Tools
            </h3>
            
            <div className="space-y-3 relative z-10">
              <motion.button 
                onClick={() => handleNavigate('agent-studio')} 
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 hover:border-blue-500/30 border border-transparent p-3 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 flex items-center justify-center mr-3">
                    <Sparkles className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">AI Agent Studio</span>
                    <span className="text-xs text-zinc-500">Create & manage custom AI agents</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </motion.button>
              
              <motion.button 
                onClick={() => handleNavigate('website_scanner')} 
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 hover:border-blue-500/30 border border-transparent p-3 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mr-3">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">Website Intelligence</span>
                    <span className="text-xs text-zinc-500">Analyze websites & competitors</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </motion.button>
              
              <motion.button 
                onClick={() => handleNavigate('contextual-deal-writer')} 
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 hover:border-blue-500/30 border border-transparent p-3 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mr-3">
                    <Target className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">Deal Writer</span>
                    <span className="text-xs text-zinc-500">Generate personalized proposals</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </motion.button>
              
              <motion.button 
                onClick={() => handleNavigate('pollinations-assistant')} 
                whileHover={{ x: 5 }}
                className="w-full flex items-center justify-between bg-zinc-800/50 hover:bg-zinc-800 hover:border-blue-500/30 border border-transparent p-3 rounded-md transition-colors"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 flex items-center justify-center mr-3">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <span className="font-medium block">AI Chat</span>
                    <span className="text-xs text-zinc-500">Chat with advanced AI assistant</span>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </motion.button>
            </div>
            
            {/* New tool suggestion - AI powered */}
            <div className="mt-5 pt-4 border-t border-zinc-800/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-6 w-6 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mr-2">
                    <Brain className="h-3 w-3 text-blue-400" />
                  </div>
                  <p className="text-xs text-zinc-400">AI SUGGESTION</p>
                </div>
                
                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-zinc-500 hover:text-zinc-300">
                  View
                </Button>
              </div>
              
              <p className="text-xs text-zinc-500 mt-2">
                Based on your usage, you might benefit from the Presentation Generator tool.
              </p>
            </div>
          </div>
          
          {/* Performance Overview / Insights - Enhanced */}
          <div className="bg-zinc-900/80 rounded-lg border border-zinc-800 p-5 transition-colors relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-400" />
                Insights
              </h3>
              
              {/* Time period selector */}
              <Select defaultValue="week">
                <SelectTrigger className="w-28 h-7 text-xs bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                  <SelectItem value="day" className="text-xs">Last 24h</SelectItem>
                  <SelectItem value="week" className="text-xs">This Week</SelectItem>
                  <SelectItem value="month" className="text-xs">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center">
                    <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                    AI Usage
                  </span>
                  <motion.span 
                    key={dashboardData.activeProjects}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {(dashboardData.activeProjects * 2 + 60) % 100}%
                  </motion.span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dashboardData.activeProjects * 2 + 60) % 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center">
                    <div className="h-2 w-2 bg-purple-400 rounded-full mr-2"></div>
                    Content Quality
                  </span>
                  <motion.span 
                    key={dashboardData.contentCreated}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {(dashboardData.contentCreated / 2 + 40) % 100}%
                  </motion.span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(dashboardData.contentCreated / 2 + 40) % 100}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400 flex items-center">
                    <div className="h-2 w-2 bg-emerald-400 rounded-full mr-2"></div>
                    Efficiency
                  </span>
                  <motion.span 
                    key={dashboardData.performance}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-medium"
                  >
                    {Math.min(99, dashboardData.performance)}%
                  </motion.span>
                </div>
                <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(99, dashboardData.performance)}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
                  ></motion.div>
                </div>
              </div>
            </div>
            
            {/* AI recommendations */}
            <div className="mt-6 pt-4 border-t border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-600/20 to-red-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs font-medium">IMPROVEMENT OPPORTUNITY</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    Content creation efficiency could be improved 23% by leveraging templates from the Resource Library.
                  </p>
                  
                  <Button 
                    onClick={() => handleNavigate('resources')}
                    variant="ghost" 
                    size="sm" 
                    className="mt-2 h-7 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    View Resources <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Pro Features */}
          <div className="relative bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg border border-zinc-700 p-5 overflow-hidden">
            <div className="relative">
              <div className="inline-block bg-white/10 backdrop-blur-sm text-xs font-medium text-white px-2.5 py-1 rounded-full mb-3">
                Pro Features
              </div>
              <h3 className="text-xl font-semibold mb-2">Upgrade to Pro</h3>
              <p className="text-sm text-zinc-400 mb-4">
                Access advanced AI tools and unlimited generations
              </p>
              <button className="w-full bg-white text-black font-medium py-2 rounded-md hover:bg-zinc-200 transition-colors">
                View Plans
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Outputs Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold tracking-tight mb-6 flex items-center gap-2">
          <span className="h-6 w-1 bg-white rounded-full inline-block"></span>
          Recent Outputs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Output Card 1 */}
          <div className="group relative bg-zinc-900/80 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
            <div className="h-40 bg-zinc-800">
              <div className="h-full w-full flex items-center justify-center">
                <MessageSquare className="h-12 w-12 text-zinc-700" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">Marketing Email Campaign</h3>
              <p className="text-sm text-zinc-500 mb-3">5-part email sequence for product launch</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Today, 11:42 AM</span>
                <button className="text-zinc-500 hover:text-white p-1 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-16 transition-opacity">
              <button className="bg-white text-black font-medium px-4 py-2 rounded-md">
                View Details
              </button>
            </div>
          </div>
          
          {/* Output Card 2 */}
          <div className="group relative bg-zinc-900/80 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
            <div className="h-40 bg-zinc-800">
              <div className="h-full w-full flex items-center justify-center">
                <Target className="h-12 w-12 text-zinc-700" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">Enterprise Deal Proposal</h3>
              <p className="text-sm text-zinc-500 mb-3">Custom proposal for TechCorp</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Yesterday, 3:15 PM</span>
                <button className="text-zinc-500 hover:text-white p-1 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-16 transition-opacity">
              <button className="bg-white text-black font-medium px-4 py-2 rounded-md">
                View Details
              </button>
            </div>
          </div>
          
          {/* Output Card 3 */}
          <div className="group relative bg-zinc-900/80 rounded-lg border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors">
            <div className="h-40 bg-zinc-800">
              <div className="h-full w-full flex items-center justify-center">
                <Globe className="h-12 w-12 text-zinc-700" />
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium mb-1">Competitor Analysis</h3>
              <p className="text-sm text-zinc-500 mb-3">Analysis of 3 main competitors</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">2 days ago</span>
                <button className="text-zinc-500 hover:text-white p-1 rounded-full">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 flex items-end justify-center pb-16 transition-opacity">
              <button className="bg-white text-black font-medium px-4 py-2 rounded-md">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
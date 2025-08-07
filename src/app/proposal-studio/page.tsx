'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import ReasoningPanel from '@/components/ReasoningPanel';

interface ReasoningStep {
  id: string;
  step: string;
  reasoning: string;
  conclusion: string;
  confidence: number;
  status: 'pending' | 'in-progress' | 'completed';
  timestamp?: Date;
}

export default function ProposalStudioPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    personName: '',
    jobDescription: ''
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReasoningStepId, setCurrentReasoningStepId] = useState<string | null>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeWithReasoning = async () => {
    if (!formData.companyName || !formData.personName || !formData.jobDescription) {
      alert('Please fill in all fields');
      return;
    }

    setIsAnalyzing(true);
    setShowInputForm(false);
    
    // Initialize reasoning steps
    const reasoningSteps: ReasoningStep[] = [
      {
        id: 'step-1',
        step: "Understanding Requirements",
        reasoning: "Analyzing the provided job description to identify key requirements, industry, and company size.",
        conclusion: "Identified core requirements and business context.",
        confidence: 0.8,
        status: 'pending'
      },
      {
        id: 'step-2',
        step: "Market Analysis",
        reasoning: "Researching the industry trends, market position, and potential challenges based on the job description.",
        conclusion: "Assessed market dynamics and competitive landscape.",
        confidence: 0.75,
        status: 'pending'
      },
      {
        id: 'step-3',
        step: "Risk Assessment",
        reasoning: "Evaluating potential risks associated with the project, including budget, timeline, and complexity.",
        conclusion: "Determined risk level and key risk factors.",
        confidence: 0.85,
        status: 'pending'
      },
      {
        id: 'step-4',
        step: "Tool Recommendations",
        reasoning: "Matching project requirements with the most suitable AI tools and technologies for optimal results.",
        conclusion: "Recommended set of tools based on analysis.",
        confidence: 0.9,
        status: 'pending'
      }
    ];

    // Set initial step to in-progress
    reasoningSteps[0].status = 'in-progress';
    setAnalysis({ reasoning: reasoningSteps });

    try {
      // Simulate step-by-step analysis
      for (let i = 0; i < reasoningSteps.length; i++) {
        setCurrentReasoningStepId(reasoningSteps[i].id);
        reasoningSteps[i].status = 'in-progress';
        reasoningSteps[i].timestamp = new Date();
        setAnalysis({ reasoning: [...reasoningSteps] });
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        reasoningSteps[i].status = 'completed';
        setAnalysis({ reasoning: [...reasoningSteps] });
      }

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysis({
        companyName: formData.companyName,
        industry: 'Technology',
        size: 'Mid-size (50-500)',
        budgetRange: '$10K - $35K',
        timeline: '2-3 months',
        riskLevel: 'medium',
        confidenceScore: 0.85,
        recommendedTools: ['AI Chat Assistant', 'Website Scanner'],
        reasoning: analysis?.reasoning || []
      });
      
      setCurrentReasoningStepId(null);
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Header */}
      <div className="w-full border-b border-zinc-800 bg-black p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-xs font-bold">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-bold">Proposal Studio</h1>
              <p className="text-xs text-zinc-400">AI-Powered Analysis</p>
            </div>
          </div>
          
          <Button 
            onClick={() => setShowInputForm(true)}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            New Analysis
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Reasoning Panel - Main focus */}
        <div className="flex-1">
          {analysis?.reasoning ? (
            <ReasoningPanel 
              steps={analysis.reasoning}
              activeStepId={currentReasoningStepId}
              isLiveMode={isAnalyzing}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <span className="text-2xl">AI</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Reasoning Hub</h2>
              <p className="text-zinc-400 mb-6 max-w-md">
                Start a new analysis to see the AI's reasoning process in real-time.
              </p>
              <Button 
                onClick={() => setShowInputForm(true)}
                className="bg-white text-black hover:bg-white/90"
              >
                Start Analysis
              </Button>
            </div>
          )}
        </div>

        {/* Input Form Drawer */}
        {showInputForm && (
          <div className="w-96 bg-black border-l border-zinc-800 flex flex-col shadow-2xl">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-semibold">New Analysis</h3>
              <Button 
                onClick={() => setShowInputForm(false)}
                size="sm"
                variant="ghost"
                className="text-zinc-400 hover:text-white"
              >
                ×
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <Input
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
              <Input
                placeholder="Contact Person Name"
                value={formData.personName}
                onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white"
              />
              <Textarea
                placeholder="Job Description / Project Details"
                value={formData.jobDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                className="bg-zinc-900 border-zinc-700 text-white min-h-[120px]"
              />
            </div>
            
            <div className="p-4 border-t border-zinc-800">
              <Button 
                onClick={() => {
                  analyzeWithReasoning();
                  setShowInputForm(false);
                }}
                disabled={isAnalyzing}
                className="w-full bg-white text-black hover:bg-white/90 disabled:opacity-50"
              >
                {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

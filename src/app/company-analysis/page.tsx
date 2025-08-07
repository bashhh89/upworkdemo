'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  Brain,
  Sparkles,
  CheckCircle,
  Clock,
  DollarSign,
  Shield
} from 'lucide-react';

interface CompanyAnalysis {
  companyName: string;
  industry: string;
  size: string;
  budgetRange: string;
  timeline: string;
  riskLevel: 'low' | 'medium' | 'high';
  confidenceScore: number;
  recommendedTools: string[];
  keyInsights: string[];
  nextSteps: string[];
}

export default function CompanyAnalysisPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    personName: '',
    jobDescription: ''
  });
  
  const [analysis, setAnalysis] = useState<CompanyAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeCompany = async () => {
    if (!formData.companyName || !formData.personName || !formData.jobDescription) {
      alert('Please fill in all fields');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis with realistic data
    setTimeout(() => {
      const mockAnalysis: CompanyAnalysis = {
        companyName: formData.companyName,
        industry: detectIndustry(formData.jobDescription),
        size: detectCompanySize(formData.jobDescription),
        budgetRange: detectBudget(formData.jobDescription),
        timeline: detectTimeline(formData.jobDescription),
        riskLevel: detectRisk(formData.jobDescription),
        confidenceScore: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
        recommendedTools: getRecommendedTools(formData.jobDescription),
        keyInsights: generateInsights(formData.companyName, formData.jobDescription),
        nextSteps: generateNextSteps(formData.jobDescription)
      };
      
      setAnalysis(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  const detectIndustry = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('tech') || desc.includes('software') || desc.includes('app')) return 'Technology';
    if (desc.includes('health') || desc.includes('medical')) return 'Healthcare';
    if (desc.includes('finance') || desc.includes('bank')) return 'Finance';
    if (desc.includes('retail') || desc.includes('ecommerce')) return 'Retail';
    if (desc.includes('education') || desc.includes('school')) return 'Education';
    return 'Professional Services';
  };

  const detectCompanySize = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('startup') || desc.includes('small')) return 'Startup (1-50)';
    if (desc.includes('enterprise') || desc.includes('large')) return 'Enterprise (1000+)';
    return 'Mid-size (50-500)';
  };

  const detectBudget = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('budget') || desc.includes('cheap') || desc.includes('affordable')) return '$5K - $15K';
    if (desc.includes('enterprise') || desc.includes('comprehensive')) return '$50K - $150K';
    if (desc.includes('premium') || desc.includes('high-end')) return '$25K - $75K';
    return '$10K - $35K';
  };

  const detectTimeline = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('urgent') || desc.includes('asap') || desc.includes('rush')) return '2-4 weeks';
    if (desc.includes('long term') || desc.includes('ongoing')) return '6+ months';
    return '2-3 months';
  };

  const detectRisk = (description: string): 'low' | 'medium' | 'high' => {
    const desc = description.toLowerCase();
    if (desc.includes('urgent') || desc.includes('cheap') || desc.includes('budget')) return 'high';
    if (desc.includes('flexible') || desc.includes('quality') || desc.includes('professional')) return 'low';
    return 'medium';
  };

  const getRecommendedTools = (description: string): string[] => {
    const tools = [];
    const desc = description.toLowerCase();
    
    if (desc.includes('website') || desc.includes('web')) tools.push('Website Scanner');
    if (desc.includes('brand') || desc.includes('design')) tools.push('Brand Foundation');
    if (desc.includes('executive') || desc.includes('ceo')) tools.push('Executive Profiler');
    if (desc.includes('image') || desc.includes('visual')) tools.push('Image Generator');
    if (desc.includes('voice') || desc.includes('audio')) tools.push('Voice Synthesis');
    if (desc.includes('ai') || desc.includes('automation')) tools.push('AI Chat Assistant');
    
    return tools.length > 0 ? tools : ['AI Chat Assistant', 'Website Scanner'];
  };

  const generateInsights = (company: string, description: string): string[] => {
    return [
      `${company} appears to be actively investing in digital transformation`,
      'Strong potential for long-term partnership based on project scope',
      'Decision maker seems technically informed and quality-focused',
      'Project aligns well with current AI/automation trends',
      'Good opportunity to showcase advanced technical capabilities'
    ];
  };

  const generateNextSteps = (description: string): string[] => {
    return [
      'Schedule discovery call to understand detailed requirements',
      'Prepare portfolio examples relevant to their industry',
      'Create custom proposal highlighting recommended tools',
      'Research their current tech stack and competitors',
      'Prepare pricing options with clear value propositions'
    ];
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                Company Analysis
              </h1>
              <p className="text-zinc-400">AI-powered business intelligence and opportunity assessment</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Research
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                placeholder="Contact Person Name"
                value={formData.personName}
                onChange={(e) => setFormData(prev => ({ ...prev, personName: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Textarea
                placeholder="Job Description / Project Details"
                value={formData.jobDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
              />
              <Button 
                onClick={analyzeCompany}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Opportunity
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Overview */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-sm text-zinc-400">Industry</div>
                    <div className="font-medium text-white">{analysis.industry}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg">
                    <div className="text-sm text-zinc-400">Company Size</div>
                    <div className="font-medium text-white">{analysis.size}</div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-zinc-800 rounded-lg text-center">
                    <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                    <div className="text-xs text-zinc-400">Budget</div>
                    <div className="text-sm font-medium text-white">{analysis.budgetRange}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg text-center">
                    <Clock className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                    <div className="text-xs text-zinc-400">Timeline</div>
                    <div className="text-sm font-medium text-white">{analysis.timeline}</div>
                  </div>
                  <div className="p-3 bg-zinc-800 rounded-lg text-center">
                    <Shield className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                    <div className="text-xs text-zinc-400">Confidence</div>
                    <div className="text-sm font-medium text-white">{Math.round(analysis.confidenceScore * 100)}%</div>
                  </div>
                </div>

                {/* Risk Assessment */}
                <div className="p-3 bg-zinc-800 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-zinc-400">Risk Level</span>
                    <Badge className={getRiskColor(analysis.riskLevel)}>
                      {analysis.riskLevel.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                {/* Recommended Tools */}
                <div>
                  <div className="text-sm text-zinc-400 mb-2">Recommended Tools</div>
                  <div className="flex flex-wrap gap-2">
                    {analysis.recommendedTools.map((tool, index) => (
                      <Badge key={index} className="bg-blue-600 text-white">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Insights */}
        {analysis && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.keyInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-zinc-300">{insight}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Next Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.nextSteps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-sm text-zinc-300">{step}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
// Company analysis processing logic
import { glmApiClient } from './glm-api';
import { companyAnalysisStorage } from '@/lib/storage';
import { CompanyAnalysis, CompanyResearchForm } from '@/types/admin';

export interface AnalysisProgress {
  stage: 'initializing' | 'researching' | 'analyzing' | 'processing' | 'complete' | 'error';
  message: string;
  progress: number; // 0-100
  timestamp: Date;
}

export class CompanyAnalysisEngine {
  private progressCallback?: (progress: AnalysisProgress) => void;

  constructor(progressCallback?: (progress: AnalysisProgress) => void) {
    this.progressCallback = progressCallback;
  }

  private updateProgress(stage: AnalysisProgress['stage'], message: string, progress: number) {
    const progressUpdate: AnalysisProgress = {
      stage,
      message,
      progress,
      timestamp: new Date()
    };

    if (this.progressCallback) {
      this.progressCallback(progressUpdate);
    }

    console.log(`[Analysis] ${stage}: ${message} (${progress}%)`);
  }

  async analyzeCompany(form: CompanyResearchForm): Promise<CompanyAnalysis> {
    try {
      this.updateProgress('initializing', 'Starting company analysis...', 0);

      // Validate input
      if (!form.companyName || !form.personName || !form.jobDescription) {
        throw new Error('Missing required fields: company name, person name, and job description are required');
      }

      this.updateProgress('researching', 'Gathering company intelligence...', 20);

      // Check if we have a recent analysis for this company
      const existingAnalyses = companyAnalysisStorage.getByCompany(form.companyName);
      const recentAnalysis = existingAnalyses.find(analysis => {
        const hoursSinceAnalysis = (Date.now() - analysis.analysisTimestamp.getTime()) / (1000 * 60 * 60);
        return hoursSinceAnalysis < 24; // Use cached analysis if less than 24 hours old
      });

      if (recentAnalysis) {
        this.updateProgress('complete', 'Using recent analysis from cache', 100);
        return recentAnalysis;
      }

      this.updateProgress('analyzing', 'AI analyzing opportunity with GLM 4.5 Flash...', 40);

      // Call working API for analysis
      const analysis = await this.callWorkingAPI(form);

      this.updateProgress('processing', 'Processing and structuring results...', 80);

      // Enhance analysis with additional processing
      const enhancedAnalysis = await this.enhanceAnalysis(analysis, form);

      this.updateProgress('processing', 'Saving analysis results...', 90);

      // Save to storage
      const savedAnalysis = companyAnalysisStorage.save(enhancedAnalysis);

      this.updateProgress('complete', 'Company analysis complete!', 100);

      return savedAnalysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateProgress('error', `Analysis failed: ${errorMessage}`, 0);
      throw error;
    }
  }

  private async enhanceAnalysis(analysis: CompanyAnalysis, form: CompanyResearchForm): Promise<CompanyAnalysis> {
    // Add job-specific insights
    const jobInsights = this.extractJobInsights(form.jobDescription);
    
    // Enhance opportunity insights with job-specific data
    const enhancedOpportunityInsights = {
      ...analysis.opportunityInsights,
      ...jobInsights
    };

    // Add tool recommendations based on job description
    const toolRecommendations = this.generateToolRecommendations(form.jobDescription, analysis);

    // Calculate enhanced risk assessment
    const enhancedRiskAssessment = this.calculateRiskScore(analysis, form);

    return {
      ...analysis,
      opportunityInsights: enhancedOpportunityInsights,
      recommendedTools: [...analysis.recommendedTools, ...toolRecommendations],
      riskAssessment: enhancedRiskAssessment
    };
  }

  private extractJobInsights(jobDescription: string): Partial<CompanyAnalysis['opportunityInsights']> {
    const insights: Partial<CompanyAnalysis['opportunityInsights']> = {};

    // Extract budget indicators
    const budgetKeywords = {
      high: ['enterprise', 'large scale', 'comprehensive', 'full stack', 'end-to-end'],
      medium: ['professional', 'business', 'commercial', 'standard'],
      low: ['simple', 'basic', 'minimal', 'small', 'startup']
    };

    // Extract timeline indicators
    const timelineKeywords = {
      urgent: ['asap', 'urgent', 'immediately', 'rush', 'quick'],
      normal: ['reasonable', 'standard', 'typical', 'normal'],
      flexible: ['flexible', 'when ready', 'no rush', 'long term']
    };

    // Extract complexity indicators
    const complexityKeywords = {
      high: ['complex', 'advanced', 'sophisticated', 'enterprise', 'scalable', 'ai', 'machine learning'],
      medium: ['professional', 'business', 'integration', 'api', 'database'],
      low: ['simple', 'basic', 'straightforward', 'minimal']
    };

    const lowerDesc = jobDescription.toLowerCase();

    // Determine project complexity
    if (complexityKeywords.high.some(keyword => lowerDesc.includes(keyword))) {
      insights.projectComplexity = 'high';
    } else if (complexityKeywords.low.some(keyword => lowerDesc.includes(keyword))) {
      insights.projectComplexity = 'low';
    } else {
      insights.projectComplexity = 'medium';
    }

    // Determine urgency
    if (timelineKeywords.urgent.some(keyword => lowerDesc.includes(keyword))) {
      insights.urgency = 'high';
    } else if (timelineKeywords.flexible.some(keyword => lowerDesc.includes(keyword))) {
      insights.urgency = 'low';
    } else {
      insights.urgency = 'medium';
    }

    return insights;
  }

  private generateToolRecommendations(jobDescription: string, analysis: CompanyAnalysis): CompanyAnalysis['recommendedTools'] {
    const recommendations: CompanyAnalysis['recommendedTools'] = [];
    const lowerDesc = jobDescription.toLowerCase();

    // Website-related tools
    if (lowerDesc.includes('website') || lowerDesc.includes('web') || lowerDesc.includes('landing')) {
      recommendations.push({
        toolId: 'website_scanner',
        toolName: 'Website Intelligence Scanner',
        relevanceScore: 0.9,
        reasoning: 'Job involves website work - tool can analyze current site and competitors',
        priority: 'high',
        estimatedValue: 'High - provides competitive intelligence and technical insights'
      });
    }

    // AI/ML related tools
    if (lowerDesc.includes('ai') || lowerDesc.includes('artificial intelligence') || lowerDesc.includes('machine learning')) {
      recommendations.push({
        toolId: 'pollinations-assistant',
        toolName: 'AI Chat Assistant',
        relevanceScore: 0.95,
        reasoning: 'AI-focused project - demonstrate AI capabilities directly',
        priority: 'high',
        estimatedValue: 'Very High - showcases AI expertise relevant to project'
      });
    }

    // Branding/Design related tools
    if (lowerDesc.includes('brand') || lowerDesc.includes('design') || lowerDesc.includes('logo') || lowerDesc.includes('identity')) {
      recommendations.push({
        toolId: 'brand_foundation',
        toolName: 'Brand Foundation Builder',
        relevanceScore: 0.85,
        reasoning: 'Branding project - tool helps establish brand strategy',
        priority: 'high',
        estimatedValue: 'High - directly relevant to brand development needs'
      });

      recommendations.push({
        toolId: 'image_generator',
        toolName: 'Smart Image Generator',
        relevanceScore: 0.8,
        reasoning: 'Visual content needs - tool can generate brand assets',
        priority: 'medium',
        estimatedValue: 'Medium - useful for creating visual mockups and concepts'
      });
    }

    // Executive/Leadership related
    if (lowerDesc.includes('executive') || lowerDesc.includes('ceo') || lowerDesc.includes('leadership') || lowerDesc.includes('c-suite')) {
      recommendations.push({
        toolId: 'executive_persona',
        toolName: 'Executive Persona Analyzer',
        relevanceScore: 0.9,
        reasoning: 'Executive-level project - tool provides leadership insights',
        priority: 'high',
        estimatedValue: 'High - helps understand decision-maker psychology'
      });
    }

    // Content/Marketing related
    if (lowerDesc.includes('content') || lowerDesc.includes('marketing') || lowerDesc.includes('copy')) {
      recommendations.push({
        toolId: 'voiceover_generator',
        toolName: 'Voice Synthesis Studio',
        relevanceScore: 0.7,
        reasoning: 'Content creation project - tool adds multimedia capabilities',
        priority: 'medium',
        estimatedValue: 'Medium - enhances content with professional audio'
      });
    }

    // Customer analysis related
    if (lowerDesc.includes('customer') || lowerDesc.includes('audience') || lowerDesc.includes('target') || lowerDesc.includes('user')) {
      recommendations.push({
        toolId: 'icp_builder',
        toolName: 'ICP Builder',
        relevanceScore: 0.85,
        reasoning: 'Customer-focused project - tool helps define target audience',
        priority: 'high',
        estimatedValue: 'High - essential for understanding target market'
      });
    }

    return recommendations;
  }

  private async callWorkingAPI(form: CompanyResearchForm): Promise<CompanyAnalysis> {
    const analysisPrompt = `Analyze this job opportunity and provide business intelligence:

COMPANY: ${form.companyName}
CONTACT: ${form.personName}
JOB DESCRIPTION: ${form.jobDescription}

Provide a comprehensive analysis as JSON with this structure:
{
  "companyProfile": {
    "name": "${form.companyName}",
    "industry": "string", 
    "size": "string",
    "fundingStatus": "string",
    "techStack": ["string"],
    "recentNews": []
  },
  "opportunityInsights": {
    "budgetRange": "string",
    "timelineExpectation": "string", 
    "decisionMakers": ["${form.personName}"],
    "painPoints": ["string"],
    "successFactors": ["string"],
    "projectComplexity": "medium",
    "urgency": "medium"
  },
  "competitiveAnalysis": {
    "competitorCount": 3,
    "competitiveAdvantages": ["AI expertise"],
    "differentiationOpportunities": ["string"],
    "marketPosition": "Strong",
    "competitiveLandscape": "Competitive"
  },
  "recommendedTools": [],
  "riskAssessment": {
    "riskLevel": "medium",
    "riskFactors": ["string"],
    "mitigationStrategies": ["string"],
    "confidenceScore": 0.8
  }
}`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: analysisPrompt }],
          model: 'glm-4.5-flash',
          thinking: { type: 'disabled' }
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from API');
      }

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in API response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      return {
        ...analysisData,
        analysisTimestamp: new Date(),
        analysisId: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

    } catch (error) {
      console.error('API analysis failed:', error);
      throw error;
    }
  }

  private calculateRiskScore(analysis: CompanyAnalysis, form: CompanyResearchForm): CompanyAnalysis['riskAssessment'] {
    const riskFactors: string[] = [...analysis.riskAssessment.riskFactors];
    const mitigationStrategies: string[] = [...analysis.riskAssessment.mitigationStrategies];
    let riskScore = 0;

    // Analyze job description for risk indicators
    const lowerDesc = form.jobDescription.toLowerCase();
    
    // High-risk indicators
    const highRiskKeywords = ['urgent', 'asap', 'cheap', 'budget', 'quick', 'rush'];
    const mediumRiskKeywords = ['complex', 'advanced', 'enterprise', 'scalable'];
    const lowRiskKeywords = ['flexible', 'long term', 'professional', 'quality'];

    highRiskKeywords.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore += 0.2;
        if (keyword === 'urgent' || keyword === 'asap') {
          riskFactors.push('Tight timeline pressure');
          mitigationStrategies.push('Set clear expectations about realistic timelines');
        }
        if (keyword === 'cheap' || keyword === 'budget') {
          riskFactors.push('Budget constraints indicated');
          mitigationStrategies.push('Emphasize value over cost, provide tiered pricing');
        }
      }
    });

    mediumRiskKeywords.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore += 0.1;
        riskFactors.push('Complex project requirements');
        mitigationStrategies.push('Break project into phases, ensure clear specifications');
      }
    });

    lowRiskKeywords.forEach(keyword => {
      if (lowerDesc.includes(keyword)) {
        riskScore -= 0.1;
      }
    });

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskScore <= 0.3) {
      riskLevel = 'low';
    } else if (riskScore <= 0.6) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    // Calculate confidence score (inverse of risk)
    const confidenceScore = Math.max(0.1, Math.min(1.0, 1 - riskScore));

    return {
      riskLevel,
      riskFactors: [...new Set(riskFactors)], // Remove duplicates
      mitigationStrategies: [...new Set(mitigationStrategies)], // Remove duplicates
      confidenceScore: Math.round(confidenceScore * 100) / 100 // Round to 2 decimal places
    };
  }

  // Utility method to get analysis statistics
  getAnalysisStats(): {
    totalAnalyses: number;
    recentAnalyses: number;
    averageConfidenceScore: number;
    topIndustries: string[];
  } {
    const allAnalyses = companyAnalysisStorage.getRecent(100);
    const recentAnalyses = companyAnalysisStorage.getRecent(30);
    
    const averageConfidence = allAnalyses.length > 0 
      ? allAnalyses.reduce((sum, analysis) => sum + analysis.riskAssessment.confidenceScore, 0) / allAnalyses.length
      : 0;

    const industryCount: Record<string, number> = {};
    allAnalyses.forEach(analysis => {
      const industry = analysis.companyProfile.industry;
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    const topIndustries = Object.entries(industryCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([industry]) => industry);

    return {
      totalAnalyses: allAnalyses.length,
      recentAnalyses: recentAnalyses.length,
      averageConfidenceScore: Math.round(averageConfidence * 100) / 100,
      topIndustries
    };
  }
}

// Export singleton instance
export const companyAnalysisEngine = new CompanyAnalysisEngine();
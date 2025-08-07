// GLM 4.5 Flash API client via Z.ai endpoint
import { CompanyAnalysis, CompanyResearchForm } from '@/types/admin';

// Z.ai API configuration
const Z_AI_CONFIG = {
  baseUrl: 'https://api.z.ai/api/paas/v4/chat/completions',
  apiKey: '33deb7d432c54adf99309adec7cbbd57.Oe83JiBGzFjP2OoP',
  model: 'glm-4.5-flash',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000
};

// FreelanceHelper prompt for company analysis
const FREELANCE_HELPER_PROMPT = `You are FreelanceHelper, an expert AI consultant specializing in freelance business intelligence and opportunity analysis. Your role is to analyze job opportunities and provide strategic insights for freelancers.

When analyzing a company and job opportunity, provide a comprehensive analysis covering:

1. COMPANY PROFILE: Industry, size, funding status, tech stack, recent news
2. OPPORTUNITY INSIGHTS: Budget range, timeline, decision makers, pain points, success factors
3. COMPETITIVE ANALYSIS: Competition level, advantages, differentiation opportunities
4. RISK ASSESSMENT: Risk level, factors, mitigation strategies
5. TOOL RECOMMENDATIONS: Which AI tools would be most valuable for this client

Be specific, actionable, and business-focused. Format your response as structured JSON.`;

interface GLMApiResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  created: number;
}

interface GLMApiError {
  error: {
    message: string;
    type: string;
    code: string;
  };
}

export class GLMApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || Z_AI_CONFIG.apiKey;
    this.baseUrl = Z_AI_CONFIG.baseUrl;
  }

  private async makeRequest(messages: Array<{ role: string; content: string }>): Promise<GLMApiResponse> {
    const requestBody = {
      model: Z_AI_CONFIG.model,
      messages,
      max_tokens: Z_AI_CONFIG.maxTokens,
      temperature: Z_AI_CONFIG.temperature,
      stream: false
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), Z_AI_CONFIG.timeout);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Accept-Language': 'en-US,en;q=0.9'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: GLMApiError = await response.json();
        throw new Error(`Z.ai API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data: GLMApiResponse = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout - Z.ai API took too long to respond');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred while calling Z.ai API');
    }
  }

  async analyzeCompany(input: CompanyResearchForm): Promise<CompanyAnalysis> {
    const analysisPrompt = `${FREELANCE_HELPER_PROMPT}

COMPANY: ${input.companyName}
CONTACT: ${input.personName}
JOB DESCRIPTION: ${input.jobDescription}
${input.additionalContext ? `ADDITIONAL CONTEXT: ${input.additionalContext}` : ''}

Analyze this opportunity and provide a comprehensive assessment. Return your analysis as a JSON object with this exact structure:

{
  "companyProfile": {
    "name": "string",
    "industry": "string", 
    "size": "string",
    "fundingStatus": "string",
    "techStack": ["string"],
    "recentNews": [{"title": "string", "url": "string", "publishedAt": "ISO date", "source": "string", "summary": "string"}],
    "website": "string",
    "location": "string",
    "foundedYear": number,
    "employeeCount": "string"
  },
  "opportunityInsights": {
    "budgetRange": "string",
    "timelineExpectation": "string", 
    "decisionMakers": ["string"],
    "painPoints": ["string"],
    "successFactors": ["string"],
    "projectComplexity": "low|medium|high",
    "urgency": "low|medium|high"
  },
  "competitiveAnalysis": {
    "competitorCount": number,
    "competitiveAdvantages": ["string"],
    "differentiationOpportunities": ["string"],
    "marketPosition": "string",
    "competitiveLandscape": "string"
  },
  "recommendedTools": [
    {
      "toolId": "string",
      "toolName": "string", 
      "relevanceScore": number,
      "reasoning": "string",
      "priority": "high|medium|low",
      "estimatedValue": "string"
    }
  ],
  "riskAssessment": {
    "riskLevel": "low|medium|high",
    "riskFactors": ["string"],
    "mitigationStrategies": ["string"],
    "confidenceScore": number
  }
}`;

    const messages = [
      { role: 'system', content: FREELANCE_HELPER_PROMPT },
      { role: 'user', content: analysisPrompt }
    ];

    try {
      const response = await this.makeRequest(messages);
      const content = response.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('Empty response from Z.ai API');
      }

      // Extract JSON from response (handle potential markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in API response');
      }

      const analysisData = JSON.parse(jsonMatch[0]);
      
      // Add metadata
      const analysis: CompanyAnalysis = {
        ...analysisData,
        analysisTimestamp: new Date(),
        analysisId: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      return analysis;
    } catch (error) {
      console.error('Company analysis failed:', error);
      
      // Return fallback analysis structure
      return this.createFallbackAnalysis(input);
    }
  }

  private createFallbackAnalysis(input: CompanyResearchForm): CompanyAnalysis {
    return {
      analysisId: `fallback-${Date.now()}`,
      analysisTimestamp: new Date(),
      companyProfile: {
        name: input.companyName,
        industry: 'Unknown',
        size: 'Unknown',
        fundingStatus: 'Unknown',
        techStack: [],
        recentNews: [],
        website: '',
        location: 'Unknown',
        foundedYear: undefined,
        employeeCount: 'Unknown'
      },
      opportunityInsights: {
        budgetRange: 'To be determined',
        timelineExpectation: 'To be determined',
        decisionMakers: [input.personName],
        painPoints: ['Analysis unavailable - API error'],
        successFactors: ['Manual analysis required'],
        projectComplexity: 'medium',
        urgency: 'medium'
      },
      competitiveAnalysis: {
        competitorCount: 0,
        competitiveAdvantages: ['Manual analysis required'],
        differentiationOpportunities: ['Manual analysis required'],
        marketPosition: 'Unknown',
        competitiveLandscape: 'Unknown'
      },
      recommendedTools: [],
      riskAssessment: {
        riskLevel: 'medium',
        riskFactors: ['API analysis unavailable'],
        mitigationStrategies: ['Conduct manual research', 'Follow up with client directly'],
        confidenceScore: 0.3
      }
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    
    try {
      const testMessages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Connection test successful" and nothing else.' }
      ];

      const response = await this.makeRequest(testMessages);
      const latency = Date.now() - startTime;
      
      if (response.choices[0]?.message?.content) {
        return {
          success: true,
          message: 'Z.ai API connection successful',
          latency
        };
      } else {
        return {
          success: false,
          message: 'Invalid response format from Z.ai API'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown connection error'
      };
    }
  }

  // Utility method to get API usage stats
  getUsageStats(): { model: string; endpoint: string; configured: boolean } {
    return {
      model: Z_AI_CONFIG.model,
      endpoint: this.baseUrl,
      configured: !!this.apiKey
    };
  }
}

// Export singleton instance
export const glmApiClient = new GLMApiClient();

// Export configuration for reference
export { Z_AI_CONFIG, FREELANCE_HELPER_PROMPT };
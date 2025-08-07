import { GLMApiClient, glmApiClient, Z_AI_CONFIG } from '../glm-api';
import { CompanyResearchForm } from '@/types/admin';

// Mock fetch
global.fetch = jest.fn();

describe('GLMApiClient', () => {
  let apiClient: GLMApiClient;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    apiClient = new GLMApiClient(mockApiKey);
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with default API key if none provided', () => {
      const clientWithDefaultKey = new GLMApiClient();
      expect(clientWithDefaultKey).toBeInstanceOf(GLMApiClient);
    });

    it('should initialize with provided API key', () => {
      expect(apiClient).toBeInstanceOf(GLMApiClient);
    });
  });

  describe('getUsageStats', () => {
    it('should return correct usage statistics', () => {
      const stats = apiClient.getUsageStats();
      expect(stats).toEqual({
        model: Z_AI_CONFIG.model,
        endpoint: Z_AI_CONFIG.baseUrl,
        configured: true,
      });
    });
  });

  describe('testConnection', () => {
    it('should successfully test connection', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Connection test successful', role: 'assistant' }, finish_reason: 'stop' }]
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse as any);

      const result = await apiClient.testConnection();

      expect(result.success).toBe(true);
      expect(result.message).toBe('Z.ai API connection successful');
      expect(result.latency).toBeDefined();
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should handle connection failure', async () => {
      const mockError = new Error('Network error');
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(mockError);

      const result = await apiClient.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Network error');
    });

    it('should handle API error response', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          error: { message: 'Invalid API key', type: 'authentication_error', code: 'invalid_api_key' }
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockErrorResponse as any);

      const result = await apiClient.testConnection();

      expect(result.success).toBe(false);
      expect(result.message).toContain('Z.ai API Error: Invalid API key');
    });
  });

  describe('analyzeCompany', () => {
    const mockInput: CompanyResearchForm = {
      companyName: 'Test Corp',
      personName: 'John Doe',
      jobDescription: 'Looking for a React developer',
      additionalContext: 'Fast-paced startup'
    };

    it('should successfully analyze company and return structured data', async () => {
      const mockJsonResponse = {
        choices: [{
          message: {
            content: JSON.stringify({
              companyProfile: { name: 'Test Corp', industry: 'Technology', size: '10-50', fundingStatus: 'Series A', techStack: ['React', 'Node.js'], recentNews: [], website: 'https://testcorp.com', location: 'San Francisco', foundedYear: 2020, employeeCount: '25-50' },
              opportunityInsights: { budgetRange: '$50,000 - $100,000', timelineExpectation: '3-6 months', decisionMakers: ['CTO', 'Hiring Manager'], painPoints: ['Slow development', 'Need for scalability'], successFactors: ['Quality code', 'On-time delivery'], projectComplexity: 'medium', urgency: 'high' },
              competitiveAnalysis: { competitorCount: 5, competitiveAdvantages: ['Expert React skills', 'Agile methodology'], differentiationOpportunities: ['Specialized in fintech'], marketPosition: 'Niche player', competitiveLandscape: 'Moderate' },
              recommendedTools: [{ toolId: 'react-dev', toolName: 'React Dev Tools', relevanceScore: 0.9, reasoning: 'Essential for React development', priority: 'high', estimatedValue: 'Increased productivity by 30%' }],
              riskAssessment: { riskLevel: 'low', riskFactors: [], mitigationStrategies: ['Clear communication'], confidenceScore: 0.85 }
            }),
            role: 'assistant'
          },
          finish_reason: 'stop'
        }],
        usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 },
        model: 'glm-4.5-flash',
        created: Date.now()
      };
      
      const mockResponse = {
        ok: true,
        json: async () => mockJsonResponse
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse as any);

      const result = await apiClient.analyzeCompany(mockInput);

      expect(result).toEqual(expect.objectContaining({
        companyProfile: expect.objectContaining({ name: 'Test Corp', industry: 'Technology' }),
        opportunityInsights: expect.objectContaining({ budgetRange: '$50,000 - $100,000' }),
        competitiveAnalysis: expect.objectContaining({ competitorCount: 5 }),
        recommendedTools: expect.arrayContaining([expect.objectContaining({ toolId: 'react-dev' })]),
        riskAssessment: expect.objectContaining({ riskLevel: 'low', confidenceScore: 0.85 }),
        analysisId: expect.any(String),
        analysisTimestamp: expect.any(Date)
      }));
      expect(result.companyProfile.name).toBe('Test Corp');
    });

    it('should handle empty API response by returning fallback analysis', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'No valid JSON here', role: 'assistant' }, finish_reason: 'stop' }]
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockResponse as any);

      const result = await apiClient.analyzeCompany(mockInput);

      expect(result).toEqual(expect.objectContaining({
        analysisId: expect.stringMatching(/fallback-.*/),
        companyProfile: expect.objectContaining({ name: 'Test Corp', industry: 'Unknown' }),
        opportunityInsights: expect.objectContaining({ budgetRange: 'To be determined' }),
        riskAssessment: expect.objectContaining({ riskLevel: 'medium', confidenceScore: 0.3 })
      }));
    });

    it('should handle API error by returning fallback analysis', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
        json: async () => ({
          error: { message: 'Internal Server Error', type: 'server_error' }
        })
      };
      (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(mockErrorResponse as any);

      const result = await apiClient.analyzeCompany(mockInput);

      expect(result).toEqual(expect.objectContaining({
        analysisId: expect.stringMatching(/fallback-.*/),
        companyProfile: expect.objectContaining({ name: 'Test Corp', industry: 'Unknown' }),
        opportunityInsights: expect.objectContaining({ painPoints: ['Analysis unavailable - API error'] }),
      }));
    });

    it('should handle network error by returning fallback analysis', async () => {
      const mockError = new Error('Failed to fetch');
      (fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(mockError);

      const result = await apiClient.analyzeCompany(mockInput);

      expect(result).toEqual(expect.objectContaining({
        analysisId: expect.stringMatching(/fallback-.*/),
        companyProfile: expect.objectContaining({ name: 'Test Corp', industry: 'Unknown' }),
        opportunityInsights: expect.objectContaining({ painPoints: ['Analysis unavailable - API error'] }),
      }));
    });
  });

  describe('Fallback Analysis Creation', () => {
    it('should create a fallback analysis with input data', () => {
      // This test is indirectly covered by the 'handle API error' test above,
      // but we can test the private method directly if needed by making it public for tests
      // or by refactoring. For now, the behavior is tested via the error handling path.
    });
  });
});

// Test for the exported singleton instance
describe('glmApiClient Singleton', () => {
  it('should be an instance of GLMApiClient', () => {
    expect(glmApiClient).toBeInstanceOf(GLMApiClient);
  });

  it('should have usage stats available', () => {
    expect(glmApiClient.getUsageStats()).toEqual(expect.objectContaining({
      model: expect.any(String),
      endpoint: expect.any(String),
      configured: expect.any(Boolean)
    }));
  });
});

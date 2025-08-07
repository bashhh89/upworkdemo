// Admin Dashboard Types for Smart Proposal Generation System

export interface AdminDashboardProps {
  initialTab?: string;
}

export interface DashboardState {
  activeTab: string;
  unsavedChanges: Record<string, boolean>;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Company Research Tab Types
export interface CompanyResearchTabProps {
  onAnalysisComplete: (analysis: CompanyAnalysis) => void;
}

export interface CompanyResearchForm {
  companyName: string;
  personName: string;
  jobDescription: string;
  additionalContext?: string;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  size: string;
  fundingStatus: string;
  techStack: string[];
  recentNews: NewsItem[];
  website?: string;
  location?: string;
  foundedYear?: number;
  employeeCount?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: Date;
  source: string;
  summary?: string;
}

export interface OpportunityInsights {
  budgetRange: string;
  timelineExpectation: string;
  decisionMakers: string[];
  painPoints: string[];
  successFactors: string[];
  projectComplexity: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
}

export interface CompetitiveAnalysis {
  competitorCount: number;
  competitiveAdvantages: string[];
  differentiationOpportunities: string[];
  marketPosition: string;
  competitiveLandscape: string;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  mitigationStrategies: string[];
  confidenceScore: number;
}

export interface CompanyAnalysis {
  companyProfile: CompanyProfile;
  opportunityInsights: OpportunityInsights;
  competitiveAnalysis: CompetitiveAnalysis;
  recommendedTools: ToolRecommendation[];
  riskAssessment: RiskAssessment;
  analysisTimestamp: Date;
  analysisId: string;
}

// Recommendations Tab Types
export interface RecommendationsTabProps {
  companyAnalysis: CompanyAnalysis;
  onRecommendationUpdate: (recommendation: ApplicationRecommendation) => void;
}

export interface ReasoningFactor {
  factor: string;
  weight: number;
  score: number;
  reasoning: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface EffortEstimate {
  timeToComplete: string;
  complexityLevel: 'low' | 'medium' | 'high';
  resourcesRequired: string[];
  estimatedHours: number;
}

export interface ApplicationRecommendation {
  shouldApply: boolean;
  confidenceScore: number;
  reasoningFactors: ReasoningFactor[];
  suggestedApproach: string;
  estimatedEffort: EffortEstimate;
  successProbability: number;
  recommendationId: string;
  createdAt: Date;
}

// Sidebar Config Tab Types
export interface SidebarConfigTabProps {
  availableTools: ToolDefinition[];
  selectedTools: string[];
  aiRecommendations: ToolRecommendation[];
  onToolToggle: (toolId: string, enabled: boolean) => void;
}

export interface ToolRecommendation {
  toolId: string;
  toolName: string;
  relevanceScore: number;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
  estimatedValue: string;
}

export interface ToolCustomization {
  displayName?: string;
  description?: string;
  customPrompt?: string;
  parameters?: Record<string, any>;
  styling?: {
    color?: string;
    icon?: string;
  };
}

export interface ToolConfiguration {
  toolId: string;
  enabled: boolean;
  customization: ToolCustomization;
  displayOrder: number;
  lastUpdated: Date;
}

// Manage Jobs Tab Types
export interface ManageJobsTabProps {
  jobs: JobRecord[];
  onJobUpdate: (jobId: string, updates: Partial<JobRecord>) => void;
  onJobDelete: (jobId: string) => void;
}

export type JobStatus = 'draft' | 'sent' | 'viewed' | 'responded' | 'rejected' | 'hired' | 'archived';

export interface JobAnalytics {
  proposalViews: number;
  timeSpentOnProposal: number;
  toolInteractions: number;
  lastViewedAt?: Date;
  conversionEvents: ConversionEvent[];
  engagementScore: number;
}

export interface ConversionEvent {
  eventType: 'view' | 'tool_interaction' | 'contact' | 'meeting_scheduled' | 'proposal_accepted';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  type: 'general' | 'follow_up' | 'meeting' | 'decision';
  priority?: 'low' | 'medium' | 'high';
}

export interface JobRecord {
  id: string;
  companyName: string;
  personName: string;
  jobDescription: string;
  applicationDate: Date;
  status: JobStatus;
  proposalUrl: string;
  companyAnalysis?: CompanyAnalysis;
  toolConfiguration: ToolConfiguration[];
  analytics: JobAnalytics;
  crmRecord?: CRMRecord;
  notes: Note[];
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

// CRM Integration Types
export interface CRMRecord {
  contactId: string;
  companyId: string;
  dealId?: string;
  stage: string;
  value?: number;
  probability?: number;
  expectedCloseDate?: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  relationshipScore: number;
  interactions: CRMInteraction[];
}

export interface CRMInteraction {
  id: string;
  type: 'email' | 'call' | 'meeting' | 'proposal_sent' | 'proposal_viewed' | 'follow_up';
  timestamp: Date;
  description: string;
  outcome?: string;
  nextAction?: string;
}

// Blog Management Types
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  categories: string[];
  tags: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  seoTitle?: string;
  seoDescription?: string;
  featuredImage?: string;
  readingTime?: number;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

// Widgets Tab Types
export interface Widget {
  id: string;
  name: string;
  description: string;
  type: 'integration' | 'automation' | 'analytics' | 'utility';
  enabled: boolean;
  configuration: Record<string, any>;
  lastUpdated: Date;
}

export interface WidgetConfiguration {
  widgetId: string;
  settings: Record<string, any>;
  enabled: boolean;
  permissions?: string[];
}
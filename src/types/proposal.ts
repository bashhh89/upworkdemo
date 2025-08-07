// Proposal Generation System Types

import { ToolConfiguration, JobRecord, CompanyAnalysis } from './admin';

// Proposal Builder Types
export interface ProposalBuilderProps {
  jobRecord: JobRecord;
  companyAnalysis: CompanyAnalysis;
  toolConfiguration: ToolConfiguration[];
  onProposalGenerate: (proposal: GeneratedProposal) => void;
}

export interface ProposalMetadata {
  jobId: string;
  companyName: string;
  personName: string;
  generatedAt: Date;
  version: number;
  templateVersion: string;
  customizations: TemplateCustomization;
}

export interface GeneratedProposal {
  id: string;
  url: string;
  content: ProposalContent;
  metadata: ProposalMetadata;
  analytics: AnalyticsConfiguration;
  isActive: boolean;
  expiresAt?: Date;
}

// Template Engine Types
export interface TemplateEngineProps {
  baseTemplate: 'clausen-portfolio';
  customizations: TemplateCustomization;
  content: ProposalContent;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
}

export interface BrandingOptions {
  logo?: string;
  companyName: string;
  tagline?: string;
  colors: ColorScheme;
  fonts?: {
    heading: string;
    body: string;
  };
}

export interface LayoutOptions {
  sidebarPosition: 'left' | 'right';
  sidebarWidth: 'narrow' | 'standard' | 'wide';
  contentLayout: 'single-column' | 'two-column';
  headerStyle: 'minimal' | 'standard' | 'hero';
}

export interface InteractiveElementConfig {
  type: 'roi-calculator' | 'timeline-slider' | 'scope-selector' | 'tool-demo';
  enabled: boolean;
  position: string;
  configuration: Record<string, any>;
}

export interface TemplateCustomization {
  colorScheme: ColorScheme;
  branding: BrandingOptions;
  layout: LayoutOptions;
  interactiveElements: InteractiveElementConfig[];
}

// Proposal Content Types
export interface ProposalHero {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage?: string;
  badges?: string[];
}

export interface AboutSection {
  title: string;
  content: string;
  image?: string;
  highlights: string[];
  credentials: string[];
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  content: string;
  rating?: number;
  projectType?: string;
  image?: string;
}

export interface ContactInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  linkedin?: string;
  website?: string;
  timezone?: string;
  availability?: string;
}

export interface ProposalSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'interactive' | 'testimonial' | 'case-study';
  title: string;
  content: string;
  order: number;
  visible: boolean;
  metadata?: Record<string, any>;
}

export interface ProposalSidebar {
  tools: ToolConfiguration[];
  aboutSection: AboutSection;
  testimonials: Testimonial[];
  blogPosts?: BlogPostPreview[];
  caseStudies?: CaseStudyPreview[];
}

export interface BlogPostPreview {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  publishedAt: Date;
  readingTime: number;
  relevanceScore?: number;
}

export interface CaseStudyPreview {
  id: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  results: string[];
  url: string;
  relevanceScore?: number;
}

export interface ProposalFooter {
  contactInfo: ContactInfo;
  nextSteps: string[];
  legalText?: string;
  socialLinks?: SocialLink[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface ProposalContent {
  hero: ProposalHero;
  sections: ProposalSection[];
  sidebar: ProposalSidebar;
  footer: ProposalFooter;
  customCSS?: string;
  customJS?: string;
}

// Interactive Elements Types
export interface ROICalculator {
  title: string;
  description: string;
  inputs: ROIInput[];
  formula: string;
  resultFormat: string;
}

export interface ROIInput {
  id: string;
  label: string;
  type: 'number' | 'currency' | 'percentage';
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
}

export interface TimelineSlider {
  title: string;
  description: string;
  minDuration: number;
  maxDuration: number;
  defaultDuration: number;
  milestones: TimelineMilestone[];
  pricingTiers?: PricingTier[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  duration: number;
  dependencies?: string[];
}

export interface PricingTier {
  id: string;
  name: string;
  basePrice: number;
  timeMultiplier: number;
  features: string[];
  recommended?: boolean;
}

export interface ScopeSelector {
  title: string;
  description: string;
  categories: ScopeCategory[];
  pricingModel: 'fixed' | 'hourly' | 'value-based';
}

export interface ScopeCategory {
  id: string;
  name: string;
  description: string;
  items: ScopeItem[];
  required?: boolean;
}

export interface ScopeItem {
  id: string;
  name: string;
  description: string;
  price: number;
  timeEstimate: number;
  selected: boolean;
  dependencies?: string[];
}

// URL Generation Types
export interface URLGenerationOptions {
  companyName: string;
  jobId?: string;
  customSlug?: string;
  includeTimestamp?: boolean;
  expirationDate?: Date;
}

export interface GeneratedURL {
  fullUrl: string;
  slug: string;
  shortCode: string;
  qrCode?: string;
  analytics: {
    trackingId: string;
    utmParameters?: Record<string, string>;
  };
}

// Component Library Types
export interface ProposalComponent {
  id: string;
  name: string;
  description: string;
  category: 'header' | 'content' | 'sidebar' | 'footer' | 'interactive';
  template: string;
  variables: ComponentVariable[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
}

export interface ComponentVariable {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
}

export interface ComponentVersion {
  id: string;
  componentId: string;
  version: number;
  template: string;
  variables: ComponentVariable[];
  changelog: string;
  createdAt: Date;
  isActive: boolean;
}

// Proposal Analytics Types
export interface AnalyticsConfiguration {
  trackingEnabled: boolean;
  trackingId: string;
  heatmapEnabled: boolean;
  recordingEnabled: boolean;
  customEvents: string[];
  retentionPeriod: number;
}

export interface ProposalView {
  id: string;
  proposalId: string;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  sessionId: string;
  duration?: number;
  exitPage?: string;
}

export interface InteractionEvent {
  id: string;
  proposalId: string;
  sessionId: string;
  eventType: string;
  elementId?: string;
  timestamp: Date;
  data?: Record<string, any>;
}

export interface ToolUsageEvent {
  id: string;
  proposalId: string;
  sessionId: string;
  toolId: string;
  action: 'opened' | 'used' | 'completed' | 'abandoned';
  timestamp: Date;
  duration?: number;
  result?: any;
}

export interface TimeSpentData {
  totalTime: number;
  sectionTimes: Record<string, number>;
  averageSessionTime: number;
  bounceRate: number;
  returnVisits: number;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  elementId?: string;
  timestamp: Date;
}

export interface ProposalAnalytics {
  proposalId: string;
  views: ProposalView[];
  interactions: InteractionEvent[];
  toolUsage: ToolUsageEvent[];
  timeSpent: TimeSpentData;
  heatmapData: HeatmapPoint[];
  conversionEvents: ConversionEvent[];
  generatedAt: Date;
}

// Performance Metrics Types
export interface PerformanceMetrics {
  proposalId: string;
  loadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  errorCount: number;
  timestamp: Date;
}
//
 AI-Powered Animated Client Questionnaire Types
export interface ClientQuestionnaire {
  id: string;
  proposalId: string;
  jobId: string;
  enabled: boolean;
  title: string;
  description: string;
  questions: QuestionnaireQuestion[];
  template: QuestionnaireTemplate;
  analytics: QuestionnaireAnalytics;
  settings: QuestionnaireSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  validation?: QuestionValidation;
  options?: QuestionOption[];
  logic?: QuestionLogic;
  animation?: QuestionAnimation;
}

export type QuestionType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'url'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'boolean'
  | 'slider'
  | 'rating'
  | 'file_upload'
  | 'signature';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  description?: string;
  icon?: string;
  color?: string;
}

export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  customMessage?: string;
}

export interface QuestionLogic {
  showIf?: LogicCondition[];
  hideIf?: LogicCondition[];
  skipTo?: string; // Question ID to skip to
}

export interface LogicCondition {
  questionId: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface QuestionAnimation {
  entrance: AnimationType;
  exit: AnimationType;
  duration: number;
  delay?: number;
}

export type AnimationType = 
  | 'fade_in'
  | 'slide_up'
  | 'slide_down'
  | 'slide_left'
  | 'slide_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'bounce_in'
  | 'flip_in';

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web_development' | 'mobile_app' | 'ai_consulting' | 'branding' | 'marketing' | 'custom';
  questions: QuestionnaireQuestion[];
  isDefault: boolean;
  usageCount: number;
  createdAt: Date;
}

export interface QuestionnaireSettings {
  theme: QuestionnaireTheme;
  progressBar: ProgressBarSettings;
  navigation: NavigationSettings;
  completion: CompletionSettings;
  branding: QuestionnaireBranding;
}

export interface QuestionnaireTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: number;
  spacing: 'compact' | 'comfortable' | 'spacious';
}

export interface ProgressBarSettings {
  enabled: boolean;
  style: 'bar' | 'dots' | 'steps' | 'percentage';
  position: 'top' | 'bottom';
  showPercentage: boolean;
  color: string;
}

export interface NavigationSettings {
  showPrevious: boolean;
  showNext: boolean;
  allowSkip: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  keyboardNavigation: boolean;
}

export interface CompletionSettings {
  thankYouMessage: string;
  redirectUrl?: string;
  redirectDelay: number;
  showSummary: boolean;
  allowEdit: boolean;
  sendConfirmationEmail: boolean;
}

export interface QuestionnaireBranding {
  logo?: string;
  companyName: string;
  headerText?: string;
  footerText?: string;
  customCSS?: string;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  sessionId: string;
  responses: ResponseAnswer[];
  metadata: ResponseMetadata;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt?: Date;
  timeSpent: number;
}

export interface ResponseAnswer {
  questionId: string;
  value: any;
  timestamp: Date;
  timeSpent: number;
}

export interface ResponseMetadata {
  userAgent: string;
  ipAddress?: string;
  referrer?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
  browserLanguage: string;
  timezone: string;
}

export interface QuestionnaireAnalytics {
  totalViews: number;
  totalStarted: number;
  totalCompleted: number;
  completionRate: number;
  averageTimeToComplete: number;
  dropOffPoints: DropOffAnalysis[];
  questionAnalytics: QuestionAnalytics[];
  responseDistribution: ResponseDistribution[];
  generatedAt: Date;
}

export interface DropOffAnalysis {
  questionId: string;
  questionTitle: string;
  dropOffCount: number;
  dropOffRate: number;
  averageTimeSpent: number;
}

export interface QuestionAnalytics {
  questionId: string;
  questionTitle: string;
  responseCount: number;
  skipCount: number;
  averageTimeSpent: number;
  validationErrors: number;
  mostCommonAnswers?: string[];
}

export interface ResponseDistribution {
  questionId: string;
  questionTitle: string;
  distribution: {
    value: string;
    count: number;
    percentage: number;
  }[];
}

export interface QuestionnaireSession {
  id: string;
  questionnaireId: string;
  currentQuestionId: string;
  responses: ResponseAnswer[];
  startedAt: Date;
  lastActivityAt: Date;
  metadata: ResponseMetadata;
  isActive: boolean;
}

export interface QuestionnaireBuilder {
  questionnaire: ClientQuestionnaire;
  currentQuestion: number;
  isPreviewMode: boolean;
  isDirty: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  questionId: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface QuestionnaireExport {
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  includeAnalytics: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  filters?: {
    status?: QuestionnaireResponse['status'][];
    completionRate?: {
      min: number;
      max: number;
    };
  };
}
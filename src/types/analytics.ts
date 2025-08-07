// Analytics System Types for Smart Proposal Generation System

export interface AnalyticsEvent {
  id: string;
  proposalId: string;
  sessionId: string;
  userId?: string;
  eventType: AnalyticsEventType;
  timestamp: Date;
  data: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

export type AnalyticsEventType = 
  | 'proposal_view'
  | 'section_view'
  | 'tool_interaction'
  | 'button_click'
  | 'form_submission'
  | 'download'
  | 'external_link_click'
  | 'scroll_depth'
  | 'time_on_page'
  | 'exit_intent'
  | 'conversion';

export interface SessionData {
  sessionId: string;
  proposalId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  pageViews: number;
  interactions: number;
  userAgent: string;
  ipAddress: string;
  referrer?: string;
  exitPage?: string;
  converted: boolean;
}

export interface ConversionFunnel {
  proposalId: string;
  totalViews: number;
  uniqueViews: number;
  toolInteractions: number;
  contactFormViews: number;
  contactFormSubmissions: number;
  externalLinkClicks: number;
  conversionRate: number;
  dropOffPoints: DropOffPoint[];
}

export interface DropOffPoint {
  section: string;
  viewCount: number;
  exitCount: number;
  dropOffRate: number;
}

export interface EngagementMetrics {
  proposalId: string;
  averageTimeOnPage: number;
  bounceRate: number;
  scrollDepth: number;
  interactionRate: number;
  returnVisitorRate: number;
  socialShares: number;
  engagementScore: number;
}

export interface PerformanceAnalytics {
  proposalId: string;
  loadTime: number;
  timeToInteractive: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  performanceScore: number;
  errorRate: number;
  timestamp: Date;
}

export interface HeatmapData {
  proposalId: string;
  elementId: string;
  x: number;
  y: number;
  clicks: number;
  hovers: number;
  scrolls: number;
  timestamp: Date;
}

export interface A11yMetrics {
  proposalId: string;
  accessibilityScore: number;
  violations: A11yViolation[];
  timestamp: Date;
}

export interface A11yViolation {
  rule: string;
  severity: 'minor' | 'moderate' | 'serious' | 'critical';
  element: string;
  description: string;
  impact: string;
}

export interface ComparisonMetrics {
  proposalId: string;
  comparisonProposalId: string;
  metric: string;
  value1: number;
  value2: number;
  percentageChange: number;
  significance: 'low' | 'medium' | 'high';
  period: DateRange;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface AnalyticsFilter {
  proposalIds?: string[];
  dateRange?: DateRange;
  eventTypes?: AnalyticsEventType[];
  userSegments?: string[];
  deviceTypes?: string[];
  trafficSources?: string[];
}

export interface AnalyticsQuery {
  metrics: string[];
  dimensions: string[];
  filters: AnalyticsFilter;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  query: AnalyticsQuery;
  data: AnalyticsDataPoint[];
  generatedAt: Date;
  scheduledFor?: Date;
  format: 'json' | 'csv' | 'pdf';
}

export interface AnalyticsDataPoint {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
  timestamp: Date;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string;
  widgets: AnalyticsWidget[];
  layout: DashboardLayout;
  filters: AnalyticsFilter;
  refreshInterval: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AnalyticsWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'heatmap' | 'funnel';
  title: string;
  query: AnalyticsQuery;
  visualization: VisualizationConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

export interface VisualizationConfig {
  chartType?: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  colors?: string[];
  showLegend?: boolean;
  showGrid?: boolean;
  xAxisLabel?: string;
  yAxisLabel?: string;
  format?: string;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface DashboardLayout {
  columns: number;
  rows: number;
  gridSize: number;
  responsive: boolean;
}

export interface AnalyticsAlert {
  id: string;
  name: string;
  description: string;
  condition: AlertCondition;
  threshold: number;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  recipients: string[];
  enabled: boolean;
  lastTriggered?: Date;
  createdAt: Date;
}

export interface AlertCondition {
  metric: string;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  value: number;
  timeWindow: number;
  aggregation: 'sum' | 'avg' | 'min' | 'max' | 'count';
}

export interface AnalyticsExport {
  id: string;
  reportId: string;
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  userCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SegmentCriteria {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'and' | 'or';
}

export interface AttributionModel {
  id: string;
  name: string;
  type: 'first-touch' | 'last-touch' | 'linear' | 'time-decay' | 'position-based';
  lookbackWindow: number;
  conversionEvents: string[];
  touchpoints: AttributionTouchpoint[];
}

export interface AttributionTouchpoint {
  channel: string;
  weight: number;
  position: number;
  timestamp: Date;
}

export interface CohortAnalysis {
  proposalId: string;
  cohortType: 'daily' | 'weekly' | 'monthly';
  cohorts: Cohort[];
  retentionRates: number[][];
  generatedAt: Date;
}

export interface Cohort {
  id: string;
  name: string;
  startDate: Date;
  userCount: number;
  conversionRate: number;
}

export interface RealTimeMetrics {
  activeUsers: number;
  activeProposals: string[];
  currentSessions: SessionData[];
  recentEvents: AnalyticsEvent[];
  systemHealth: SystemHealth;
  timestamp: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  responseTime: number;
  errorRate: number;
  throughput: number;
}
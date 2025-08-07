// CRM Integration Types for Smart Proposal Generation System

export interface CRMRecord {
  contactId: string;
  companyId: string;
  dealId?: string;
  stage: CRMStage;
  value?: number;
  probability?: number;
  expectedCloseDate?: Date;
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
  relationshipScore: number;
  interactions: CRMInteraction[];
  customFields?: Record<string, any>;
  tags?: string[];
  source?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CRMStage = 
  | 'lead'
  | 'qualified'
  | 'proposal_sent'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost'
  | 'on_hold';

export interface CRMInteraction {
  id: string;
  type: CRMInteractionType;
  timestamp: Date;
  description: string;
  outcome?: string;
  nextAction?: string;
  duration?: number;
  participants?: string[];
  attachments?: CRMAttachment[];
  metadata?: Record<string, any>;
}

export type CRMInteractionType = 
  | 'email'
  | 'call'
  | 'meeting'
  | 'proposal_sent'
  | 'proposal_viewed'
  | 'follow_up'
  | 'demo'
  | 'contract_sent'
  | 'payment_received'
  | 'project_kickoff';

export interface CRMAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

export interface CRMContact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  companyId: string;
  linkedinUrl?: string;
  timezone?: string;
  preferredContactMethod?: 'email' | 'phone' | 'linkedin';
  communicationStyle?: CommunicationStyle;
  decisionMakingRole?: DecisionRole;
  personalNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  lastContactedAt?: Date;
}

export interface CommunicationStyle {
  personality: 'analytical' | 'driver' | 'expressive' | 'amiable';
  preferredTone: 'formal' | 'casual' | 'friendly' | 'direct';
  responseTime: 'immediate' | 'same_day' | 'few_days' | 'weekly';
  meetingPreference: 'in_person' | 'video_call' | 'phone' | 'email';
  detailLevel: 'high' | 'medium' | 'low';
}

export type DecisionRole = 
  | 'decision_maker'
  | 'influencer'
  | 'champion'
  | 'gatekeeper'
  | 'end_user'
  | 'budget_holder';

export interface CRMCompany {
  id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  revenue?: string;
  location?: CRMAddress;
  description?: string;
  foundedYear?: number;
  techStack?: string[];
  fundingStatus?: FundingStatus;
  parentCompany?: string;
  subsidiaries?: string[];
  competitors?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  socialProfiles?: SocialProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export type CompanySize = 
  | 'startup'
  | 'small'
  | 'medium'
  | 'large'
  | 'enterprise';

export type FundingStatus = 
  | 'bootstrapped'
  | 'seed'
  | 'series_a'
  | 'series_b'
  | 'series_c'
  | 'ipo'
  | 'acquired';

export interface CRMAddress {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  timezone?: string;
}

export interface SocialProfile {
  platform: string;
  url: string;
  followers?: number;
  verified?: boolean;
}

export interface CRMDeal {
  id: string;
  name: string;
  companyId: string;
  contactId: string;
  stage: CRMStage;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  lostReason?: string;
  wonReason?: string;
  source: string;
  assignedTo: string;
  products?: DealProduct[];
  timeline?: DealTimeline[];
  competitors?: string[];
  tags?: string[];
  customFields?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DealProduct {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

export interface DealTimeline {
  id: string;
  stage: CRMStage;
  enteredAt: Date;
  exitedAt?: Date;
  duration?: number;
  notes?: string;
}

export interface CRMPipeline {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PipelineStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  probability: number;
  color?: string;
  automations?: StageAutomation[];
}

export interface StageAutomation {
  id: string;
  trigger: 'stage_entry' | 'stage_exit' | 'time_based' | 'field_change';
  condition?: string;
  action: AutomationAction;
  enabled: boolean;
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_field' | 'send_notification' | 'webhook';
  parameters: Record<string, any>;
  delay?: number;
}

export interface CRMTask {
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  dueDate?: Date;
  completedAt?: Date;
  assignedTo: string;
  relatedTo?: {
    type: 'contact' | 'company' | 'deal';
    id: string;
  };
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type TaskType = 
  | 'call'
  | 'email'
  | 'meeting'
  | 'follow_up'
  | 'demo'
  | 'proposal'
  | 'contract'
  | 'research'
  | 'other';

export interface CRMActivity {
  id: string;
  type: CRMInteractionType;
  subject: string;
  description?: string;
  timestamp: Date;
  duration?: number;
  outcome?: ActivityOutcome;
  participants: ActivityParticipant[];
  relatedTo: {
    type: 'contact' | 'company' | 'deal';
    id: string;
  };
  attachments?: CRMAttachment[];
  tags?: string[];
  createdBy: string;
  createdAt: Date;
}

export type ActivityOutcome = 
  | 'successful'
  | 'no_response'
  | 'rescheduled'
  | 'cancelled'
  | 'interested'
  | 'not_interested'
  | 'needs_follow_up';

export interface ActivityParticipant {
  contactId: string;
  role: 'organizer' | 'attendee' | 'optional';
  status: 'accepted' | 'declined' | 'tentative' | 'no_response';
}

export interface CRMReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  filters: ReportFilter[];
  metrics: string[];
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateRange: {
    startDate: Date;
    endDate: Date;
  };
  data?: ReportData[];
  generatedAt?: Date;
  scheduledFor?: Date;
  recipients?: string[];
  format: 'json' | 'csv' | 'pdf' | 'xlsx';
}

export type ReportType = 
  | 'sales_performance'
  | 'pipeline_analysis'
  | 'activity_summary'
  | 'conversion_rates'
  | 'revenue_forecast'
  | 'lead_sources'
  | 'custom';

export interface ReportFilter {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'in';
  value: any;
}

export interface ReportData {
  dimensions: Record<string, string>;
  metrics: Record<string, number>;
}

export interface CRMIntegration {
  id: string;
  name: string;
  type: 'email' | 'calendar' | 'social' | 'marketing' | 'support' | 'accounting';
  provider: string;
  status: 'connected' | 'disconnected' | 'error';
  configuration: Record<string, any>;
  lastSyncAt?: Date;
  syncFrequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CRMUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  territories?: string[];
  quotas?: UserQuota[];
  preferences: UserPreferences;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 
  | 'admin'
  | 'manager'
  | 'sales_rep'
  | 'marketing'
  | 'support'
  | 'viewer';

export interface Permission {
  resource: string;
  actions: string[];
}

export interface UserQuota {
  period: 'monthly' | 'quarterly' | 'yearly';
  target: number;
  achieved: number;
  currency?: string;
  startDate: Date;
  endDate: Date;
}

export interface UserPreferences {
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  language: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  types: string[];
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface DashboardPreferences {
  layout: string;
  widgets: string[];
  defaultView: string;
  refreshInterval: number;
}

export interface CRMMetrics {
  totalContacts: number;
  totalCompanies: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealSize: number;
  averageSalesCycle: number;
  pipelineValue: number;
  winRate: number;
  lossRate: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
  generatedAt: Date;
}
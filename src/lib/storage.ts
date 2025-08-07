// Enhanced localStorage utilities for Smart Proposal Generation System

import { JobRecord, CompanyAnalysis, ApplicationRecommendation } from '@/types/admin';
import { GeneratedProposal } from '@/types/proposal';
import { AnalyticsEvent } from '@/types/analytics';
import { CRMRecord } from '@/types/crm';

// Storage keys
const STORAGE_KEYS = {
  JOBS: 'smart_proposal_jobs',
  PROPOSALS: 'smart_proposal_proposals',
  ANALYTICS: 'smart_proposal_analytics',
  CRM_RECORDS: 'smart_proposal_crm',
  COMPANY_ANALYSES: 'smart_proposal_analyses',
  RECOMMENDATIONS: 'smart_proposal_recommendations',
  TOOL_CONFIGURATIONS: 'smart_proposal_tool_configs',
  BLOG_POSTS: 'smart_proposal_blog_posts',
  WIDGETS: 'smart_proposal_widgets',
  USER_PREFERENCES: 'smart_proposal_preferences',
} as const;

// Generic storage interface
interface StorageManager<T> {
  getAll(): T[];
  getById(id: string): T | null;
  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T;
  update(id: string, updates: Partial<T>): T | null;
  delete(id: string): boolean;
  clear(): void;
  search(query: (item: T) => boolean): T[];
}

// Base storage class
class BaseStorageManager<T extends { id: string; createdAt: Date; updatedAt: Date }> implements StorageManager<T> {
  constructor(private storageKey: string) {}

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getStorageData(): T[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error(`Error reading from localStorage key ${this.storageKey}:`, error);
      return [];
    }
  }

  private setStorageData(data: T[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to localStorage key ${this.storageKey}:`, error);
    }
  }

  getAll(): T[] {
    return this.getStorageData();
  }

  getById(id: string): T | null {
    const items = this.getStorageData();
    return items.find(item => item.id === id) || null;
  }

  create(itemData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const now = new Date();
    const item = {
      ...itemData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;

    const items = this.getStorageData();
    items.push(item);
    this.setStorageData(items);
    
    return item;
  }

  update(id: string, updates: Partial<T>): T | null {
    const items = this.getStorageData();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date(),
    };

    items[index] = updatedItem;
    this.setStorageData(items);
    
    return updatedItem;
  }

  delete(id: string): boolean {
    const items = this.getStorageData();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return false;

    items.splice(index, 1);
    this.setStorageData(items);
    
    return true;
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  search(query: (item: T) => boolean): T[] {
    return this.getStorageData().filter(query);
  }
}

// Specialized storage managers
export class JobStorageManager extends BaseStorageManager<JobRecord> {
  constructor() {
    super(STORAGE_KEYS.JOBS);
  }

  getByStatus(status: JobRecord['status']): JobRecord[] {
    return this.search(job => job.status === status);
  }

  getByCompany(companyName: string): JobRecord[] {
    return this.search(job => 
      job.companyName.toLowerCase().includes(companyName.toLowerCase())
    );
  }

  getRecentJobs(days: number = 30): JobRecord[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return this.search(job => job.createdAt >= cutoffDate)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  updateStatus(id: string, status: JobRecord['status']): JobRecord | null {
    return this.update(id, { status });
  }

  addNote(id: string, note: string, type: 'general' | 'follow_up' | 'meeting' | 'decision' = 'general'): JobRecord | null {
    const job = this.getById(id);
    if (!job) return null;

    const newNote = {
      id: `note-${Date.now()}`,
      content: note,
      createdAt: new Date(),
      type,
    };

    const updatedNotes = [...job.notes, newNote];
    return this.update(id, { notes: updatedNotes });
  }
}

export class ProposalStorageManager extends BaseStorageManager<GeneratedProposal> {
  constructor() {
    super(STORAGE_KEYS.PROPOSALS);
  }

  getByJobId(jobId: string): GeneratedProposal[] {
    return this.search(proposal => proposal.metadata.jobId === jobId);
  }

  getActiveProposals(): GeneratedProposal[] {
    return this.search(proposal => proposal.isActive);
  }

  getByUrl(url: string): GeneratedProposal | null {
    return this.search(proposal => proposal.url === url)[0] || null;
  }

  deactivateProposal(id: string): GeneratedProposal | null {
    return this.update(id, { isActive: false });
  }

  updateAnalytics(id: string, analytics: Partial<GeneratedProposal['analytics']>): GeneratedProposal | null {
    const proposal = this.getById(id);
    if (!proposal) return null;

    const updatedAnalytics = { ...proposal.analytics, ...analytics };
    return this.update(id, { analytics: updatedAnalytics });
  }
}

export class AnalyticsStorageManager {
  private storageKey = STORAGE_KEYS.ANALYTICS;

  private getStorageData(): AnalyticsEvent[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      }));
    } catch (error) {
      console.error('Error reading analytics from localStorage:', error);
      return [];
    }
  }

  private setStorageData(events: AnalyticsEvent[]): void {
    try {
      // Keep only the last 10,000 events to prevent localStorage bloat
      const limitedEvents = events.slice(-10000);
      localStorage.setItem(this.storageKey, JSON.stringify(limitedEvents));
    } catch (error) {
      console.error('Error writing analytics to localStorage:', error);
    }
  }

  trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): void {
    const analyticsEvent: AnalyticsEvent = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    const events = this.getStorageData();
    events.push(analyticsEvent);
    this.setStorageData(events);
  }

  getEventsByProposal(proposalId: string): AnalyticsEvent[] {
    return this.getStorageData().filter(event => event.proposalId === proposalId);
  }

  getEventsByType(eventType: AnalyticsEvent['eventType']): AnalyticsEvent[] {
    return this.getStorageData().filter(event => event.eventType === eventType);
  }

  getEventsInRange(startDate: Date, endDate: Date): AnalyticsEvent[] {
    return this.getStorageData().filter(event => 
      event.timestamp >= startDate && event.timestamp <= endDate
    );
  }

  clearOldEvents(daysToKeep: number = 90): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const events = this.getStorageData();
    const filteredEvents = events.filter(event => event.timestamp >= cutoffDate);
    this.setStorageData(filteredEvents);
  }
}

export class CompanyAnalysisStorageManager {
  private storageKey = STORAGE_KEYS.COMPANY_ANALYSES;

  private getStorageData(): (CompanyAnalysis & { id: string })[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      
      const parsed = JSON.parse(data);
      return parsed.map((analysis: any) => ({
        ...analysis,
        analysisTimestamp: new Date(analysis.analysisTimestamp),
      }));
    } catch (error) {
      console.error('Error reading company analyses from localStorage:', error);
      return [];
    }
  }

  private setStorageData(analyses: (CompanyAnalysis & { id: string })[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(analyses));
    } catch (error) {
      console.error('Error writing company analyses to localStorage:', error);
    }
  }

  save(analysis: CompanyAnalysis): CompanyAnalysis & { id: string } {
    const analysisWithId = {
      ...analysis,
      id: `analysis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    const analyses = this.getStorageData();
    analyses.push(analysisWithId);
    this.setStorageData(analyses);
    
    return analysisWithId;
  }

  getByCompany(companyName: string): (CompanyAnalysis & { id: string })[] {
    return this.getStorageData().filter(analysis => 
      analysis.companyProfile.name.toLowerCase().includes(companyName.toLowerCase())
    );
  }

  getRecent(limit: number = 10): (CompanyAnalysis & { id: string })[] {
    return this.getStorageData()
      .sort((a, b) => b.analysisTimestamp.getTime() - a.analysisTimestamp.getTime())
      .slice(0, limit);
  }

  delete(id: string): boolean {
    const analyses = this.getStorageData();
    const index = analyses.findIndex(analysis => analysis.id === id);
    
    if (index === -1) return false;

    analyses.splice(index, 1);
    this.setStorageData(analyses);
    
    return true;
  }
}

// User preferences storage
export class UserPreferencesManager {
  private storageKey = STORAGE_KEYS.USER_PREFERENCES;

  getPreferences(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading user preferences:', error);
      return {};
    }
  }

  setPreference(key: string, value: any): void {
    try {
      const preferences = this.getPreferences();
      preferences[key] = value;
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preference:', error);
    }
  }

  getPreference(key: string, defaultValue?: any): any {
    const preferences = this.getPreferences();
    return preferences[key] !== undefined ? preferences[key] : defaultValue;
  }

  removePreference(key: string): void {
    try {
      const preferences = this.getPreferences();
      delete preferences[key];
      localStorage.setItem(this.storageKey, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error removing user preference:', error);
    }
  }

  clearAllPreferences(): void {
    localStorage.removeItem(this.storageKey);
  }
}

// Export storage manager instances
export const jobStorage = new JobStorageManager();
export const proposalStorage = new ProposalStorageManager();
export const analyticsStorage = new AnalyticsStorageManager();
export const companyAnalysisStorage = new CompanyAnalysisStorageManager();
export const userPreferences = new UserPreferencesManager();

// Utility functions for data migration and cleanup
export const storageUtils = {
  // Export all data for backup
  exportAllData(): Record<string, any> {
    const data: Record<string, any> = {};
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      } catch (error) {
        console.error(`Error exporting data for key ${key}:`, error);
      }
    });
    
    return data;
  },

  // Import data from backup
  importAllData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error importing data for key ${key}:`, error);
      }
    });
  },

  // Clear all application data
  clearAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  },

  // Get storage usage statistics
  getStorageStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const value = localStorage.getItem(key);
        stats[key] = value ? new Blob([value]).size : 0;
      } catch (error) {
        stats[key] = 0;
      }
    });
    
    return stats;
  },

  // Check if localStorage is available
  isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  },
};
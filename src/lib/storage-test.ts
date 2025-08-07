// Storage System Test Suite
// Run this to verify localStorage functionality before database migration

import { 
  jobStorage, 
  proposalStorage, 
  analyticsStorage, 
  companyAnalysisStorage,
  userPreferences,
  storageUtils 
} from './storage';
import { JobRecord, CompanyAnalysis } from '@/types/admin';
import { GeneratedProposal } from '@/types/proposal';

export class StorageTestSuite {
  private testResults: { test: string; passed: boolean; error?: string }[] = [];

  private log(test: string, passed: boolean, error?: string) {
    this.testResults.push({ test, passed, error });
    console.log(`${passed ? '✅' : '❌'} ${test}${error ? `: ${error}` : ''}`);
  }

  async runAllTests(): Promise<boolean> {
    console.log('🧪 Starting Storage System Tests...\n');
    
    // Clear any existing test data
    this.clearTestData();
    
    // Run individual test suites
    await this.testJobStorage();
    await this.testProposalStorage();
    await this.testAnalyticsStorage();
    await this.testCompanyAnalysisStorage();
    await this.testUserPreferences();
    await this.testStorageUtils();
    
    // Summary
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const success = passed === total;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (!success) {
      console.log('\n❌ Failed tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`  - ${r.test}: ${r.error}`));
    }
    
    return success;
  }

  private clearTestData() {
    try {
      // Clear test data without affecting real data
      const testKeys = [
        'test_jobs',
        'test_proposals', 
        'test_analytics',
        'test_analyses',
        'test_preferences'
      ];
      
      testKeys.forEach(key => localStorage.removeItem(key));
      this.log('Clear test data', true);
    } catch (error) {
      this.log('Clear test data', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testJobStorage() {
    console.log('\n📋 Testing Job Storage...');
    
    try {
      // Test job creation
      const testJob = jobStorage.create({
        companyName: 'Test Company',
        personName: 'John Doe',
        jobDescription: 'Test job description for storage testing',
        applicationDate: new Date(),
        status: 'draft',
        proposalUrl: '/proposal/test-company-123',
        toolConfiguration: [],
        analytics: {
          proposalViews: 0,
          timeSpentOnProposal: 0,
          toolInteractions: 0,
          conversionEvents: [],
          engagementScore: 0
        },
        notes: []
      });
      
      this.log('Job creation', !!testJob.id);
      
      // Test job retrieval
      const retrievedJob = jobStorage.getById(testJob.id);
      this.log('Job retrieval', !!retrievedJob && retrievedJob.id === testJob.id);
      
      // Test job update
      const updatedJob = jobStorage.update(testJob.id, { status: 'sent' });
      this.log('Job update', !!updatedJob && updatedJob.status === 'sent');
      
      // Test job search by status
      const draftJobs = jobStorage.getByStatus('draft');
      const sentJobs = jobStorage.getByStatus('sent');
      this.log('Job search by status', sentJobs.length === 1 && draftJobs.length === 0);
      
      // Test job search by company
      const companyJobs = jobStorage.getByCompany('Test Company');
      this.log('Job search by company', companyJobs.length === 1);
      
      // Test adding notes
      const jobWithNote = jobStorage.addNote(testJob.id, 'Test note', 'general');
      this.log('Add job note', !!jobWithNote && jobWithNote.notes.length === 1);
      
      // Test recent jobs
      const recentJobs = jobStorage.getRecentJobs(30);
      this.log('Recent jobs retrieval', recentJobs.length >= 1);
      
      // Test job deletion
      const deleted = jobStorage.delete(testJob.id);
      this.log('Job deletion', deleted);
      
    } catch (error) {
      this.log('Job storage test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testProposalStorage() {
    console.log('\n📄 Testing Proposal Storage...');
    
    try {
      // Create a test job first
      const testJob = jobStorage.create({
        companyName: 'Proposal Test Company',
        personName: 'Jane Smith',
        jobDescription: 'Test job for proposal testing',
        applicationDate: new Date(),
        status: 'draft',
        proposalUrl: '/proposal/proposal-test-123',
        toolConfiguration: [],
        analytics: {
          proposalViews: 0,
          timeSpentOnProposal: 0,
          toolInteractions: 0,
          conversionEvents: [],
          engagementScore: 0
        },
        notes: []
      });

      // Test proposal creation
      const testProposal = proposalStorage.create({
        url: '/proposal/test-proposal-456',
        content: {
          hero: {
            headline: 'Test Proposal',
            subheadline: 'Testing proposal storage',
            ctaText: 'Get Started'
          },
          sections: [],
          sidebar: {
            tools: [],
            aboutSection: {
              title: 'About',
              content: 'Test content',
              highlights: [],
              credentials: []
            },
            testimonials: []
          },
          footer: {
            contactInfo: {
              name: 'Test User',
              title: 'Developer',
              email: 'test@example.com'
            },
            nextSteps: []
          }
        },
        metadata: {
          jobId: testJob.id,
          companyName: 'Proposal Test Company',
          personName: 'Jane Smith',
          generatedAt: new Date(),
          version: 1,
          templateVersion: '1.0',
          customizations: {
            colorScheme: {
              primary: '#000',
              secondary: '#fff',
              accent: '#blue',
              background: '#f5f5f5',
              text: '#333',
              muted: '#666'
            },
            branding: {
              companyName: 'Test Company',
              colors: {
                primary: '#000',
                secondary: '#fff',
                accent: '#blue',
                background: '#f5f5f5',
                text: '#333',
                muted: '#666'
              }
            },
            layout: {
              sidebarPosition: 'left',
              sidebarWidth: 'standard',
              contentLayout: 'single-column',
              headerStyle: 'standard'
            },
            interactiveElements: []
          }
        },
        analytics: {
          trackingEnabled: true,
          trackingId: 'test-tracking-id',
          heatmapEnabled: false,
          recordingEnabled: false,
          customEvents: [],
          retentionPeriod: 90
        },
        isActive: true
      });
      
      this.log('Proposal creation', !!testProposal.id);
      
      // Test proposal retrieval by job ID
      const jobProposals = proposalStorage.getByJobId(testJob.id);
      this.log('Proposal retrieval by job ID', jobProposals.length === 1);
      
      // Test active proposals
      const activeProposals = proposalStorage.getActiveProposals();
      this.log('Active proposals retrieval', activeProposals.length >= 1);
      
      // Test proposal by URL
      const urlProposal = proposalStorage.getByUrl('/proposal/test-proposal-456');
      this.log('Proposal retrieval by URL', !!urlProposal);
      
      // Test proposal deactivation
      const deactivated = proposalStorage.deactivateProposal(testProposal.id);
      this.log('Proposal deactivation', !!deactivated && !deactivated.isActive);
      
      // Cleanup
      proposalStorage.delete(testProposal.id);
      jobStorage.delete(testJob.id);
      
    } catch (error) {
      this.log('Proposal storage test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testAnalyticsStorage() {
    console.log('\n📊 Testing Analytics Storage...');
    
    try {
      // Test event tracking
      analyticsStorage.trackEvent({
        proposalId: 'test-proposal-123',
        sessionId: 'test-session-456',
        eventType: 'proposal_view',
        data: { page: 'home' }
      });
      
      // Test event retrieval by proposal
      const proposalEvents = analyticsStorage.getEventsByProposal('test-proposal-123');
      this.log('Analytics event tracking', proposalEvents.length === 1);
      
      // Test event retrieval by type
      const viewEvents = analyticsStorage.getEventsByType('proposal_view');
      this.log('Analytics event retrieval by type', viewEvents.length >= 1);
      
      // Test event retrieval by date range
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const rangeEvents = analyticsStorage.getEventsInRange(yesterday, now);
      this.log('Analytics event retrieval by date range', rangeEvents.length >= 1);
      
      // Test cleanup (this won't delete recent events)
      analyticsStorage.clearOldEvents(1); // Keep only 1 day
      this.log('Analytics cleanup', true);
      
    } catch (error) {
      this.log('Analytics storage test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testCompanyAnalysisStorage() {
    console.log('\n🏢 Testing Company Analysis Storage...');
    
    try {
      // Test analysis creation
      const testAnalysis: CompanyAnalysis = {
        companyProfile: {
          name: 'Test Analysis Company',
          industry: 'Technology',
          size: '50-200 employees',
          fundingStatus: 'Series A',
          techStack: ['React', 'Node.js'],
          recentNews: []
        },
        opportunityInsights: {
          budgetRange: '$10k-50k',
          timelineExpectation: '3-6 months',
          decisionMakers: ['CTO', 'CEO'],
          painPoints: ['Scalability', 'Performance'],
          successFactors: ['Technical expertise', 'Timeline adherence'],
          projectComplexity: 'medium',
          urgency: 'high'
        },
        competitiveAnalysis: {
          competitorCount: 5,
          competitiveAdvantages: ['AI expertise', 'Fast delivery'],
          differentiationOpportunities: ['Custom solutions'],
          marketPosition: 'Strong',
          competitiveLandscape: 'Competitive but manageable'
        },
        recommendedTools: [],
        riskAssessment: {
          riskLevel: 'low',
          riskFactors: ['Timeline pressure'],
          mitigationStrategies: ['Clear milestones'],
          confidenceScore: 0.85
        },
        analysisTimestamp: new Date(),
        analysisId: 'test-analysis-123'
      };
      
      const savedAnalysis = companyAnalysisStorage.save(testAnalysis);
      this.log('Company analysis creation', !!savedAnalysis.id);
      
      // Test retrieval by company
      const companyAnalyses = companyAnalysisStorage.getByCompany('Test Analysis Company');
      this.log('Company analysis retrieval by company', companyAnalyses.length === 1);
      
      // Test recent analyses
      const recentAnalyses = companyAnalysisStorage.getRecent(5);
      this.log('Recent company analyses', recentAnalyses.length >= 1);
      
      // Test deletion
      const deleted = companyAnalysisStorage.delete(savedAnalysis.id);
      this.log('Company analysis deletion', deleted);
      
    } catch (error) {
      this.log('Company analysis storage test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testUserPreferences() {
    console.log('\n⚙️ Testing User Preferences...');
    
    try {
      // Test setting preferences
      userPreferences.setPreference('theme', 'dark');
      userPreferences.setPreference('language', 'en');
      userPreferences.setPreference('notifications', { email: true, push: false });
      
      // Test getting preferences
      const theme = userPreferences.getPreference('theme');
      const language = userPreferences.getPreference('language');
      const notifications = userPreferences.getPreference('notifications');
      
      this.log('User preferences set/get', theme === 'dark' && language === 'en');
      this.log('User preferences complex object', notifications.email === true && notifications.push === false);
      
      // Test default values
      const nonExistent = userPreferences.getPreference('nonexistent', 'default');
      this.log('User preferences default value', nonExistent === 'default');
      
      // Test removing preferences
      userPreferences.removePreference('theme');
      const removedTheme = userPreferences.getPreference('theme');
      this.log('User preferences removal', removedTheme === undefined);
      
      // Test getting all preferences
      const allPrefs = userPreferences.getPreferences();
      this.log('User preferences get all', typeof allPrefs === 'object');
      
    } catch (error) {
      this.log('User preferences test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  private async testStorageUtils() {
    console.log('\n🛠️ Testing Storage Utils...');
    
    try {
      // Test storage availability
      const isAvailable = storageUtils.isStorageAvailable();
      this.log('Storage availability check', isAvailable);
      
      // Test storage stats
      const stats = storageUtils.getStorageStats();
      this.log('Storage stats retrieval', typeof stats === 'object');
      
      // Test data export
      const exportedData = storageUtils.exportAllData();
      this.log('Data export', typeof exportedData === 'object');
      
      // Test data import (using the same data)
      storageUtils.importAllData(exportedData);
      this.log('Data import', true);
      
    } catch (error) {
      this.log('Storage utils test suite', false, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // Method to run tests in browser console
  static async runInBrowser(): Promise<boolean> {
    const testSuite = new StorageTestSuite();
    return await testSuite.runAllTests();
  }
}

// Export for use in development
export const runStorageTests = StorageTestSuite.runInBrowser;
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Building2,
    Users,
    Settings,
    BarChart3,
    Briefcase,
    Plus,
    Trash2,
    Eye,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

// Import our storage utilities
import { jobStorage, companyAnalysisStorage, analyticsStorage } from '@/lib/storage';
import { companyAnalysisEngine, AnalysisProgress } from '@/lib/ai/company-analysis';
import { glmApiClient } from '@/lib/ai/glm-api';
import type { JobRecord, CompanyAnalysis } from '@/types/admin';

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState('company-research');
    const [jobs, setJobs] = useState<JobRecord[]>([]);
    const [analyses, setAnalyses] = useState<(CompanyAnalysis & { id: string })[]>([]);
    const [testResults, setTestResults] = useState<Record<string, boolean>>({});
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgress | null>(null);
    const [apiStatus, setApiStatus] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

    // Form states
    const [companyForm, setCompanyForm] = useState({
        companyName: '',
        personName: '',
        jobDescription: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setJobs(jobStorage.getAll());
        setAnalyses(companyAnalysisStorage.getRecent(10));
    };

    const handleCreateJob = async () => {
        if (!companyForm.companyName || !companyForm.personName || !companyForm.jobDescription) {
            alert('Please fill in all fields');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisProgress(null);

        try {
            // Create job first
            const newJob = jobStorage.create({
                companyName: companyForm.companyName,
                personName: companyForm.personName,
                jobDescription: companyForm.jobDescription,
                applicationDate: new Date(),
                status: 'draft',
                proposalUrl: `/proposal/${companyForm.companyName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
                toolConfiguration: [],
                analytics: {
                    proposalViews: 0,
                    timeSpentOnProposal: 0,
                    toolInteractions: 0,
                    lastViewedAt: undefined,
                    conversionEvents: [],
                    engagementScore: 0
                },
                notes: [],
                tags: ['new']
            });

            setJobs([newJob, ...jobs]);

            // Create mock analysis immediately (no API calls)
            const analysis = {
                analysisId: `analysis-${Date.now()}`,
                analysisTimestamp: new Date(),
                companyProfile: {
                    name: companyForm.companyName,
                    industry: 'Technology',
                    size: '50-200 employees',
                    fundingStatus: 'Series A',
                    techStack: ['React', 'Node.js'],
                    recentNews: []
                },
                opportunityInsights: {
                    budgetRange: '$10k-50k',
                    timelineExpectation: '3-6 months',
                    decisionMakers: [companyForm.personName],
                    painPoints: ['Need better website'],
                    successFactors: ['Fast delivery'],
                    projectComplexity: 'medium' as const,
                    urgency: 'high' as const
                },
                competitiveAnalysis: {
                    competitorCount: 5,
                    competitiveAdvantages: ['AI expertise'],
                    differentiationOpportunities: ['Custom solutions'],
                    marketPosition: 'Strong',
                    competitiveLandscape: 'Competitive'
                },
                recommendedTools: [],
                riskAssessment: {
                    riskLevel: 'low' as const,
                    riskFactors: [],
                    mitigationStrategies: [],
                    confidenceScore: 0.8
                }
            };

            // Save analysis and update job
            const savedAnalysis = companyAnalysisStorage.save(analysis);
            const updatedJob = jobStorage.update(newJob.id, { companyAnalysis: analysis });
            
            if (updatedJob) {
                setJobs(prev => prev.map(job => job.id === newJob.id ? updatedJob : job));
            }

            // Refresh analyses list
            setAnalyses(companyAnalysisStorage.getRecent(10));

            setCompanyForm({ companyName: '', personName: '', jobDescription: '' });

            // Track analytics event
            analyticsStorage.trackEvent({
                proposalId: newJob.proposalUrl,
                sessionId: `session-${Date.now()}`,
                eventType: 'proposal_view',
                data: { action: 'job_created_with_analysis', jobId: newJob.id, analysisId: analysis.analysisId }
            });

        } catch (error) {
            console.error('Job creation or analysis failed:', error);
            alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsAnalyzing(false);
            setAnalysisProgress(null);
        }
    };

    const handleDeleteJob = (jobId: string) => {
        if (confirm('Are you sure you want to delete this job?')) {
            jobStorage.delete(jobId);
            setJobs(jobs.filter(job => job.id !== jobId));
        }
    };

    const handleUpdateJobStatus = (jobId: string, status: JobRecord['status']) => {
        const updatedJob = jobStorage.updateStatus(jobId, status);
        if (updatedJob) {
            setJobs(jobs.map(job => job.id === jobId ? updatedJob : job));
        }
    };

    const runStorageTest = async (testName: string, testFn: () => Promise<boolean>) => {
        try {
            const result = await testFn();
            setTestResults(prev => ({ ...prev, [testName]: result }));
            return result;
        } catch (error) {
            console.error(`Test ${testName} failed:`, error);
            setTestResults(prev => ({ ...prev, [testName]: false }));
            return false;
        }
    };

    const testApiConnection = async () => {
        setApiStatus(null);
        try {
            const result = await glmApiClient.testConnection();
            setApiStatus(result);
        } catch (error) {
            setApiStatus({
                success: false,
                message: error instanceof Error ? error.message : 'Connection test failed'
            });
        }
    };

    const runAllTests = async () => {
        console.log('🧪 Running localStorage tests...');

        // Test 1: Create job
        await runStorageTest('create_job', async () => {
            const testJob = jobStorage.create({
                companyName: "Test Company",
                personName: "John Doe",
                jobDescription: "Test job description",
                applicationDate: new Date(),
                status: "draft",
                proposalUrl: "/proposal/test-123",
                toolConfiguration: [],
                analytics: { proposalViews: 0, timeSpentOnProposal: 0, toolInteractions: 0, conversionEvents: [], engagementScore: 0 },
                notes: [],
                tags: ["test"]
            });
            return !!testJob.id;
        });

        // Test 2: Update job
        await runStorageTest('update_job', async () => {
            const allJobs = jobStorage.getAll();
            const testJob = allJobs.find(job => job.companyName === "Test Company");
            if (testJob) {
                const updated = jobStorage.update(testJob.id, { status: "sent" });
                return updated?.status === "sent";
            }
            return false;
        });

        // Test 3: Company analysis
        await runStorageTest('company_analysis', async () => {
            const analysis = companyAnalysisStorage.save({
                analysisId: "test-analysis-123",
                companyProfile: {
                    name: "Test Company",
                    industry: "Technology",
                    size: "50-200 employees",
                    fundingStatus: "Series A",
                    techStack: ["React", "Node.js"],
                    recentNews: []
                },
                opportunityInsights: {
                    budgetRange: "$10k-50k",
                    timelineExpectation: "3-6 months",
                    decisionMakers: ["John Doe"],
                    painPoints: ["Need better website"],
                    successFactors: ["Fast delivery"],
                    projectComplexity: "medium",
                    urgency: "high"
                },
                competitiveAnalysis: {
                    competitorCount: 5,
                    competitiveAdvantages: ["AI expertise"],
                    differentiationOpportunities: ["Custom solutions"],
                    marketPosition: "Strong",
                    competitiveLandscape: "Competitive"
                },
                recommendedTools: [],
                riskAssessment: {
                    riskLevel: "low",
                    riskFactors: [],
                    mitigationStrategies: [],
                    confidenceScore: 0.8
                },
                analysisTimestamp: new Date()
            });
            return !!analysis.id;
        });

        // Test 4: Analytics
        await runStorageTest('analytics', async () => {
            analyticsStorage.trackEvent({
                proposalId: "test-proposal-123",
                sessionId: "test-session-123",
                eventType: "proposal_view",
                data: { page: "home" }
            });
            const events = analyticsStorage.getEventsByProposal("test-proposal-123");
            return events.length > 0;
        });

        // Cleanup test data
        const testJobs = jobStorage.search(job => job.companyName === "Test Company");
        testJobs.forEach(job => jobStorage.delete(job.id));

        const testAnalyses = companyAnalysisStorage.getByCompany("Test Company");
        testAnalyses.forEach(analysis => companyAnalysisStorage.delete(analysis.id));

        loadData();
    };

    const getStatusColor = (status: JobRecord['status']) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            viewed: 'bg-green-100 text-green-800',
            responded: 'bg-purple-100 text-purple-800',
            rejected: 'bg-red-100 text-red-800',
            hired: 'bg-emerald-100 text-emerald-800',
            archived: 'bg-gray-100 text-gray-600'
        };
        return colors[status] || colors.draft;
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Smart Proposal System - Admin Dashboard</h1>
                    <p className="text-zinc-400">Manage your proposal generation workflow</p>
                </div>

                {/* Storage Test Section */}
                <Card className="mb-6 bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            localStorage Testing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center mb-4">
                            <Button onClick={runAllTests} className="bg-blue-600 hover:bg-blue-700">
                                Run All Tests
                            </Button>
                            <Button onClick={testApiConnection} className="bg-green-600 hover:bg-green-700">
                                Test Z.ai API
                            </Button>
                            <div className="flex gap-2">
                                {Object.entries(testResults).map(([test, passed]) => (
                                    <Badge key={test} className={passed ? 'bg-green-600' : 'bg-red-600'}>
                                        {test}: {passed ? '✅' : '❌'}
                                    </Badge>
                                ))}
                                {apiStatus && (
                                    <Badge className={apiStatus.success ? 'bg-green-600' : 'bg-red-600'}>
                                        API: {apiStatus.success ? '✅' : '❌'} {apiStatus.latency ? `${apiStatus.latency}ms` : ''}
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Click "Run All Tests" to verify localStorage functionality. Check browser console for detailed results.
                        </p>
                    </CardContent>
                </Card>

                {/* Main Dashboard Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-5 bg-zinc-900">
                        <TabsTrigger value="company-research" className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Company Research
                        </TabsTrigger>
                        <TabsTrigger value="recommendations" className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Recommendations
                        </TabsTrigger>
                        <TabsTrigger value="sidebar-config" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Sidebar Config
                        </TabsTrigger>
                        <TabsTrigger value="manage-jobs" className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Manage Jobs
                        </TabsTrigger>
                        <TabsTrigger value="widgets" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Widgets
                        </TabsTrigger>
                    </TabsList>

                    {/* Company Research Tab */}
                    <TabsContent value="company-research">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Create New Job</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Input
                                        placeholder="Company Name"
                                        value={companyForm.companyName}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, companyName: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Input
                                        placeholder="Contact Person Name"
                                        value={companyForm.personName}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, personName: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white"
                                    />
                                    <Textarea
                                        placeholder="Job Description"
                                        value={companyForm.jobDescription}
                                        onChange={(e) => setCompanyForm(prev => ({ ...prev, jobDescription: e.target.value }))}
                                        className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
                                    />
                                    <Button
                                        onClick={handleCreateJob}
                                        disabled={isAnalyzing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        {isAnalyzing ? 'Analyzing...' : 'Create Job & Analyze'}
                                    </Button>

                                    {analysisProgress && (
                                        <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm text-white">{analysisProgress.message}</span>
                                                <span className="text-xs text-zinc-400">{analysisProgress.progress}%</span>
                                            </div>
                                            <div className="w-full bg-zinc-700 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${analysisProgress.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="bg-zinc-900 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-white">Recent Analyses</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {analyses.length === 0 ? (
                                        <p className="text-zinc-400">No analyses yet. Create a job to get started.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {analyses.slice(0, 5).map((analysis) => (
                                                <div key={analysis.id} className="p-3 bg-zinc-800 rounded-lg">
                                                    <div className="font-medium text-white">{analysis.companyProfile.name}</div>
                                                    <div className="text-sm text-zinc-400">
                                                        {analysis.companyProfile.industry} • {analysis.companyProfile.size}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 mt-1">
                                                        {analysis.analysisTimestamp.toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Manage Jobs Tab */}
                    <TabsContent value="manage-jobs">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">Job Pipeline ({jobs.length} jobs)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {jobs.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Briefcase className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                        <p className="text-zinc-400">No jobs yet. Create your first job in the Company Research tab.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {jobs.map((job) => (
                                            <div key={job.id} className="p-4 bg-zinc-800 rounded-lg">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-medium text-white">{job.companyName}</h3>
                                                            <Badge className={getStatusColor(job.status)}>
                                                                {job.status}
                                                            </Badge>
                                                            {job.tags?.map(tag => (
                                                                <Badge key={tag} variant="outline" className="text-xs">
                                                                    {tag}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-zinc-400 mb-1">Contact: {job.personName}</p>
                                                        <p className="text-xs text-zinc-500">
                                                            Created: {job.createdAt.toLocaleDateString()}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 truncate mt-1">
                                                            {job.jobDescription.substring(0, 100)}...
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 ml-4">
                                                        <select
                                                            value={job.status}
                                                            onChange={(e) => handleUpdateJobStatus(job.id, e.target.value as JobRecord['status'])}
                                                            className="bg-zinc-700 border-zinc-600 text-white text-xs rounded px-2 py-1"
                                                        >
                                                            <option value="draft">Draft</option>
                                                            <option value="sent">Sent</option>
                                                            <option value="viewed">Viewed</option>
                                                            <option value="responded">Responded</option>
                                                            <option value="rejected">Rejected</option>
                                                            <option value="hired">Hired</option>
                                                            <option value="archived">Archived</option>
                                                        </select>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="border-zinc-600 text-zinc-400 hover:text-white"
                                                        >
                                                            <Eye className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="border-red-600 text-red-400 hover:text-red-300"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Other tabs - placeholder content */}
                    <TabsContent value="recommendations">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">AI Recommendations</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <AlertCircle className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400">Recommendations will appear here after company analysis is complete.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sidebar-config">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">Tool Configuration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Settings className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400">Configure which tools appear in client proposals.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="widgets">
                        <Card className="bg-zinc-900 border-zinc-800">
                            <CardHeader>
                                <CardTitle className="text-white">System Widgets</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                                    <p className="text-zinc-400">Manage integrations and system utilities.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
# Smart Proposal System - Testing Guide

## 🧪 localStorage Testing Instructions

### Test 1: Basic Storage Functionality
**What to test:** Create and retrieve job records

**Steps:**
1. Go to: `http://localhost:3000` (your upworkdemo URL)
2. Open browser DevTools (F12)
3. Go to Console tab
4. Copy and paste this code:

```javascript
// Test 1: Create a job record
const { jobStorage } = await import('/src/lib/storage.js');
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
console.log("✅ Job created:", testJob);
```

**Expected Result:** Should see "✅ Job created:" followed by job object with ID
**Success:** YES / NO

---

### Test 2: Retrieve and Update Job
**What to test:** Get job by ID and update it

**Steps:**
1. In same console, paste:

```javascript
// Test 2: Get all jobs and update one
const allJobs = jobStorage.getAll();
console.log("📋 All jobs:", allJobs);

if (allJobs.length > 0) {
  const firstJob = allJobs[0];
  const updatedJob = jobStorage.update(firstJob.id, { status: "sent" });
  console.log("✅ Job updated:", updatedJob);
} else {
  console.log("❌ No jobs found");
}
```

**Expected Result:** Should see list of jobs, then updated job with status "sent"
**Success:** YES / NO

---

### Test 3: Company Analysis Storage
**What to test:** Save and retrieve company analysis

**Steps:**
1. In console, paste:

```javascript
// Test 3: Save company analysis
const { companyAnalysisStorage } = await import('/src/lib/storage.js');
const testAnalysis = companyAnalysisStorage.save({
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
console.log("✅ Analysis saved:", testAnalysis);
```

**Expected Result:** Should see "✅ Analysis saved:" with analysis object
**Success:** YES / NO

---

### Test 4: Search and Filter
**What to test:** Search functionality

**Steps:**
1. In console, paste:

```javascript
// Test 4: Search jobs by company
const searchResults = jobStorage.getByCompany("Test");
console.log("🔍 Search results:", searchResults);

const recentJobs = jobStorage.getRecentJobs(30);
console.log("📅 Recent jobs:", recentJobs);
```

**Expected Result:** Should find the test job in search results
**Success:** YES / NO

---

### Test 5: Analytics Storage
**What to test:** Track analytics events

**Steps:**
1. In console, paste:

```javascript
// Test 5: Track analytics event
const { analyticsStorage } = await import('/src/lib/storage.js');
analyticsStorage.trackEvent({
  proposalId: "test-proposal-123",
  sessionId: "test-session-123",
  eventType: "proposal_view",
  data: { page: "home" }
});

const events = analyticsStorage.getEventsByProposal("test-proposal-123");
console.log("📊 Analytics events:", events);
```

**Expected Result:** Should see analytics event created and retrieved
**Success:** YES / NO

---

### Test 6: Data Export/Import
**What to test:** Backup and restore functionality

**Steps:**
1. In console, paste:

```javascript
// Test 6: Export all data
const { storageUtils } = await import('/src/lib/storage.js');
const exportedData = storageUtils.exportAllData();
console.log("💾 Exported data keys:", Object.keys(exportedData));

const stats = storageUtils.getStorageStats();
console.log("📈 Storage stats:", stats);
```

**Expected Result:** Should see exported data keys and storage statistics
**Success:** YES / NO

---

### Test 7: Clean Up Test Data
**What to test:** Delete test records

**Steps:**
1. In console, paste:

```javascript
// Test 7: Clean up test data
const allJobs = jobStorage.getAll();
const testJobs = allJobs.filter(job => job.companyName === "Test Company");
testJobs.forEach(job => {
  jobStorage.delete(job.id);
  console.log("🗑️ Deleted job:", job.id);
});

const analyses = companyAnalysisStorage.getByCompany("Test Company");
analyses.forEach(analysis => {
  companyAnalysisStorage.delete(analysis.id);
  console.log("🗑️ Deleted analysis:", analysis.id);
});

console.log("✅ Cleanup complete");
```

**Expected Result:** Should see deletion confirmations
**Success:** YES / NO

---

## 📋 Test Results Summary

| Test | Description | Result | Notes |
|------|-------------|--------|-------|
| 1 | Create Job Record | ⬜ YES / ⬜ NO | |
| 2 | Update Job Record | ⬜ YES / ⬜ NO | |
| 3 | Company Analysis | ⬜ YES / ⬜ NO | |
| 4 | Search & Filter | ⬜ YES / ⬜ NO | |
| 5 | Analytics Tracking | ⬜ YES / ⬜ NO | |
| 6 | Data Export | ⬜ YES / ⬜ NO | |
| 7 | Data Cleanup | ⬜ YES / ⬜ NO | |

## 🚨 If Any Test Fails

1. Check browser console for error messages
2. Verify you're on the correct URL
3. Make sure the storage.js file exists at `/src/lib/storage.js`
4. Try refreshing the page and running the test again

## ✅ All Tests Pass?

If all tests pass, localStorage is working correctly and we can proceed to create the Supabase migration SQL.

## ❌ Tests Failing?

If tests fail, we need to fix the localStorage implementation before moving to database setup.

---

**Next Step After Testing:** 
- If localStorage tests pass → Create Supabase migration SQL
- If localStorage tests fail → Debug and fix storage issues first
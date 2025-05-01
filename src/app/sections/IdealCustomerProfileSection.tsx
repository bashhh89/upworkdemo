'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Briefcase, 
  Search, 
  AlertCircle, 
  Target, 
  MessageSquare, 
  Image as ImageIcon, 
  Download, 
  Clipboard, 
  Check, 
  ArrowRight, 
  UserPlus,
  Building2,
  Link,
  Plus,
  Trash2,
  FileText,
  Lightbulb,
  Zap,
  Mail,
  Phone
} from 'lucide-react';

// Define interfaces for our data structures
interface CustomerInput {
  id: string;
  companyName: string;
  contactName: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  notes?: string;
}

interface ProspectingParameters {
  jobTitles: string[];
  industries: string[];
  companySize: string;
  onlineCommunities: string[];
  contentInterests: string[];
  technographics?: string[];
  searchKeywords: string[];
}

interface EngagementStrategy {
  messagingTips: string[];
  keyMotivators: string[];
  decisionTriggers: string[];
  objectionHandling?: string[];
  outreachTemplates?: {
    email?: string;
    linkedin?: string;
    cold_call?: string;
  };
}

interface ICPReport {
  personaProfile: string;
  prospectingParameters: ProspectingParameters;
  engagementStrategy: EngagementStrategy;
  visualConcepts?: {
    personaImage?: string;
    linkedinTemplate?: string;
    emailTemplate?: string;
  };
}

// Error display component
function ErrorDisplay({ error, onRetry }: { error: any, onRetry: () => void }) {
  return (
    <Card className="bg-near-black border-light-gray p-6 text-white">
      <CardHeader>
        <div className="flex items-center">
          <AlertCircle className="text-red-400 mr-2" />
          <CardTitle>Something went wrong</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400">{error.message || "An unexpected error occurred"}</p>
        {error.details && (
          <div className="mt-4 p-4 bg-black/30 rounded-md text-sm text-gray-400 border border-red-900/20">
            <p className="mb-2 text-red-400 font-medium text-xs uppercase">Details:</p>
            <p>{error.details}</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onRetry}>Try Again</Button>
      </CardFooter>
    </Card>
  );
}

export function IdealCustomerProfileSection() {
  // State variables
  const [customerInputs, setCustomerInputs] = useState<CustomerInput[]>([
    { id: "1", companyName: "", contactName: "" }
  ]);
  const [yourCompanyName, setYourCompanyName] = useState<string>("");
  const [yourIndustry, setYourIndustry] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<any>(null);
  const [icpReport, setIcpReport] = useState<ICPReport | null>(null);
  const [activeTab, setActiveTab] = useState<string>("customer-inputs");
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Add a new customer input field
  const addCustomerInput = () => {
    setCustomerInputs(prev => [
      ...prev, 
      { 
        id: `${Date.now()}`, 
        companyName: "", 
        contactName: "" 
      }
    ]);
  };

  // Remove a customer input field
  const removeCustomerInput = (id: string) => {
    if (customerInputs.length <= 1) return; // Keep at least one input
    setCustomerInputs(prev => prev.filter(input => input.id !== id));
  };

  // Update a customer input field
  const updateCustomerInput = (id: string, field: keyof CustomerInput, value: string) => {
    setCustomerInputs(prev => 
      prev.map(input => 
        input.id === id ? { ...input, [field]: value } : input
      )
    );
  };

  // Handle copy to clipboard
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Reset form
  const handleReset = () => {
    setCustomerInputs([{ id: "1", companyName: "", contactName: "" }]);
    setYourCompanyName("");
    setYourIndustry("");
    setIcpReport(null);
    setError(null);
    setActiveTab("customer-inputs");
  };

  // Generate ICP Report
  const handleGenerateICP = async () => {
    // Validate inputs
    if (customerInputs.some(input => !input.companyName.trim())) {
      setError({ message: "Please fill in at least one company name" });
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.floor(Math.random() * 8);
      });
    }, 1000);
    
    try {
      // Step 1: Prepare the customer data for analysis
      const customerData = customerInputs
        .filter(input => input.companyName.trim())
        .map(input => ({
          company: input.companyName,
          contact: input.contactName,
          linkedin: input.linkedinUrl || "",
          website: input.websiteUrl || "",
          notes: input.notes || ""
        }));
      
      // Step 2: Generate the ICP analysis using searchgpt
      const promptForICPAnalysis = `
        Analyze the following list of successful customer examples to generate a detailed Ideal Customer Profile (ICP):
        
        ${JSON.stringify(customerData, null, 2)}
        
        Additional context about our company:
        Company Name: ${yourCompanyName || "Our company"}
        Industry: ${yourIndustry || "Not specified"}
        
        Find common patterns in their job titles, industries, company sizes, online activities (if discoverable),
        potential challenges, and motivations. Synthesize this into a detailed Ideal Customer Profile (ICP).
        
        Format the response as a VALID JSON object with these exact keys:
        {
          "personaProfile": "Detailed description of the ideal customer archetype, their motivations, challenges, and decision-making style.",
          "prospectingParameters": {
            "jobTitles": ["Relevant job title 1", "Relevant job title 2", ...],
            "industries": ["Industry 1", "Industry 2", ...],
            "companySize": "Description of ideal company size range",
            "onlineCommunities": ["Community 1", "Community 2", ...],
            "contentInterests": ["Interest 1", "Interest 2", ...],
            "technographics": ["Technology 1", "Technology 2", ...],
            "searchKeywords": ["Keyword 1", "Keyword 2", ...]
          },
          "engagementStrategy": {
            "messagingTips": ["Tip 1", "Tip 2", ...],
            "keyMotivators": ["Motivator 1", "Motivator 2", ...],
            "decisionTriggers": ["Trigger 1", "Trigger 2", ...],
            "objectionHandling": ["Objection response 1", "Objection response 2", ...],
            "outreachTemplates": {
              "email": "Email template with placeholders",
              "linkedin": "LinkedIn message template with placeholders",
              "cold_call": "Cold call script outline"
            }
          }
        }
        
        Focus on extracting actionable insights from the examples provided. If information is limited, make reasonable inferences
        based on the company names, websites, and any other available data. The goal is to create a practical ICP
        that sales and marketing teams can use to find and engage similar prospects.
      `;
      
      // Real API call to Pollinations searchgpt
      const icpResponse = await fetch('/api/pollinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "searchgpt",
          messages: [
            { role: "user", content: promptForICPAnalysis }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });
      
      if (!icpResponse.ok) {
        throw new Error(`ICP analysis failed with status: ${icpResponse.status}`);
      }
      
      const icpData = await icpResponse.json();
      let parsedIcpReport: ICPReport;
      
      if (icpData.content) {
        try {
          parsedIcpReport = JSON.parse(icpData.content);
        } catch (parseError) {
          console.error("Failed to parse ICP report:", parseError);
          throw new Error("Failed to parse ICP analysis results");
        }
      } else {
        throw new Error("Invalid response format from API");
      }
      
      // Step 3: Generate visual concepts for the ICP
      let visualConcepts = {
        personaImage: undefined,
        linkedinTemplate: undefined,
        emailTemplate: undefined
      };
      
      try {
        // Generate persona image
        const personaPrompt = `A professional abstract visualization of a ${parsedIcpReport.prospectingParameters.jobTitles[0]} in the ${parsedIcpReport.prospectingParameters.industries[0]} industry, ${parsedIcpReport.prospectingParameters.searchKeywords.slice(0, 3).join(', ')}, minimalist design, blue and teal color scheme`;
        
        const encodedPersonaPrompt = encodeURIComponent(personaPrompt);
        visualConcepts.personaImage = `https://image.pollinations.ai/prompt/${encodedPersonaPrompt}?width=800&height=600&noCache=true&model=flux`;
        
        // Generate LinkedIn template
        const linkedinPrompt = `Professional LinkedIn post template targeting ${parsedIcpReport.prospectingParameters.jobTitles.slice(0, 2).join(' or ')} in ${parsedIcpReport.prospectingParameters.industries[0]}, theme: ${parsedIcpReport.engagementStrategy.keyMotivators[0]}, modern design, abstract elements, blue color scheme, space for text overlay`;
        
        const encodedLinkedinPrompt = encodeURIComponent(linkedinPrompt);
        visualConcepts.linkedinTemplate = `https://image.pollinations.ai/prompt/${encodedLinkedinPrompt}?width=1200&height=628&noCache=true&model=flux`;
        
        // Generate email header template
        const emailPrompt = `Email header image design for ${parsedIcpReport.prospectingParameters.jobTitles[0]}, ${parsedIcpReport.prospectingParameters.industries[0]} industry, clean professional style, subtle technology elements, blue gradient background`;
        
        const encodedEmailPrompt = encodeURIComponent(emailPrompt);
        visualConcepts.emailTemplate = `https://image.pollinations.ai/prompt/${encodedEmailPrompt}?width=600&height=200&noCache=true&model=flux`;
        
        // Add visual concepts to the ICP report
        parsedIcpReport.visualConcepts = visualConcepts;
      } catch (visualError) {
        console.error("Error generating visual concepts:", visualError);
        // Continue even if visuals fail
      }
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      
      // Update state with the generated ICP report
      setIcpReport(parsedIcpReport);
      
    } catch (error) {
      console.error("Error generating ICP report:", error);
      clearInterval(progressInterval);
      setError({
        message: error instanceof Error ? error.message : "Failed to generate ICP report",
        details: error instanceof Error ? error.stack : "Unknown error occurred"
      });
    } finally {
      setIsAnalyzing(false);
      // Reset progress after delay
      setTimeout(() => {
        if (progress === 100) {
          setProgress(0);
        }
      }, 1000);
    }
  };

  // Download report as text
  const handleDownload = () => {
    if (!icpReport) return;
    
    let reportText = `
IDEAL CUSTOMER PROFILE & OUTREACH PLAYBOOK
==========================================
Generated: ${new Date().toLocaleDateString()}
Your Company: ${yourCompanyName || "Not specified"}
Your Industry: ${yourIndustry || "Not specified"}

WHO THEY ARE
-----------
${icpReport.personaProfile}

HOW TO FIND THEM
---------------
Job Titles: ${icpReport.prospectingParameters.jobTitles.join(', ')}
Industries: ${icpReport.prospectingParameters.industries.join(', ')}
Company Size: ${icpReport.prospectingParameters.companySize}
Online Communities: ${icpReport.prospectingParameters.onlineCommunities.join(', ')}
Content Interests: ${icpReport.prospectingParameters.contentInterests.join(', ')}
${icpReport.prospectingParameters.technographics ? `Technographics: ${icpReport.prospectingParameters.technographics.join(', ')}\n` : ''}
Search Keywords: ${icpReport.prospectingParameters.searchKeywords.join(', ')}

HOW TO ENGAGE THEM
-----------------
Messaging Tips:
${icpReport.engagementStrategy.messagingTips.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}

Key Motivators:
${icpReport.engagementStrategy.keyMotivators.map((motivator, i) => `- ${motivator}`).join('\n')}

Decision Triggers:
${icpReport.engagementStrategy.decisionTriggers.map((trigger, i) => `- ${trigger}`).join('\n')}

${icpReport.engagementStrategy.objectionHandling ? `
Objection Handling:
${icpReport.engagementStrategy.objectionHandling.map((objection, i) => `- ${objection}`).join('\n')}
` : ''}

${icpReport.engagementStrategy.outreachTemplates ? `
OUTREACH TEMPLATES
-----------------
${icpReport.engagementStrategy.outreachTemplates.email ? `
Email Template:
${icpReport.engagementStrategy.outreachTemplates.email}
` : ''}

${icpReport.engagementStrategy.outreachTemplates.linkedin ? `
LinkedIn Message:
${icpReport.engagementStrategy.outreachTemplates.linkedin}
` : ''}

${icpReport.engagementStrategy.outreachTemplates.cold_call ? `
Cold Call Script:
${icpReport.engagementStrategy.outreachTemplates.cold_call}
` : ''}
` : ''}

${icpReport.visualConcepts ? `
VISUAL CONCEPTS
--------------
${icpReport.visualConcepts.personaImage ? `Persona Image: ${icpReport.visualConcepts.personaImage}` : ''}
${icpReport.visualConcepts.linkedinTemplate ? `LinkedIn Template: ${icpReport.visualConcepts.linkedinTemplate}` : ''}
${icpReport.visualConcepts.emailTemplate ? `Email Header Template: ${icpReport.visualConcepts.emailTemplate}` : ''}
` : ''}

Generated by: Deliver AI Platform
Note: This ICP is generated using AI analysis of your ideal customer examples. Use it as a starting point for your prospecting and outreach strategies.
`;

    const blob = new Blob([reportText.trim()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ideal-customer-profile-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Render the input form if no report yet
  if (!icpReport) {
    return (
      <div className="w-full max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Ideal Customer Profile <span className="text-sky-400">Generator</span></h2>
        <p className="text-muted-gray mb-6">Create a comprehensive ICP and outreach playbook by analyzing your best existing customers.</p>
        
        {/* Error display */}
        {error && (
          <div className="mb-6">
            <ErrorDisplay error={error} onRetry={() => setError(null)} />
          </div>
        )}
        
        {/* Input form */}
        <Card className="bg-near-black border-light-gray mb-8 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Users className="h-5 w-5 text-sky-400 mr-2" />
              Customer Analysis Inputs
            </CardTitle>
            <CardDescription>
              Enter details about your most successful customers to generate your ideal customer profile
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Your company information */}
            <div className="bg-black/40 p-4 rounded-md border border-light-gray/30">
              <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                <Building2 className="h-4 w-4 mr-2 text-sky-400" />
                Your Company Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Your Company Name</label>
                  <Input
                    value={yourCompanyName}
                    onChange={(e) => setYourCompanyName(e.target.value)}
                    placeholder="e.g., Acme Software Solutions"
                    className="bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-400">Your Industry</label>
                  <Input
                    value={yourIndustry}
                    onChange={(e) => setYourIndustry(e.target.value)}
                    placeholder="e.g., SaaS, Financial Services, Healthcare"
                    className="bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                  />
                </div>
              </div>
            </div>
            
            {/* Customer inputs */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3 flex items-center">
                <UserPlus className="h-4 w-4 mr-2 text-indigo-400" />
                Your Ideal Customer Examples
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Add 3-5 of your best customers. The more details you provide, the more accurate your ICP will be.
              </p>
              
              <div className="space-y-4">
                {customerInputs.map((input, index) => (
                  <div key={input.id} className="bg-black/30 p-4 rounded-md border border-light-gray/30">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-sm font-medium text-white">Customer {index + 1}</h4>
                      {customerInputs.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCustomerInput(input.id)}
                          className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">Company Name*</label>
                        <Input
                          value={input.companyName}
                          onChange={(e) => updateCustomerInput(input.id, 'companyName', e.target.value)}
                          placeholder="e.g., Tesla, Microsoft, Nike"
                          className="bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">Contact Name</label>
                        <Input
                          value={input.contactName}
                          onChange={(e) => updateCustomerInput(input.id, 'contactName', e.target.value)}
                          placeholder="e.g., John Smith"
                          className="bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">LinkedIn URL (Optional)</label>
                        <div className="relative">
                          <Link className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                          <Input
                            value={input.linkedinUrl || ''}
                            onChange={(e) => updateCustomerInput(input.id, 'linkedinUrl', e.target.value)}
                            placeholder="www.linkedin.com/company/..."
                            className="pl-8 bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-400">Website URL (Optional)</label>
                        <div className="relative">
                          <Link className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                          <Input
                            value={input.websiteUrl || ''}
                            onChange={(e) => updateCustomerInput(input.id, 'websiteUrl', e.target.value)}
                            placeholder="www.company.com"
                            className="pl-8 bg-black border-light-gray/50 text-white placeholder:text-muted-gray h-9"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-400">Notes (Optional)</label>
                      <Textarea
                        value={input.notes || ''}
                        onChange={(e) => updateCustomerInput(input.id, 'notes', e.target.value)}
                        placeholder="Why is this a great customer? What makes them ideal? Any specific characteristics worth noting?"
                        className="bg-black border-light-gray/50 text-white placeholder:text-muted-gray min-h-[60px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={addCustomerInput}
                className="mt-4"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Another Customer
              </Button>
            </div>
            
            <div className="bg-sky-950/20 border border-sky-800/30 rounded-md p-3 text-sm">
              <div className="flex items-start">
                <Search className="h-4 w-4 text-sky-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sky-300">
                  Our AI will analyze your input and search for information about these companies to build your ICP.
                </p>
              </div>
            </div>
            
            {/* Progress bar for loading state */}
            {isAnalyzing && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-gray">Analyzing customer data</span>
                  <span className="text-sky-400">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1" />
                <p className="text-xs text-muted-gray mt-2 italic">
                  {progress < 30 ? "Gathering information about your customers..." : 
                   progress < 60 ? "Identifying patterns and shared characteristics..." : 
                   progress < 90 ? "Generating ICP and outreach strategies..." : 
                   "Creating visual concepts..."}
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="border-t border-light-gray pt-4 flex justify-end gap-2">
            <Button 
              variant="outline"
              onClick={handleReset}
              disabled={isAnalyzing}
              className="rounded-md"
            >
              Reset Form
            </Button>
            <Button 
              onClick={handleGenerateICP}
              disabled={isAnalyzing || customerInputs.some(input => !input.companyName.trim())}
              className="bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 rounded-md"
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"/>
                  Analyzing...
                </span>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Generate ICP
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Render the ICP report
  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-500">
      <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-white">Ideal Customer Profile <span className="text-sky-400">Report</span></h2>
      <p className="text-muted-gray mb-6">Your comprehensive ICP and outreach playbook based on your best customers.</p>
      
      {/* ICP header card */}
      <Card className="bg-near-black border-light-gray mb-6 overflow-hidden">
        <div className="bg-gradient-to-r from-sky-900/20 to-indigo-900/20 p-4 sm:p-6 border-b border-light-gray">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Customer Profile Analysis</h3>
              <p className="text-sm text-gray-400 mt-1">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleCopy(JSON.stringify(icpReport, null, 2), "JSON")}
                className="h-9"
              >
                {copiedText === "JSON" ? (
                  <>
                    <Check className="mr-1 h-4 w-4 text-green-400" />
                    <span className="text-green-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="mr-1 h-4 w-4" />
                    Copy JSON
                  </>
                )}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleDownload}
                className="h-9"
              >
                <Download className="mr-1 h-4 w-4" />
                Download
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleReset}
                className="h-9"
              >
                <ArrowRight className="mr-1 h-4 w-4" />
                New Analysis
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Tabbed content */}
      <Tabs defaultValue="persona" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8 p-1 bg-black rounded-lg border border-light-gray/50 shadow-lg">
          <TabsTrigger 
            value="persona" 
            className="text-base font-medium py-3 data-[state=active]:bg-sky-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-sky-400 transition-all duration-200"
          >
            <Users className="h-5 w-5 mr-2" />
            Persona Profile
          </TabsTrigger>
          <TabsTrigger 
            value="prospecting" 
            className="text-base font-medium py-3 data-[state=active]:bg-indigo-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-400 transition-all duration-200"
          >
            <Target className="h-5 w-5 mr-2" />
            Prospecting
          </TabsTrigger>
          <TabsTrigger 
            value="engagement" 
            className="text-base font-medium py-3 data-[state=active]:bg-purple-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-purple-400 transition-all duration-200"
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Engagement
          </TabsTrigger>
          <TabsTrigger 
            value="visuals" 
            className="text-base font-medium py-3 data-[state=active]:bg-emerald-900/40 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=inactive]:text-gray-400 data-[state=active]:border-b-2 data-[state=active]:border-emerald-400 transition-all duration-200"
          >
            <ImageIcon className="h-5 w-5 mr-2" />
            Visual Concepts
          </TabsTrigger>
        </TabsList>
        
        {/* Persona Tab */}
        <TabsContent value="persona" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-sky-400 mr-3 rounded-sm"></div>
                Ideal Customer Persona
              </CardTitle>
              <CardDescription>
                Detailed profile of your ideal customer based on analysis of your best customers
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-white mb-4">Who They Are</h4>
                  <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                    <p className="text-gray-300 whitespace-pre-line">
                      {icpReport.personaProfile}
                    </p>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Key Motivators</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {icpReport.engagementStrategy.keyMotivators.map((motivator, index) => (
                        <div key={index} className="flex items-center bg-sky-900/10 border border-sky-800/30 p-3 rounded-md">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-900/30 text-sky-400 flex items-center justify-center mr-3">
                            <Zap className="h-4 w-4" />
                          </div>
                          <p className="text-gray-300">{motivator}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {icpReport.visualConcepts?.personaImage && (
                  <div className="w-full md:w-72 md:flex-shrink-0">
                    <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                      <div className="aspect-square relative overflow-hidden">
                        <img 
                          src={icpReport.visualConcepts.personaImage} 
                          alt="Ideal Customer Persona Visualization" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/111827/6B7280/png?text=Persona+Image'}
                        />
                      </div>
                      <div className="p-3 text-center">
                        <p className="text-xs text-gray-400">AI-generated visualization of your ideal customer</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2 w-full text-xs"
                          onClick={() => window.open(icpReport.visualConcepts?.personaImage, '_blank')}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download Image
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Prospecting Tab */}
        <TabsContent value="prospecting" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-indigo-400 mr-3 rounded-sm"></div>
                How To Find Them
              </CardTitle>
              <CardDescription>
                Specific parameters to target your ideal customers in prospecting activities
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Titles */}
                <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-indigo-400" />
                    Job Titles to Target
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {icpReport.prospectingParameters.jobTitles.map((title, index) => (
                      <span key={index} className="px-2 py-1 bg-indigo-900/20 border border-indigo-800/30 rounded-full text-xs text-indigo-300">
                        {title}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Industries */}
                <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-sky-400" />
                    Target Industries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {icpReport.prospectingParameters.industries.map((industry, index) => (
                      <span key={index} className="px-2 py-1 bg-sky-900/20 border border-sky-800/30 rounded-full text-xs text-sky-300">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Company Size */}
                <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-emerald-400" />
                    Company Size
                  </h4>
                  <p className="text-gray-300 text-sm">{icpReport.prospectingParameters.companySize}</p>
                </div>
              </div>
              
              {/* Additional parameters */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Online Communities */}
                <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-purple-400" />
                    Online Communities
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {icpReport.prospectingParameters.onlineCommunities.map((community, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-900/20 border border-purple-800/30 rounded-full text-xs text-purple-300">
                        {community}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Content Interests */}
                <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-amber-400" />
                    Content Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {icpReport.prospectingParameters.contentInterests.map((interest, index) => (
                      <span key={index} className="px-2 py-1 bg-amber-900/20 border border-amber-800/30 rounded-full text-xs text-amber-300">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Technographics - if available */}
              {icpReport.prospectingParameters.technographics && (
                <div className="mt-6">
                  <h4 className="text-base font-medium text-white mb-3 flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-rose-400" />
                    Technology Stack
                  </h4>
                  <div className="bg-black/30 rounded-md border border-light-gray/30 p-4">
                    <div className="flex flex-wrap gap-2">
                      {icpReport.prospectingParameters.technographics.map((tech, index) => (
                        <span key={index} className="px-2 py-1 bg-rose-900/20 border border-rose-800/30 rounded-full text-xs text-rose-300">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <h4 className="text-base font-medium text-white mb-3 flex items-center">
                  <Search className="h-4 w-4 mr-2 text-purple-400" />
                  Search Keywords
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {icpReport.prospectingParameters.searchKeywords.map((keyword, index) => (
                    <div key={index} className="flex items-center bg-purple-900/10 border border-purple-800/30 p-3 rounded-md">
                      <p className="text-gray-300 text-sm font-mono">{keyword}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="ml-auto h-6 w-6"
                        onClick={() => handleCopy(keyword, `keyword-${index}`)}
                      >
                        {copiedText === `keyword-${index}` ? (
                          <Check className="h-3 w-3 text-green-400" />
                        ) : (
                          <Clipboard className="h-3 w-3 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Engagement Tab */}
        <TabsContent value="engagement" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-purple-400 mr-3 rounded-sm"></div>
                How To Engage Them
              </CardTitle>
              <CardDescription>
                Communication strategies and messaging that resonates with your ideal customers
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Messaging Tips</h4>
                <div className="space-y-3">
                  {icpReport.engagementStrategy.messagingTips.map((tip, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-900/30 text-purple-400 flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-300">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-white mb-4">Decision Triggers</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {icpReport.engagementStrategy.decisionTriggers.map((trigger, index) => (
                    <div key={index} className="bg-black/30 rounded-md border border-light-gray/30 p-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-900/30 text-amber-400 flex items-center justify-center mr-2">
                          <Lightbulb className="h-3 w-3" />
                        </div>
                        <p className="text-gray-300 text-sm">{trigger}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Outreach templates */}
              {icpReport.engagementStrategy.outreachTemplates && (
                <div>
                  <h4 className="text-lg font-semibold text-white mb-4">Outreach Templates</h4>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Email template */}
                    {icpReport.engagementStrategy.outreachTemplates.email && (
                      <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                        <div className="p-3 bg-indigo-900/10 border-b border-light-gray/30">
                          <h5 className="text-base font-medium text-white flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-indigo-400" />
                            Email Template
                          </h5>
                        </div>
                        <div className="p-4">
                          <div className="bg-black/50 rounded-md p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap mb-3">
                            {icpReport.engagementStrategy.outreachTemplates.email}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleCopy(icpReport.engagementStrategy.outreachTemplates?.email || "", "email-template")}
                            >
                              {copiedText === "email-template" ? (
                                <>
                                  <Check className="mr-1 h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Clipboard className="mr-1 h-3 w-3" />
                                  Copy Template
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* LinkedIn template */}
                    {icpReport.engagementStrategy.outreachTemplates.linkedin && (
                      <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                        <div className="p-3 bg-blue-900/10 border-b border-light-gray/30">
                          <h5 className="text-base font-medium text-white flex items-center">
                            <Link className="h-4 w-4 mr-2 text-blue-400" />
                            LinkedIn Message
                          </h5>
                        </div>
                        <div className="p-4">
                          <div className="bg-black/50 rounded-md p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap mb-3">
                            {icpReport.engagementStrategy.outreachTemplates.linkedin}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleCopy(icpReport.engagementStrategy.outreachTemplates?.linkedin || "", "linkedin-template")}
                            >
                              {copiedText === "linkedin-template" ? (
                                <>
                                  <Check className="mr-1 h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Clipboard className="mr-1 h-3 w-3" />
                                  Copy Template
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cold call script */}
                    {icpReport.engagementStrategy.outreachTemplates.cold_call && (
                      <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                        <div className="p-3 bg-emerald-900/10 border-b border-light-gray/30">
                          <h5 className="text-base font-medium text-white flex items-center">
                            <Phone className="h-4 w-4 mr-2 text-emerald-400" />
                            Cold Call Script
                          </h5>
                        </div>
                        <div className="p-4">
                          <div className="bg-black/50 rounded-md p-4 font-mono text-xs text-gray-300 whitespace-pre-wrap mb-3">
                            {icpReport.engagementStrategy.outreachTemplates.cold_call}
                          </div>
                          <div className="flex justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => handleCopy(icpReport.engagementStrategy.outreachTemplates?.cold_call || "", "cold-call-template")}
                            >
                              {copiedText === "cold-call-template" ? (
                                <>
                                  <Check className="mr-1 h-3 w-3 text-green-400" />
                                  <span className="text-green-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Clipboard className="mr-1 h-3 w-3" />
                                  Copy Script
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Visuals Tab */}
        <TabsContent value="visuals" className="mt-0">
          <Card className="bg-near-black border-light-gray overflow-hidden">
            <CardHeader className="border-b border-light-gray">
              <CardTitle className="text-xl font-semibold text-white flex items-center">
                <div className="w-2 h-6 bg-emerald-400 mr-3 rounded-sm"></div>
                Visual Concepts
              </CardTitle>
              <CardDescription>
                AI-generated visual templates for engaging with your ideal customer profile
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              {icpReport.visualConcepts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* LinkedIn Template */}
                  {icpReport.visualConcepts.linkedinTemplate && (
                    <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={icpReport.visualConcepts.linkedinTemplate} 
                          alt="LinkedIn Post Template" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/1200x628/111827/6B7280/png?text=LinkedIn+Template'}
                        />
                      </div>
                      <div className="p-3">
                        <h5 className="text-sm font-medium text-white mb-1">LinkedIn Post Template</h5>
                        <p className="text-xs text-gray-400 mb-3">Designed for engagement with your target ICP</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => window.open(icpReport.visualConcepts?.linkedinTemplate, '_blank')}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download Image
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Email Template */}
                  {icpReport.visualConcepts.emailTemplate && (
                    <div className="bg-black/30 rounded-md border border-light-gray/30 overflow-hidden">
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={icpReport.visualConcepts.emailTemplate} 
                          alt="Email Header Template" 
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/600x200/111827/6B7280/png?text=Email+Header+Template'}
                        />
                      </div>
                      <div className="p-3">
                        <h5 className="text-sm font-medium text-white mb-1">Email Header Template</h5>
                        <p className="text-xs text-gray-400 mb-3">Professional header for email campaigns</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full text-xs"
                          onClick={() => window.open(icpReport.visualConcepts?.emailTemplate, '_blank')}
                        >
                          <Download className="mr-2 h-3 w-3" />
                          Download Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-600 mb-4" />
                  <h3 className="text-white font-medium mb-2">No Visual Concepts Available</h3>
                  <p className="text-muted-gray text-sm max-w-md">
                    Visual concepts could not be generated for this ICP.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Action buttons */}
      <div className="flex justify-center gap-4 my-10">
        <Button
          onClick={handleReset}
          variant="outline"
          className="rounded-md h-10 px-6 border-indigo-400/50 text-indigo-400 hover:bg-indigo-950/30"
        >
          Create New ICP
        </Button>
        
        <Button
          variant="default"
          className="rounded-md h-10 px-6 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 border-0"
          onClick={handleDownload}
        >
          <Download className="mr-2 h-4 w-4" />
          Download ICP Playbook
        </Button>
      </div>
      
      {/* Bottom branding */}
      <div className="text-center text-xs text-muted-gray/60 mt-6">
        <p>Generated by Deliver AI Platform • {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
} 
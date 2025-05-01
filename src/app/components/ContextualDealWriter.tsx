'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// Helper function to slugify text for IDs
const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

// Extract headings from markdown text
const extractHeadings = (markdown: string) => {
  if (!markdown) return [];
  
  const lines = markdown.split('\n');
  const headings: { text: string; id: string; level: number }[] = [];
  
  lines.forEach(line => {
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugify(text);
      headings.push({ text, id, level });
    }
  });
  
  return headings;
};

const ContextualDealWriter = () => {
  const [formData, setFormData] = useState({
    companyUrl: '',
    executiveName: '',
    companyName: '',
    offeringDetails: '',
    proposalGoal: '',
  });
  const [currentStep, setCurrentStep] = useState('input'); // 'input' | 'loading' | 'result'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [proposalText, setProposalText] = useState<string | null>(null);
  // Optional state for analysis results
  const [websiteAnalysis, setWebsiteAnalysis] = useState<any | null>(null);
  const [executiveProfile, setExecutiveProfile] = useState<any | null>(null);
  const [analysisSteps, setAnalysisSteps] = useState<any | null>(null);
  
  // New state for navigation and sharing
  const [headings, setHeadings] = useState<{ text: string; id: string; level: number }[]>([]);
  const [shareableUrl, setShareableUrl] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  // New state for copy functionality
  const [copied, setCopied] = useState(false);

  // Extract headings when proposal text changes
  useEffect(() => {
    if (proposalText) {
      setHeadings(extractHeadings(proposalText));
    }
  }, [proposalText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!formData.companyUrl || !formData.executiveName || !formData.companyName || !formData.offeringDetails || !formData.proposalGoal) {
      setError('Please fill out all fields.');
      return;
    }

    console.log('Submitting data:', formData);

    // Set loading state
    setLoading(true);
    setCurrentStep('loading');
    setShareableUrl(null); // Reset shareable URL

    try {
      // API call to the contextual deal writer endpoint
      const response = await fetch('/api/contextual-deal-writer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyUrl: formData.companyUrl,
          executiveName: formData.executiveName,
          companyName: formData.companyName,
          offeringDetails: formData.offeringDetails,
          proposalGoal: formData.proposalGoal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Failed to generate proposal');
      }

      const data = await response.json();
      
      // Set the results
      setProposalText(data.proposal);
      setWebsiteAnalysis(data.websiteAnalysis || null);
      setExecutiveProfile(data.executiveProfile || null);
      setAnalysisSteps(data.analysisSteps || null);
      setShareableUrl(data.shareableUrl || null); // Set the shareable URL from response
      
      // Move to results step
      setCurrentStep('result');
    } catch (err) {
      console.error('Error generating proposal:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setCurrentStep('input'); // Return to input on error
    } finally {
      setLoading(false);
    }
  };
  
  // Handle navigation click to scroll to section
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element && contentRef.current) {
      contentRef.current.scrollTo({
        top: element.offsetTop - 20,
        behavior: 'smooth'
      });
    }
  };
  
  // Update handleCopyLink to use the actual shareableUrl
  const handleCopyLink = () => {
    if (!shareableUrl) {
      console.error('No shareable URL available');
      return;
    }
    
    navigator.clipboard.writeText(shareableUrl)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };
  
  // Render markdown with IDs for navigation
  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-[#a0a0a0]">No content available</p>;
    
    // Simple markdown parser (in a real app, use a library like react-markdown)
    const html = text
      // Add IDs to headings
      .replace(/^(#{1,3})\s+(.+)$/gm, (match, hashes, content) => {
        const level = hashes.length;
        const id = slugify(content);
        const size = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base';
        return `<h${level} id="${id}" class="${size} font-bold text-[#FFFFFF] mb-4 mt-6">${content}</h${level}>`;
      })
      // Format paragraphs
      .replace(/^(?!(#{1,6}|\*|\d+\.).*$)(.*$)/gm, '<p class="text-[#FFFFFF] mb-4">$1</p>')
      // Format strong
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Format emphasis
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Format lists
      .replace(/^\*\s+(.+)$/gm, '<ul><li class="text-[#FFFFFF] ml-6 mb-2">$1</li></ul>')
      // Format links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#FFFFFF] underline hover:text-[#a0a0a0]">$1</a>');

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  };

  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  return (
    <div className="bg-[#0a0a0a] text-[#FFFFFF] min-h-screen p-8 flex flex-col items-center font-inter">
      {/* Header/Title Area */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#FFFFFF]">Contextual Deal Writer</h2>
        <p className="text-lg text-[#a0a0a0]">Generate personalized proposals powered by prospect & company analysis.</p>
      </div>

      {/* Input Step */}
      {currentStep === 'input' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-xl">
          {/* Company URL */}
          <div>
            <Label htmlFor="companyUrl" className="text-sm font-medium text-[#FFFFFF] mb-1 block">Prospect Company Website URL</Label>
            <Input
              id="companyUrl"
              type="url"
              placeholder="e.g., https://example.com"
              value={formData.companyUrl}
              onChange={handleInputChange}
              className="bg-[#0a0a0a] text-[#FFFFFF] border-[#333333] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Executive Name */}
          <div>
            <Label htmlFor="executiveName" className="text-sm font-medium text-[#FFFFFF] mb-1 block">Executive Name</Label>
            <Input
              id="executiveName"
              type="text"
              placeholder="e.g., Jane Doe"
              value={formData.executiveName}
              onChange={handleInputChange}
              className="bg-[#0a0a0a] text-[#FFFFFF] border-[#333333] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="companyName" className="text-sm font-medium text-[#FFFFFF] mb-1 block">Prospect Company Name</Label>
            <Input
              id="companyName"
              type="text"
              placeholder="e.g., Example Corp"
              value={formData.companyName}
              onChange={handleInputChange}
              className="bg-[#0a0a0a] text-[#FFFFFF] border-[#333333] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Offering Details */}
          <div>
            <Label htmlFor="offeringDetails" className="text-sm font-medium text-[#FFFFFF] mb-1 block">Your Offering Details</Label>
            <Textarea
              id="offeringDetails"
              placeholder="Describe your product/service, key features, and benefits in detail. This will be used to explain your solution."
              value={formData.offeringDetails}
              onChange={handleInputChange}
              rows={6} // Give more space for detailed input
              className="bg-[#0a0a0a] text-[#FFFFFF] border-[#333333] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Proposal Goal */}
          <div>
            <Label htmlFor="proposalGoal" className="text-sm font-medium text-[#FFFFFF] mb-1 block">Specific Proposal Goal</Label>
            <Textarea
              id="proposalGoal"
              placeholder="What is the specific objective for this proposal? (e.g., Propose SEO services to increase organic traffic by 20%, Secure a strategic partnership for mutual lead generation)"
              value={formData.proposalGoal}
              onChange={handleInputChange}
              rows={3} // Give enough space
              className="bg-[#0a0a0a] text-[#FFFFFF] border-[#333333] placeholder:text-[#a0a0a0]"
            />
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 bg-red-900/20 p-2 rounded text-sm">{error}</p>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FFFFFF] text-[#000000] hover:bg-[#a0a0a0] hover:text-[#000000] mt-2"
          >
            {loading ? 'Generating...' : 'Generate Proposal'}
          </Button>
        </form>
      )}

      {/* Loading Step */}
      {currentStep === 'loading' && (
        <div className="flex flex-col items-center justify-center p-8 space-y-4 w-full max-w-xl">
          <div className="animate-pulse h-4 w-4 bg-[#FFFFFF] rounded-full"></div>
          <p className="text-[#a0a0a0] text-center">
            Generating your personalized proposal...<br />
            <span className="text-sm">This may take a minute or two.</span>
          </p>
        </div>
      )}

      {/* Enhanced Result Step with Sidebar */}
      {currentStep === 'result' && (
        <>
          <div className="w-full max-w-6xl mx-auto">
            <h3 className="text-xl font-bold mb-6 text-center">Your Proposal is Ready</h3>
            
            {/* Analysis Steps Summary */}
            {analysisSteps && (
              <div className="mb-6 p-4 bg-[#111111] rounded-md">
                <h4 className="text-lg font-medium mb-2 text-[#FFFFFF]">Analysis Summary</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {/* Website Analysis */}
                  <div className="p-3 border border-[#333333] rounded-md">
                    <h5 className="font-medium mb-1">Website Analysis</h5>
                    <p className="text-[#a0a0a0]">URL: {analysisSteps.website.url}</p>
                    <p className={`${analysisSteps.website.success ? 'text-green-400' : 'text-yellow-400'}`}>
                      {analysisSteps.website.success ? 'Analysis successful' : 'Limited data available'}
                    </p>
                    {analysisSteps.website.usedFallback && (
                      <p className="text-yellow-400 text-xs mt-1">Used fallback data</p>
                    )}
                  </div>
                  
                  {/* Executive Analysis */}
                  <div className="p-3 border border-[#333333] rounded-md">
                    <h5 className="font-medium mb-1">Executive Analysis</h5>
                    <p className="text-[#a0a0a0]">{analysisSteps.executive.name} at {analysisSteps.executive.company}</p>
                    <p className={`${analysisSteps.executive.success ? 'text-green-400' : 'text-yellow-400'}`}>
                      {analysisSteps.executive.success ? 'Profile analyzed' : 'Limited profile data'}
                    </p>
                    {analysisSteps.executive.usedFallback && (
                      <p className="text-yellow-400 text-xs mt-1">Used fallback profile</p>
                    )}
                  </div>
                  
                  {/* Proposal Generation */}
                  <div className="p-3 border border-[#333333] rounded-md">
                    <h5 className="font-medium mb-1">Proposal Generation</h5>
                    <p className="text-[#a0a0a0]">{analysisSteps.proposal.format} format</p>
                    <p className="text-[#a0a0a0] text-xs mb-1">Goal: {analysisSteps.proposal.goal}</p>
                    <p className={`${!analysisSteps.proposal.usedFallback ? 'text-green-400' : 'text-yellow-400'}`}>
                      {!analysisSteps.proposal.usedFallback ? 'Custom proposal created' : 'Used template proposal'}
                    </p>
                  </div>
                </div>
                
                {/* Detailed Analysis View Toggle */}
                <div className="mt-4 flex justify-center">
                  <button 
                    onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                    className="px-3 py-1 bg-[#222222] text-[#a0a0a0] hover:bg-[#333333] hover:text-[#FFFFFF] rounded text-xs"
                  >
                    {showDetailedAnalysis ? 'Hide Detailed Analysis' : 'Show Detailed Analysis'}
                  </button>
                </div>
                
                {/* Detailed Analysis Content */}
                {showDetailedAnalysis && (
                  <div className="mt-4 border-t border-[#333333] pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Website Analysis Details */}
                      <div>
                        <h5 className="font-medium mb-2 text-[#FFFFFF]">Website Intelligence</h5>
                        {websiteAnalysis && (
                          <div className="bg-[#000000] p-3 rounded-md text-xs">
                            <div className="mb-2">
                              <span className="text-[#a0a0a0]">Title: </span>
                              <span className="text-[#FFFFFF]">{websiteAnalysis.title || 'Unknown'}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-[#a0a0a0]">Description: </span>
                              <span className="text-[#FFFFFF]">{websiteAnalysis.description || 'None'}</span>
                            </div>
                            
                            <h6 className="text-[#a0a0a0] mt-3 mb-1 font-medium">Key Findings:</h6>
                            {websiteAnalysis.analysis && Object.entries(websiteAnalysis.analysis).map(([key, value]: [string, any]) => (
                              <div key={key} className="mb-2 pl-2 border-l border-[#333333]">
                                <span className="text-[#a0a0a0]">{key}: </span>
                                <span className={`${value.includes('Unknown') ? 'text-yellow-400' : 'text-[#FFFFFF]'}`}>
                                  {value}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Executive Analysis Details */}
                      <div>
                        <h5 className="font-medium mb-2 text-[#FFFFFF]">Executive Profile</h5>
                        {executiveProfile && (
                          <div className="bg-[#000000] p-3 rounded-md text-xs">
                            <div className="mb-2">
                              <span className="text-[#a0a0a0]">Profile Summary: </span>
                              <span className="text-[#FFFFFF]">{executiveProfile.profileSummary || 'Unknown'}</span>
                            </div>
                            <div className="mb-2">
                              <span className="text-[#a0a0a0]">Communication Style: </span>
                              <span className="text-[#FFFFFF]">{executiveProfile.inferredStyle || 'Unknown'}</span>
                            </div>
                            
                            <h6 className="text-[#a0a0a0] mt-3 mb-1 font-medium">DISC Profile:</h6>
                            <div className="mb-2 pl-2 border-l border-[#333333]">
                              <span className="text-[#a0a0a0]">Primary Type: </span>
                              <span className="text-[#FFFFFF]">{executiveProfile.discProfile?.primaryType || 'Unknown'}</span>
                            </div>
                            <div className="mb-2 pl-2 border-l border-[#333333]">
                              <span className="text-[#a0a0a0]">Description: </span>
                              <span className="text-[#FFFFFF]">{executiveProfile.discProfile?.description || 'Unknown'}</span>
                            </div>
                            
                            <h6 className="text-[#a0a0a0] mt-3 mb-1 font-medium">Communication Tips:</h6>
                            {executiveProfile.communicationTips && executiveProfile.communicationTips.map((tip: string, index: number) => (
                              <div key={index} className="mb-1 pl-2 border-l border-[#333333]">
                                <span className="text-[#FFFFFF]">• {tip}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex flex-col md:flex-row gap-8 w-full">
              {/* Sidebar Navigation */}
              <div className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-[#333333] pb-4 md:pb-0 md:pr-8">
                <h4 className="text-lg font-medium mb-4 text-[#FFFFFF]">Contents</h4>
                
                <nav className="space-y-2">
                  {headings.map((heading, index) => (
                    <div 
                      key={index}
                      onClick={() => handleNavClick(heading.id)}
                      className={`
                        text-sm cursor-pointer hover:text-[#FFFFFF] transition-colors
                        ${heading.level === 1 ? 'text-[#FFFFFF] font-medium' : 'text-[#a0a0a0]'}
                        ${heading.level === 2 ? 'ml-2' : heading.level === 3 ? 'ml-4' : ''}
                      `}
                    >
                      {heading.text}
                    </div>
                  ))}
                </nav>
                
                <div className="mt-8">
                  <Button 
                    onClick={() => setCurrentStep('input')}
                    className="w-full bg-[#333333] text-[#FFFFFF] hover:bg-[#444444]"
                  >
                    Create New Proposal
                  </Button>
                </div>
              </div>
              
              {/* Main Content Area */}
              <div 
                ref={contentRef}
                className="flex-grow overflow-y-auto max-h-[70vh] bg-[#111111] p-6 rounded-md"
              >
                {proposalText ? (
                  renderMarkdown(proposalText)
                ) : (
                  <p className="text-[#a0a0a0]">No proposal content available.</p>
                )}
              </div>
            </div>
            
            {/* Updated Sharing Section with actual URL */}
            <div className="mt-8 flex flex-wrap items-center gap-4 w-full">
              <Label className="text-sm font-medium text-[#FFFFFF] flex-shrink-0">
                Share This Proposal:
              </Label>
              <Input
                type="text"
                readOnly
                value={shareableUrl || 'URL not available'}
                className="flex-grow bg-[#0a0a0a] text-[#a0a0a0] border-[#333333]"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!shareableUrl}
                className="flex-shrink-0 bg-[#333333] text-[#FFFFFF] hover:bg-[#a0a0a0] hover:text-[#000000]"
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            
            {/* Explain that the link leads to a standalone page */}
            <p className="mt-2 text-xs text-[#a0a0a0] text-center">
              The shareable link opens a standalone page with just your proposal content.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ContextualDealWriter; 
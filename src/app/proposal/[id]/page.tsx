'use client'; // Add this at the top to mark as a Client Component

import { useEffect, useState } from 'react';
import { use } from 'react';

// Reuse the markdown rendering and styling logic from the ContextualDealWriter component
const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

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

// Type for proposal data
type ProposalData = {
  id: string;
  timestamp: string;
  input: {
    companyUrl: string;
    executiveName: string;
    companyName: string;
    offeringDetails: string;
    format: string;
    proposalGoal: string;
  };
  websiteAnalysis: any;
  executiveProfile: any;
  proposal: string;
}

// Client component for the headings navigation
function HeadingsNavigation({ headings }: { headings: { text: string; id: string; level: number }[] }) {
  return (
    <nav className="space-y-2">
      {headings.map((heading, index) => (
        <div 
          key={index}
          onClick={() => {
            document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
          }}
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
  );
}

// Function to render markdown with proper HTML and styling
function renderMarkdown(text: string) {
  if (!text) return '<p class="text-[#a0a0a0]">No content available</p>';
  
  try {
    // Simple markdown parser (in a real app, use a library like react-markdown)
    const html = text
      // Add IDs to headings
      .replace(/^(#{1,3})\s+(.+)$/gm, (match, hashes, content) => {
        const level = hashes.length;
        const id = slugify(content);
        const size = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base';
        return `<h${level} id="${id}" class="${size} font-bold text-[#FFFFFF] mb-4 mt-6">${content}</h${level}>`;
      })
      // Format paragraphs - only match lines that don't start with #, *, or numbers followed by period
      .replace(/^(?!(#{1,6}|\*|\d+\.))(.*[^\s].*)$/gm, '<p class="text-[#FFFFFF] mb-4">$2</p>')
      // Format strong
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Format emphasis
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Format lists
      .replace(/^\*\s+(.+)$/gm, '<ul><li class="text-[#FFFFFF] ml-6 mb-2">$1</li></ul>')
      // Format links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#FFFFFF] underline hover:text-[#a0a0a0]">$1</a>');

    // If no HTML was generated, provide a fallback
    if (html === text) {
      console.log("No HTML generated, using fallback rendering");
      // Convert plain text to paragraphs
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      const paragraphs = lines.map(line => `<p class="text-[#FFFFFF] mb-4">${line}</p>`).join('');
      return `<div class="text-[#FFFFFF]">${paragraphs}</div>`;
    }
    
    return html;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    return `<div class="text-[#FFFFFF]">${text}</div>`;
  }
}

// This is a client component for the proposal page
export default function ProposalPage({ params }: { params: { id: string } }) {
  // Unwrap params with React.use()
  const unwrappedParams = use(params);
  const proposalId = unwrappedParams.id;
  
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [headings, setHeadings] = useState<{ text: string; id: string; level: number }[]>([]);
  const [proposalHtml, setProposalHtml] = useState<string>('');
  
  // Fetch the proposal data client-side
  useEffect(() => {
    async function fetchProposal() {
      try {
        const response = await fetch(`/api/proposal/${proposalId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Proposal not found');
          } else {
            setError('Failed to load proposal');
          }
          setLoading(false);
          return;
        }
        
        const data = await response.json();
        setProposal(data);
        
        // Process the proposal content
        if (data.proposal) {
          console.log("Proposal content received:", data.proposal.substring(0, 100) + "..."); // Log the first 100 chars
          setHeadings(extractHeadings(data.proposal));
          
          // Ensure we're getting valid HTML from the markdown
          const html = renderMarkdown(data.proposal);
          console.log("Rendered HTML:", html.substring(0, 100) + "..."); // Log the first 100 chars
          setProposalHtml(html);
        } else {
          console.error("No proposal content in the response");
          setError("The proposal has no content");
        }
      } catch (err) {
        setError('Error loading proposal');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProposal();
  }, [proposalId]);
  
  if (loading) {
    return (
      <div className="bg-[#0a0a0a] text-[#FFFFFF] min-h-screen p-8 flex items-center justify-center">
        <div className="animate-pulse h-4 w-4 bg-[#FFFFFF] rounded-full"></div>
        <p className="text-[#a0a0a0] ml-3">Loading proposal...</p>
      </div>
    );
  }
  
  if (error || !proposal) {
    return (
      <div className="bg-[#0a0a0a] text-[#FFFFFF] min-h-screen p-8 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Error</h2>
        <p className="text-[#a0a0a0]">{error || 'Proposal not found'}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-[#0a0a0a] text-[#FFFFFF] min-h-screen p-8 flex flex-col items-center font-inter">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#FFFFFF]">Contextual Deal Writer</h2>
        <p className="text-lg text-[#a0a0a0]">Proposal for {proposal.input.executiveName} at {proposal.input.companyName}</p>
        <p className="text-sm text-[#a0a0a0] mt-2">Generated on {new Date(proposal.timestamp).toLocaleString()}</p>
      </div>
      
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Sidebar Navigation - Now using client component */}
          <div className="w-full md:w-64 md:flex-shrink-0 border-b md:border-b-0 md:border-r border-[#333333] pb-4 md:pb-0 md:pr-8">
            <h4 className="text-lg font-medium mb-4 text-[#FFFFFF]">Contents</h4>
            <HeadingsNavigation headings={headings} />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-grow overflow-y-auto max-h-[70vh] bg-[#111111] p-6 rounded-md">
            {proposalHtml ? (
              <>
                {/* Debug info - will remove after fixing */}
                <p className="text-xs text-gray-400 mb-4">Content length: {proposalHtml.length} characters</p>
                <div dangerouslySetInnerHTML={{ __html: proposalHtml }} />
                
                {/* Fallback raw text display if HTML isn't rendering */}
                {proposal && proposalHtml.length > 0 && (
                  <div className="mt-8 pt-8 border-t border-gray-700">
                    <p className="text-sm text-yellow-400 mb-4">If content is not displaying properly above, here is the raw text:</p>
                    <pre className="whitespace-pre-wrap text-sm text-white bg-gray-900 p-4 rounded overflow-auto">
                      {proposal.proposal}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[#a0a0a0]">No proposal content available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
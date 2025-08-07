'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

// Optimized slugify function
const slugify = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
};

// Memoized heading extraction
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

// Optimized markdown renderer - memoized to prevent re-computation
const renderMarkdown = (text: string): string => {
  if (!text) return '<p class="text-[#a0a0a0]">No content available</p>';

  try {
    // Batch all regex operations for better performance
    let html = text
      .replace(/^(#{1,3})\s+(.+)$/gm, (_, hashes, content) => {
        const level = hashes.length;
        const id = slugify(content);
        const size = level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base';
        return `<h${level} id="${id}" class="${size} font-bold text-[#FFFFFF] mb-4 mt-6">${content}</h${level}>`;
      })
      .replace(/^(?!(#{1,6}|\*|\d+\.))(.*[^\s].*)$/gm, '<p class="text-[#FFFFFF] mb-4">$2</p>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\*\s+(.+)$/gm, '<ul><li class="text-[#FFFFFF] ml-6 mb-2">$1</li></ul>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-[#FFFFFF] underline hover:text-[#a0a0a0]">$1</a>');

    // Fallback for plain text
    if (html === text) {
      const lines = text.split('\n').filter(line => line.trim().length > 0);
      html = lines.map(line => `<p class="text-[#FFFFFF] mb-4">${line}</p>`).join('');
    }

    return html;
  } catch (error) {
    console.error("Error rendering markdown:", error);
    return `<div class="text-[#FFFFFF]">${text}</div>`;
  }
};

// Optimized proposal page component
export default function ProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string>('');

  // Resolve params asynchronously
  useEffect(() => {
    params.then(resolvedParams => {
      setProposalId(resolvedParams.id);
    });
  }, [params]);

  // Memoized headings extraction
  const headings = useMemo(() => {
    return proposal?.proposal ? extractHeadings(proposal.proposal) : [];
  }, [proposal?.proposal]);

  // Memoized HTML rendering
  const proposalHtml = useMemo(() => {
    return proposal?.proposal ? renderMarkdown(proposal.proposal) : '';
  }, [proposal?.proposal]);

  // Optimized fetch function
  const fetchProposal = useCallback(async (id: string) => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/proposal/${id}`);

      if (!response.ok) {
        setError(response.status === 404 ? 'Proposal not found' : 'Failed to load proposal');
        return;
      }

      const data = await response.json();

      if (!data.proposal) {
        setError("The proposal has no content");
        return;
      }

      setProposal(data);
      setError(null);
    } catch (err) {
      setError('Error loading proposal');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch proposal when ID is available
  useEffect(() => {
    if (proposalId) {
      fetchProposal(proposalId);
    }
  }, [proposalId, fetchProposal]);

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
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-[#FFFFFF]">Proposal</h2>
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
              <div dangerouslySetInnerHTML={{ __html: proposalHtml }} />
            ) : (
              <p className="text-[#a0a0a0]">No proposal content available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

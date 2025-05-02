'use client'; // This makes it a client component

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function CreateScorecardPage() {
  const [clientName, setClientName] = useState('');
  const [clientWebsite, setClientWebsite] = useState('');
  const [scorecardPurpose, setScorecardPurpose] = useState('');

  const handleGenerateScorecard = () => {
    // This function will eventually trigger the backend analysis and scorecard generation
    // For now, we'll just log the data
    console.log('Generating scorecard with data:', {
      clientName,
      clientWebsite,
      scorecardPurpose,
    });
    alert('Generate Scorecard button clicked! (Data logged to console)');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 bg-slate-950 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Create New Scorecard</h1>

      <div className="grid gap-6">
        {/* Client Information */}
        <div className="grid gap-2">
          <Label htmlFor="clientName" className="text-gray-300">Client Name</Label>
          <Input
            id="clientName"
            placeholder="e.g., Acme Corporation"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="clientWebsite" className="text-gray-300">Client Website URL</Label>
          <Input
            id="clientWebsite"
            type="url"
            placeholder="e.g., https://www.acmecorp.com"
            value={clientWebsite}
            onChange={(e) => setClientWebsite(e.target.value)}
             className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500"
          />
           <p className="text-sm text-gray-500">This will be used to analyze the client and populate the scorecard.</p>
        </div>

        {/* Scorecard Purpose/Notes */}
         <div className="grid gap-2">
          <Label htmlFor="scorecardPurpose" className="text-gray-300">Scorecard Purpose / Key Areas to Evaluate</Label>
          <Textarea
            id="scorecardPurpose"
            placeholder="e.g., Evaluate their current marketing strategy, Assess their technical infrastructure, etc."
            value={scorecardPurpose}
            onChange={(e) => setScorecardPurpose(e.target.value)}
             className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500 min-h-[100px]"
          />
           <p className="text-sm text-gray-500">Provide context for the AI on what aspects of the client/project to focus on for the scorecard.</p>
        </div>


        {/* Generate Button */}
        <Button
          onClick={handleGenerateScorecard}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 transition duration-300 ease-in-out"
        >
          Generate Scorecard Draft
        </Button>
      </div>
    </div>
  );
}
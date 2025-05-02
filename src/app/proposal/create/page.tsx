'use client'; // This makes it a client component

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CreateProposalPage() {
  const [clientName, setClientName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [clientWebsite, setClientWebsite] = useState('');
  const [userProductName, setUserProductName] = useState('');
  const [userProductDescription, setUserProductDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleGenerateProposal = () => {
    // This function will eventually trigger the backend process
    // For now, we'll just log the data
    console.log('Generating proposal with data:', {
      clientName,
      projectTitle,
      clientWebsite,
      userProductName,
      userProductDescription,
      selectedTemplate,
    });
    alert('Generate Proposal button clicked! (Data logged to console)');
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 bg-slate-950 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-400 mb-8">Create New Proposal</h1>

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
          <Label htmlFor="projectTitle" className="text-gray-300">Project Title/Goal</Label>
          <Input
            id="projectTitle"
            placeholder="e.g., Revamp Marketing Website"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
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
           <p className="text-sm text-gray-500">This will be used to personalize the proposal.</p>
        </div>

        {/* Your Product/Offering Information */}
         <h2 className="text-2xl font-semibold text-gray-200 mt-4 mb-2">Your Offering</h2>

         <div className="grid gap-2">
          <Label htmlFor="userProductName" className="text-gray-300">Your Product/Service Name</Label>
          <Input
            id="userProductName"
            placeholder="e.g., SaaS Platform X"
            value={userProductName}
            onChange={(e) => setUserProductName(e.target.value)}
             className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500"
          />
        </div>

         <div className="grid gap-2">
          <Label htmlFor="userProductDescription" className="text-gray-300">Your Product/Service Description</Label>
          <Textarea
            id="userProductDescription"
            placeholder="Briefly describe what you offer and its main benefits."
            value={userProductDescription}
            onChange={(e) => setUserProductDescription(e.target.value)}
             className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500 min-h-[100px]"
          />
        </div>


        {/* Template Selection */}
        <div className="grid gap-2">
          <Label htmlFor="template" className="text-gray-300">Select Proposal Template</Label>
           <Select onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template" className="bg-slate-800 border-slate-700 text-gray-100 placeholder:text-gray-500">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 text-gray-100 border-slate-700">
                <SelectItem value="standard-comprehensive">Standard Comprehensive Proposal</SelectItem>
                <SelectItem value="executive-summary">Visual Executive Summary Proposal</SelectItem>
                <SelectItem value="minimalist-outreach">Minimalist Outreach Proposal</SelectItem>
              </SelectContent>
            </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerateProposal}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 mt-4 transition duration-300 ease-in-out"
        >
          Generate Personalized Proposal
        </Button>
      </div>
    </div>
  );
}
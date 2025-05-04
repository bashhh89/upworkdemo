'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { AgentConfiguration } from '@/types/agent';

// Mock pipeline data (normally you'd fetch this)
const mockPipelines = [
  { id: 'pipeline1', name: 'Customer Support Pipeline' },
  { id: 'pipeline2', name: 'Sales Leads Pipeline' },
  { id: 'pipeline3', name: 'Product Sales Pipeline' },
];

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const agentId = params.id as string;
  
  // State for agent data, loading, saving, deleting, and error
  const [agent, setAgent] = useState<AgentConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch agent data from API
  useEffect(() => {
    if (!agentId) return;

    const fetchAgentData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Fetching data for agent ID: ${agentId}`);

      try {
        const response = await fetch(`/api/agent-studio/${agentId}`);

        if (response.status === 404) {
          console.log("Agent not found (404).");
          setError('Agent not found.');
          toast({
            title: "Error",
            description: "Agent not found.",
            variant: "destructive",
            duration: 5000
          });
          return;
        }

        if (!response.ok) {
           const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
           console.error("API Error fetching agent:", response.status, errorData);
           throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: AgentConfiguration = await response.json();
        console.log("Fetched agent data:", data);
        setAgent(data);

      } catch (err) {
        console.error("Failed to fetch agent data:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred.";
        setError(`Failed to load agent data: ${message}`);
        toast({
          title: "Error Loading Agent",
          description: message,
          variant: "destructive",
          duration: 5000
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentData();
  }, [agentId, router, toast]);
  
  // Form state
  const [agentName, setAgentName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'Training'>('Active');
  const [createCards, setCreateCards] = useState(false);
  const [linkedPipelineId, setLinkedPipelineId] = useState('');
  const [initialMessages, setInitialMessages] = useState<string[]>([]);
  const [newInitialMessage, setNewInitialMessage] = useState('');
  const [suggestedReplies, setSuggestedReplies] = useState<string[]>([]);
  const [newSuggestedReply, setNewSuggestedReply] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4A90E2');
  const [knowledgeSources, setKnowledgeSources] = useState<any[]>([]);
  
  // Update form state when agent data is loaded/changed
  useEffect(() => {
    if (agent) {
      setAgentName(agent.name);
      setSystemPrompt(agent.systemPrompt);
      setStatus(agent.status);
      setCreateCards(agent.settings?.createCards ?? false);
      setLinkedPipelineId(agent.settings?.linkedPipelineId ?? '');
      setInitialMessages(agent.settings?.initialMessages || []);
      setSuggestedReplies(agent.settings?.suggestedReplies || []);
      setPrimaryColor(agent.settings?.primaryColor || '#4A90E2');
      setKnowledgeSources(agent.knowledgeSources || []);
      setNewInitialMessage('');
      setNewSuggestedReply('');
    }
  }, [agent]);
  
  // Handle save - Now connects to the PUT API endpoint
  const handleSave = async () => {
    if (!agentId) return;

    console.log("Attempting to save changes for agent:", agentId);
    setIsSaving(true);

    // Construct the payload with fields that can be updated from the UI state
    const updatePayload = {
      name: agentName,
      systemPrompt: systemPrompt,
      status: status,
      // Send the current state of knowledge sources (backend would process updates)
      knowledgeSources: knowledgeSources,
      // Reconstruct the settings object from individual states
      settings: {
        createCards: createCards,
        linkedPipelineId: linkedPipelineId || null, // Ensure null if empty
        initialMessages: initialMessages,
        suggestedReplies: suggestedReplies,
        primaryColor: primaryColor
      }
    };

    console.log("Update Payload:", updatePayload);

    try {
      const response = await fetch(`/api/agent-studio/${agentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        // Handle non-successful responses
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error("API Error updating agent:", response.status, errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful update
      const updatedAgentData: AgentConfiguration = await response.json();
      console.log("API Update Success:", updatedAgentData);

      // Update the main agent state with the response from the API
      setAgent(updatedAgentData);

      toast({
        title: "Changes Saved",
        description: "Your agent configuration has been updated successfully.",
        duration: 3000,
        action: <Button onClick={() => toast({ title: "", description: "" })} className="bg-transparent hover:bg-white/10">Dismiss</Button>
      });

    } catch (error) {
      console.error("Failed to save agent changes:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error Saving Changes",
        description: message,
        variant: "destructive",
        duration: 5000,
        action: <Button onClick={() => toast({ title: "", description: "" })} className="bg-transparent hover:bg-red-800/20 text-white">Dismiss</Button>
      });
    } finally {
      setIsSaving(false); // End loading state
    }
  };
  
  // Handle adding new initial message
  const handleAddInitialMessage = () => {
    if (newInitialMessage.trim() !== '') {
      setInitialMessages([...initialMessages, newInitialMessage]);
      setNewInitialMessage('');
    }
  };
  
  // Handle removing initial message
  const handleRemoveInitialMessage = (index: number) => {
    setInitialMessages(initialMessages.filter((_, i) => i !== index));
  };
  
  // Handle adding new suggested reply
  const handleAddSuggestedReply = () => {
    if (newSuggestedReply.trim() !== '') {
      setSuggestedReplies([...suggestedReplies, newSuggestedReply]);
      setNewSuggestedReply('');
    }
  };
  
  // Handle removing suggested reply
  const handleRemoveSuggestedReply = (index: number) => {
    setSuggestedReplies(suggestedReplies.filter((_, i) => i !== index));
  };
  
  // Handle Agent Deletion using API
  const handleDeleteAgent = async () => {
    if (!agentId) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the agent "${agentName || agentId}"? This cannot be undone.`
    );

    if (!confirmDelete) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/agent-studio/${agentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
         console.error("API Error deleting agent:", response.status, errorData);
         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      console.log(`Agent ${agentId} deleted successfully via API.`);
      toast({
        title: "Agent Deleted",
        description: `Agent "${agentName || agentId}" has been deleted.`,
        duration: 3000,
      });

      router.push('/agent-studio');

    } catch (error) {
      console.error("Failed to delete agent:", error);
      const message = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        title: "Error Deleting Agent",
        description: message,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 text-white text-center">
        <div className="animate-pulse">Loading agent details...</div>
      </div>
    );
  }
  
  if (error) {
     return <div className="flex items-center justify-center h-screen bg-black text-white"><p className="text-red-500">Error: {error}</p></div>;
  }
  
  if (!agent) {
    return <div className="flex items-center justify-center h-screen bg-black text-white"><p>Agent data not available.</p></div>;
  }
  
  return (
    <div className="container mx-auto py-8 text-white max-w-5xl">
      {/* Header with agent name and status */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <p className="text-gray-400 mt-2">Agent Configuration & Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 text-sm font-medium rounded-full ${
            agent.status === 'Active' ? 'bg-green-500' : 
            agent.status === 'Training' ? 'bg-yellow-500' : 'bg-gray-500'
          }`}>
            {agent.status}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            className="bg-white text-black hover:bg-gray-200 rounded-none"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            onClick={() => router.push('/agent-studio')}
            variant="outline" 
            className="border-[#333333] text-white hover:bg-[#333333] rounded-none"
          >
            Back to List
          </Button>
          <Button variant="destructive" onClick={handleDeleteAgent} disabled={isDeleting || isLoading}>
            {isDeleting ? 'Deleting...' : 'Delete Agent'}
          </Button>
        </div>
      </div>
      
      {/* Tabs for different settings */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-[#111111] border border-[#333333] rounded-none w-full">
          <TabsTrigger value="general" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">General</TabsTrigger>
          <TabsTrigger value="interface" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">Interface</TabsTrigger>
          <TabsTrigger value="knowledge" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">Knowledge</TabsTrigger>
          <TabsTrigger value="workflow" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">Workflow</TabsTrigger>
          <TabsTrigger value="share" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">Share & Embed</TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 rounded-none data-[state=active]:bg-[#333333]">Activity</TabsTrigger>
        </TabsList>
        
        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <div>
              <Label htmlFor="agent-name" className="text-lg font-medium mb-2 block">Agent Name</Label>
              <Input 
                id="agent-name"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white rounded-none"
              />
            </div>
            
            <div>
              <Label htmlFor="agent-status" className="text-lg font-medium mb-2 block">Status</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as any)}>
                <SelectTrigger id="agent-status" className="bg-[#0a0a0a] border-[#333333] text-white rounded-none w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-[#333333] text-white rounded-none">
                  <SelectItem value="Active" className="focus:bg-[#333333] focus:text-white">Active</SelectItem>
                  <SelectItem value="Training" className="focus:bg-[#333333] focus:text-white">Training</SelectItem>
                  <SelectItem value="Inactive" className="focus:bg-[#333333] focus:text-white">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="system-prompt" className="text-lg font-medium mb-2 block">System Prompt / Instructions</Label>
              <Textarea 
                id="system-prompt"
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-[#0a0a0a] border-[#333333] text-white rounded-none min-h-[200px]"
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Interface Tab */}
        <TabsContent value="interface" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">Initial Messages</Label>
              <div className="space-y-3 mb-4">
                {initialMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={message}
                      readOnly
                      className="bg-[#0a0a0a] border-[#333333] text-white rounded-none flex-grow"
                    />
                    <Button 
                      onClick={() => handleRemoveInitialMessage(index)}
                      variant="outline"
                      className="border-[#333333] text-white hover:bg-[#333333]"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input 
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  placeholder="Add a new initial message..."
                  className="bg-[#0a0a0a] border-[#333333] text-white rounded-none flex-grow"
                />
                <Button 
                  onClick={handleAddInitialMessage}
                  variant="outline"
                  className="border-[#333333] text-white hover:bg-[#333333]"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-lg font-medium mb-4 block">Suggested Replies</Label>
              <div className="space-y-3 mb-4">
                {suggestedReplies.map((reply, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input 
                      value={reply}
                      readOnly
                      className="bg-[#0a0a0a] border-[#333333] text-white rounded-none flex-grow"
                    />
                    <Button 
                      onClick={() => handleRemoveSuggestedReply(index)}
                      variant="outline"
                      className="border-[#333333] text-white hover:bg-[#333333]"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input 
                  value={newSuggestedReply}
                  onChange={(e) => setNewSuggestedReply(e.target.value)}
                  placeholder="Add a new suggested reply..."
                  className="bg-[#0a0a0a] border-[#333333] text-white rounded-none flex-grow"
                />
                <Button 
                  onClick={handleAddSuggestedReply}
                  variant="outline"
                  className="border-[#333333] text-white hover:bg-[#333333]"
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="primary-color" className="text-lg font-medium mb-2 block">Primary Color</Label>
              <div className="flex items-center gap-3">
                <input
                  id="primary-color"
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 border-0"
                />
                <Input 
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-[#0a0a0a] border-[#333333] text-white rounded-none w-32"
                />
                <div className="text-sm text-gray-400">
                  This color will be used for the chat widget and messages.
                </div>
              </div>
            </div>
            
            <div className="mt-8 border border-[#333333]">
              <div className="bg-[#1a1a1a] p-3 text-sm font-medium border-b border-[#333333]">Live Preview</div>
              <div className="p-6 bg-[#0a0a0a] min-h-[300px] flex items-center justify-center">
                <div className="w-full max-w-lg">
                  {/* Chat widget preview */}
                  <div className="bg-[#111111] border border-[#333333] rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-medium" style={{ color: primaryColor }}>{agentName}</h3>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    
                    {/* Chat messages */}
                    <div className="space-y-4 mb-6">
                      {/* Initial message from agent */}
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-[#222222] flex items-center justify-center mr-2">
                          <span style={{ color: primaryColor }}>AI</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg max-w-[75%]">
                          {initialMessages.length > 0 ? initialMessages[0] : "Hello! How can I help you today?"}
                        </div>
                      </div>
                      
                      {/* Sample user message */}
                      <div className="flex items-start justify-end">
                        <div className="p-3 rounded-lg max-w-[75%]" style={{ backgroundColor: primaryColor + '33' }}>
                          How can you help my business?
                        </div>
                      </div>
                      
                      {/* Agent response */}
                      <div className="flex items-start">
                        <div className="h-8 w-8 rounded-full bg-[#222222] flex items-center justify-center mr-2">
                          <span style={{ color: primaryColor }}>AI</span>
                        </div>
                        <div className="bg-[#1a1a1a] p-3 rounded-lg max-w-[75%]">
                          I can assist with various aspects of your business needs...
                        </div>
                      </div>
                    </div>
                    
                    {/* Input area */}
                    <div className="relative">
                      <input 
                        type="text" 
                        className="w-full bg-[#1a1a1a] border border-[#333333] rounded-lg px-4 py-2 text-white"
                        placeholder="Type your message..."
                        readOnly
                      />
                      <button 
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full" 
                        style={{ backgroundColor: primaryColor }}
                      >
                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Suggested replies */}
                    {suggestedReplies.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {suggestedReplies.slice(0, 3).map((reply, index) => (
                          <div 
                            key={index} 
                            className="px-3 py-1 rounded-full text-sm border cursor-pointer" 
                            style={{ borderColor: primaryColor, color: primaryColor }}
                          >
                            {reply}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Knowledge Tab - Just a placeholder for now */}
        <TabsContent value="knowledge" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <h2 className="text-xl font-semibold">Knowledge Sources</h2>
            
            <div className="space-y-4">
              {knowledgeSources.map((source: any, index: number) => (
                <div key={index} className="flex items-center justify-between bg-[#1a1a1a] p-4 border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase bg-[#333333] px-2 py-1">{source.type}</span>
                    <span>{source.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-[#333333] text-white hover:bg-[#333333]">
                      Refresh
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-[#333333] text-white hover:bg-[#333333]"
                      onClick={() => {
                        // Remove knowledge source
                        const updatedSources = [...knowledgeSources];
                        updatedSources.splice(index, 1);
                        setKnowledgeSources(updatedSources);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* New knowledge source form */}
            <div className="mt-6 space-y-4 border border-[#333333] p-4">
              <h3 className="font-medium">Add New Knowledge Source</h3>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="source-type" className="block mb-2">Source Type</Label>
                  <Select defaultValue="url">
                    <SelectTrigger id="source-type" className="bg-[#0a0a0a] border-[#333333] text-white rounded-none w-full">
                      <SelectValue placeholder="Select source type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0a0a0a] border-[#333333] text-white rounded-none">
                      <SelectItem value="url" className="focus:bg-[#333333] focus:text-white">Website URL</SelectItem>
                      <SelectItem value="file" className="focus:bg-[#333333] focus:text-white">File Upload</SelectItem>
                      <SelectItem value="text" className="focus:bg-[#333333] focus:text-white">Text Content</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="source-name" className="block mb-2">Source URL/Name</Label>
                  <Input 
                    id="source-name"
                    placeholder="https://example.com or file name"
                    className="bg-[#0a0a0a] border-[#333333] text-white rounded-none"
                  />
                </div>
                
                <Button 
                  className="mt-2 bg-white text-black hover:bg-gray-200 rounded-none"
                  onClick={() => {
                    // Add a new knowledge source (mock functionality)
                    const newSource = { 
                      type: 'url', 
                      name: document.getElementById('source-name') ? 
                           (document.getElementById('source-name') as HTMLInputElement).value : 
                           'New Source'
                    };
                    
                    if (newSource.name && newSource.name.trim() !== '') {
                      setKnowledgeSources([...knowledgeSources, newSource]);
                      
                      // Clear input field
                      const inputEl = document.getElementById('source-name') as HTMLInputElement;
                      if (inputEl) inputEl.value = '';
                      
                      toast({
                        title: "Source added",
                        description: "Knowledge source has been added successfully."
                      });
                    } else {
                      toast({
                        title: "Error",
                        description: "Please enter a valid source name or URL.",
                        variant: "destructive"
                      });
                    }
                  }}
                >
                  Add Source
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <Button className="bg-[#333333] text-white hover:bg-[#444444] rounded-none">
                Retrain Agent
              </Button>
            </div>
          </div>
        </TabsContent>
        
        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <Switch 
                id="create-cards" 
                checked={createCards}
                onCheckedChange={setCreateCards}
              />
              <div>
                <Label htmlFor="create-cards" className="font-medium">Automatically Create Kanban Cards</Label>
                <p className="text-sm text-gray-400">Create a new card on your Kanban board for each new chat session</p>
              </div>
            </div>
            
            {createCards && (
              <div className="pl-10 border-l border-[#333333] ml-2 mt-4 pt-2">
                <Label htmlFor="pipeline-select" className="block mb-2">Select Target Pipeline</Label>
                <Select value={linkedPipelineId} onValueChange={setLinkedPipelineId}>
                  <SelectTrigger id="pipeline-select" className="bg-[#0a0a0a] border-[#333333] text-white rounded-none w-full">
                    <SelectValue placeholder="Choose a pipeline" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0a0a0a] border-[#333333] text-white rounded-none">
                    {mockPipelines.map(pipeline => (
                      <SelectItem key={pipeline.id} value={pipeline.id} className="focus:bg-[#333333] focus:text-white">
                        {pipeline.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium">Card Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="include-first-message" defaultChecked />
                      <Label htmlFor="include-first-message">Include first user message</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-source" defaultChecked />
                      <Label htmlFor="include-source">Include source URL/reference</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="include-timestamp" defaultChecked />
                      <Label htmlFor="include-timestamp">Include timestamp</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Share & Embed Tab - Simplified for now */}
        <TabsContent value="share" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <div>
              <Label className="text-lg font-medium mb-4 block">Public Share Link</Label>
              <div className="flex gap-2">
                <Input 
                  value={`https://example.com/chat/${agent.id}`}
                  readOnly
                  className="bg-[#0a0a0a] border-[#333333] text-white rounded-none flex-grow font-mono text-sm"
                />
                <Button 
                  className="bg-white text-black hover:bg-gray-200 rounded-none"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://example.com/chat/${agent.id}`);
                    toast({ 
                      title: "Link copied to clipboard",
                      description: "Share link has been copied successfully.",
                      action: (
                        <Button 
                          onClick={() => toast({title: "", description: ""})} 
                          className="bg-transparent hover:bg-white/10"
                        >
                          Dismiss
                        </Button>
                      )
                    });
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
            
            <div className="pt-4">
              <Label className="text-lg font-medium mb-4 block">Embed Code</Label>
              <div className="bg-[#0a0a0a] p-4 rounded border border-[#333333] mb-4">
                <pre className="text-sm font-mono whitespace-pre-wrap text-gray-300">{`<script src="https://example.com/embed.js" data-agent-id="${agent.id}"></script>`}</pre>
              </div>
              <Button 
                className="bg-white text-black hover:bg-gray-200 rounded-none"
                onClick={() => {
                  navigator.clipboard.writeText(`<script src="https://example.com/embed.js" data-agent-id="${agent.id}"></script>`);
                  toast({ 
                    title: "Code copied to clipboard",
                    description: "Embed code has been copied successfully.",
                    action: (
                      <Button 
                        onClick={() => toast({title: "", description: ""})} 
                        className="bg-transparent hover:bg-white/10"
                      >
                        Dismiss
                      </Button>
                    )
                  });
                }}
              >
                Copy Code
              </Button>
            </div>
            
            {/* Preview section */}
            <div className="pt-6 mt-4 border-t border-[#333333]">
              <Label className="text-lg font-medium mb-4 block">Embed Preview</Label>
              <div className="bg-[#0a0a0a] border border-[#333333] rounded p-4 min-h-[300px]">
                <div className="flex items-center justify-center h-full">
                  <div className="bg-[#111111] border border-[#333333] rounded-lg shadow-lg w-full max-w-sm p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium" style={{ color: primaryColor }}>{agentName}</h3>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-[#1a1a1a] p-3 rounded-lg max-w-[75%]">
                        {initialMessages.length > 0 ? initialMessages[0] : "Hello! How can I help you today?"}
                      </div>
                      <div className="p-3 rounded-lg ml-auto max-w-[75%]" style={{ backgroundColor: primaryColor + '33' }}>
                        Sample user message
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-sm text-gray-500">This is how your chat widget will appear when embedded</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Activity Tab - Simplified for now */}
        <TabsContent value="activity" className="space-y-6">
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
              <Button 
                variant="outline" 
                className="border-[#333333] text-white hover:bg-[#333333]"
              >
                Export CSV
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1a1a1a] text-left">
                    <th className="p-3 border border-[#333333]">Time</th>
                    <th className="p-3 border border-[#333333]">User</th>
                    <th className="p-3 border border-[#333333]">First Message</th>
                    <th className="p-3 border border-[#333333]">Source</th>
                    <th className="p-3 border border-[#333333]">Kanban Card</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((item) => (
                    <tr key={item} className="border-b border-[#333333]">
                      <td className="p-3 border border-[#333333]">2023-11-{10 + item} 14:30</td>
                      <td className="p-3 border border-[#333333]">User {item}</td>
                      <td className="p-3 border border-[#333333]">I need help with...</td>
                      <td className="p-3 border border-[#333333]">Website</td>
                      <td className="p-3 border border-[#333333]">
                        <a href="#" className="text-blue-400 hover:underline">View Card</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-400">Showing 5 of 153 activities</div>
              <div className="flex gap-2">
                <Button variant="outline" className="border-[#333333] text-white hover:bg-[#333333]">
                  Previous
                </Button>
                <Button variant="outline" className="border-[#333333] text-white hover:bg-[#333333]">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 
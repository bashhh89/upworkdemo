'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';

// Mock pipeline data (normally you'd fetch this)
const mockPipelines = [
  { id: 'pipeline1', name: 'Customer Support Pipeline' },
  { id: 'pipeline2', name: 'Sales Leads Pipeline' },
  { id: 'pipeline3', name: 'Product Sales Pipeline' },
];

// Define templates for agent prompts
const promptTemplates = [
  { 
    id: 'customer-support',
    name: 'Customer Support',
    prompt: 'You are a helpful customer support agent. Your goal is to assist customers with their questions and concerns in a friendly and professional manner. Always provide accurate information and escalate issues when necessary.'
  },
  { 
    id: 'lead-qualification',
    name: 'Lead Qualification',
    prompt: 'You are a lead qualification specialist. Your goal is to assess potential customers, understand their needs, and determine if our solutions are a good fit for them. Ask relevant questions to qualify leads effectively.'
  },
  { 
    id: 'faq-bot',
    name: 'FAQ Bot',
    prompt: 'You are an FAQ assistant. Your goal is to provide concise and accurate answers to frequently asked questions about our products and services. When you don\'t know an answer, suggest contacting support.'
  }
];

export default function CreateAgentPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Steps tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Step 1: Core Identity
  const [agentName, setAgentName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  
  // Step 2: Knowledge
  const [knowledgeSource, setKnowledgeSource] = useState<'files' | 'url' | 'text'>('files');
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState(['']);
  const [knowledgeText, setKnowledgeText] = useState('');
  
  // Step 3: Workflow Integration
  const [createCards, setCreateCards] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState('');
  
  // Step 4: Summary & Launch
  const [isTraining, setIsTraining] = useState(false);
  
  // Progress calculation
  const progressPercentage = (currentStep / totalSteps) * 100;
  
  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = promptTemplates.find(t => t.id === templateId);
    if (template) {
      setSystemPrompt(template.prompt);
    }
  };
  
  // Handle URL input changes
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };
  
  // Add a new URL input
  const addUrlInput = () => {
    setUrls([...urls, '']);
  };
  
  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };
  
  // Next step handler
  const handleNextStep = () => {
    // Validate current step
    if (currentStep === 1 && (!agentName || !systemPrompt)) {
      const { dismiss } = toast({
        title: "Missing information",
        description: "Please provide a name and system prompt for your agent.",
        variant: "destructive",
        duration: 5000,
        action: <Button onClick={() => dismiss()} className="bg-transparent hover:bg-red-800/20 text-white">Dismiss</Button>
      });
      return;
    }
    
    if (currentStep === 2) {
      // Knowledge validation
      if (
        (knowledgeSource === 'files' && files.length === 0) ||
        (knowledgeSource === 'url' && (!urls[0] || urls[0].trim() === '')) ||
        (knowledgeSource === 'text' && (!knowledgeText || knowledgeText.trim() === ''))
      ) {
        const { dismiss } = toast({
          title: "Knowledge source required",
          description: "Please provide at least one knowledge source for your agent.",
          variant: "destructive",
          duration: 5000,
          action: <Button onClick={() => dismiss()} className="bg-transparent hover:bg-red-800/20 text-white">Dismiss</Button>
        });
        return;
      }
    }
    
    if (currentStep === 3 && createCards && !selectedPipeline) {
      const { dismiss } = toast({
        title: "Pipeline selection required",
        description: "Please select a Kanban pipeline or disable card creation.",
        variant: "destructive",
        duration: 5000,
        action: <Button onClick={() => dismiss()} className="bg-transparent hover:bg-red-800/20 text-white">Dismiss</Button>
      });
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Previous step handler
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Create agent handler
  const handleCreateAgent = async () => {
    setIsTraining(true);

    try {
      // Construct FormData for the API
      const formData = new FormData();
      formData.append('name', agentName);
      formData.append('systemPrompt', systemPrompt);
      formData.append('status', 'Training'); // Or derive from state if needed
      formData.append('settings', JSON.stringify({
        createCards: createCards,
        linkedPipelineId: createCards ? selectedPipeline : null,
        initialMessages: ['Hello! How can I help you today?'], // Example default
        suggestedReplies: [], // Example default
        primaryColor: '#4A90E2' // Example default
      }));

      // Append knowledge sources
      if (knowledgeSource === 'files') {
        files.forEach(file => formData.append('knowledgeFiles', file));
      } else if (knowledgeSource === 'url') {
        const urlSources = urls.filter(url => url.trim() !== '').map(url => ({ type: 'url', name: url }));
        formData.append('otherKnowledgeSources', JSON.stringify(urlSources));
      } else if (knowledgeSource === 'text') {
        const textSources = [{ type: 'text', name: 'Custom knowledge text', content: knowledgeText }];
        formData.append('otherKnowledgeSources', JSON.stringify(textSources));
      }

      console.log('Submitting Agent FormData:', formData);

      const response = await fetch('/api/agent-studio', {
        method: 'POST',
        // Do NOT set Content-Type header; browser will set it for FormData
        body: formData,
      });

      if (!response.ok) {
        // Handle non-successful responses (e.g., 4xx, 5xx)
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('API Error:', response.status, errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Handle successful response (e.g., 201 Created)
      const createdAgent = await response.json();
      console.log('API Success:', createdAgent);

      const { dismiss } = toast({
        title: 'Agent creation started!',
        description: 'Your new agent is being created.',
        duration: 3000,
        action: <Button onClick={() => dismiss()} className="bg-transparent hover:bg-white/10">Dismiss</Button>
      });

      // Redirect to the new agent's detail page
      router.push(`/agent-studio/${createdAgent.id}`);

    } catch (error) {
      console.error('Failed to create agent:', error);
      const { dismiss } = toast({
        title: 'Error Creating Agent',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
        duration: 5000,
        action: <Button onClick={() => dismiss()} className="bg-transparent hover:bg-red-800/20 text-white">Dismiss</Button>
      });
    } finally {
      setIsTraining(false); // End loading state regardless of outcome
    }
  };
  
  return (
    <div className="container mx-auto py-8 text-white max-w-4xl">
      <h1 className="text-3xl font-bold mb-2">Create New AI Agent</h1>
      <p className="text-gray-400 mb-8">Configure your specialized AI agent in a few simple steps</p>
      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-gray-400">
          <span>Step {currentStep} of {totalSteps}</span>
          <span>{currentStep === 1 ? 'Core Identity' : currentStep === 2 ? 'Knowledge' : currentStep === 3 ? 'Workflow' : 'Launch'}</span>
        </div>
      </div>
      {/* Step 1: Core Identity */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <Label htmlFor="agent-name" className="text-lg font-medium mb-2 block">Agent Name</Label>
            <Input 
              id="agent-name"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Enter a name for your agent"
              className="bg-[#111111] border-[#333333] text-white rounded-none"
            />
          </div>
          
          <div>
            <Label className="text-lg font-medium mb-2 block">System Prompt Template</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {promptTemplates.map(template => (
                <div 
                  key={template.id}
                  className={`p-4 border cursor-pointer transition-colors ${
                    selectedTemplate === template.id 
                    ? 'border-white bg-[#222222]' 
                    : 'border-[#333333] bg-[#111111] hover:border-gray-400'
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <h3 className="font-medium mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3">{template.prompt}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="system-prompt" className="text-lg font-medium mb-2 block">System Prompt / Instructions</Label>
            <Textarea 
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter detailed instructions for your AI agent..."
              className="bg-[#111111] border-[#333333] text-white rounded-none min-h-[200px]"
            />
          </div>
        </div>
      )}
      {/* Step 2: Knowledge Infusion */}
      {currentStep === 2 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Infuse Knowledge</h2>
          <Tabs defaultValue="files" onValueChange={(value) => setKnowledgeSource(value as any)}>
            <TabsList className="bg-[#111111] border border-[#333333] rounded-none mb-6">
              <TabsTrigger value="files" className="rounded-none data-[state=active]:bg-[#333333]">Upload Files</TabsTrigger>
              <TabsTrigger value="url" className="rounded-none data-[state=active]:bg-[#333333]">Website URLs</TabsTrigger>
              <TabsTrigger value="text" className="rounded-none data-[state=active]:bg-[#333333]">Paste Text</TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="border border-[#333333] p-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">Upload Knowledge Files</Label>
                <div 
                  className="border-2 border-dashed border-[#333333] rounded p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="mb-2">Drag and drop files or click to browse</p>
                  <p className="text-sm text-gray-400">PDF, DOCX, TXT, CSV files accepted</p>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Selected Files:</h3>
                    <ul className="space-y-2">
                      {Array.from(files).map((file, index) => (
                        <li key={index} className="flex items-center justify-between bg-[#1a1a1a] p-2">
                          <span>{file.name}</span>
                          <span className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="border border-[#333333] p-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">Website URLs</Label>
                <p className="text-sm text-gray-400 mb-4">Enter URLs to crawl for knowledge</p>
                
                {urls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="https://example.com"
                      className="bg-[#111111] border-[#333333] text-white rounded-none flex-grow"
                    />
                    {index === urls.length - 1 && (
                      <Button onClick={addUrlInput} variant="outline" className="border-[#333333] text-white hover:bg-[#333333]">
                        Add More
                      </Button>
                    )}
                  </div>
                ))}
                
                <div className="flex items-center space-x-2 pt-4">
                  <Switch id="crawl-site" />
                  <Label htmlFor="crawl-site">Crawl entire site (follow links)</Label>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="text" className="border border-[#333333] p-6">
              <div className="space-y-4">
                <Label htmlFor="knowledge-text" className="text-lg font-medium">Paste Knowledge Text</Label>
                <Textarea 
                  id="knowledge-text"
                  value={knowledgeText}
                  onChange={(e) => setKnowledgeText(e.target.value)}
                  placeholder="Paste your knowledge content here..."
                  className="bg-[#111111] border-[#333333] text-white rounded-none min-h-[200px]"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
      {/* Step 3: Workflow Integration */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Connect to Workflow</h2>
          
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
              <Select value={selectedPipeline} onValueChange={setSelectedPipeline}>
                <SelectTrigger id="pipeline-select" className="bg-[#111111] border-[#333333] text-white rounded-none w-full">
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
      )}
      {/* Step 4: Launch */}
      {currentStep === 4 && (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Launch Your Agent</h2>
          
          <div className="bg-[#111111] border border-[#333333] p-6 space-y-4">
            <h3 className="font-medium text-xl">Agent Summary</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-gray-400">Name</p>
                <p className="font-medium">{agentName}</p>
              </div>
              
              <div>
                <p className="text-gray-400">Knowledge Source</p>
                <p className="font-medium">
                  {knowledgeSource === 'files' 
                    ? `${files.length} file${files.length !== 1 ? 's' : ''}` 
                    : knowledgeSource === 'url' 
                      ? `${urls.filter(u => u.trim() !== '').length} URL${urls.filter(u => u.trim() !== '').length !== 1 ? 's' : ''}` 
                      : 'Custom text'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400">Template</p>
                <p className="font-medium">
                  {selectedTemplate 
                    ? promptTemplates.find(t => t.id === selectedTemplate)?.name || 'Custom' 
                    : 'Custom'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400">Workflow Integration</p>
                <p className="font-medium">
                  {createCards 
                    ? `Kanban (${mockPipelines.find(p => p.id === selectedPipeline)?.name})` 
                    : 'None'}
                </p>
              </div>
            </div>
            
            <div className="pt-4">
              <p className="text-gray-400">System Instructions (Preview)</p>
              <div className="bg-[#0a0a0a] p-3 mt-1 max-h-[150px] overflow-y-auto">
                <p className="text-sm font-mono whitespace-pre-wrap">{systemPrompt}</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={handleCreateAgent} 
              disabled={isTraining} 
              className="bg-white text-black hover:bg-gray-200 rounded-none px-8 py-6 text-lg"
            >
              {isTraining ? (
                <>
                  <span className="animate-pulse mr-2">Training your agent...</span>
                  <span className="inline-block w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                </>
              ) : "Create & Train Agent"}
            </Button>
          </div>
        </div>
      )}
      {/* Navigation buttons */}
      <div className="flex justify-between mt-12">
        {currentStep > 1 ? (
          <Button
            onClick={handlePreviousStep}
            variant="outline"
            className="border-[#333333] text-white hover:bg-[#333333] rounded-none"
          >
            Previous Step
          </Button>
        ) : (
          (<div></div>) // Empty div to maintain spacing with flex justify-between
        )}
        
        {currentStep < totalSteps && (
          <Button 
            onClick={handleNextStep}
            className="bg-white text-black hover:bg-gray-200 rounded-none"
          >
            Next Step
          </Button>
        )}
      </div>
    </div>
  );
} 
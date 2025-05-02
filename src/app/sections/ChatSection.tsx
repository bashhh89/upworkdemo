'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Send, Plus, RefreshCw, ChevronDown, ChevronUp, Copy, Check, Search, X, MessageSquare, Trash2, Clipboard, Play, Maximize, Minimize, Save, ExternalLink, Bookmark, BookmarkCheck, Users, Target, Globe, Mail, Info, Tool, Building } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Added Card and CardContent import
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  thinking?: string;
  toolResult?: ToolResult; // Add this line
}

interface Thread {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: Date;
}

interface Model {
  id: string;
  name: string;
  description: string;
}

// Saved code artifact interface
interface CodeArtifact {
  id: string;
  code: string;
  language: string;
  title: string;
  description: string;
  createdAt: Date;
  preview?: string; // URL for sharing
}

// Tool result interface for specialized components
interface ToolResult {
  id: string;
  toolName: string; // "Website Intelligence", "Executive Persona", etc.
  url?: string;     // URL of analyzed website or other source
  content: any;     // The result data - structure depends on the tool
  summary: string;  // Text summary of the result
  createdAt: Date;
  shareUrl?: string; // URL for sharing
}

export default function ChatSection() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("openai");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [modelSearch, setModelSearch] = useState('');
  const [threadNameInput, setThreadNameInput] = useState('');
  const [pollinationsModels, setPollinationsModels] = useState<Model[]>([
    { id: "openai", name: "OpenAI", description: "GPT-4o-mini - Balanced, reliable model for general tasks" },
    { id: "openai-large", name: "OpenAI Large", description: "GPT-4o - More powerful OpenAI model with enhanced capabilities" },
    { id: "gemini", name: "Gemini", description: "Google's advanced language model with strong reasoning capabilities" },
    { id: "mistral", name: "Mistral", description: "Fast and efficient language model with good reasoning" },
    { id: "qwen-coder", name: "Qwen Coder", description: "Specialized in code generation and programming tasks" },
    { id: "llama", name: "Llama", description: "Meta's large language model with broad capabilities" },
    { id: "llamascout", name: "Llama Scout", description: "Research-focused variant of Llama" },
    { id: "unity", name: "Unity", description: "Specialized model with creative capabilities" },
    { id: "midijourney", name: "Midi Journey", description: "Specialized in music and audio descriptions" },
    { id: "rtist", name: "Rtist", description: "Artistic and creative text generation" },
    { id: "searchgpt", name: "Search GPT", description: "Specialized in search and information retrieval" },
    { id: "evil", name: "Evil", description: "Model with less content restrictions (use responsibly)" },
    { id: "deepseek-reasoning", name: "DeepSeek Reasoning", description: "Enhanced reasoning capabilities for complex problems" },
    { id: "deepseek-reasoning-large", name: "DeepSeek Reasoning Large", description: "Larger model with superior reasoning abilities" },
    { id: "phi", name: "Phi", description: "Microsoft's compact but powerful language model" },
    { id: "llama-vision", name: "Llama Vision", description: "Model with advanced knowledge representation" },
    { id: "hormoz", name: "Hormoz", description: "Specialized conversational AI" },
    { id: "hypnosis-tracy", name: "Hypnosis Tracy", description: "Specialized therapeutic conversation model" },
    { id: "deepseek", name: "DeepSeek", description: "General purpose model with strong capabilities" },
    { id: "sur", name: "Sur", description: "Specialized in summarization and content organization" }
  ]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [threadDropdownOpen, setThreadDropdownOpen] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<string[]>([]);
  const [codePreview, setCodePreview] = useState<{code: string, language: string, id?: string} | null>(null);
  const [savedArtifacts, setSavedArtifacts] = useState<CodeArtifact[]>([]);
  // Add state for tool results
  const [savedToolResults, setSavedToolResults] = useState<ToolResult[]>([]);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showToolResultsLibrary, setShowToolResultsLibrary] = useState(false);
  const [artifactTitle, setArtifactTitle] = useState('');
  const [artifactDescription, setArtifactDescription] = useState('');
  
  // Always keep auto-preview enabled since we removed the toggle
  const autoPreviewEnabled = true;
  
  const [isSavingArtifact, setIsSavingArtifact] = useState(false);

  // Function to toggle the artifact saving form
  const toggleSavingArtifact = () => {
    setIsSavingArtifact(prev => !prev);
    // Clear title/description when closing the form
    if (isSavingArtifact) {
      setArtifactTitle('');
      setArtifactDescription('');
    }
  };

  // Fetch available models from Pollinations API
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch('https://text.pollinations.ai/models');
        if (!response.ok) {
          throw new Error(`Error fetching models: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process the models data - format may vary based on the API
        const modelsList: Model[] = [];
        
        // Handle case where the API returns an array of strings
        if (Array.isArray(data) && typeof data[0] === 'string') {
          data.forEach((modelId: string) => {
            if (modelId !== 'openai-audio') { // Skip audio model
              // Find if we already have a description for this model
              const existingModel = pollinationsModels.find(m => m.id === modelId);
              
              if (existingModel) {
                modelsList.push(existingModel);
              } else {
                const displayName = modelId
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                modelsList.push({
                  id: modelId,
                  name: displayName,
                  description: `${displayName} Model`
                });
              }
            }
          });
        } 
        // Handle case where it returns an object with model details
        else if (typeof data === 'object' && !Array.isArray(data)) {
          Object.entries(data).forEach(([modelId, details]: [string, any]) => {
            if (modelId !== 'openai-audio') { // Skip audio model
              // Find if we already have a description for this model
              const existingModel = pollinationsModels.find(m => m.id === modelId);
              
              if (existingModel) {
                modelsList.push(existingModel);
              } else {
                const displayName = modelId
                  .split('-')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                
                modelsList.push({
                  id: modelId,
                  name: displayName,
                  description: details?.description || `${displayName} Model`
                });
              }
            }
          });
        }
        
        // If we got no models, keep the defaults
        if (modelsList.length > 0) {
          // Ensure the most reliable models are at the top
          const orderedModels = [
            ...modelsList.filter(m => ['openai', 'openai-large', 'mistral'].includes(m.id)),
            ...modelsList.filter(m => !['openai', 'openai-large', 'mistral'].includes(m.id))
          ];
          setPollinationsModels(orderedModels);
        }
      } catch (error) {
        console.error('Error fetching models:', error);
        // Keep the default models in case of error
      } finally {
        setIsLoadingModels(false);
      }
    };
    
    fetchModels();
  }, []);

  // Load threads from localStorage on mount
  useEffect(() => {
    const savedThreads = localStorage.getItem('chatThreads');
    if (savedThreads) {
      try {
        const parsedThreads = JSON.parse(savedThreads).map((thread: any) => ({
          ...thread,
          lastUpdated: new Date(thread.lastUpdated)
        }));
        setThreads(parsedThreads);
        
        // Load last active thread if exists
        const lastActiveId = localStorage.getItem('activeThreadId');
        if (lastActiveId && parsedThreads.some(t => t.id === lastActiveId)) {
          setActiveThreadId(lastActiveId);
          const activeThread = parsedThreads.find(t => t.id === lastActiveId);
          if (activeThread) {
            setMessages(activeThread.messages);
          }
        }
      } catch (error) {
        console.error('Error loading saved threads:', error);
        setThreads([]);
      }
    }
  }, []);

  // Save threads to localStorage when they change
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('chatThreads', JSON.stringify(threads));
    }
    
    if (activeThreadId) {
      localStorage.setItem('activeThreadId', activeThreadId);
    }
  }, [threads, activeThreadId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Scroll to bottom of messages
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Reset copied code state after 2 seconds
  useEffect(() => {
    if (copiedCode) {
      const timer = setTimeout(() => setCopiedCode(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copiedCode]);

  // Load saved artifacts from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('codeArtifacts');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setSavedArtifacts(parsedItems);
      } catch (error) {
        console.error('Error loading saved artifacts:', error);
      }
    }
  }, []);

  // Save artifacts to localStorage when they change
  useEffect(() => {
    if (savedArtifacts.length > 0) {
      localStorage.setItem('codeArtifacts', JSON.stringify(savedArtifacts));
    }
  }, [savedArtifacts]);

  // Load saved tool results from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('toolResults');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
        setSavedToolResults(parsedItems);
      } catch (error) {
        console.error('Error loading saved tool results:', error);
      }
    }
  }, []);

  // Save tool results to localStorage when they change
  useEffect(() => {
    if (savedToolResults.length > 0) {
      localStorage.setItem('toolResults', JSON.stringify(savedToolResults));
    }
  }, [savedToolResults]);

  // Function to execute specialized tools and integrate results with chat
  const executeSpecializedTool = async (toolName: string, params: any) => {
    // Create user message for the tool request
    let userMessage = '';
    
    switch (toolName) {
      case 'Website Intelligence':
        userMessage = `Analyze website: ${params.url}`;
        break;
      case 'Executive Persona':
        userMessage = `Create an executive persona for ${params.role} in ${params.industry}`;
        break;
      case 'Customer Profile':
        userMessage = `Generate a customer profile for ${params.product}`;
        break;
      default:
        userMessage = `Use ${toolName} with parameters: ${JSON.stringify(params)}`;
    }
    
    // Add user message to chat
    const userMessageObj: Message = { role: 'user', content: userMessage };
    const updatedMessages: Message[] = [...messages, userMessageObj];
    setMessages(updatedMessages);
    setIsLoading(true);
    
    try {
      // Execute the appropriate tool
      let result: ToolResult;
      const resultId = uuidv4();
      
      switch (toolName) {
        case 'Website Intelligence':
          // Call the website intelligence API
          const response = await fetch('/api/tools/website-scanner', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: params.url })
          });
          
          if (!response.ok) {
            throw new Error(`Error scanning website: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Create a tool result
          result = {
            id: resultId,
            toolName,
            url: params.url,
            content: data,
            summary: `Analysis of ${params.url} found ${data.categories?.length || 0} categories and ${data.links?.length || 0} links.`,
            createdAt: new Date(),
            shareUrl: `/shared/tool-result/${resultId}`
          };
          break;
          
        case 'Executive Persona':
          // Similar implementation for Executive Persona
          // This would call the appropriate API endpoint
          result = {
            id: resultId,
            toolName,
            content: {
              role: params.role,
              industry: params.industry,
              // This would be filled with actual API response data
              persona: {}
            },
            summary: `Executive persona created for ${params.role} in ${params.industry}.`,
            createdAt: new Date(),
            shareUrl: `/shared/tool-result/${resultId}`
          };
          break;
          
        // Add other tool cases as needed
          
        default:
          throw new Error(`Unsupported tool: ${toolName}`);
      }
      
      // Save the tool result
      setSavedToolResults(prev => [result, ...prev]);
      
      // Create assistant message with the result
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I've analyzed this using our **${toolName}** tool.\n\n**Summary:** ${result.summary}\n\n[View Full Analysis](${result.shareUrl})\n\nWould you like me to explain specific aspects of this analysis?`,
        toolResult: result // Add the tool result to the message for reference
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Update thread with the messages
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
      }
      
      return result;
    } catch (error) {
      console.error(`Error executing ${toolName}:`, error);
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, there was an error executing the ${toolName} tool: ${(error as Error).message}`
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Update thread with error message
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  // State for handling interactive tool parameter input
  const [pendingTool, setPendingTool] = useState<{ 
    toolName: string, 
    params: Record<string, string>,
    requiredParams: string[] 
  } | null>(null);

  // Function to detect and execute tools based on user input
  const detectAndExecuteTool = async (input: string) => {
    // Website Intelligence detection
    const websiteRegex = /analyze\s+(website|site|url|domain)?:?\s*(https?:\/\/[^\s]+)?/i;
    const websiteMatch = input.match(websiteRegex);
    
    if (websiteMatch) {
      // If URL is provided, execute immediately
      if (websiteMatch[2]) {
        return executeSpecializedTool('Website Intelligence', { url: websiteMatch[2] });
      } else {
        // Otherwise, set pending tool to collect URL parameter
        setPendingTool({
          toolName: 'Website Intelligence',
          params: {},
          requiredParams: ['url']
        });
        return null;
      }
    }
    
    // Executive Persona detection
    const personaRegex = /create\s+(an?\s+)?(executive|leader|cxo)\s+persona\s+for\s+a?\s+([^]+?)\s+in\s+([^]+?)(?:\.|$)/i;
    const personaMatch = input.match(personaRegex);
    
    if (personaMatch) {
      if (personaMatch[3] && personaMatch[4]) {
        return executeSpecializedTool('Executive Persona', { 
          role: personaMatch[3].trim(), 
          industry: personaMatch[4].trim() 
        });
      } else {
        // Set pending tool to collect role and industry parameters
        setPendingTool({
          toolName: 'Executive Persona',
          params: {},
          requiredParams: ['role', 'industry']
        });
        return null;
      }
    }
    
    // Customer Profile detection
    const profileRegex = /generate\s+(a\s+)?(customer|client|buyer)\s+profile\s+for\s+([^]+?)(?:\.|$)/i;
    const profileMatch = input.match(profileRegex);
    
    if (profileMatch) {
      if (profileMatch[3]) {
        return executeSpecializedTool('Customer Profile', { 
          product: profileMatch[3].trim()
        });
      } else {
        // Set pending tool to collect product parameter
        setPendingTool({
          toolName: 'Customer Profile',
          params: {},
          requiredParams: ['product']
        });
        return null;
      }
    }
    
    // No tool detected
    return null;
  };
  
  // Function to render tool parameter form
  const renderToolParamForm = () => {
    if (!pendingTool) return null;
    
    const handleParamSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      executeSpecializedTool(pendingTool.toolName, pendingTool.params);
      setPendingTool(null);
    };
    
    const updateParam = (param: string, value: string) => {
      setPendingTool(prev => prev ? {
        ...prev,
        params: {
          ...prev.params,
          [param]: value
        }
      } : null);
    };
    
    // Get placeholder and label based on tool and parameter
    const getParamInfo = (toolName: string, param: string) => {
      switch (toolName) {
        case 'Website Intelligence':
          if (param === 'url') return {
            label: 'Website URL',
            placeholder: 'https://example.com',
            icon: <Globe className="h-4 w-4 text-blue-500" />
          };
          break;
        case 'Executive Persona':
          if (param === 'role') return {
            label: 'Executive Role',
            placeholder: 'CEO, CTO, CFO, CMO, etc.',
            icon: <Users className="h-4 w-4 text-purple-500" />
          };
          if (param === 'industry') return {
            label: 'Industry',
            placeholder: 'SaaS, Fintech, Healthcare, etc.',
            icon: <Building className="h-4 w-4 text-purple-500" />
          };
          break;
        case 'Customer Profile':
          if (param === 'product') return {
            label: 'Product or Service',
            placeholder: 'B2B Marketing Software, etc.',
            icon: <Target className="h-4 w-4 text-green-500" />
          };
          break;
      }
      return { 
        label: param.charAt(0).toUpperCase() + param.slice(1),
        placeholder: `Enter ${param}`,
        icon: <Info className="h-4 w-4 text-gray-500" />
      };
    };
    
    return (
      <div className="py-4 px-6 bg-[#111] border border-[#333] rounded-lg mb-6 animate-in fade-in duration-300">
        <h3 className="text-white text-md font-medium mb-4 flex items-center">
          <Tool className="h-5 w-5 mr-2 text-blue-500" />
          Configure <span className="text-blue-400 mx-1">{pendingTool.toolName}</span> Parameters
        </h3>
        
        <form onSubmit={handleParamSubmit}>
          <div className="space-y-4">
            {pendingTool.requiredParams.map(param => {
              const { label, placeholder, icon } = getParamInfo(pendingTool.toolName, param);
              return (
                <div key={param} className="space-y-2">
                  <label className="text-sm text-gray-300">{label}:</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      {icon}
                    </div>
                    <input
                      type="text"
                      value={pendingTool.params[param] || ''}
                      onChange={(e) => updateParam(param, e.target.value)}
                      placeholder={placeholder}
                      className="w-full px-10 py-2 bg-[#0a0a0a] border border-[#333] rounded text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-end space-x-3 mt-4">
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => setPendingTool(null)}
              className="text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Run Analysis
            </Button>
          </div>
        </form>
      </div>
    );
  };

  // Sample suggestions
  const suggestions = [
    "Analyze website: example.com and identify key improvement opportunities",
    "Create an executive persona for a SaaS company CEO in the fintech industry",
    "Generate a customer profile for my B2B marketing automation software",
    "Analyze website: competitor-site.com and extract key competitor data",
    "Write an outreach email template for cold contacting CMOs about our AI solution"
  ];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
  };
  
  // Add function to copy an entire message
  const handleCopyMessage = (message: string) => {
    navigator.clipboard.writeText(message);
    setCopiedMessage(message);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  // Update thread with new messages
  const updateThreadMessages = (threadId: string, newMessages: Message[]) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId
        ? { ...thread, messages: newMessages, lastUpdated: new Date() }
        : thread
    ));
  };

  // Get thread name from first message or default
  const getThreadNameFromMessages = (msgs: Message[]): string => {
    if (msgs.length === 0) return "New thread";
    
    const firstUserMsg = msgs.find(m => m.role === "user");
    if (!firstUserMsg) return "New thread";
    
    const content = firstUserMsg.content.trim();
    return content.length > 30 ? content.substring(0, 27) + "..." : content;
  };

  // Function to toggle thinking section expansion
  const toggleThinking = (messageId: string) => {
    setExpandedThinking(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId) 
        : [...prev, messageId]
    );
  };

  // Helper function to extract thinking content
  // Note on model-specific behaviors:
  // - deepseek-reasoning: Reliably uses <think>...</think> tags that can be parsed
  // - gemini, openai-large, mistral: Include reasoning within their responses but don't use explicit tags
  // This means the thinking extraction only works reliably with deepseek-reasoning model
  const extractThinking = (content: string): { thinking: string, response: string } => {
    // Check if content has explicit thinking section with tags
    if (content.includes('<think>') && content.includes('</think>')) {
      const thinkingMatch = content.match(/<think>([\s\S]*?)<\/think>/);
      const thinking = thinkingMatch ? thinkingMatch[1].trim() : '';
      const response = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
      return { thinking, response };
    }
    
    // For models that don't use tags but include reasoning (gemini, openai-large, mistral)
    // Look for common reasoning patterns in the response
    const reasoningPatterns = [
      // Match sections that look like step-by-step reasoning
      /(?:Let me think about this|Let's think|Here's my thinking|My reasoning|Let me work through this|I'll analyze this step by step|Let me break this down)([^]*?)(?:Therefore|In conclusion|So,|To summarize|Final answer|That means)/i,
      // Match numbered steps often used in reasoning
      /(?:Step 1:|1\.|First,)([^]*?)(?:So to summarize|In conclusion|Therefore|The answer is)/i,
      // Match "I'll" sections that indicate starting the reasoning process
      /(?:I'll|I will)(?:\s+first|\s+now|\s+analyze|\s+break down|\s+solve|\s+tackle)([^]*?)(?:Therefore|In conclusion|So,|To summarize|Final answer)/i
    ];
    
    // Try to find reasoning section using the patterns
    for (const pattern of reasoningPatterns) {
      const match = content.match(pattern);
      if (match && match[1] && match[1].length > 50) { // Ensure the match is substantial
        const reasoning = match[1].trim();
        const finalAnswer = content.substring(content.indexOf(match[0]) + match[0].length).trim();
        
        // Only extract if we have both parts
        if (reasoning && finalAnswer) {
          return {
            thinking: reasoning,
            response: `${content.substring(0, content.indexOf(match[0]))}\n${finalAnswer}`
          };
        }
      }
    }
    
    // If no pattern matches, check if response is long and might contain reasoning
    if (content.length > 300) {
      const lines = content.split('\n');
      const responseThird = Math.floor(lines.length / 3);
      
      // Take the first 1/3 of the response as potential reasoning if it's substantial
      if (responseThird > 2) {
        const thinking = lines.slice(0, responseThird).join('\n').trim();
        const response = lines.slice(responseThird).join('\n').trim();
        
        // Only return split content if thinking section looks like reasoning
        if (thinking.includes('let me') || thinking.includes('I think') || 
            thinking.includes('step') || thinking.includes('approach') ||
            thinking.includes('analyze') || thinking.includes('consider')) {
          return { thinking, response };
        }
      }
    }
    
    // Default case: no thinking section detected
    return { thinking: '', response: content };
  };

  // Detect language from code block
  const getLanguageFromClassName = (className: string | undefined): string => {
    if (!className) return 'text';
    const match = /language-(\w+)/.exec(className);
    return match ? match[1] : 'text';
  };
  
  // Check if code is HTML
  const isHTML = (code: string): boolean => {
    return code.trim().startsWith('<') && 
           (code.includes('<html') || code.includes('<body') || 
            code.includes('<div') || code.includes('<head'));
  };
  
  // Check if code is CSS
  const isCSS = (code: string): boolean => {
    const cssPatterns = [
      /\s*\{[\s\S]*?\}\s*/,  // CSS blocks
      /\s*:\s*[\w\s\d#]+;/   // property: value;
    ];
    return cssPatterns.some(pattern => pattern.test(code));
  };
  
  // Generate a share URL for an artifact
  const getShareUrl = (artifactId: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared-code/${artifactId}`;
  };
  
  // Add notification when share link is copied - create a completely revised toast system
  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url);
    
    // Create a simple notification element that will self-dismiss
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-black border border-gray-700 text-white px-4 py-3 rounded shadow-lg z-[9999] flex items-center gap-3';
    notification.innerHTML = `
      <div>
        <div class="font-medium">Link copied!</div>
        <div class="text-sm text-gray-400">Share this link to give others access to this code snippet.</div>
      </div>
      <button class="h-6 w-6 rounded-full hover:bg-gray-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Add the close button functionality
    const closeButton = notification.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        document.body.removeChild(notification);
      });
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };
  
  // Create a more robust notification system
  const showNotification = (title: string, description: string) => {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-black border border-gray-700 text-white px-4 py-3 rounded shadow-lg z-[9999] flex items-center gap-3';
    notification.innerHTML = `
      <div>
        <div class="font-medium">${title}</div>
        <div class="text-sm text-gray-400">${description}</div>
      </div>
      <button class="h-6 w-6 rounded-full hover:bg-gray-700 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;
    
    // Add the close button functionality
    const closeButton = notification.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        document.body.removeChild(notification);
      });
    }
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Auto dismiss after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  // Save the current preview as an artifact
  const saveArtifact = () => {
    if (!codePreview) return;
    
    const artifactId = codePreview.id || uuidv4();
    const newArtifact: CodeArtifact = {
      id: artifactId,
      code: codePreview.code,
      language: codePreview.language,
      title: artifactTitle || `${codePreview.language.charAt(0).toUpperCase() + codePreview.language.slice(1)} snippet`,
      description: artifactDescription || 'Saved code snippet',
      createdAt: new Date(),
      preview: getShareUrl(artifactId)
    };
    
    const updatedArtifacts = [newArtifact, ...savedArtifacts.filter(a => a.id !== artifactId)];
    setSavedArtifacts(updatedArtifacts);
    
    // Save to localStorage immediately
    localStorage.setItem('codeArtifacts', JSON.stringify(updatedArtifacts));
    
    setArtifactTitle('');
    setArtifactDescription('');
    
    // Update the preview with the ID
    setCodePreview({...codePreview, id: artifactId});
    
    // Show a toast notification
    showNotification("Code saved!", "Your code snippet has been saved to your library.");
    
    // Copy the share link to clipboard
    copyShareLink(getShareUrl(artifactId));
  };
  
  // Delete an artifact
  const deleteArtifact = (id: string) => {
    const updatedArtifacts = savedArtifacts.filter(artifact => artifact.id !== id);
    setSavedArtifacts(updatedArtifacts);
    
    // Update localStorage
    localStorage.setItem('codeArtifacts', JSON.stringify(updatedArtifacts));
    
    // Show notification
    showNotification("Code deleted", "The code snippet has been removed from your library.");
  };
  
  // Load an artifact into the preview
  const loadArtifact = (artifact: CodeArtifact) => {
    setCodePreview({
      code: artifact.code,
      language: artifact.language,
      id: artifact.id
    });
    setShowLibrary(false);
  };
  
  // Enhanced preview handler with ID generation
  const handleShowPreview = (code: string, language: string) => {
    console.log(`Displaying preview for ${language} code, length: ${code.length}`);
    setCodePreview({ 
      code, 
      language,
      id: uuidv4() // Generate unique ID for each preview
    });
    
    // Make sure the UI updates immediately
    setTimeout(() => {
      const previewElement = document.querySelector('[title="Code Preview"]');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Component for the artifact saving form
  interface ArtifactSaveFormProps {
    isSaving: boolean;
    setIsSaving: (isSaving: boolean) => void;
    artifactTitle: string;
    setArtifactTitle: (title: string) => void;
    artifactDescription: string;
    setArtifactDescription: (description: string) => void;
    saveArtifact: () => void;
    toggleSaving: () => void;
    language: string; // Pass language for placeholder
  }

  const ArtifactSaveForm = ({
    isSaving,
    setIsSaving,
    artifactTitle,
    setArtifactTitle,
    artifactDescription,
    setArtifactDescription,
    saveArtifact,
    toggleSaving,
    language
  }: ArtifactSaveFormProps) => {
    // Use local state to avoid focus issues with controlled inputs
    const [localTitle, setLocalTitle] = useState(artifactTitle);
    const [localDescription, setLocalDescription] = useState(artifactDescription);

    // Update parent state only when input is complete (blur/submit)
    const updateTitle = (value: string) => {
      setLocalTitle(value);
      setArtifactTitle(value);
    };

    const updateDescription = (value: string) => {
      setLocalDescription(value);
      setArtifactDescription(value);
    };

    // Handle local state updates separately from parent state to avoid focus issues
    useEffect(() => {
      setLocalTitle(artifactTitle);
    }, [artifactTitle]);

    useEffect(() => {
      setLocalDescription(artifactDescription);
    }, [artifactDescription]);

    return (
      <>
        {isSaving && (
          <div className="p-4 border-b border-[#333] bg-[#111] relative z-50">
            <h3 className="text-white text-sm font-medium mb-3">Save this code snippet</h3>
            <div className="grid gap-3">
              <div>
                <label className="text-gray-400 text-xs block mb-1">Title</label>
                <Input
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={() => updateTitle(localTitle)}
                  placeholder={`${language.charAt(0).toUpperCase() + language.slice(1)} snippet`}
                  className="bg-[#0a0a0a] border-[#333] text-white"
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs block mb-1">Description</label>
                <Textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  onBlur={() => updateDescription(localDescription)}
                  placeholder="Brief description of this code"
                  className="bg-[#0a0a0a] border-[#333] text-white resize-none h-20"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSaving(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    // Update parent state before saving
                    setArtifactTitle(localTitle);
                    setArtifactDescription(localDescription);
                    saveArtifact();
                    toggleSaving(); // Use the passed-in toggle function
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // Typing indicator component
  const TypingIndicator = () => {
    const [dots, setDots] = useState(1);
    
    useEffect(() => {
      const interval = setInterval(() => {
        setDots(prev => prev < 3 ? prev + 1 : 1);
      }, 500);
      
      return () => clearInterval(interval);
    }, []);
    
    return (
      <div className="flex justify-start mb-8">
        <div className="relative max-w-[90%] rounded-md bg-[#111111] border border-[#333333] text-white p-5">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <span className={`w-2 h-2 rounded-full ${dots >= 1 ? 'bg-blue-500' : 'bg-gray-600'} transition-colors duration-300`}></span>
              <span className={`w-2 h-2 rounded-full ${dots >= 2 ? 'bg-blue-500' : 'bg-gray-600'} transition-colors duration-300`}></span>
              <span className={`w-2 h-2 rounded-full ${dots >= 3 ? 'bg-blue-500' : 'bg-gray-600'} transition-colors duration-300`}></span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-400 font-medium">
                {getModelDisplay(selectedModel)}
              </span>
              <span className="ml-2 text-sm text-gray-400">
                is generating a response
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to automatically show preview when a code block is detected in an assistant message
  const autoPreviewCode = (message: Message) => {
    // Only auto-preview assistant messages
    if (message.role !== 'assistant') return;
    
    // Enhanced regex to catch more code block formats
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)\n```/g;
    let match;
    let lastCodeBlock = null;
    let hasHtmlContent = false;
    
    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2];
      
      // Check if this is HTML content
      if (language === 'html' || code.trim().startsWith('<') && (code.includes('<html') || code.includes('<body') || code.includes('<div'))) {
        // HTML content gets priority - show it immediately
        handleShowPreview(code, 'html');
        hasHtmlContent = true;
        break;
      }
      
      // Store the last code block found
      lastCodeBlock = { language, code };
    }
    
    // If HTML wasn't shown but we found other code, show the last code block
    if (!hasHtmlContent && lastCodeBlock) {
      handleShowPreview(lastCodeBlock.code, lastCodeBlock.language);
    }
  };

  // Modify handleSend to use tools when appropriate
  const handleSend = async () => {
    if (!input.trim()) return;
    
    // First, check if the input should trigger a specialized tool
    const toolResult = await detectAndExecuteTool(input.trim());
    
    // If a tool was executed, no need to call the chat API
    if (toolResult) {
      setInput('');
      return;
    }
    
    // Regular chat flow for non-tool messages
    // Add user message
    const userMessage: Message = { role: 'user' as const, content: input };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    // Create a new thread if none exists
    if (!activeThreadId) {
      const newThreadId = Date.now().toString();
      const newThread: Thread = {
        id: newThreadId,
        name: getThreadNameFromMessages([userMessage]),
        messages: updatedMessages,
        lastUpdated: new Date()
      };
      
      setThreads(prev => [newThread, ...prev]);
      setActiveThreadId(newThreadId);
    } else {
      // Update existing thread
      updateThreadMessages(activeThreadId, updatedMessages);
    }
    
    try {
      // Scroll to bottom to show the typing indicator
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Check if this is likely a code generation request
      const isCodeRequest = /code|create|generate|script|html|css|javascript|function|programming/i.test(input.toLowerCase());
      
      // Check if it's a complex code request (landing pages, complete websites, etc.)
      const isComplexCodeRequest = isCodeRequest && 
                                /landing page|website|app|application|complete|full/i.test(input.toLowerCase());
      
      // Add a timeout for the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout for complex code generation
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId); // Clear the timeout if the request completes
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API response error (${response.status}):`, errorText);
        throw new Error(`Error from API: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Use the model info returned from the API if available
      const modelUsed = data.model || selectedModel;
      
      // Extract thinking and response content
      const content = data.choices[0].message.content;
      const { thinking, response: cleanedResponse } = extractThinking(content);
      
      const assistantMessage: Message = { 
        role: 'assistant' as const, 
        content: cleanedResponse,
        thinking: thinking,
        model: modelUsed
      };
      
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      // Always auto-preview responses, with priority for code generation requests
      const forcePreview = isCodeRequest || /code|html|css|javascript/i.test(assistantMessage.content);
      // Always run auto-preview since it's always enabled now
      autoPreviewCode(assistantMessage);
      
      // Update thread with assistant response
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
        
        // Update thread name if it's the first message
        if (updatedMessages.length === 1) {
          setThreads(prev => prev.map(thread => 
            thread.id === activeThreadId
              ? { ...thread, name: getThreadNameFromMessages([userMessage]) }
              : thread
          ));
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle abort error specifically
      let errorContent = 'Sorry, there was an error processing your request. ';
      
      if (error.name === 'AbortError') {
        errorContent += 'The request took too long to complete. For complex generations like landing pages:\n\n' + 
          '1. Break your request into smaller steps\n' +
          '2. Specify the framework you prefer\n' +
          '3. Try again with more specific details about what you want';
      } else if (error.message?.includes('500')) {
        errorContent += 'The server encountered an internal error. This often happens with complex generation requests. Try the following:\n\n' + 
          '1. Break your request into smaller, simpler parts\n' +
          '2. Be more specific about what you want';
      } else {
        errorContent += 'The model you selected might be temporarily unavailable. Please try again with a different model.';
      }
      
      const errorMessage: Message = { 
        role: 'assistant' as const, 
        content: errorContent,
        model: 'system'
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      // Update thread with error message
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const createNewThread = () => {
    setMessages([]);
    setActiveThreadId(null);
    setThreadNameInput('');
  };
  
  const selectThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setMessages(thread.messages);
      setActiveThreadId(threadId);
    }
  };
  
  const deleteThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads(prev => prev.filter(thread => thread.id !== threadId));
    
    if (activeThreadId === threadId) {
      setMessages([]);
      setActiveThreadId(null);
    }
  };
  
  const renameThread = (threadId: string, newName: string) => {
    if (!newName.trim()) return;
    
    setThreads(prev => prev.map(thread => 
      thread.id === threadId
        ? { ...thread, name: newName }
        : thread
    ));
    setThreadNameInput('');
  };

  // Filter models based on search
  const filteredModels = modelSearch.trim() === '' 
    ? pollinationsModels 
    : pollinationsModels.filter(model => 
        model.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
        model.description.toLowerCase().includes(modelSearch.toLowerCase())
      );

  // Helper function to detect code files based on language
  const getFileExtension = (language: string): string => {
    const extensions: Record<string, string> = {
      js: 'js',
      javascript: 'js',
      jsx: 'jsx',
      ts: 'ts',
      typescript: 'tsx',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      md: 'md',
      py: 'py',
      python: 'py',
      rb: 'rb',
      ruby: 'rb',
      // Add more languages as needed
    };
    return extensions[language] || 'txt';
  };

  // Define templates for different frameworks
  const templates: Record<string, Record<string, string>> = {
    vanilla: {
      'index.js': 'console.log("Hello world!");',
      'index.html': '<div id="app"></div>',
    },
    react: {
      'App.js': `import React from 'react';

export default function App() {
  return (
    <div>
      <h1>Hello React</h1>
    </div>
  );
}`,
      'index.js': `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));`,
      'index.html': '<div id="root"></div>',
    }
  };

  // Custom renderer for code blocks and tables
  const renderers = {
    // Root wrapper with proper styling
    root: ({ children }: { children: React.ReactNode }) => (
      <div className="prose prose-invert max-w-none break-words text-base">
        {children}
      </div>
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-6">
        <table className="border-collapse border border-[#333333] w-full">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children: React.ReactNode }) => (
      <thead className="bg-[#111111]">
        {children}
      </thead>
    ),
    tbody: ({ children }: { children: React.ReactNode }) => (
      <tbody>
        {children}
      </tbody>
    ),
    tr: ({ children }: { children: React.ReactNode }) => (
      <tr className="border-b border-[#333333]">
        {children}
      </tr>
    ),
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="border border-[#333333] p-2 text-left">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="border border-[#333333] p-2">
        {children}
      </td>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <div className="relative">
          <pre className="bg-[#111111] p-4 rounded-md overflow-x-auto my-4 border border-[#333333] relative">
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => handleCopyCode(String(children).replace(/\n$/, ''))}
                className="bg-[#222] hover:bg-[#333] p-1 rounded text-xs flex items-center"
                aria-label="Copy code"
              >
                {copiedCode === String(children).replace(/\n$/, '') ? (
                  <><Check className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy</>
                )}
              </button>
            </div>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      ) : (
        <code className="bg-[#111111] px-1 py-0.5 rounded font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    p: ({ children }: { children: React.ReactNode }) => (
      <p className="mb-4 leading-7">{children}</p>
    ),
    h1: ({ children }: { children: React.ReactNode }) => (
      <h1 className="text-2xl font-bold my-6">{children}</h1>
    ),
    h2: ({ children }: { children: React.ReactNode }) => (
      <h2 className="text-xl font-bold my-5">{children}</h2>
    ),
    h3: ({ children }: { children: React.ReactNode }) => (
      <h3 className="text-lg font-bold my-4">{children}</h3>
    ),
    h4: ({ children }: { children: React.ReactNode }) => (
      <h4 className="text-base font-bold my-3">{children}</h4>
    ),
    ul: ({ children }: { children: React.ReactNode }) => (
      <ul className="list-disc list-inside mb-4 pl-2 space-y-2">{children}</ul>
    ),
    ol: ({ children }: { children: React.ReactNode }) => (
      <ol className="list-decimal list-inside mb-4 pl-2 space-y-2">{children}</ol>
    ),
    li: ({ children }: { children: React.ReactNode }) => (
      <li className="mb-1">{children}</li>
    ),
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-4 border-[#333333] pl-4 my-4 italic">{children}</blockquote>
    ),
  };

  // Function to get model name display
  const getModelDisplay = (modelId?: string) => {
    if (!modelId) return "System";
    const model = pollinationsModels.find(m => m.id === modelId);
    return model ? model.name : modelId;
  };

  // Code preview component
  interface CodePreviewProps {
    code: string;
    language: string;
    id?: string;
    // Props for controlling the save form
    isSaving: boolean;
    setIsSaving: (isSaving: boolean) => void;
    artifactTitle: string;
    setArtifactTitle: (title: string) => void;
    artifactDescription: string;
    setArtifactDescription: (description: string) => void;
    toggleSaving: () => void; // Function to toggle save form visibility
  }

  const CodePreview = ({
    code,
    language,
    id,
    isSaving,
    setIsSaving,
    artifactTitle,
    setArtifactTitle,
    artifactDescription,
    setArtifactDescription,
    toggleSaving // Use the passed toggle function
  }: CodePreviewProps) => {
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Removed: const [isSaving, setIsSaving] = useState(false); // State moved to parent
    const [copied, setCopied] = useState(false);
    
    // Check if this artifact is already saved
    const isSaved = id && savedArtifacts.some(artifact => artifact.id === id);
    
    // Generate appropriate preview content
    const getPreviewContent = () => {
      // For HTML, we need to ensure it includes CSS and JS if possible
      if (language === 'html' || isHTML(code)) {
        // If code doesn't have <style> or <script> tags and seems to be just HTML structure
        if (!code.includes('<style>') && !code.includes('<script>')) {
          return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Default styles to make preview look nicer */
    body { 
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
      line-height: 1.5;
      padding: 20px; 
      max-width: 1200px;
      margin: 0 auto;
      color: #333;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    button:hover {
      background: #2563eb;
    }
    input, select, textarea {
      border: 1px solid #e5e7eb;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
    }
    a {
      color: #3b82f6;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
  <script>
    // Default interactive functions
    function setupInteractivity() {
      // Add click listeners to buttons
      document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('data-action')) {
          button.setAttribute('data-action', 'demo');
          button.addEventListener('click', function() {
            alert('Button clicked!');
          });
        }
      });
    }
    
    // Run after DOM is loaded
    document.addEventListener('DOMContentLoaded', setupInteractivity);
  </script>
</head>
<body>
  ${code}
</body>
</html>`;
        }
        return code;
      } else if (language === 'css' || isCSS(code)) {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code}</style>
</head>
<body>
  <div class="preview-container" style="padding: 20px; font-family: system-ui, sans-serif;">
    <h1>CSS Preview</h1>
    <p>This is a paragraph to demonstrate text styling.</p>
    <button>This is a button</button>
    <div class="box" style="margin-top: 20px; padding: 20px; border: 1px solid #ccc;">This is a div with class "box"</div>
    <form style="margin-top: 20px;">
      <div style="margin-bottom: 10px;">
        <label for="name">Name:</label>
        <input type="text" id="name" placeholder="Enter your name">
      </div>
      <div style="margin-bottom: 10px;">
        <label for="email">Email:</label>
        <input type="email" id="email" placeholder="Enter your email">
      </div>
      <button type="button">Submit</button>
    </form>
  </div>
</body>
</html>`;
      } else if (language === 'javascript' || language === 'js') {
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px; 
      max-width: 800px;
      margin: 0 auto;
    }
    .output { 
      background: #f5f5f5; 
      padding: 15px; 
      border-radius: 6px; 
      margin-top: 20px;
      border: 1px solid #e0e0e0;
      min-height: 100px;
    }
    h1 { 
      margin-top: 0; 
      color: #333;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 8px;
    }
    .error {
      color: #e11d48;
      font-weight: bold;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    button:hover {
      background: #2563eb;
    }
    .controls {
      margin-top: 15px;
    }
  </style>
</head>
<body>
  <h1>JavaScript Output</h1>
  <div class="output" id="output">Output will appear here</div>
  <div class="controls">
    <button onclick="runCode()">Run Code Again</button>
    <button onclick="clearOutput()">Clear Output</button>
  </div>
  
  <script>
    const output = document.getElementById('output');
    
    // Redirect console.log to our output div
    const originalLog = console.log;
    console.log = function(...args) {
      originalLog.apply(console, args);
      output.innerHTML += args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
      ).join(' ') + '<br>';
    };
    
    // Error handling
    window.onerror = function(message, source, lineno, colno, error) {
      output.innerHTML += '<span class="error">Error: ' + message + '</span><br>';
      return true;
    };
    
    function clearOutput() {
      output.innerHTML = '';
    }
    
    function runCode() {
      clearOutput();
      try {
        // Run the code
        ${code}
      } catch (error) {
        output.innerHTML += '<span class="error">Error: ' + error.message + '</span>';
      }
    }
    
    // Initial run
    runCode();
  </script>
</body>
</html>`;
      } else if (language === 'jsx' || language === 'tsx' || language === 'react') {
        // For React code, create a more sophisticated preview with React loaded
        return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>React Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    body { 
      font-family: system-ui, sans-serif; 
      padding: 20px; 
      max-width: 800px;
      margin: 0 auto;
    }
    #root {
      padding: 20px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      min-height: 200px;
      margin-top: 20px;
    }
    .error {
      color: #e11d48;
      font-weight: bold;
      padding: 10px;
      background: #fff1f2;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    h1 { 
      margin-top: 0; 
      color: #333;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  <h1>React Preview</h1>
  <div id="error-display"></div>
  <div id="root"></div>

  <script type="text/babel">
    try {
      ${code}
      
      // Default render if no ReactDOM.render is in the code
      if (!${code.includes('ReactDOM.render') || code.includes('createRoot')}) {
        // Check if there's a component named App or a default export
        if (typeof App !== 'undefined') {
          ReactDOM.render(<App />, document.getElementById('root'));
        } else if (typeof Component !== 'undefined') {
          ReactDOM.render(<Component />, document.getElementById('root'));
        } else {
          document.getElementById('error-display').innerHTML = 
            '<div class="error">No React component found to render. Name your component "App" or "Component".</div>';
        }
      }
    } catch (error) {
      document.getElementById('error-display').innerHTML = 
        '<div class="error">Error: ' + error.message + '</div>';
    }
  </script>
</body>
</html>`;
      } else {
        return `<!DOCTYPE html>
<html>
<body style="font-family: system-ui, sans-serif; padding: 20px;">
  <div>
    <h2>No preview available for ${language} code</h2>
    <p>Preview is only available for HTML, CSS, JavaScript, and React.</p>
    <pre style="background: #f5f5f5; padding: 15px; border-radius: 6px; overflow: auto;">${code}</pre>
  </div>
</body>
</html>`;
      }
    };
    
    const previewContent = getPreviewContent();
    
    // Copy the code to clipboard
    const copyCode = () => {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    
    // Toggle the save form
    const toggleSave = () => {
      if (isSaved) {
        // If already saved, we could offer to edit or delete
        deleteArtifact(id!);
         // After deleting, also close the save form if it was open
         if(isSaving) {
           toggleSaving();
         }
      } else {
        toggleSaving(); // Use the passed-in toggle function
      }
    };
    
    return (
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 bg-black/90 z-50 flex flex-col transition-all duration-300 ease-in-out",
          isFullscreen ? "left-0" : "w-[60%] border-l border-[#333]",
          "transform"
        )}
        style={{
          boxShadow: "-5px 0 25px rgba(0,0,0,0.5)"
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="flex items-center">
            <div className="text-white font-medium">
              Code Preview: <span className="text-blue-400">{language}</span>
            </div>
            {id && (
              <div className="ml-3 px-2 py-1 bg-[#222] rounded-full text-xs text-gray-300">
                ID: {id.slice(0, 8)}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "h-8 px-3 flex items-center gap-1",
                isSaved && "bg-blue-600/20 border-blue-500"
              )}
              onClick={toggleSave}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Save</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 flex items-center gap-1"
              onClick={copyCode}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 flex items-center gap-1"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              {isFullscreen ? (
                <>
                  <Minimize className="h-3.5 w-3.5" />
                  <span>Minimize</span>
                </>
              ) : (
                <>
                  <Maximize className="h-3.5 w-3.5" />
                  <span>Fullscreen</span>
                </>
              )}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3"
              onClick={() => setCodePreview(null)}
            >
              Close
            </Button>
          </div>
        </div>
        
        {/* Render the dedicated ArtifactSaveForm component */}
        <ArtifactSaveForm
          isSaving={isSaving}
          setIsSaving={setIsSaving}
          artifactTitle={artifactTitle}
          setArtifactTitle={setArtifactTitle}
          artifactDescription={artifactDescription}
          setArtifactDescription={setArtifactDescription}
          saveArtifact={saveArtifact}
          toggleSaving={toggleSavingArtifact}
          language={language}
        />
        
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-none"
            sandbox="allow-scripts"
            title="Code Preview"
          />
        </div>
      </div>
    );
  };

  // Code Library component
  const CodeLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter artifacts based on search term
    const filteredArtifacts = searchTerm.trim() === ''
      ? savedArtifacts
      : savedArtifacts.filter(artifact => 
          artifact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          artifact.language.toLowerCase().includes(searchTerm.toLowerCase())
        );
    
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black/90 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="text-white font-medium">
            Code Library: <span className="text-blue-400">{savedArtifacts.length} saved snippets</span>
          </div>
          
          <Button 
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={() => setShowLibrary(false)}
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 border-b border-[#333]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved code..."
              className="w-full px-3 py-2 pl-10 pr-10 bg-[#0a0a0a] border border-[#333] rounded text-white focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredArtifacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {searchTerm ? (
                <>
                  <Search className="h-10 w-10 mb-3 opacity-50" />
                  <p>No saved code found matching "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <Bookmark className="h-10 w-10 mb-3 opacity-50" />
                  <p>No saved code snippets yet</p>
                  <p className="text-sm mt-2">When you save code, it will appear here</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredArtifacts.map(artifact => (
                <div 
                  key={artifact.id} 
                  className="bg-[#111] border border-[#333] rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium truncate mr-2">{artifact.title}</h3>
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                        {artifact.language}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{artifact.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(artifact.createdAt).toLocaleDateString()} · {artifact.code.length} chars
                    </div>
                  </div>
                  
                  <div className="border-t border-[#222] p-3 flex justify-between">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-gray-400 hover:text-white"
                      onClick={() => loadArtifact(artifact)}
                    >
                      <Play className="h-3.5 w-3.5 mr-1" /> Preview
                    </Button>
                    
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-gray-400 hover:text-white"
                              onClick={() => {
                                if (artifact.preview) {
                                  copyShareLink(artifact.preview);
                                }
                              }}
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy share link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-gray-400 hover:text-white"
                              onClick={() => navigator.clipboard.writeText(artifact.code)}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-red-400 hover:text-red-300"
                              onClick={() => deleteArtifact(artifact.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Tool Results Library component
  const ToolResultsLibrary = () => {
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filter results based on search term
    const filteredResults = searchTerm.trim() === ''
      ? savedToolResults
      : savedToolResults.filter(result => 
          result.toolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (result.url && result.url.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    
    // Function to format date
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };
    
    // Function to delete a tool result
    const deleteToolResult = (id: string) => {
      setSavedToolResults(prev => prev.filter(result => result.id !== id));
      
      // Update localStorage
      const updatedResults = savedToolResults.filter(result => result.id !== id);
      localStorage.setItem('toolResults', JSON.stringify(updatedResults));
      
      // Show notification
      showNotification("Result deleted", "The tool result has been removed from your library.");
    };
    
    // Function to copy share link
    const copyResultLink = (url: string) => {
      const fullUrl = window.location.origin + url;
      navigator.clipboard.writeText(fullUrl);
      copyShareLink(fullUrl);
    };
    
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black/90 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="text-white font-medium">
            Tool Results Library: <span className="text-blue-400">{savedToolResults.length} saved results</span>
          </div>
          
          <Button 
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={() => setShowToolResultsLibrary(false)}
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 border-b border-[#333]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved results..."
              className="w-full px-3 py-2 pl-10 pr-10 bg-[#0a0a0a] border border-[#333] rounded text-white focus:outline-none"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          {filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              {searchTerm ? (
                <>
                  <Search className="h-10 w-10 mb-3 opacity-50" />
                  <p>No saved results found matching "{searchTerm}"</p>
                </>
              ) : (
                <>
                  <Globe className="h-10 w-10 mb-3 opacity-50" />
                  <p>No saved tool results yet</p>
                  <p className="text-sm mt-2">Use AI Chat with specialized commands to generate results</p>
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResults.map(result => (
                <div 
                  key={result.id} 
                  className="bg-[#111] border border-[#333] rounded-md overflow-hidden hover:border-blue-500 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-medium truncate mr-2">{result.toolName}</h3>
                      <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
                        {formatDate(result.createdAt)}
                      </span>
                    </div>
                    
                    {result.url && (
                      <div className="text-gray-400 text-sm mt-1 truncate">
                        {result.url}
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-sm mt-2 line-clamp-3">{result.summary}</p>
                  </div>
                  
                  <div className="border-t border-[#222] p-3 flex justify-between">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 text-gray-400 hover:text-white"
                      onClick={() => {
                        // Launch the appropriate viewer based on tool type
                        window.open(result.shareUrl, '_blank');
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                    
                    <div className="flex gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-gray-400 hover:text-white"
                              onClick={() => {
                                if (result.shareUrl) {
                                  copyResultLink(result.shareUrl);
                                }
                              }}
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy share link</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-gray-400 hover:text-white"
                              onClick={() => {
                                // Add this result to the current chat
                                const assistantMessage: Message = {
                                  role: 'assistant',
                                  content: `Here's the ${result.toolName} analysis I ran earlier:\n\n**Summary:** ${result.summary}\n\n[View Full Analysis](${result.shareUrl})\n\nWould you like me to explain any specific aspects of this analysis?`,
                                  toolResult: result // Add the tool result to the message for reference
                                };
                                
                                setMessages(prev => [...prev, assistantMessage]);
                                setShowToolResultsLibrary(false);
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add to current chat</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 px-2 text-red-400 hover:text-red-300"
                              onClick={() => deleteToolResult(result.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Delete</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread management header */}
      <div className="flex items-center p-3 border-b border-[#333333] bg-[#0a0a0a]">
        <div className="flex items-center space-x-2">
          <Button
            onClick={createNewThread}
            variant="outline"
            className="flex items-center justify-center bg-[#111] hover:bg-[#222] text-white py-2 px-4 rounded border border-[#333333]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Thread
          </Button>
          
          <div className="relative">
            <button
              onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
              className="flex items-center justify-between bg-[#111] hover:bg-[#222] text-white py-2 px-4 rounded border border-[#333333] min-w-[160px] h-9"
            >
              <div className="flex items-center">
                <span className="text-sm font-medium truncate">
                  {isLoadingModels ? "Loading..." : getModelDisplay(selectedModel)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
            </button>
            
            {modelDropdownOpen && (
              <div className="absolute left-0 mt-1 w-72 bg-[#111111] border border-[#333333] rounded-md shadow-lg z-10 max-h-96 overflow-hidden">
                <div className="p-2 border-b border-[#333333] sticky top-0 bg-[#111111]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full px-3 py-1 pl-8 pr-8 bg-[#0a0a0a] border border-[#444] rounded text-sm focus:outline-none"
                    />
                    {modelSearch && (
                      <button 
                        onClick={() => setModelSearch('')}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="overflow-y-auto flex-1 max-h-80">
                  {isLoadingModels ? (
                    <div className="flex items-center justify-center p-4 text-gray-400">
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Loading available models...
                    </div>
                  ) : filteredModels.length > 0 ? (
                    filteredModels.map((model) => (
                      <div 
                        key={model.id}
                        className={cn(
                          "px-4 py-2 cursor-pointer hover:bg-[#222]",
                          selectedModel === model.id && "bg-[#222]"
                        )}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setModelDropdownOpen(false);
                          setModelSearch('');
                        }}
                      >
                        <div className="font-medium">{model.name}</div>
                        <div className="text-xs text-gray-400">{model.description}</div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-center text-gray-400">No models found</div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Add Library Button */}
          <Button
            onClick={() => setShowLibrary(true)}
            variant="outline"
            className="flex items-center justify-center bg-[#111] hover:bg-[#222] text-white py-2 px-4 rounded border border-[#333333] ml-2"
          >
            <Bookmark className="h-4 w-4 mr-2" />
            Code Library
            {savedArtifacts.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {savedArtifacts.length}
              </span>
            )}
          </Button>
          
          {/* Add Tool Results Library Button */}
          <Button
            onClick={() => setShowToolResultsLibrary(true)}
            variant="outline"
            className="flex items-center justify-center bg-[#111] hover:bg-[#222] text-white py-2 px-4 rounded border border-[#333333] ml-2"
          >
            <Globe className="h-4 w-4 mr-2" />
            Tool Results
            {savedToolResults.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {savedToolResults.length}
              </span>
            )}
          </Button>
          
          {/* Remove Auto Preview Toggle Button but keep functionality enabled */}
          <input type="hidden" value="true" />
        </div>
        
        {/* Thread selector (only shows when there are threads) */}
        {threads.length > 0 && (
          <div className="relative ml-auto">
            <button
              onClick={() => setThreadDropdownOpen(!threadDropdownOpen)}
              className="flex items-center justify-between bg-[#111] hover:bg-[#222] text-white py-2 px-4 rounded border border-[#333333] min-w-[140px] h-9"
            >
              <span className="text-sm font-medium truncate">
                {activeThreadId 
                  ? threads.find(t => t.id === activeThreadId)?.name || "Current Thread" 
                  : "Select Thread"}
              </span>
              <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
            </button>
            
            {threadDropdownOpen && (
              <div className="absolute right-0 mt-1 w-72 bg-[#111111] border border-[#333333] rounded-md shadow-lg z-10">
                <div className="overflow-y-auto max-h-80 divide-y divide-[#222]">
                  {threads
                    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
                    .map((thread) => (
                      <div 
                        key={thread.id}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-[#222] flex justify-between items-center",
                          activeThreadId === thread.id && "bg-[#222] border-l-2 border-blue-500"
                        )}
                        onClick={() => {
                          selectThread(thread.id);
                          setThreadDropdownOpen(false);
                        }}
                      >
                        <div className="truncate flex-1">
                          <div className="font-medium truncate">{thread.name}</div>
                          <div className="text-xs text-gray-400 flex items-center">
                            <span className="mr-2">{new Date(thread.lastUpdated).toLocaleString(undefined, { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                            <span className="text-xs text-gray-500">{thread.messages.length} msgs</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteThread(thread.id, e)}
                          className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-[#333]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Main chat interface */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#000000]">
        {/* Chat messages area */}
        <div className="flex-1 overflow-auto p-6">
          {codePreview && (
            <CodePreview
              code={codePreview.code}
              language={codePreview.language}
              id={codePreview.id}
              // Pass state and functions from parent
              isSaving={isSavingArtifact}
              setIsSaving={setIsSavingArtifact}
              artifactTitle={artifactTitle}
              setArtifactTitle={setArtifactTitle}
              artifactDescription={artifactDescription}
              setArtifactDescription={setArtifactDescription}
              toggleSaving={toggleSavingArtifact}
            />
          )}
          
          {showLibrary && <CodeLibrary />}
          
          {showToolResultsLibrary && <ToolResultsLibrary />}
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-4">
              <div className="max-w-3xl text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Deliver AI Assistant</h2>
                <p className="text-lg text-gray-400 mb-8">Your intelligent partner for marketing and sales tasks</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 w-full max-w-2xl mx-auto">
                  {suggestions.map((suggestion, i) => (
                    <Card
                      key={i}
                      className="bg-[#111] border border-[#333] hover:border-blue-600 hover:bg-[#151515] transition-colors cursor-pointer group"
                      onClick={() => {
                        setInput(suggestion);
                      }}
                    >
                      <CardContent className="p-4 flex items-center">
                        {i === 0 && <Search className="h-5 w-5 text-blue-400 mr-4 flex-shrink-0 group-hover:text-blue-500" />}
                        {i === 1 && <Users className="h-5 w-5 text-blue-400 mr-4 flex-shrink-0 group-hover:text-blue-500" />}
                        {i === 2 && <Target className="h-5 w-5 text-blue-400 mr-4 flex-shrink-0 group-hover:text-blue-500" />}
                        {i === 3 && <Globe className="h-5 w-5 text-blue-400 mr-4 flex-shrink-0 group-hover:text-blue-500" />}
                        {i === 4 && <Mail className="h-5 w-5 text-blue-400 mr-4 flex-shrink-0 group-hover:text-blue-500" />}
                        <div className="text-left">
                          <span className="text-white group-hover:text-blue-400">{suggestion}</span>
                          <p className="text-xs text-gray-400 mt-1 group-hover:text-gray-300">
                            {i === 0 && "Website Intelligence Scanner - Analyze site performance and content"}
                            {i === 1 && "Executive Persona - Create detailed buyer personas for your target audience"}
                            {i === 2 && "Customer Profile Generator - Build detailed ICP for marketing strategy"}
                            {i === 3 && "Competitive Analysis - Extract and analyze competitor websites"}
                            {i === 4 && "Sales Enablement - Create compelling outreach content"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-gray-500 text-sm">
                  <p>You can also directly ask for assistance with generating content, analyzing data, or implementing strategies.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div 
                    className={cn(
                      "relative max-w-[90%] rounded-md group",
                      message.role === "user" 
                        ? "bg-[#0a0a0a] border border-[#333333] text-white p-5 ml-auto" 
                        : "bg-[#111111] border border-[#333333] text-white p-5"
                    )}
                  >
                    {message.role === 'assistant' && message.model && (
                      <div className="absolute top-1 right-1 flex items-center gap-2">
                        <span className="bg-[#222] text-xs px-2 py-0.5 rounded-full text-gray-300">
                          {getModelDisplay(message.model)}
                        </span>
                        
                        {/* Copy whole message button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button 
                                onClick={() => handleCopyMessage(message.content)}
                                className="bg-[#222] text-xs p-1 rounded-full text-gray-300 hover:text-white hover:bg-[#333] opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                {copiedMessage === message.content ? (
                                  <Check className="h-3 w-3" />
                                ) : (
                                  <Clipboard className="h-3 w-3" />
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedMessage === message.content ? "Copied!" : "Copy message"}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                    
                    {/* Thinking section (only for assistant messages with thinking content) */}
                    {message.role === 'assistant' && message.thinking && (
                      <div className="mb-4">
                        <button 
                          onClick={() => toggleThinking(`${index}`)}
                          className="flex items-center text-xs font-medium text-gray-400 hover:text-white bg-[#222] hover:bg-[#333] px-2 py-1 rounded mb-2 transition-colors"
                        >
                          {expandedThinking.includes(`${index}`) ? (
                            <>
                              <ChevronUp className="h-3 w-3 mr-1" />
                              Hide AI Thinking
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-3 w-3 mr-1" />
                              Show AI Thinking
                            </>
                          )}
                        </button>
                        
                        {expandedThinking.includes(`${index}`) && (
                          <div className="p-3 bg-[#0a0a0a] border border-[#333] rounded-md mb-3 text-gray-300 text-sm">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({node, inline, className, children, ...props}: any) {
                                  const match = /language-(\w+)/.exec(className || '');
                                  const codeString = String(children).replace(/\n$/, '');
                                  
                                  if (inline) {
                                    return <code className="px-1 py-0.5 bg-[#333] rounded text-xs font-mono" {...props}>{children}</code>
                                  }
                                  
                                  return (
                                    <div className="relative mt-2 mb-2 rounded overflow-hidden">
                                      <div className="flex items-center justify-between bg-[#1a1a1a] px-3 py-1 rounded-t">
                                        <span className="text-xs text-gray-400">{match && match[1] ? match[1] : 'code'}</span>
                                        <TooltipProvider>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <button 
                                                onClick={() => handleCopyCode(codeString)}
                                                className="text-xs text-gray-400 hover:text-white"
                                              >
                                                {copiedCode === codeString ? (
                                                  <Check className="h-3 w-3" />
                                                ) : (
                                                  <Copy className="h-3 w-3" />
                                                )}
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{copiedCode === codeString ? "Copied!" : "Copy code"}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </TooltipProvider>
                                      </div>
                                      <pre className="px-3 py-2 bg-[#0a0a0a] rounded-b overflow-auto">
                                        <code className="text-white text-xs font-mono">{children}</code>
                                      </pre>
                                    </div>
                                  );
                                },
                                p: ({children}) => <p className="mb-2 last:mb-0 text-gray-300 text-xs">{children}</p>,
                                ul: ({children}) => <ul className="list-disc pl-4 mb-2 last:mb-0 text-gray-300 text-xs">{children}</ul>,
                                ol: ({children}) => <ol className="list-decimal pl-4 mb-2 last:mb-0 text-gray-300 text-xs">{children}</ol>,
                                li: ({children}) => <li className="mb-1 text-gray-300 text-xs">{children}</li>,
                              }}
                            >
                              {message.thinking}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({node, inline, className, children, ...props}: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const codeString = String(children).replace(/\n$/, '');
                          const language = getLanguageFromClassName(className);
                          
                          if (inline) {
                            return <code className="px-1 py-0.5 bg-[#222] rounded text-sm font-mono" {...props}>{children}</code>
                          }
                          
                          const canPreview = ['html', 'css', 'javascript', 'js', 'jsx', 'tsx', 'react'].includes(language) || 
                                           isHTML(codeString) || 
                                           isCSS(codeString);
                          
                          return (
                            <div className="relative mt-4 mb-4 rounded overflow-hidden">
                              <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-1 rounded-t">
                                <span className="text-xs text-gray-400">{match && match[1] ? match[1] : 'code'}</span>
                                <div className="flex items-center gap-2">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button 
                                          onClick={() => handleCopyCode(codeString)}
                                          className="text-xs text-gray-400 hover:text-white"
                                        >
                                          {copiedCode === codeString ? (
                                            <Check className="h-3 w-3" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{copiedCode === codeString ? "Copied!" : "Copy code"}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              </div>
                              <pre className="px-4 py-3 bg-[#0a0a0a] rounded-b overflow-auto">
                                <code className="text-white text-sm font-mono">{children}</code>
                              </pre>
                              {canPreview && (
                                <div className="mt-2 flex justify-end">
                                  <button
                                    onClick={() => handleShowPreview(codeString, language)}
                                    className="text-xs flex items-center gap-1 text-gray-300 hover:text-white bg-[#1a1a1a] px-3 py-1.5 rounded"
                                  >
                                    <Play className="h-3 w-3" /> Preview Code
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        },
                        p: ({children}) => <p className="mb-4 last:mb-0 text-gray-100">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-5 mb-4 last:mb-0 text-gray-100">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-5 mb-4 last:mb-0 text-gray-100">{children}</ol>,
                        li: ({children}) => <li className="mb-1 text-gray-100">{children}</li>,
                        a: ({href, children}) => <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">{children}</a>,
                        blockquote: ({children}) => <blockquote className="border-l-4 border-[#333] pl-4 italic my-4 text-gray-400">{children}</blockquote>,
                        h1: ({children}) => <h1 className="text-2xl font-bold my-4 text-white">{children}</h1>,
                        h2: ({children}) => <h2 className="text-xl font-bold my-3 text-white">{children}</h2>,
                        h3: ({children}) => <h3 className="text-lg font-bold my-2 text-white">{children}</h3>,
                        table: ({children}) => <div className="overflow-auto my-4 border border-[#333] rounded"><table className="w-full border-collapse">{children}</table></div>,
                        thead: ({children}) => <thead className="bg-[#111] text-left">{children}</thead>,
                        tbody: ({children}) => <tbody>{children}</tbody>,
                        tr: ({children}) => <tr className="border-b border-[#333]">{children}</tr>,
                        th: ({children}) => <th className="p-2 border-r last:border-r-0 border-[#333] text-white">{children}</th>,
                        td: ({children}) => <td className="p-2 border-r last:border-r-0 border-[#333] text-gray-300">{children}</td>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              
              {/* Typing indicator appears in the chat flow */}
              {isLoading && <TypingIndicator />}
              
              <div ref={endOfMessagesRef} />
            </div>
          )}
        </div>
        
        {/* Input area - improved with shadcn styling */}
        <div className="border-t border-[#333333] p-4 bg-[#0a0a0a]">
          <div className="relative mx-auto max-w-4xl flex items-end">
            <div className="relative flex-1">
              <Textarea
                placeholder="Type a message..."
                className="w-full min-h-[52px] max-h-[200px] bg-[#0a0a0a] border border-[#333333] rounded-md pl-4 pr-12 py-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
              />
            </div>
            
            <Button
              className={cn(
                "ml-2 p-2 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-md transition-all duration-200 h-10 w-10 flex items-center justify-center",
                (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed from-blue-500/70 to-blue-400/70"
              )}
              disabled={isLoading || !input.trim()}
              onClick={handleSend}
              size="icon"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
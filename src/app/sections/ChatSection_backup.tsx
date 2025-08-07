'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  SendHorizonal, 
  Send, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Book,
  Play,
  Copy,
  Check,
  Save,
  BookmarkCheck,
  List,
  Search,
  Trash2,
  Edit,
  FileText,
  Clock,
  LogOut,
  Home,
  Command,
  Brain,
  Eye,
  Music,
  Target,
  Sparkles,
  Share,
  Image,
  X,
  ImagePlus,
  Mail,
  Info,
  Wrench,
  Building,
  Globe,
  LayoutTemplate,
  RefreshCw,
  Clipboard,
  Maximize,
  Minimize,
  ExternalLink,
  Bookmark,
  Users,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Added Card and CardContent import
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PromptStudioModal from '@/components/PromptStudioModal'; // Import PromptStudioModal
import VariableManagerModal from '@/components/VariableManagerModal'; // Import VariableManagerModal
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/components/ui/use-toast";
import { useSearchParams } from 'next/navigation'; // Add this for URL parameter parameter handling
import { detectToolRequest, extractParametersFromMessage, hasAllRequiredParameters, availableTools } from '@/lib/tool-utils';
import { ToolDefinition } from '@/types/tools'; // Import type definition
import { AgentConfiguration } from '@/types/agent';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectSeparator } from '@/components/ui/select';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  thinking?: string;
  toolResult?: ToolResult; // Add this line
  id?: string; // Add this line
  image?: string; // Add this line for image attachment
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
  // Add properties based on the provided list
  vision?: boolean;
  audio?: boolean;
  reasoning?: boolean;
  uncensored?: boolean;
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

export const runtime = "edge";

// Available models from Pollinations API
const AVAILABLE_MODELS = [
  "gemini", "openai", "openai-fast", "openai-large", "mirexa", "mistral", 
  "llama", "unity", "deepseek", "sur", "phi", "searchgpt", "rtist"
];

// Helper function to check if a model is available
function isModelAvailable(model: string): boolean {
  return AVAILABLE_MODELS.includes(model.toLowerCase());
}

export default function ChatSection() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState(''); // Renamed input to inputValue for clarity
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("deepseek-reasoning"); // Set default to a model with good reasoning/thinking capabilities
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPromptStudioOpen, setIsPromptStudioOpen] = useState(false); // State for Prompt Studio modal
  const [isVariableManagerOpen, setIsVariableManagerOpen] = useState(false); // State for Variable Manager modal
  const [modelSearch, setModelSearch] = useState('');
  const [threadNameInput, setThreadNameInput] = useState('');
  // Add ref for textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Add ref for file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Add state for image attachment
  const [imageAttachment, setImageAttachment] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false); // Add state for image processing
  
  // Define initial Pollinations models with state
  const [pollinationsModels, setPollinationsModels] = useState<Model[]>([
    { id: "openai", name: "OpenAI", description: "OpenAI GPT-4.1-mini (Azure)", vision: true },
    { id: "openai-fast", name: "OpenAI Fast", description: "OpenAI GPT-4.1-nano (Azure)", vision: true },
    { id: "openai-large", name: "OpenAI Large", description: "OpenAI GPT-4.1 (Azure)", vision: true },
    { id: "qwen-coder", name: "Qwen Coder", description: "Qwen 2.5 Coder 32B (Scaleway)" },
    { id: "llama", name: "Llama", description: "Llama 3.3 70B (Cloudflare)" },
    { id: "llamascout", name: "Llama Scout", description: "Llama 4 Scout 17B (Cloudflare)" },
    { id: "mistral", name: "Mistral", description: "Mistral Small 3.1 24B (Cloudflare)", vision: true },
    { id: "unity", name: "Unity", description: "Unity Unrestricted Agent (Mistral Small 3.1, Scaleway)", uncensored: true, vision: true },
    { id: "mirexa", name: "Mirexa", description: "WithThatWay's Mirexa", vision: true },
    { id: "midijourney", name: "Midi Journey", description: "Midijourney (Azure)" },
    { id: "rtist", name: "Rtist", description: "Rtist (Azure)" },
    { id: "searchgpt", name: "Search GPT", description: "SearchGPT (Azure)", vision: true },
    { id: "openai-reasoning", name: "OpenAI Reasoning", description: "OpenAI model variant focused on reasoning tasks", reasoning: true }, // Placeholder description
    { id: "evil", name: "Evil", description: "Evil (Scaleway)", uncensored: true, vision: true },
    { id: "deepseek-reasoning", name: "DeepSeek Reasoning", description: "MAI-DS-R1 (Cloudflare)", reasoning: true },
    { id: "deepseek-reasoning-large", name: "DeepSeek Reasoning Large", description: "Larger DeepSeek model with superior reasoning abilities", reasoning: true }, // Placeholder description
    { id: "phi", name: "Phi", description: "Phi-4 Instruct (Cloudflare)", vision: true, audio: true },
    { id: "llama-vision", name: "Llama Vision", description: "Llama 3.2 11B Vision (Cloudflare)", vision: true },
    { id: "hormoz", name: "Hormoz", description: "Hormoz 8b (Modal)" },
    { id: "hypnosis-tracy", name: "Hypnosis Tracy", description: "Hypnosis Tracy 7B (Azure)", audio: true },
    { id: "deepseek", name: "DeepSeek", description: "DeepSeek-V3 (DeepSeek)" },
    { id: "sur", name: "Sur", description: "Sur AI Assistant (Mistral, Scaleway)", vision: true },
    { id: "openai-audio", name: "OpenAI Audio", description: "OpenAI GPT-4o-audio-preview (Azure)", vision: true, audio: true }
  ]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const threadsDropdownRef = useRef<HTMLDivElement>(null);
  const libraryDropdownRef = useRef<HTMLDivElement>(null);
  const toolResultsDropdownRef = useRef<HTMLDivElement>(null);
  const [threadDropdownOpen, setThreadDropdownOpen] = useState(false);
  const [threadsDropdownOpen, setThreadsDropdownOpen] = useState(false);
  const [libraryDropdownOpen, setLibraryDropdownOpen] = useState(false);
  const [toolResultsDropdownOpen, setToolResultsDropdownOpen] = useState(false);
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

  // Fix thread and message persistence
  useEffect(() => {
    const loadFromLocalStorage = () => {
      try {
        // First load stored threads
        const savedThreads = localStorage.getItem('chatThreads');
        if (savedThreads) {
          const parsedThreads = JSON.parse(savedThreads).map((thread: any) => ({
            ...thread,
            lastUpdated: new Date(thread.lastUpdated)
          }));
          setThreads(parsedThreads);
          console.log(`Loaded ${parsedThreads.length} threads from localStorage`);

          // Then load active thread ID
          const lastActiveId = localStorage.getItem('activeThreadId');
          if (lastActiveId && parsedThreads.some(t => t.id === lastActiveId)) {
            setActiveThreadId(lastActiveId);
            console.log(`Restored active thread: ${lastActiveId}`);
            
            // Find and load messages for active thread
            const activeThread = parsedThreads.find(t => t.id === lastActiveId);
            if (activeThread && activeThread.messages) {
              setMessages(activeThread.messages);
              console.log(`Loaded ${activeThread.messages.length} messages for active thread`);
            } else {
              // If no active thread exists, create one
              createNewThread();
            }
          } else if (parsedThreads.length > 0) {
            // If no active thread ID, use most recent thread
            const mostRecentThread = parsedThreads.sort((a, b) => 
              new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
            )[0];
            
            setActiveThreadId(mostRecentThread.id);
            setMessages(mostRecentThread.messages);
            console.log(`No active thread found, using most recent: ${mostRecentThread.id}`);
          } else {
            // If no threads at all, create a new one
            createNewThread();
          }
        } else {
          // No saved threads, create a new thread
          createNewThread();
        }
      } catch (error) {
        console.error('Error loading saved conversations:', error);
        // On error, create a new thread
        createNewThread();
      }
    };

    loadFromLocalStorage();
  }, []);

  // Fix how threads are saved to localStorage whenever they change
  useEffect(() => {
    if (threads.length > 0) {
      // Save all threads to localStorage
      localStorage.setItem('chatThreads', JSON.stringify(threads));
      console.log(`Saved ${threads.length} threads to localStorage`);

      // Save active thread ID
      if (activeThreadId) {
        localStorage.setItem('activeThreadId', activeThreadId);
      }
    }
  }, [threads, activeThreadId]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Close model dropdown if clicking outside
      if (modelDropdownOpen && 
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setModelDropdownOpen(false);
      }
      
      // Close threads dropdown if clicking outside
      if (threadsDropdownOpen && 
          threadsDropdownRef.current && 
          !threadsDropdownRef.current.contains(event.target as Node)) {
        setThreadsDropdownOpen(false);
      }
      
      // Close library dropdown if clicking outside
      if (libraryDropdownOpen && 
          libraryDropdownRef.current && 
          !libraryDropdownRef.current.contains(event.target as Node)) {
        setLibraryDropdownOpen(false);
      }
      
      // Close tool results dropdown if clicking outside
      if (toolResultsDropdownOpen && 
          toolResultsDropdownRef.current && 
          !toolResultsDropdownRef.current.contains(event.target as Node)) {
        setToolResultsDropdownOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modelDropdownOpen, threadsDropdownOpen, libraryDropdownOpen, toolResultsDropdownOpen]);

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

  // Function to detect and execute tools based on user inputValue
  const detectAndExecuteTool = async (inputValue: string) => {
    const detectedTool = detectToolRequest(inputValue);

    if (detectedTool) {
      // Extract parameters from the message
      const extractedParams = extractParametersFromMessage(inputValue, detectedTool);

      // Check if all required parameters are present
      const hasAllParams = hasAllRequiredParameters(extractedParams, detectedTool);

      if (hasAllParams) {
        // All parameters provided, proceed with tool execution
        return await executeSpecializedTool(detectedTool.name, extractedParams);
      } else {
        // Missing parameters, prompt user with form
        // Add a system message explaining parameter collection
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `I'll help you with that. Let me gather the necessary information for the ${detectedTool.name} tool.`
        }]);

        // Set up tool request for parameter collection
        setPendingToolRequest({
          tool: detectedTool,
          params: extractedParams,
          originalMessage: inputValue
        });

        return true; // Tool handling in progress
      }
    }

    // Fall back to regex pattern matching approach for backward compatibility

    // Website Intelligence detection
    const websiteRegex = /analyze\s+(website|site|url|domain)?:?\s*(https?:\/\/[^\s]+)?/i;
    const websiteMatch = inputValue.match(websiteRegex);

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
        return true;
      }
    }

    // Executive Persona detection
    const personaRegex = /create\s+(an?\s+)?(executive|leader|cxo)\s+persona\s+for\s+a?\s+([^]+?)\s+in\s+([^]+?)(?:\.|$)/i;
    const personaMatch = inputValue.match(personaRegex);

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
        return true;
      }
    }

    // Customer Profile detection
    const profileRegex = /generate\s+(a\s+)?(customer|client|buyer)\s+profile\s+for\s+([^]+?)(?:\.|$)/i;
    const profileMatch = inputValue.match(profileRegex);

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
        return true;
      }
    }

    // No tool detected
    return false;
  };

  // Function to render tool parameter form
  const renderToolParamForm = () => {
    if (!pendingToolRequest || !pendingToolRequest.tool) return null;

    const { tool, params } = pendingToolRequest;

    const handleParamSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // Execute tool with collected parameters
      executeSpecializedTool(tool.name, params).then(() => {
        // Clear pending tool request after execution
        setPendingToolRequest(null);
      });
    };

    const updateParam = (paramName: string, value: string) => {
      setPendingToolRequest({
        ...pendingToolRequest,
        params: {
          ...pendingToolRequest.params,
          [paramName]: value
        }
      });
    };

    return (
      <Card className="w-full border border-gray-600 p-4 my-4 bg-gray-900 text-white rounded-lg">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold mb-2">{tool.name}</h3>
          <p className="text-sm mb-4 text-gray-400">{tool.description}</p>

          <form onSubmit={handleParamSubmit} className="space-y-4">
            {tool.requiredParameters.map((param) => (
              <div key={param.name} className="space-y-2">
                <label className="block text-sm font-medium">{param.label}</label>

                {param.type === 'select' ? (
                  <select
                    value={params[param.name] || ''}
                    onChange={(e) => updateParam(param.name, e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-md w-full p-2 text-white"
                    required={param.required !== false}
                  >
                    <option value="">Select {param.label}</option>
                    {param.options?.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={param.type}
                    value={params[param.name] || ''}
                    onChange={(e) => updateParam(param.name, e.target.value)}
                    placeholder={param.placeholder}
                    className="bg-gray-800 border border-gray-600 rounded-md w-full p-2 text-white"
                    required={param.required !== false}
                  />
                )}
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPendingToolRequest(null)}
                className="border-gray-600 text-white hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Run {tool.name}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  // Sample suggestions
  const suggestions = [];

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
    // Update in-memory state
    setThreads(prev => prev.map(thread =>
      thread.id === threadId
        ? { ...thread, messages: newMessages, lastUpdated: new Date() }
        : thread
    ));
    
    // Also update localStorage directly to ensure persistence
    try {
      const threadsJson = localStorage.getItem('chatThreads');
      if (threadsJson) {
        const threads = JSON.parse(threadsJson);
        const updatedThreads = threads.map((thread: any) => 
          thread.id === threadId
            ? { ...thread, messages: newMessages, lastUpdated: new Date() }
            : thread
        );
        localStorage.setItem('chatThreads', JSON.stringify(updatedThreads));
        console.log(`Updated thread ${threadId} with ${newMessages.length} messages in localStorage`);
      }
    } catch (error) {
      console.error('Error updating thread in localStorage:', error);
    }
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
    console.log('Toggle thinking for message:', messageId);
    const newExpandedThinking = expandedThinking.includes(messageId)
      ? expandedThinking.filter(id => id !== messageId)
      : [...expandedThinking, messageId];
    
    console.log('New expanded thinking state:', newExpandedThinking);
    setExpandedThinking(newExpandedThinking);
  };

  // Helper function to extract thinking content
  // Note on model-specific behaviors:
  // - deepseek-reasoning: Reliably uses <think>...</think> tags that can be parsed
  // - gemini, openai-large, mistral: Include reasoning within their responses but don't use explicit tags
  // This means the thinking extraction only works reliably with deepseek-reasoning model
  const extractThinking = (content: string): { thinking: string, response: string } => {
    // Check if content has explicit thinking section with tags
    if (content && content.includes('<think>') && content.includes('</think>')) {
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
      if (!content) continue;
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
    if (content && content.length > 300) {
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
    return { thinking: '', response: content || '' };
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
    if (!codePreview) {
      console.error("Attempted to save artifact with no code preview open");
      return;
    }

    console.log("Saving artifact:", codePreview);

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

    console.log("Creating new artifact:", newArtifact);

    // Make a copy of the current artifacts array
    const updatedArtifacts = [newArtifact, ...savedArtifacts.filter(a => a.id !== artifactId)];
    
    // Update state with the new artifact
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
    
    // Debug
    console.log("Saved artifacts count:", updatedArtifacts.length);
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
    // Ensure code and language are valid before setting preview
    if (!code || typeof code !== 'string') {
      console.error("Attempted to show preview with invalid code.");
      return;
    }
    const validLanguage = language && typeof language === 'string' ? language : 'text';

    console.log(`Displaying preview for ${validLanguage} code, length: ${code.length}`);
    setCodePreview({
      code,
      language: validLanguage,
      id: uuidv4() // Generate unique ID for each preview
    });

    // Show a subtle notification that code preview opened
    showNotification(
      "Code preview opened", 
      `Previewing ${validLanguage} code snippet. Use the preview button to toggle visibility.`
    );

    // Make sure the UI updates immediately
    setTimeout(() => {
      const previewElement = document.querySelector('[title="Code Preview"]');
      if (previewElement) {
        previewElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Handler to select a prompt template
  const handleSelectTemplate = (promptText: string) => {
    setInputValue(promptText); // Update chat inputValue state
    setIsPromptStudioOpen(false); // Close the modal
    // Optional: Focus the inputValue field after setting the text
    inputRef.current?.focus();
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
    language?: string; // Make language optional
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
    language = 'code' // Default value for language
  }: ArtifactSaveFormProps) => {
    // Use local state to avoid focus issues with controlled inputValues
    // Ensure default empty string in case initial prop is undefined
    const [localTitle, setLocalTitle] = useState(artifactTitle || '');
    const [localDescription, setLocalDescription] = useState(artifactDescription || '');

    // Update parent state only when inputValue is complete (blur/submit)
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
                  className="bg-blue-600 text-white hover:bg-blue-700"
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

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      const language = match[1] || 'text'; // Default to 'text' if no language specified
      const code = match[2];

      // Validate code 
      if (code && typeof code === 'string' && code.trim().length > 0) {
        // Always store the last valid code block found
        lastCodeBlock = { language, code };
      }
    }

    // If we found any valid code block, show preview for the last one
    if (lastCodeBlock) {
      console.log(`Showing preview for ${lastCodeBlock.language} code`);
      handleShowPreview(lastCodeBlock.code, lastCodeBlock.language);
    }
  };

  // Modify handleSend function to handle API errors better
  const handleSend = async () => {
    if (!inputValue.trim() && !imageAttachment) return;

    // If no active thread, create one
    if (!activeThreadId) {
      const newThreadId = createNewThread();
      console.log('Created new thread before sending message:', newThreadId);
      // Small delay to ensure thread is created before proceeding
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // First, check if the inputValue should trigger a specialized tool
    if (inputValue.trim() && !imageAttachment) {
      const toolResult = await detectAndExecuteTool(inputValue.trim());

      // If a tool was executed, no need to call the chat API
      if (toolResult) {
        setInputValue('');
        // Focus back on the textarea
        setTimeout(() => inputRef.current?.focus(), 50);
        return;
      }
    }

    console.log("Sending message with image:", imageAttachment ? "yes (length: " + imageAttachment.length + ")" : "no");

    // Regular chat flow for non-tool messages
    console.log("Entering handleSend. Current imageAttachment state:", 
      imageAttachment ? `String (length: ${imageAttachment.length}, preview: ${imageAttachment.substring(0, 30)}...)` : imageAttachment
    );

    // Explicitly get the current value before creating the message
    const currentImageAttachment = imageAttachment; 
    const currentInputValue = inputValue.trim();

    // Check if imageAttachment is a valid string before adding it
    const imagePayload = typeof currentImageAttachment === 'string' && currentImageAttachment.startsWith('data:image')
      ? { image: currentImageAttachment }
      : {};

    console.log(`handleSend: currentImageAttachment type is ${typeof currentImageAttachment}. imagePayload created:`, imagePayload);

    // Create the user message object using the current values
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user' as const,
      content: currentInputValue || (currentImageAttachment ? "[Image attached]" : ""), // Use placeholder if only image
      ...imagePayload // Conditionally add image payload
    };

    console.log("Created message:", userMessage.id, "with image:", userMessage.image ? "yes" : "no");

    // Add message to current thread messages
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setImageAttachment(null); // Clear the image attachment after sending
    setIsLoading(true);

    try {
      // Scroll to bottom to show the typing indicator
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

      let assistantResponse = '';
      let modelUsed = selectedModel;
      let apiError = null;
      
      // Initialize model attempts variables
      let modelAttempts = 0;
      const maxModelAttempts = 2;
      let currentModelToTry = selectedModel;

      // Try up to maxModelAttempts times with different models
      while (modelAttempts < maxModelAttempts) {
        try {
          modelAttempts++;
          console.log(`Attempt ${modelAttempts} with model: ${currentModelToTry}`);

        // Standard Model: Use existing chat API logic
        // Modify messagesForAPI to send image data in the correct format and add thinking instructions for reasoning models
        const messagesForAPI = updatedMessages.map(msg => {
          if (msg.image && typeof msg.image === 'string' && msg.image.startsWith('data:image')) {
            return {
              role: msg.role,
              content: [
                { type: "text", text: msg.content || "Describe this image:" },
                { type: "image_url", image_url: { url: msg.image } }
              ]
            };
          } else {
            return { role: msg.role, content: msg.content };
          }
        });
        
        // Add special system message for thinking models if needed
        const isReasoningModel = selectedModel.includes('reasoning') || selectedModel === 'deepseek' || selectedModel === 'deepseek-reasoning';
        
        if (isReasoningModel) {
          // Add system message to encourage thinking output
          messagesForAPI.unshift({
            role: 'system',
            content: 'Show your thinking process by using <think>your reasoning here</think> tags before giving your final answer. I want to see your step-by-step reasoning.'
          });
        }
        
        // Add a timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              messages: messagesForAPI, 
              model: currentModelToTry 
            }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API response error (${response.status}):`, errorText);
            
            // If this was the first attempt with a non-standard model, try again with a reliable model
            if (modelAttempts === 1 && currentModelToTry !== "openai") {
              // Switch to openai model for the second attempt
              currentModelToTry = "openai";
              apiError = `The model "${selectedModel}" returned an error. Trying with the OpenAI model instead...`;
              continue; // Try again with the new model
            }
            
          throw new Error(`Error from API: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        modelUsed = data.model || selectedModel;
        assistantResponse = data.choices[0].message.content;
          apiError = null; // Clear error if successful
          break; // Exit the loop on success
        } catch (error) {
          // If this was the last attempt, rethrow the error
          if (modelAttempts >= maxModelAttempts) {
            throw error;
          }
          // Otherwise, continue to next attempt
          apiError = error.message;
        }
      }

      // Extract thinking and response content
      const { thinking, response: cleanedResponse } = extractThinking(assistantResponse || '');

      // More detailed logging for debugging
      console.log('Extracted thinking content:', {
        hasThinking: !!thinking, 
        thinkingLength: thinking ? thinking.length : 0,
        responseLength: cleanedResponse ? cleanedResponse.length : 0,
        modelUsed
      });

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant' as const,
        content: apiError ? 
          `I encountered an issue with the ${selectedModel} model: ${apiError}\n\n${cleanedResponse}` :
          cleanedResponse,
        thinking: thinking || '',  // Ensure thinking is stored
        model: modelUsed
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Always auto-preview responses, with priority for code generation requests
      const isCodeRequest = /code|create|generate|script|html|css|javascript|function|programming/i.test(inputValue.toLowerCase());
      const forcePreview = isCodeRequest || /code|html|css|javascript/i.test(assistantMessage.content);
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
        errorContent += 'The server encountered an internal error. This might be due to:\n\n' +
          '1. The API endpoint is not correctly set up - ask the developer to check /api/chat\n' +
          '2. The selected model may be unavailable - try a different model like "openai"\n' +
          '3. The request may be too complex - try simplifying it';
      } else {
        errorContent += `The model you selected "${selectedModel}" might be temporarily unavailable. Please try again with a different model like "gemini" or "openai".`;
      }

      const errorMessage: Message = {
        id: uuidv4(),
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
      // Focus back on the textarea
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    
    // Clear and reset textarea height after sending
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = '52px';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize the textarea based on content
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(200, Math.max(52, inputRef.current.scrollHeight))}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // If Enter is pressed without Shift, send the message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default behavior (new line)
      handleSend();
    }
    // If Shift+Enter is pressed, allow default behavior (new line in textarea)
  };

  // Modify createNewThread to properly initialize a new thread
  const createNewThread = () => {
    const newThreadId = uuidv4();
    const newThread = {
      id: newThreadId,
      name: 'New conversation',
      messages: [],
      lastUpdated: new Date()
    };
    
    // Immediately update the threads state
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThreadId);
    setMessages([]);
    
    // Also save directly to localStorage to ensure persistence
    const existingThreads = localStorage.getItem('chatThreads');
    const parsedThreads = existingThreads ? JSON.parse(existingThreads) : [];
    const updatedThreads = [newThread, ...parsedThreads];
    localStorage.setItem('chatThreads', JSON.stringify(updatedThreads));
    localStorage.setItem('activeThreadId', newThreadId);
    
    console.log(`Created new thread: ${newThreadId}`);
    return newThreadId;
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

  // Add state to track expanded code blocks
  const [expandedCodeBlocks, setExpandedCodeBlocks] = useState<string[]>([]);

  // Function to toggle code block expansion
  const toggleCodeBlock = (codeId: string) => {
    setExpandedCodeBlocks(prev => 
      prev.includes(codeId) 
        ? prev.filter(id => id !== codeId)
        : [...prev, codeId]
    );
  };

  // Function to check if a code block is expanded
  const isExpanded = (codeId: string) => expandedCodeBlocks.includes(codeId);

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
      const language = match ? match[1] : 'text';
      const codeContent = String(children).replace(/\n$/, '');
      const codeId = useRef(`code-${Math.random().toString(36).substring(2, 9)}`).current;
      
      // For inline code, just return as is
      if (inline) {
        return (
          <code className="bg-[#111111] px-1 py-0.5 rounded font-mono text-sm" {...props}>
            {children}
          </code>
        );
      }
      
      // Get a short description based on code content and language
      const getCodeDescription = () => {
        const firstLine = codeContent.split('\n')[0].trim();
        const fileName = firstLine.startsWith('//') ? firstLine.replace('//', '').trim() : null;
        
        if (fileName) return fileName;
        
        if (language === 'html') return 'HTML Template';
        if (language === 'css') return 'CSS Styles';
        if (language === 'javascript' || language === 'js') return 'JavaScript Code';
        if (language === 'jsx' || language === 'tsx') return 'React Component';
        if (language === 'json') return 'JSON Data';
        
        // Return language with first letter capitalized
        return language.charAt(0).toUpperCase() + language.slice(1) + ' Code';
      };
      
      return (
        <div className="relative my-4 rounded-md overflow-hidden border border-[#333333] bg-[#111111]">
          {/* Header area with info, buttons and toggle */}
          <div className="flex items-center justify-between p-2 bg-[#1a1a1a] border-b border-[#333333]">
            <div className="flex items-center">
              <span className="text-xs font-medium text-blue-400 mr-2">{language}</span>
              <span className="text-xs text-gray-400">{getCodeDescription()}</span>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleShowPreview(codeContent, language)}
                className="bg-[#222] hover:bg-[#333] p-1 rounded text-xs flex items-center"
                aria-label="Preview code"
              >
                <Play className="h-3 w-3 mr-1" /> Preview
              </button>
              
              <button
                onClick={() => handleCopyCode(codeContent)}
                className="bg-[#222] hover:bg-[#333] p-1 rounded text-xs flex items-center"
                aria-label="Copy code"
              >
                {copiedCode === codeContent ? (
                  <><Check className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy</>
                )}
              </button>
              
              <button
                onClick={() => toggleCodeBlock(codeId)}
                className="bg-[#222] hover:bg-[#333] p-1 rounded text-xs flex items-center"
                aria-label={isExpanded(codeId) ? "Collapse code" : "Expand code"}
              >
                {isExpanded(codeId) ? (
                  <><ChevronUp className="h-3 w-3 mr-1" /> Collapse</>
                ) : (
                  <><ChevronDown className="h-3 w-3 mr-1" /> Expand</>
                )}
              </button>
            </div>
          </div>
          
          {/* Code content - conditionally shown based on expanded state */}
          <div className={`transition-all duration-200 ease-in-out ${isExpanded(codeId) ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <pre className="p-4 overflow-x-auto">
              <code className={className} {...props}>
                {children}
              </code>
            </pre>
          </div>
        </div>
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

  // Handle file input change for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImageAttachment(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }
    
    // Validate it's an image file
    if (!file.type.startsWith('image/')) {
      console.log("Invalid file type:", file.type);
      showNotification("Invalid file", "Please select an image file.");
      e.target.value = ''; // Clear the input
      return;
    }

    console.log("Processing image file:", file.name, "size:", file.size, "type:", file.type);
    setIsProcessingImage(true); // Start processing
    
    // Check if file is too large (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large:", file.size);
      showNotification("File too large", "Please select an image smaller than 10MB.");
      e.target.value = ''; // Clear the input
      return;
    }

    // For large images, add compression to reduce size
    if (file.size > 1 * 1024 * 1024) { // If larger than 1MB
      console.log("Large image detected, compressing before upload");
      
      // Create a URL for the image file
      const url = URL.createObjectURL(file);
      
      // Create an image element for compression
      const img = new Image();
      img.onload = () => {
        // Release the object URL
        URL.revokeObjectURL(url);
        
        // Calculate new dimensions (max 1200px width/height)
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image to canvas, resized
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error("Could not get canvas context for image compression");
          processImageFile(file); // Fall back to original method
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with reduced quality
        const quality = file.size > 5 * 1024 * 1024 ? 0.7 : 0.85; // More compression for very large files
        const dataUrl = canvas.toDataURL(file.type, quality);
        
        console.log("Image compressed successfully, original size:", file.size, "compressed size:", Math.round(dataUrl.length * 0.75)); // Base64 is ~33% larger than binary
        setImageAttachment(dataUrl);
        showNotification("Image attached", "Compressed image ready to send with your message.");
        setIsProcessingImage(false); // Processing finished
      };
      
      img.onerror = () => {
        console.error("Error loading image for compression");
        processImageFile(file); // Fall back to original method
      };
      
      // Set src to start loading
      img.src = url;
    } else {
      // For smaller images, process normally
      processImageFile(file); // This will set isProcessingImage to false on completion/error
    }
    
    e.target.value = ''; // Clear the input for future uploads
  };

  // Improve paste handler with better error handling
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    console.log("Paste event detected, items:", items.length);
    
    for (let i = 0; i < items.length; i++) {
      console.log("Clipboard item:", items[i].kind, items[i].type);
      if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) {
          console.log("Failed to get file from clipboard item");
          continue;
        }
        
        // Check file size
        if (file.size > 10 * 1024 * 1024) {
          console.log("Pasted image too large:", file.size);
          showNotification("File too large", "Please use an image smaller than 10MB.");
          e.preventDefault();
          return;
        }
        
        console.log("Processing pasted image:", file.size, "bytes");
        e.preventDefault(); // Prevent default paste behavior

        // Use the same compression logic as for uploaded files
        if (file.size > 1 * 1024 * 1024) { // If larger than 1MB
          console.log("Large pasted image detected, compressing");
          
          // Create a URL for the image file
          const url = URL.createObjectURL(file);
          
          // Create an image element for compression
          const img = new Image();
          img.onload = () => {
            // Release the object URL
            URL.revokeObjectURL(url);
            
            // Calculate new dimensions (max 1200px width/height)
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            
            // Draw the image to canvas, resized
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              console.error("Could not get canvas context for image compression");
              processImageFile(file); // Fall back to original method
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with reduced quality
            const quality = file.size > 5 * 1024 * 1024 ? 0.7 : 0.85; // More compression for very large files
            const dataUrl = canvas.toDataURL(file.type, quality);
            
            console.log("Pasted image compressed successfully, original size:", file.size, "compressed size:", Math.round(dataUrl.length * 0.75));
            setImageAttachment(dataUrl);
            showNotification("Image attached", "Compressed image ready to send with your message.");
            setIsProcessingImage(false); // Processing finished
          };
          
          img.onerror = () => {
            console.error("Error loading pasted image for compression");
            processImageFile(file); // Fall back to original method
          };
          
          // Set src to start loading
          img.src = url;
        } else {
          // For smaller images, process normally
          processImageFile(file); // Handles setting isProcessingImage
        }
        
        break; // Only handle the first image
      }
    }
  };

  // Remove image attachment
  const removeImageAttachment = () => {
    setImageAttachment(null);
  };

  const [agents, setAgents] = useState<AgentConfiguration[]>([]);

  // Fetch agents on mount
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agent-studio');
        if (!response.ok) throw new Error('Failed to fetch agents');
        const data = await response.json();
        setAgents(data);
      } catch (err) {
        console.error('Error fetching agents:', err);
      }
    };
    fetchAgents();
  }, []);

  // Replace the enhancePrompt function with a more robust implementation
  const enhancePrompt = async (prompt: string): Promise<string> => {
    if (!prompt.trim()) return prompt;
    
    // Create a temporary loading state that doesn't affect the UI button
    const tempLoading = true;
    
    try {
      // Call the same chat API endpoint but with specific enhancer instructions
      const enhancerMessages = [
        {
          role: 'system',
          content: `You are the world's best prompt engineer. 
Your task is to dramatically improve the user's prompt to get better AI responses.

RULES:
1. Make the prompt extremely detailed, specific and clear
2. Add creative elements the user didn't think of that improve the request
3. Break down complex requests into clear steps or bullet points
4. For coding: add specific requirements for error handling, documentation, and edge cases
5. For creative: add sensory details, emotional elements, and vivid imagery
6. For business: include metrics, outcomes, and strategic considerations
7. NEVER add phrases like "please provide" or similar phrases. DO NOT include explanations - return ONLY the enhanced prompt text with no additional commentary. Keep your enhancement concise and effective.
8. DO NOT include explanations or commentary in any form
9. DO NOT introduce your response with phrases like "Here's an enhanced prompt"
10. DO NOT enclose the prompt in quotes
11. Return ONLY the improved prompt text with no explanations`
        },
        {
          role: 'user',
          content: `Transform this basic prompt into a dramatically improved, detailed and specific version: "${prompt}"`
        }
      ];
      
      // Call the chat API 
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: enhancerMessages, 
          model: selectedModel,
          temperature: 0.7 // Use moderate temperature for creativity
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error enhancing prompt: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract the enhanced prompt from the response
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Unexpected API response format");
      }
      
      const enhancedPrompt = data.choices[0].message.content;
      
      // Extensive cleaning to handle different AI model response formats
      let cleanedPrompt = enhancedPrompt
        .replace(/^[\s"']*Enhanced prompt:[\s"']*/i, '')
        .replace(/^[\s"']*Here['s]* (?:is )?(?:the |your |an )?enhanced prompt:[\s"']*/i, '')
        .replace(/^[\s"']*(?:Enhanced|Improved|Better) version:[\s"']*/i, '')
        .replace(/^[\s"']*(?:Here is|Here's)(?: the| your| an)? (?:enhanced|improved|better)(?:[ -]|\s+)(?:version|prompt)(?:\s+of your prompt)?:[\s"']*/i, '')
        .replace(/["']$/, '') // Remove trailing quote
        .replace(/^["']/, '') // Remove leading quote
        .trim();
      
      // If the model didn't return anything useful, return the original
      if (!cleanedPrompt || cleanedPrompt === prompt || cleanedPrompt.length < 5) {
        return prompt;
      }
      
      return cleanedPrompt;
    } catch (error) {
      console.error("Error enhancing prompt:", error);
      // Return original prompt if enhancement failed
      return prompt;
    }
  };

  // State for model selector
  const [showModelSelector, setShowModelSelector] = useState(false);

  // Function to close model selector
  const closeModelSelector = () => {
    setShowModelSelector(false);
  };

  // Function to switch to a thread
  const switchToThread = (threadId: string) => {
    setActiveThreadId(threadId);
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setMessages(thread.messages);
    }
  };

  // Function to process image file
  const processImageFile = (file: File) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImageAttachment(result);
      setIsProcessingImage(false);
      showNotification("Image attached", "Image ready to send with your message.");
    };
    reader.onerror = () => {
      setIsProcessingImage(false);
      showNotification("Error", "Failed to process image.");
    };
    reader.readAsDataURL(file);
  };
  
  
  // Simple Model Selector component
  const ModelSelector = () => {
    const reasoningModels = pollinationsModels.filter(model => model.reasoning);
    const visionModels = pollinationsModels.filter(model => model.vision && !model.reasoning);
    const standardModels = pollinationsModels.filter(model => !model.vision && !model.reasoning && !model.uncensored && !model.audio);
    const audioModels = pollinationsModels.filter(model => model.audio);
    const uncensoredModels = pollinationsModels.filter(model => model.uncensored);
    
    const filteredModels = modelSearch.trim()
      ? pollinationsModels.filter(model => 
          model.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
          model.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
          model.description.toLowerCase().includes(modelSearch.toLowerCase())
        )
      : [];
    
    // Add the missing renderModelButton function
    const renderModelButton = (model: Model) => {
      return (
        <button
          key={model.id}
          className={`w-full text-left px-3 py-2 rounded-md my-1 transition-colors ${
            selectedModel === model.id
              ? "bg-indigo-600/30 text-white"
              : "text-zinc-300 hover:bg-zinc-800"
          }`}
          onClick={() => {
            setSelectedModel(model.id);
            setShowModelSelector(false);
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{model.name}</div>
              <div className="text-xs text-zinc-400 mt-0.5 max-w-xs truncate">
                {model.description}
              </div>
            </div>
            <div className="flex gap-1">
              {model.vision && (
                <span className="bg-green-500/20 text-green-400 text-[10px] px-1.5 py-0.5 rounded-full">Vision</span>
              )}
              {model.reasoning && (
                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded-full">Reasoning</span>
              )}
              {model.audio && (
                <span className="bg-purple-500/20 text-purple-400 text-[10px] px-1.5 py-0.5 rounded-full">Audio</span>
              )}
              {model.uncensored && (
                <span className="bg-red-500/20 text-red-400 text-[10px] px-1.5 py-0.5 rounded-full">Uncensored</span>
              )}
            </div>
          </div>
        </button>
      );
    };
    
    // Add the missing renderModelGroup function
    const renderModelGroup = (title: string, models: Model[], icon: React.ReactNode) => {
      if (models.length === 0) return null;
      
      return (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2 px-3">
            {icon}
            <h3 className="font-medium text-sm text-zinc-400">{title}</h3>
            <span className="text-[10px] text-zinc-500 mt-0.5">({models.length})</span>
          </div>
          <div className="space-y-1">
            {models.map(model => renderModelButton(model))}
          </div>
        </div>
      );
    };
    
    return (
      <div className="fixed top-0 right-0 bottom-0 w-96 bg-zinc-900 border-l border-zinc-800 shadow-xl z-40 p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Select Model</h3>
          <button 
            className="text-zinc-400 hover:text-white"
            onClick={closeModelSelector}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center mb-4">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-[83px]" />
          <Input
            type="text"
            placeholder="Search models..."
            className="pl-9 pr-4 py-2 text-sm w-full bg-zinc-800 border-zinc-700"
            value={modelSearch}
            onChange={(e) => setModelSearch(e.target.value)}
          />
        </div>
        
        {modelSearch.trim() ? (
          // Show search results
          <div>
            <div className="mt-3 mb-2">
              <h3 className="font-medium text-sm text-zinc-400 px-3">
                Search Results for "{modelSearch}"
              </h3>
            </div>
            {filteredModels.length > 0 ? (
              <div className="space-y-1 mt-2">
                {filteredModels.map(model => renderModelButton(model))}
              </div>
            ) : (
              <div className="text-zinc-500 text-sm p-3">No models found</div>
            )}
          </div>
        ) : (
          // Show normal categorized listing - with reasoning models first
          <div>
            {renderModelGroup("Reasoning Models", reasoningModels, <Brain className="h-4 w-4" />)}
            {renderModelGroup("Vision Models", visionModels, <Eye className="h-4 w-4" />)}
            {renderModelGroup("Standard Models", standardModels, <MessageSquare className="h-4 w-4" />)}
            {renderModelGroup("Audio Models", audioModels, <Music className="h-4 w-4" />)}
            {renderModelGroup("Uncensored Models", uncensoredModels, <Target className="h-4 w-4" />)}
          </div>
        )}
        
        <div className="border-t border-zinc-800 mt-4 pt-4">
          <button 
            className="w-full py-2 border border-zinc-700 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 text-sm"
            onClick={closeModelSelector}
          >
            Close
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full relative">
      {/* Thread Sidebar */}
      <div className="w-80 bg-[#111111] border-r border-[#333333] flex flex-col">
        {/* Thread Header */}
        <div className="p-4 border-b border-[#333333]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Conversations</h2>
            <button
              onClick={createNewThread}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
            >
              New Chat
            </button>
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {threads.map((thread) => (
            <div
              key={thread.id}
              onClick={() => switchToThread(thread.id)}
              className={`p-3 border-b border-[#333333] cursor-pointer hover:bg-[#1a1a1a] transition-colors ${
                activeThreadId === thread.id ? 'bg-[#1a1a1a] border-l-2 border-l-blue-500' : ''
              }`}
            >
              <div className="text-white text-sm font-medium truncate">
                {thread.name || 'New Conversation'}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {thread.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#333333] bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-white text-lg font-semibold">
                {threads.find(t => t.id === activeThreadId)?.name || 'Pollinations Assistant'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="px-3 py-1.5 bg-[#333333] hover:bg-[#444444] text-white text-sm rounded-md transition-colors"
              >
                {selectedModel}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-[#111111] border border-[#333333] text-white'
              }`}>
                {message.image && (
                  <img src={message.image} alt="Attached" className="max-w-full h-auto rounded mb-2" />
                )}
                <div className="whitespace-pre-wrap">{message.content}</div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#111111] border border-[#333333] text-white rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-[#333333] bg-[#0a0a0a]">
          {imageAttachment && (
            <div className="mb-3 p-2 bg-[#111111] border border-[#333333] rounded-lg">
              <img src={imageAttachment} alt="Attachment" className="max-h-20 rounded" />
              <button
                onClick={() => setImageAttachment(null)}
                className="ml-2 text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>
          )}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Type your message..."
                className="min-h-[60px] max-h-[200px] resize-none bg-[#111111] border-[#333333] text-white placeholder-gray-400"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 bg-[#333333] hover:bg-[#444444] text-white rounded-md transition-colors"
                disabled={isLoading}
              >
                📎
              </button>
              <button
                onClick={handleSend}
                disabled={isLoading || (!inputValue.trim() && !imageAttachment)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Show Model Selector if active */}
      {showModelSelector && <ModelSelector />}
    </div>
  );
}
}
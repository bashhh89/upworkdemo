'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Send, Plus, RefreshCw, ChevronDown, ChevronUp, Copy, Check, Search, X, MessageSquare, Trash2, Clipboard, Play, Maximize, Minimize, Save, ExternalLink, Bookmark, BookmarkCheck, Users, Target, Globe, Mail, Info, Wrench, Building, Book } from 'lucide-react';
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
import { useSearchParams } from 'next/navigation'; // Add this for URL parameter handling
import { detectToolRequest, extractParametersFromMessage, hasAllRequiredParameters, availableTools } from '@/lib/tool-utils';
import { ToolDefinition } from '@/types/tools'; // Import type definition

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  thinking?: string;
  toolResult?: ToolResult; // Add this line
  id?: string; // Add this line
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
  // Add ref for textarea
  const inputRef = useRef<HTMLTextAreaElement>(null);
  // Define initial Pollinations models with state
  const [pollinationsModels, setPollinationsModels] = useState<Model[]>([
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

  // Function to detect and execute tools based on user input
  const detectAndExecuteTool = async (input: string) => {
    const detectedTool = detectToolRequest(input);

    if (detectedTool) {
      // Extract parameters from the message
      const extractedParams = extractParametersFromMessage(input, detectedTool);

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
          originalMessage: input
        });

        return true; // Tool handling in progress
      }
    }

    // Fall back to regex pattern matching approach for backward compatibility

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
        return true;
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
        return true;
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
    // Use local state to avoid focus issues with controlled inputs
    // Ensure default empty string in case initial prop is undefined
    const [localTitle, setLocalTitle] = useState(artifactTitle || '');
    const [localDescription, setLocalDescription] = useState(artifactDescription || '');

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

  // Modify handleSend to use tools when appropriate
  const handleSend = async () => {
    if (!input.trim()) return;

    // If no active thread, create one
    if (!activeThreadId) {
      const newThreadId = createNewThread();
      console.log('Created new thread before sending message:', newThreadId);
      // Small delay to ensure thread is created before proceeding
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // First, check if the input should trigger a specialized tool
    const toolResult = await detectAndExecuteTool(input.trim());

    // If a tool was executed, no need to call the chat API
    if (toolResult) {
      setInput('');
      // Focus back on the textarea
      setTimeout(() => inputRef.current?.focus(), 50);
      return;
    }

    // Regular chat flow for non-tool messages
    // Add user message with ID
    const userMessage: Message = { id: uuidv4(), role: 'user' as const, content: input };
    const updatedMessages: Message[] = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

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
        id: uuidv4(),
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
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
      const isExpanded = expandedCodeBlocks.includes(codeId);
      
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
                aria-label={isExpanded ? "Collapse code" : "Expand code"}
              >
                {isExpanded ? (
                  <><ChevronUp className="h-3 w-3 mr-1" /> Collapse</>
                ) : (
                  <><ChevronDown className="h-3 w-3 mr-1" /> Expand</>
                )}
              </button>
            </div>
          </div>
          
          {/* Code content - conditionally shown based on expanded state */}
          <div className={`transition-all duration-200 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
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

    // Clean close function for the preview
    const closePreview = () => {
      setCodePreview(null);
      if(isSaving) {
        setIsSaving(false);
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
              onClick={closePreview}
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

  // Function to completely reset library state and close properly
  const closeLibrary = () => {
    setShowLibrary(false);
    setLibraryDropdownOpen(false);
  };

  // Code Library component with fixed closing functionality
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
            onClick={closeLibrary}
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

  // Function to fully close tool results library
  const closeToolResultsLibrary = () => {
    setShowToolResultsLibrary(false);
    setToolResultsDropdownOpen(false);
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
            onClick={closeToolResultsLibrary}
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
                                  id: uuidv4(),
                                  role: 'assistant' as const,
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

  // New states for tool parameter handling
  const [pendingToolRequest, setPendingToolRequest] = useState<{
    tool: ToolDefinition | null,
    params: Record<string, string>,
    originalMessage: string
  } | null>(null);

  // Get search params for URL parameter handling
  const searchParams = useSearchParams();

  // ... existing useEffects ...

  // Handle URL parameters for direct tool launching
  useEffect(() => {
    // Check for tool parameter
    const toolParam = searchParams?.get('tool');
    const promptParam = searchParams?.get('prompt');

    if (toolParam) {
      let targetTool: ToolDefinition | undefined;

      // Find the tool based on partial name match
      if (toolParam.toLowerCase().includes('web') || toolParam.toLowerCase().includes('scan')) {
        targetTool = availableTools.find(t => t.name.includes('Website'));
      } else if (toolParam.toLowerCase().includes('exec') || toolParam.toLowerCase().includes('persona')) {
        targetTool = availableTools.find(t => t.name.includes('Executive'));
      } else if (toolParam.toLowerCase().includes('deal') || toolParam.toLowerCase().includes('contextual')) {
        targetTool = availableTools.find(t => t.name.includes('Deal'));
      }

      if (targetTool) {
        console.log('Launching tool from URL param:', targetTool.name);

        // Set up pending tool request
        setPendingToolRequest({
          tool: targetTool,
          params: {},
          originalMessage: `Launch ${targetTool.name}`
        });
      }
    } else if (promptParam) {
      // Set input field with the prompt parameter
      setInput(promptParam);
    }
  }, [searchParams]);

  // ... existing functions ...

  // ... rest of the existing component ...

  // This replaces the dropdown-based models menu with a simple button
  const openModelSelector = () => {
    // Close other dropdowns first
    setThreadsDropdownOpen(false);
    setLibraryDropdownOpen(false);
    setToolResultsDropdownOpen(false);
    
    // Clear and reset the model search
    setModelSearch('');
    
    // Show the model selector as its own fullscreen overlay
    setShowModelSelector(true);
  };
  
  // Close model selector
  const closeModelSelector = () => {
    setShowModelSelector(false);
  };
  
  // State for model selector
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Simple Model Selector component
  const ModelSelector = () => {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 transition-all duration-300 ease-in-out">
        <div className="flex items-center justify-between p-4 border-b border-[#333333]">
          <div className="text-white font-medium">
            Select AI Model
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3"
            onClick={closeModelSelector}
          >
            Close
          </Button>
        </div>
        
        <div className="p-4 border-b border-[#333]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models..."
              className="w-full px-3 py-2 pl-10 pr-10 bg-[#0a0a0a] border border-[#333] rounded text-white focus:outline-none"
            />
            {modelSearch && (
              <button
                onClick={() => setModelSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredModels.map(model => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className={`justify-start py-6 text-left ${selectedModel === model.id ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#111] hover:bg-[#222]'}`}
                onClick={() => {
                  setSelectedModel(model.id);
                  closeModelSelector();
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className="text-xs text-gray-400 mt-1">{model.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Show Model Selector if active */}
      {showModelSelector && <ModelSelector />}
      
      {/* Show Library if active */}
      {showLibrary && <CodeLibrary />}
      
      {/* Show Tool Results Library if active */}
      {showToolResultsLibrary && <ToolResultsLibrary />}
    
      {/* Chat header with controls moved from bottom */}
      <div className="bg-black border-b border-[#222222] p-3 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost" 
              size="sm"
              className="flex items-center gap-1 hover:text-white text-gray-400 text-sm"
              onClick={() => setShowModelSelector(true)}
            >
              <MessageSquare className="h-4 w-4" />
              {getModelDisplay(selectedModel)}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Thread Controls and Actions */}
            <div className="relative" ref={threadsDropdownRef}>
              <button
                className="flex items-center gap-1 hover:text-white text-gray-400 text-sm"
                onClick={() => setThreadsDropdownOpen(!threadsDropdownOpen)}
              >
                <Book className="h-4 w-4" />
                Threads
                {threadsDropdownOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
              
              {/* Threads Dropdown Menu */}
              {threadsDropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+5px)] bg-[#0a0a0a] border border-[#222222] rounded-md shadow-md z-50 min-w-[250px]">
                  <div className="p-2 border-b border-[#222222]">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full justify-start text-sm text-gray-400 hover:text-white"
                      onClick={() => {
                        createNewThread();
                        setThreadsDropdownOpen(false);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Thread
                    </Button>
                  </div>
                  
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {threads.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No threads yet</div>
                    ) : (
                      threads
                        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
                        .map(thread => (
                          <div 
                            key={thread.id} 
                            className={`px-3 py-2 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors ${activeThreadId === thread.id ? 'bg-[#1a1a1a] text-white' : 'text-gray-400'}`}
                          >
                            <button
                              className="text-left text-sm truncate flex-1"
                              onClick={() => {
                                selectThread(thread.id);
                                setThreadsDropdownOpen(false);
                              }}
                            >
                              {thread.name}
                            </button>
                            
                            <button
                              className="p-1 hover:text-red-500 transition-colors"
                              onClick={(e) => deleteThread(thread.id, e)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Button 
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 hover:text-white text-gray-400 text-sm"
              onClick={() => setShowLibrary(true)}
            >
              <Bookmark className="h-4 w-4" />
              Code Library
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 hover:text-white text-gray-400 text-sm"
              onClick={() => setShowToolResultsLibrary(true)}
            >
              <Wrench className="h-4 w-4" />
              Tool Results
            </Button>
          </div>
        </div>
      </div>

      {/* Chat body */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        {messages.map((message, index) => {
          // Ensure each message has an ID
          const messageId = message.id || `message-${index}`;
          
          return (
            <div key={messageId} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {message.role === 'user' ? (
                    <div className="w-8 h-8 bg-[#3b82f6] rounded-full flex items-center justify-center text-white">
                      {message.role.charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-[#6b7280] rounded-full flex items-center justify-center text-white">
                      {message.role.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-gray-400">{message.role === 'user' ? 'You' : 'Assistant'}</span>
                  {message.model && message.role === 'assistant' && (
                    <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {getModelDisplay(message.model)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {message.role === 'assistant' && message.thinking && (
                    <button
                      onClick={() => toggleThinking(messageId)}
                      className={`text-xs px-2 py-0.5 rounded ${expandedThinking.includes(messageId) ? 'bg-blue-900 text-blue-100' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                    >
                      {expandedThinking.includes(messageId) ? 'Hide thinking' : 'Show thinking'}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2">
                {message.role === 'user' ? (
                  <pre className="whitespace-pre-wrap">{message.content}</pre>
                ) : (
                  <ReactMarkdown
                    components={renderers}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
                {message.role === 'assistant' && message.thinking && (
                  <div className={`mt-3 border border-blue-800 bg-blue-900/20 p-3 rounded-md ${expandedThinking.includes(messageId) ? '' : 'hidden'}`}>
                    <div className="text-xs text-blue-400 mb-2 font-medium">Model thinking process:</div>
                    <ReactMarkdown
                      components={renderers}
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.thinking}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && <TypingIndicator />}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input area */}
      <div className="absolute bottom-0 left-0 right-0 bg-black border-t border-[#222222] p-4 z-10">
        {codePreview && (
          <CodePreview
            code={codePreview.code}
            language={codePreview.language}
            id={codePreview.id}
            isSaving={isSavingArtifact}
            setIsSaving={setIsSavingArtifact}
            artifactTitle={artifactTitle}
            setArtifactTitle={setArtifactTitle}
            artifactDescription={artifactDescription}
            setArtifactDescription={setArtifactDescription}
            toggleSaving={toggleSavingArtifact}
          />
        )}

        <div className="flex items-start gap-2 max-w-5xl mx-auto">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question or prompt the assistant..."
            className="flex-1 bg-[#111111] border-gray-800 focus:border-blue-500 min-h-[60px] max-h-[200px] placeholder:text-gray-400 resize-none shadow-inner rounded-md text-white p-3"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "h-[60px] rounded-md flex items-center justify-center px-4 transition-all duration-200 transform shadow-sm",
              !input.trim() || isLoading
                ? "bg-gray-800 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:translate-y-[-2px]"
            )}
          >
            <div className="relative flex items-center justify-center">
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin text-white" />
              ) : (
                <Send className="h-5 w-5 text-white" />
              )}
            </div>
          </Button>
        </div>

        {/* Add a light gray highlight around the input area */}
        <div className="max-w-5xl mx-auto mt-1">
          <div className="text-xs text-gray-500 flex items-center">
            <span>Press <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400 mx-1 border border-gray-700">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-400 mx-1 border border-gray-700">Shift+Enter</kbd> for new line</span>
          </div>
        </div>

        {/* Sample Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-3 max-w-5xl mx-auto overflow-x-auto pb-2 flex space-x-2 no-scrollbar">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-8 text-xs text-gray-400 hover:text-white flex-shrink-0"
                onClick={() => setInput(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

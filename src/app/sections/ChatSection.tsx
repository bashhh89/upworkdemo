'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Globe, Users, Sparkles, Copy, Check, ExternalLink, Command, Bot, User, Loader2, Brain, ChevronDown, Settings, Play, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Sandpack } from '@codesandbox/sandpack-react';
import { v4 as uuidv4 } from 'uuid';
import { detectToolRequest, extractParametersFromMessage, hasAllRequiredParameters, availableTools } from '@/lib/tool-utils';
import { ToolDefinition, ToolResult } from '@/types/tools';
import ToolButtonTray from '@/components/ToolButtonTray';
import SlashCommandMenu from '@/components/SlashCommandMenu';
import ToolResultSummary from '@/components/ToolResultSummary';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolResult?: ToolResult;
  timestamp: Date;
  reasoning?: string;
  artifacts?: CodeArtifact[];
}

interface CodeArtifact {
  id: string;
  type: 'html' | 'react' | 'javascript' | 'css';
  title: string;
  code: string;
  files?: Record<string, string>;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  reasoning?: boolean;
}

interface Thread {
  id: string;
  name: string;
  messages: Message[];
  lastUpdated: Date;
}

export default function ChatSection() {
  // Core state
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // AI Configuration
  const [selectedModel, setSelectedModel] = useState('glm-4.5-flash');
  const [isReasoningEnabled, setIsReasoningEnabled] = useState(true);
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Tool state
  const [pendingTool, setPendingTool] = useState<ToolDefinition | null>(null);
  const [pendingParams, setPendingParams] = useState<Record<string, string>>({});
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  
  // UI state
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [expandedReasoning, setExpandedReasoning] = useState<string[]>([]);
  const [activeArtifacts, setActiveArtifacts] = useState<Record<string, boolean>>({});
  const [currentArtifact, setCurrentArtifact] = useState<CodeArtifact | null>(null);
  
  // Refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available models
  const availableModels: ModelConfig[] = [
    { id: 'glm-4.5-flash', name: 'GLM-4.5 Flash', provider: 'Z.ai', reasoning: true },
    { id: 'glm-4-plus', name: 'GLM-4 Plus', provider: 'Z.ai', reasoning: true },
    { id: 'glm-4-air', name: 'GLM-4 Air', provider: 'Z.ai', reasoning: false },
    { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', reasoning: false },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', reasoning: false },
    { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', reasoning: false }
  ];

  // Load threads from localStorage on mount
  useEffect(() => {
    const savedThreads = localStorage.getItem('chatThreads');
    if (savedThreads) {
      try {
        const parsedThreads = JSON.parse(savedThreads).map((thread: any) => ({
          ...thread,
          lastUpdated: new Date(thread.lastUpdated),
          messages: thread.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setThreads(parsedThreads);
        
        // Load most recent thread
        if (parsedThreads.length > 0) {
          const mostRecent = parsedThreads.sort((a, b) => 
            new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
          )[0];
          setActiveThreadId(mostRecent.id);
          setMessages(mostRecent.messages);
        } else {
          createNewThread();
        }
      } catch (error) {
        console.error('Error loading threads:', error);
        createNewThread();
      }
    } else {
      createNewThread();
    }
  }, []);

  // Save threads to localStorage
  useEffect(() => {
    if (threads.length > 0) {
      localStorage.setItem('chatThreads', JSON.stringify(threads));
    }
  }, [threads]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Create new thread
  const createNewThread = () => {
    const newThread: Thread = {
      id: uuidv4(),
      name: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    setMessages([]);
    return newThread.id;
  };

  // Switch to thread
  const switchToThread = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread) {
      setActiveThreadId(threadId);
      setMessages(thread.messages);
    }
  };

  // Update thread messages
  const updateThreadMessages = (threadId: string, newMessages: Message[]) => {
    setThreads(prev => prev.map(thread => 
      thread.id === threadId 
        ? { 
            ...thread, 
            messages: newMessages, 
            lastUpdated: new Date(),
            name: newMessages.length > 0 && thread.name === 'New Chat' 
              ? getThreadName(newMessages[0]) 
              : thread.name
          }
        : thread
    ));
  };

  // Get thread name from first message
  const getThreadName = (firstMessage: Message): string => {
    const content = firstMessage.content.trim();
    return content.length > 30 ? content.substring(0, 27) + "..." : content;
  };

  // Handle input changes for slash commands
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value === '/') {
      setShowSlashCommands(true);
    } else if (!value.startsWith('/')) {
      setShowSlashCommands(false);
    }
  };

  // Handle tool selection
  const handleToolSelect = (tool: ToolDefinition) => {
    setPendingTool(tool);
    setPendingParams({});
    setShowSlashCommands(false);
    setInput('');
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() && !pendingTool) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: pendingTool ? `Using ${pendingTool.name} tool` : input,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      let assistantMessage: Message;

      if (pendingTool) {
        // Execute tool
        const result = await executeTool(pendingTool, pendingParams);
        assistantMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: `I've completed the ${pendingTool.name} analysis. Here are the results:`,
          toolResult: result,
          timestamp: new Date()
        };
        setPendingTool(null);
        setPendingParams({});
      } else {
        // Check if message requests a tool
        const detectedTool = detectToolRequest(input);
        if (detectedTool) {
          const extractedParams = extractParametersFromMessage(input, detectedTool);
          const hasAllParams = hasAllRequiredParameters(extractedParams, detectedTool);
          
          if (hasAllParams) {
            // Execute tool directly
            const result = await executeTool(detectedTool, extractedParams);
            assistantMessage = {
              id: uuidv4(),
              role: 'assistant',
              content: `I've analyzed this using the ${detectedTool.name} tool:`,
              toolResult: result,
              timestamp: new Date()
            };
          } else {
            // Need more parameters
            setPendingTool(detectedTool);
            setPendingParams(extractedParams);
            assistantMessage = {
              id: uuidv4(),
              role: 'assistant',
              content: `I'll help you with the ${detectedTool.name} tool. Please provide the required information.`,
              timestamp: new Date()
            };
          }
        } else {
          // Regular AI response
          const aiResponse = await getAIResponse(input, updatedMessages);
          assistantMessage = {
            id: uuidv4(),
            role: 'assistant',
            content: aiResponse.content,
            reasoning: aiResponse.reasoning,
            artifacts: aiResponse.artifacts,
            timestamp: new Date()
          };
        }
      }

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      if (activeThreadId) {
        updateThreadMessages(activeThreadId, finalMessages);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Execute tool
  const executeTool = async (tool: ToolDefinition, params: Record<string, string>): Promise<ToolResult> => {
    const response = await fetch(tool.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error(`Tool execution failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    const result: ToolResult = {
      id: uuidv4(),
      toolName: tool.name,
      content: data,
      summary: data.summary || 'Analysis completed successfully',
      parameters: params,
      createdAt: new Date(),
      shareUrl: `/shared/tool-result/${uuidv4()}`
    };

    // Save to localStorage
    const savedResults = JSON.parse(localStorage.getItem('toolResults') || '[]');
    savedResults.unshift(result);
    localStorage.setItem('toolResults', JSON.stringify(savedResults));

    return result;
  };

  // Get AI response with reasoning
  const getAIResponse = async (message: string, context: Message[]): Promise<{ content: string; reasoning?: string; artifacts?: CodeArtifact[] }> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: context.slice(-10).concat([{ role: 'user', content: message }]),
          model: selectedModel,
          thinking: isReasoningEnabled ? { type: 'enabled' } : { type: 'disabled' }
        })
      });

      if (!response.ok) {
        console.error('AI API response not ok:', response.status, response.statusText);
        return { content: getFallbackResponse(message) };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || getFallbackResponse(message);
      const reasoning = data.choices?.[0]?.message?.reasoning;
      
      // Extract artifacts from content
      const artifacts = extractArtifacts(content);
      
      // Auto-show first artifact in sidebar
      if (artifacts.length > 0) {
        setCurrentArtifact(artifacts[0]);
      }
      
      return { content, reasoning, artifacts };
    } catch (error) {
      console.error('AI response error:', error);
      return { content: getFallbackResponse(message) };
    }
  };

  // Extract code artifacts from AI response
  const extractArtifacts = (content: string): CodeArtifact[] => {
    const artifacts: CodeArtifact[] = [];
    
    // Look for HTML artifacts
    const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/g);
    if (htmlMatch) {
      htmlMatch.forEach((match, index) => {
        const code = match.replace(/```html\n/, '').replace(/\n```$/, '');
        if (code.includes('<html') || code.includes('<!DOCTYPE')) {
          artifacts.push({
            id: uuidv4(),
            type: 'html',
            title: `HTML Preview ${index + 1}`,
            code: code
          });
        }
      });
    }

    // Look for React components
    const reactMatch = content.match(/```jsx?\n([\s\S]*?)\n```/g);
    if (reactMatch) {
      reactMatch.forEach((match, index) => {
        const code = match.replace(/```jsx?\n/, '').replace(/\n```$/, '');
        if (code.includes('function') || code.includes('const') || code.includes('export')) {
          artifacts.push({
            id: uuidv4(),
            type: 'react',
            title: `React Component ${index + 1}`,
            code: code,
            files: {
              '/App.js': code,
              '/index.js': 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));'
            }
          });
        }
      });
    }

    return artifacts;
  };

  // Fallback response when AI API fails
  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm your AI assistant. I can help you with website analysis, executive profiling, and other tasks. What would you like to work on?";
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return "I can help you with:\n\n• Website Intelligence - Analyze websites\n• Executive Profiling - Create executive personas\n• Image Generation - Create custom images\n• Voice Synthesis - Generate voiceovers\n\nType `/` to see all tools!";
    }
    
    return "I understand your message. I can help you with website analysis, executive profiling, and other AI-powered tasks. Type `/` to see available tools or tell me what you'd like to work on!";
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Copy message
  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessage(content);
    setTimeout(() => setCopiedMessage(null), 2000);
  };

  // Handle tool parameter submission
  const handleToolSubmit = (parameters: Record<string, string>) => {
    setPendingParams(parameters);
    handleSend();
  };

  // Handle tool cancel
  const handleToolCancel = () => {
    setPendingTool(null);
    setPendingParams({});
  };

  // Toggle reasoning display
  const toggleReasoning = (messageId: string) => {
    setExpandedReasoning(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Toggle artifact display
  const toggleArtifact = (artifactId: string) => {
    setActiveArtifacts(prev => ({
      ...prev,
      [artifactId]: !prev[artifactId]
    }));
  };

  // Render code artifact
  const renderArtifact = (artifact: CodeArtifact) => {
    const isActive = activeArtifacts[artifact.id];
    
    return (
      <div key={artifact.id} className="mt-3 border border-[#333333] rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-3 bg-[#1a1a1a] border-b border-[#333333]">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">{artifact.title}</span>
            <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">
              {artifact.type.toUpperCase()}
            </span>
          </div>
          <Button
            onClick={() => toggleArtifact(artifact.id)}
            size="sm"
            variant="outline"
            className="border-[#333333] text-white hover:bg-[#2a2a2a]"
          >
            <Play className="h-3 w-3 mr-1" />
            {isActive ? 'Hide' : 'Run'}
          </Button>
        </div>
        
        {isActive && (
          <div className="p-0">
            {artifact.type === 'html' && (
              <div className="h-96">
                <iframe
                  srcDoc={artifact.code}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              </div>
            )}
            
            {artifact.type === 'react' && artifact.files && (
              <div className="h-96">
                <Sandpack
                  template="react"
                  files={artifact.files}
                  theme="dark"
                  options={{
                    showNavigator: false,
                    showTabs: false,
                    showLineNumbers: true,
                    editorHeight: 200
                  }}
                />
              </div>
            )}
            
            {(artifact.type === 'javascript' || artifact.type === 'css') && (
              <div className="max-h-64 overflow-auto">
                <SyntaxHighlighter
                  language={artifact.type}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    background: '#0a0a0a'
                  } as any}
                >
                  {artifact.code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white">
      {/* Left Sidebar - Threads */}
      <div className="w-80 bg-[#111111] border-r border-[#333333] flex flex-col">
        <div className="p-4 border-b border-[#333333]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-semibold">Conversations</h2>
            <Button
              onClick={createNewThread}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              New Chat
            </Button>
          </div>
        </div>

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
                {thread.name}
              </div>
              <div className="text-gray-400 text-xs mt-1">
                {thread.messages.length} messages
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-[#333333] bg-[#0a0a0a]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold">AI Chat Assistant</h1>
                <p className="text-sm text-gray-400">Intelligent assistant with tools and artifacts</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Model Selector */}
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-400" />
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger className="w-48 bg-[#111111] border-[#333333] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111111] border-[#333333]">
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white hover:bg-[#222222]">
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-gray-400">{model.provider}</span>
                            {model.reasoning && <Brain className="h-3 w-3 text-blue-400" />}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reasoning Toggle */}
              <div className="flex items-center gap-2">
                <Brain className={`h-4 w-4 ${isReasoningEnabled ? 'text-blue-400' : 'text-gray-500'}`} />
                <label htmlFor="reasoning-toggle" className="text-sm text-gray-300 cursor-pointer">
                  Reasoning
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="reasoning-toggle"
                    checked={isReasoningEnabled}
                    onChange={() => setIsReasoningEnabled(!isReasoningEnabled)}
                    className="sr-only"
                  />
                  <div 
                    className={`block w-10 h-6 rounded-full cursor-pointer ${
                      isReasoningEnabled ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    onClick={() => setIsReasoningEnabled(!isReasoningEnabled)}
                  >
                    <div 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        isReasoningEnabled ? 'transform translate-x-4' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-400">Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {/* Avatar for assistant */}
              {message.role === 'assistant' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              )}
              
              <div className="flex flex-col max-w-[80%]">
                {/* Reasoning section */}
                {message.role === 'assistant' && message.reasoning && (
                  <div className="mb-2 p-3 bg-[#1a1a1a] rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-blue-400 flex items-center gap-1">
                        <Brain className="h-3 w-3" />
                        Reasoning:
                      </p>
                      <button
                        onClick={() => toggleReasoning(message.id)}
                        className="text-gray-400 hover:text-white"
                      >
                        <ChevronDown className={`h-3 w-3 transition-transform ${
                          expandedReasoning.includes(message.id) ? 'rotate-180' : ''
                        }`} />
                      </button>
                    </div>
                    {expandedReasoning.includes(message.id) && (
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{message.reasoning}</p>
                    )}
                  </div>
                )}
                
                {/* Main message */}
                <div className={`rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-[#111111] border border-[#333333] text-white'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-gray-400">
                      {message.role === 'user' ? 'You' : 'Assistant'}
                    </span>
                    <button
                      onClick={() => copyMessage(message.content)}
                      className="text-gray-400 hover:text-white ml-2"
                    >
                      {copiedMessage === message.content ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                  
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code({ node, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                background: '#0a0a0a',
                                borderRadius: '0.375rem',
                                padding: '0.5rem'
                              }}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className="bg-[#333] px-1 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {message.toolResult && (
                    <div className="mt-3">
                      <ToolResultSummary result={message.toolResult} />
                    </div>
                  )}
                </div>
                
                {/* Artifacts */}
                {message.artifacts && message.artifacts.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.artifacts.map(artifact => renderArtifact(artifact))}
                  </div>
                )}
              </div>
              
              {/* Avatar for user */}
              {message.role === 'user' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start items-center my-4">
              <div className="bg-[#1a1a1a] border border-[#444444] text-white rounded-lg p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span className="font-medium">Processing your request...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Tool Parameter Form */}
        {pendingTool && (
          <div className="p-4 border-t border-[#333333] bg-[#111111]">
            <div className="mb-3">
              <h3 className="font-semibold">{pendingTool.name}</h3>
              <p className="text-sm text-gray-400">{pendingTool.description}</p>
            </div>
            
            <div className="space-y-3">
              {pendingTool.requiredParameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-medium mb-1">{param.label}</label>
                  <input
                    type={param.type}
                    value={pendingParams[param.name] || ''}
                    onChange={(e) => setPendingParams(prev => ({
                      ...prev,
                      [param.name]: e.target.value
                    }))}
                    placeholder={param.placeholder}
                    className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-3 py-2 text-white"
                    required={param.required !== false}
                  />
                </div>
              ))}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleToolSubmit(pendingParams)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!hasAllRequiredParameters(pendingParams, pendingTool)}
                >
                  Run {pendingTool.name}
                </Button>
                <Button
                  onClick={handleToolCancel}
                  variant="outline"
                  className="border-[#333333] text-white hover:bg-[#1a1a1a]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-[#333333] bg-[#0a0a0a]">
          <div className="mb-2">
            <ToolButtonTray onSelectTool={handleToolSelect} />
          </div>
          
          <div className="flex gap-3 relative">
            <div className="flex-1 relative">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message or / for tools..."
                className="min-h-[60px] max-h-[200px] resize-none bg-[#111111] border-[#333333] text-white placeholder-gray-400"
                disabled={isLoading}
              />
              
              <SlashCommandMenu
                isOpen={showSlashCommands}
                onSelect={handleToolSelect}
                onClose={() => setShowSlashCommands(false)}
              />
            </div>
            
            <Button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !pendingTool)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Type / to access tools, or use the tool buttons above
          </p>
        </div>
      </div>

      {/* Right Sidebar - Code Artifacts */}
      {currentArtifact && (
        <div className="w-96 bg-[#111111] border-l border-[#333333] flex flex-col">
          <div className="p-4 border-b border-[#333333]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">{currentArtifact.title}</span>
                <span className="text-xs text-gray-400 bg-[#333333] px-2 py-1 rounded">
                  {currentArtifact.type.toUpperCase()}
                </span>
              </div>
              <Button
                onClick={() => setCurrentArtifact(null)}
                size="sm"
                variant="ghost"
                className="text-gray-400 hover:text-white"
              >
                ×
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {currentArtifact.type === 'html' && (
              <iframe
                srcDoc={currentArtifact.code}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            )}
            
            {currentArtifact.type === 'react' && currentArtifact.files && (
              <Sandpack
                template="react"
                files={currentArtifact.files}
                theme="dark"
                options={{
                  showNavigator: false,
                  showTabs: true,
                  showLineNumbers: true,
                  editorHeight: '100%'
                }}
                customSetup={{
                  dependencies: {
                    "react": "^18.0.0",
                    "react-dom": "^18.0.0"
                  }
                }}
              />
            )}
            
            {(currentArtifact.type === 'javascript' || currentArtifact.type === 'css') && (
              <div className="h-full overflow-auto">
                <SyntaxHighlighter
                  language={currentArtifact.type}
                  style={vscDarkPlus}
                  customStyle={{
                    margin: 0,
                    background: '#111111',
                    height: '100%',
                    padding: '1rem'
                  }}
                >
                  {currentArtifact.code}
                </SyntaxHighlighter>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

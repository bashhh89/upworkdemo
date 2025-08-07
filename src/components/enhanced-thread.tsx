import { useEffect, useState, useRef } from 'react';
// Replace problematic import
// import { useThread } from '@assistant-ui/react';
import ToolParametersForm from './ToolParametersForm';
import ToolResultSummary from './ToolResultSummary';
import SlashCommandMenu from './SlashCommandMenu';
import ToolButtonTray from './ToolButtonTray';
import ExecutivePersonaForm from './ExecutivePersonaForm';
import WebsiteScannerForm from './WebsiteScannerForm';
import { ToolDefinition, ToolResult } from '@/types/tools';
import { saveToolResult, createToolResult, detectToolRequest, extractParametersFromMessage } from '@/lib/tool-utils';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Send, Plus, Command, ChevronDown } from 'lucide-react';

// Mock useThread hook
const useThread = () => {
  return {
    messages: [],
    isMessageBeingProcessed: false,
    sendMessage: (message: string, options?: any) => {
      console.log('Mock sendMessage called with:', message, options);
      return Promise.resolve({
        role: options?.role || 'assistant',
        content: message,
        id: Date.now().toString(),
        ...(options?.toolResult ? { toolResult: options.toolResult } : {})
      });
    }
  };
};

export default function EnhancedThread() {
  const threadContext = useThread();
  // Destructure with fallback in case any properties are undefined
  const { 
    messages = [], 
    isMessageBeingProcessed = false 
  } = threadContext;
  
  // Define a safe sendMessage function that checks if the original exists
  const sendMessage = (message: string, options?: any) => {
    if (typeof threadContext.sendMessage === 'function') {
      return threadContext.sendMessage(message, options);
    } else {
      console.error('sendMessage function is not available from useThread hook');
      // Fallback: Add message directly to the UI without sending to backend
      const fallbackMessage = {
        role: options?.role || 'assistant',
        content: message,
        id: Date.now().toString(),
        ...(options?.toolResult ? { toolResult: options.toolResult } : {})
      };
      // This won't actually update the thread but prevents the app from crashing
      console.log('Fallback message created:', fallbackMessage);
      return Promise.resolve(fallbackMessage);
    }
  };

  const [pendingTool, setPendingTool] = useState<ToolDefinition | null>(null);
  const [pendingParams, setPendingParams] = useState<Record<string, string>>({});
  const [originalMessage, setOriginalMessage] = useState<string>('');
  const [input, setInput] = useState('');
  const [showSlashCommands, setShowSlashCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Listen for pending tool requests from the chat page
  useEffect(() => {
    // Check if there's a pending tool request in local storage
    const storedRequest = localStorage.getItem('pendingToolRequest');
    if (storedRequest) {
      try {
        const { tool, params, originalMessage } = JSON.parse(storedRequest);
        setPendingTool(tool);
        setPendingParams(params);
        setOriginalMessage(originalMessage);
        // Clear the stored request
        localStorage.removeItem('pendingToolRequest');
      } catch (error) {
        console.error('Error parsing pending tool request:', error);
      }
    }

    // Listen for new pending tool requests
    const handlePendingToolRequest = (event: CustomEvent) => {
      const { tool, params, originalMessage } = event.detail;
      setPendingTool(tool);
      setPendingParams(params);
      setOriginalMessage(originalMessage);
    };

    window.addEventListener('pendingToolRequest', handlePendingToolRequest as EventListener);

    return () => {
      window.removeEventListener('pendingToolRequest', handlePendingToolRequest as EventListener);
    };
  }, []);

  useEffect(() => {
    // Log whether slash commands are visible
    console.log("Slash commands visibility changed:", showSlashCommands);
  }, [showSlashCommands]);

  // Handle input changes for slash commands
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Debug
    console.log('Input value changed:', value, 'value === "/": ', value === '/');
    
    // Show slash commands when user types "/"
    if (value === '/') {
      console.log('Showing slash commands menu');
      setShowSlashCommands(true);
    } else if (!value.startsWith('/')) {
      console.log('Hiding slash commands menu');
      setShowSlashCommands(false);
    }
  };

  // Handle tool selection from slash commands menu
  const handleSlashCommandSelect = (tool: ToolDefinition) => {
    setPendingTool(tool);
    setPendingParams({});
    setShowSlashCommands(false);
    setInput('');
  };

  // Handle tool selection from button tray
  const handleToolButtonSelect = (tool: ToolDefinition) => {
    setPendingTool(tool);
    setPendingParams({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if the message is requesting a tool
    const detectedTool = detectToolRequest(input);
    if (detectedTool) {
      // Extract any parameters from the message
      const extractedParams = extractParametersFromMessage(input, detectedTool);
      setPendingTool(detectedTool);
      setPendingParams(extractedParams);
      setOriginalMessage(input);
      setInput('');
      return;
    }

    // Regular message handling
    sendMessage(input);
    setInput('');
  };

  const handleToolSubmit = async (parameters: Record<string, string>) => {
    if (!pendingTool) return;

    try {
      // First send a message about processing
      try {
        await sendMessage(`Processing ${pendingTool.name} request with parameters: ${JSON.stringify(parameters, null, 2)}`, {
          role: 'assistant',
        });
      } catch (error) {
        console.error('Error sending processing message:', error);
        // Continue with tool processing even if the message couldn't be sent
      }

      // Make API request to the tool endpoint
      const response = await fetch(pendingTool.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parameters),
      });

      if (!response.ok) {
        throw new Error(`Error processing tool request: ${response.statusText}`);
      }

      const responseData = await response.json();

      // Save the result
      saveToolResult(responseData);

      // Send the result summary as a message
      try {
        await sendMessage(`Here are the ${pendingTool.name} results:\n\n${responseData.summary}\n\nYou can view the full results here: ${window.location.origin}/shared/tool-result/${responseData.id}`, {
          role: 'assistant',
          toolResult: responseData,
        });
      } catch (error) {
        console.error('Error sending result message:', error);
        // Display a fallback UI for the results if message couldn't be sent
        alert(`Tool results ready! ${responseData.summary}`);
      }

      // Clear the pending tool state
      setPendingTool(null);
      setPendingParams({});
      setOriginalMessage('');

    } catch (error) {
      console.error('Error processing tool request:', error);
      
      try {
        await sendMessage(`Sorry, there was an error processing your ${pendingTool.name} request. Please try again.`, {
          role: 'assistant',
        });
      } catch (msgError) {
        console.error('Error sending error message:', msgError);
        // Show a fallback error alert if message couldn't be sent
        alert(`Error: Could not process ${pendingTool.name} request. Please try again.`);
      }

      // Clear the pending tool state
      setPendingTool(null);
      setPendingParams({});
      setOriginalMessage('');
    }
  };

  const handleToolCancel = () => {
    setPendingTool(null);
    setPendingParams({});
    setOriginalMessage('');
    
    // Focus back on the input field
    inputRef.current?.focus();
  };

  // Handle "Ask about this" from tool results
  const handleAskAboutTool = (question: string) => {
    setInput(question);
    // Focus the input field
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Render the message with tool result summary if present
  const renderMessage = (message: any) => {
    // For assistant messages with tool results
    if (message.role === 'assistant' && message.toolResult) {
      return (
        <div key={message.id} className="flex justify-start mb-4">
          <div className="bg-zinc-850 text-zinc-100 p-3 rounded-lg max-w-[75%]">
            <div className="font-bold mb-1 text-green-400">Assistant:</div>
            <ToolResultSummary
              result={message.toolResult}
              onAskAbout={handleAskAboutTool}
            />
          </div>
        </div>
      );
    }

    // Default rendering for other messages
    return (
      <div key={message.id} className={message.role === 'user' ? 'flex justify-end mb-4' : 'flex justify-start mb-4'}>
        <div className={message.role === 'user' ? 'bg-zinc-800 text-white p-3 rounded-lg max-w-[75%]' : 'bg-zinc-850 text-zinc-100 p-3 rounded-lg max-w-[75%]'} >
          <div className={message.role === 'user' ? 'font-bold mb-1 text-blue-400' : 'font-bold mb-1 text-green-400'}>{message.role === 'user' ? 'You' : 'Assistant'}:</div>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  // Render the specialized form based on tool type
  const renderToolForm = () => {
    if (!pendingTool) return null;

    switch (pendingTool.name) {
      case 'Executive Persona':
        return (
          <ExecutivePersonaForm
            initialParameters={pendingParams}
            onSubmit={handleToolSubmit}
            onCancel={handleToolCancel}
          />
        );
      case 'Website Intelligence Scanner':
        return (
          <WebsiteScannerForm
            initialParameters={pendingParams}
            onSubmit={handleToolSubmit}
            onCancel={handleToolCancel}
          />
        );
      default:
        return (
          <ToolParametersForm
            tool={pendingTool}
            initialParameters={pendingParams}
            onSubmit={handleToolSubmit}
            onCancel={handleToolCancel}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(renderMessage)}
        
        {isMessageBeingProcessed && (
          <div className="mb-4">
            <div className="text-green-400">
              <span className="font-bold">Assistant:</span>
            </div>
            <div className="mt-1">Thinking...</div>
          </div>
        )}
        
        {pendingTool && (
          <div className="mb-4">
            <div className="text-green-400">
              <span className="font-bold">Assistant:</span>
            </div>
            <div className="mt-1">
              {renderToolForm()}
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <div className="mb-2 flex justify-between items-center">
          <ToolButtonTray onSelectTool={handleToolButtonSelect} />
          <a href="/tools-test" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="text-xs">
              Go to Tools Test Page
            </Button>
          </a>
        </div>
        
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2"
        >
          <div className="relative flex gap-2 items-center">
            <Button
              type="button"
              onClick={() => {
                console.log("Tool button clicked, current state:", showSlashCommands);
                setShowSlashCommands(!showSlashCommands);
              }}
              variant="outline"
              size="icon"
              className="h-10 w-10 flex-shrink-0 border-gray-700 hover:border-blue-500 hover:bg-blue-950/30"
              title="Show tools menu"
            >
              <Command className="h-4 w-4" />
            </Button>
          
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                placeholder={showSlashCommands ? "Select a tool or keep typing..." : "Type a message or / for tools..."}
                className="w-full bg-[#1a1a1a] text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                value={input}
                onChange={handleInputChange}
                disabled={isMessageBeingProcessed}
                onFocus={() => {
                  if (input === '/') {
                    setShowSlashCommands(true);
                  }
                }}
                onClick={() => {
                  if (input === '/') {
                    setShowSlashCommands(true);
                  }
                }}
              />
              
              <Button
                type="submit"
                disabled={isMessageBeingProcessed || !input.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </Button>
              
              {/* Slash command menu */}
              <SlashCommandMenu
                isOpen={showSlashCommands}
                onSelect={handleSlashCommandSelect}
                onClose={() => setShowSlashCommands(false)}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-1">
            Type <span className="bg-gray-800 rounded px-1 text-gray-400">/</span> to access tools, use the <Command className="h-3 w-3 inline" /> button, or click on a tool button above
          </div>
        </form>
      </div>
    </div>
  );
}

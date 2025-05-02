import { useEffect, useState } from 'react';
import { useThread } from '@assistant-ui/react';
import ToolParametersForm from './ToolParametersForm';
import ToolResultSummary from './ToolResultSummary';
import { ToolDefinition, ToolResult } from '@/types/tools';
import { saveToolResult, createToolResult } from '@/lib/tool-utils';

export default function EnhancedThread() {
  const { messages, sendMessage, isMessageBeingProcessed } = useThread();
  const [pendingTool, setPendingTool] = useState<ToolDefinition | null>(null);
  const [pendingParams, setPendingParams] = useState<Record<string, string>>({});
  const [originalMessage, setOriginalMessage] = useState<string>('');

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

  const handleToolSubmit = async (parameters: Record<string, string>) => {
    if (!pendingTool) return;

    try {
      // Send a message indicating we're processing the request
      sendMessage(`Processing ${pendingTool.name} request with parameters: ${JSON.stringify(parameters, null, 2)}`, {
        role: 'assistant',
      });

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

      // Create a tool result from the response
      const result = createToolResult(
        pendingTool.name,
        responseData.data,
        responseData.summary,
        parameters,
        parameters.url
      );

      // Save the result
      saveToolResult(result);

      // Send the result summary as a message
      sendMessage(`Here are the ${pendingTool.name} results:\n\n${result.summary}\n\nYou can view the full results here: ${window.location.origin}/shared/tool-result/${result.id}`, {
        role: 'assistant',
        toolResult: result,
      });

      // Clear the pending tool state
      setPendingTool(null);
      setPendingParams({});
      setOriginalMessage('');

    } catch (error) {
      console.error('Error processing tool request:', error);
      sendMessage(`Sorry, there was an error processing your ${pendingTool.name} request. Please try again.`, {
        role: 'assistant',
      });

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
    sendMessage('Tool request canceled.', {
      role: 'assistant',
    });
  };

  // Render the message with tool result summary if present
  const renderMessage = (message: any) => {
    // For assistant messages with tool results
    if (message.role === 'assistant' && message.toolResult) {
      return (
        <div key={message.id}>
          <div className={`mb-4 ${message.role === 'user' ? 'text-blue-400' : 'text-green-400'}`}>
            <span className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}:</span>
          </div>
          <ToolResultSummary result={message.toolResult} />
        </div>
      );
    }

    // Default rendering for other messages
    return (
      <div key={message.id} className="mb-4">
        <div className={message.role === 'user' ? 'text-blue-400' : 'text-green-400'}>
          <span className="font-bold">{message.role === 'user' ? 'You' : 'Assistant'}:</span>
        </div>
        <div className="mt-1 whitespace-pre-wrap">{message.content}</div>
      </div>
    );
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
              <ToolParametersForm
                tool={pendingTool}
                initialParameters={pendingParams}
                onSubmit={handleToolSubmit}
                onCancel={handleToolCancel}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const message = formData.get('message') as string;
            if (message.trim()) {
              sendMessage(message);
              e.currentTarget.reset();
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            name="message"
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-[#1a1a1a] text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isMessageBeingProcessed}
          />
          <button
            type="submit"
            disabled={isMessageBeingProcessed}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 
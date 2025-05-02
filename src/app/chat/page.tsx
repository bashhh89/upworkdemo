"use client";

import React, { useState, useEffect } from 'react';
import { Thread } from "@assistant-ui/react";
import { ThreadList } from "@assistant-ui/react";
import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ToolResultsLibrary from '@/components/ToolResultsLibrary';
import { detectToolRequest, extractParametersFromMessage, hasAllRequiredParameters } from '@/lib/tool-utils';
import { ToolDefinition } from '@/types/tools';

export default function ChatPage() {
  // Initialize chat runtime for OpenAI
  const runtime = useChatRuntime({
    api: "/api/chat",
  });
  
  const [activeTab, setActiveTab] = useState('chat');
  
  // Use middleware to intercept and process messages for tool detection
  useEffect(() => {
    if (!runtime) return;
    
    const originalSendMessage = runtime.sendMessage;
    
    runtime.sendMessage = async (message, options) => {
      // Check if message requests a tool
      const detectedTool = detectToolRequest(message);
      
      if (detectedTool) {
        // Extract parameters from the message
        const extractedParams = extractParametersFromMessage(message, detectedTool);
        
        // Check if all required parameters are present
        const hasAllParams = hasAllRequiredParameters(extractedParams, detectedTool);
        
        if (hasAllParams) {
          // All parameters provided, proceed with tool processing
          await processToolRequest(detectedTool, extractedParams, message);
        } else {
          // Missing parameters, prompt user with form
          runtime.setIsMessageBeingProcessed(false);
          
          // Add a system message explaining parameter collection
          originalSendMessage("I'll help you with that. Let me gather the necessary information.", {
            role: "assistant",
          });
          
          // Store the detected tool in local storage with message reference for retrieval by the UI
          localStorage.setItem('pendingToolRequest', JSON.stringify({
            tool: detectedTool,
            params: extractedParams,
            originalMessage: message,
          }));
          
          // Force a UI refresh by dispatching a custom event
          window.dispatchEvent(new CustomEvent('pendingToolRequest', {
            detail: { 
              tool: detectedTool,
              params: extractedParams,
              originalMessage: message,
            }
          }));
          
          return;
        }
      }
      
      // Fall through to normal message processing if not a tool request
      return originalSendMessage(message, options);
    };
  }, [runtime]);
  
  const processToolRequest = async (tool: ToolDefinition, params: Record<string, string>, originalMessage: string) => {
    try {
      // Send message about processing the tool request
      runtime.sendMessage(`Processing ${tool.name} request...`, {
        role: 'assistant',
      });
      
      // Make API request to the tool's endpoint
      const response = await fetch(tool.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      if (!response.ok) {
        throw new Error(`Error processing tool request: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Send result as a message
      runtime.sendMessage(`Here are the ${tool.name} results:\n\n${result.summary}\n\nYou can view the full results here: ${window.location.origin}/shared/tool-result/${result.id}`, {
        role: 'assistant',
        toolResult: result,
      });
      
    } catch (error) {
      console.error('Error processing tool request:', error);
      runtime.sendMessage(`Sorry, there was an error processing your ${tool.name} request. Please try again.`, {
        role: 'assistant',
      });
    }
  };

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-white">
      <h1 className="text-3xl font-bold p-4 border-b border-[#333333] mb-4 text-white">Chat</h1>
      <AssistantRuntimeProvider runtime={runtime}>
        <div className="grid grid-cols-[250px_1fr] h-[calc(100vh-150px)] gap-x-4 overflow-hidden p-4">
          <div className="bg-[#0a0a0a] border border-[#333333] rounded-md overflow-hidden">
            <Tabs defaultValue="threads" className="h-full">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="threads">Threads</TabsTrigger>
                <TabsTrigger value="tools">Tool Results</TabsTrigger>
              </TabsList>
              <TabsContent value="threads" className="h-[calc(100%-40px)] overflow-y-auto">
                <ThreadList />
              </TabsContent>
              <TabsContent value="tools" className="h-[calc(100%-40px)] overflow-y-auto p-2">
                <ToolResultsLibrary />
              </TabsContent>
            </Tabs>
          </div>
          <div className="bg-[#0a0a0a] border border-[#333333] rounded-md overflow-hidden">
            <Thread />
          </div>
        </div>
      </AssistantRuntimeProvider>
    </div>
  );
} 
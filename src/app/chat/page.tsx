"use client";

import React, { useState, createContext } from 'react';
// Remove problematic imports
// import { AssistantRuntimeProvider } from "@assistant-ui/react";
// import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ToolResultsLibrary from '@/components/ToolResultsLibrary';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SendIcon } from 'lucide-react';

// Create a simple context to replace AssistantRuntimeProvider
const AssistantRuntimeContext = createContext({});

// Mock component to replace AssistantRuntimeProvider
const AssistantRuntimeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AssistantRuntimeContext.Provider value={{}}>
      {children}
    </AssistantRuntimeContext.Provider>
  );
};

// Mock hook to replace useChatRuntime
const useChatRuntime = () => {
  return {
    messages: [],
    sendMessage: (msg: string) => {
      console.log('Mock send message:', msg);
    },
    isLoading: false
  };
};

export default function ChatPage() {
  const [userMessage, setUserMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  
  // Use our mock runtime instead of the real one
  const chatRuntime = useChatRuntime();
  
  const handleSendMessage = () => {
    if (userMessage.trim()) {
      chatRuntime.sendMessage(userMessage);
      setUserMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <AssistantRuntimeProvider>
      <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
        <header className="border-b border-[#222] p-4">
          <h1 className="text-xl font-bold">Chat with Deliver AI</h1>
        </header>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b border-[#222] px-4">
            <TabsList className="bg-transparent border-b-0">
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="results">Saved Results</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-4 space-y-4 overflow-auto">
            <div className="flex-1">
              {/* Chat messages would go here */}
              <div className="space-y-4">
                <div className="bg-[#111] p-4 rounded-lg">
                  <p className="text-gray-400 mb-2 text-sm">System</p>
                  <p>Hello! I'm Deliver AI. How can I help you today?</p>
                </div>
                
                {chatRuntime.messages.map((msg: any, index: number) => (
                  <div key={index} className={`p-4 rounded-lg ${msg.role === 'user' ? 'bg-[#1a1a1a] ml-12' : 'bg-[#111] mr-12'}`}>
                    <p className="text-gray-400 mb-2 text-sm">{msg.role === 'user' ? 'You' : 'Assistant'}</p>
                    <p>{msg.content}</p>
                  </div>
                ))}
                
                {chatRuntime.isLoading && (
                  <div className="bg-[#111] p-4 rounded-lg mr-12 animate-pulse">
                    <p className="text-gray-400 mb-2 text-sm">Assistant</p>
                    <p>Thinking...</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="sticky bottom-0 bg-[#0a0a0a] pt-2">
              <div className="flex items-end gap-2 bg-[#111] rounded-lg p-3">
                <Textarea
                  placeholder="Type your message..."
                  className="min-h-20 bg-transparent border-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="h-10 w-10 rounded-full"
                  disabled={userMessage.trim() === '' || chatRuntime.isLoading}
                >
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Deliver AI Assistant can help with marketing, sales, and creative tasks.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="flex-1 p-4 overflow-auto">
            <ToolResultsLibrary />
          </TabsContent>
        </Tabs>
      </div>
    </AssistantRuntimeProvider>
  );
} 
'use client';

import { PollinationsAssistant } from "./assistant";
// Replace problematic imports
// import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
// import { AssistantRuntimeProvider } from "@assistant-ui/react";
import React, { createContext } from 'react';

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

export default function PollinationsAssistantPage() {
  // Initialize the chat runtime
  useChatRuntime();

  return (
    <AssistantRuntimeProvider>
      <div className="w-full h-full overflow-hidden">
        <PollinationsAssistant />
      </div>
    </AssistantRuntimeProvider>
  );
} 
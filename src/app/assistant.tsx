"use client";

// Remove problematic imports
// import { AssistantRuntimeProvider } from "@assistant-ui/react";
// import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import React, { createContext } from 'react';
import { Thread } from "@/components/thread";
import { ThreadList } from "@/components/thread-list";

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

export const Assistant = () => {
  useChatRuntime();

  return (
    <AssistantRuntimeProvider>
      <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadList />
        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};

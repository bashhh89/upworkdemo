'use client';

import { PollinationsAssistant } from "./assistant";
import { useChatRuntime } from "@assistant-ui/react-ai-sdk";
import { AssistantRuntimeProvider } from "@assistant-ui/react";

export default function PollinationsAssistantPage() {
  // Initialize the chat runtime
  const runtime = useChatRuntime({
    api: "/api/chat",
    body: {
      model: "openai" // Default model, will be overridden by selection in sidebar
    }
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="w-full h-full overflow-hidden">
        <PollinationsAssistant />
      </div>
    </AssistantRuntimeProvider>
  );
} 
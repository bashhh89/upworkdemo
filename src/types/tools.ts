export interface ToolResult {
  id: string;
  toolName: string;
  url?: string;
  content: any;
  summary: string;
  createdAt: Date;
  shareUrl?: string;
  parameters?: Record<string, any>;
}

export interface ToolDefinition {
  name: string;
  description: string;
  triggerPhrases: string[];
  requiredParameters: {
    name: string;
    label: string;
    type: 'text' | 'url' | 'number' | 'select';
    placeholder?: string;
    options?: string[];
    required?: boolean;
  }[];
  resultComponent?: React.ComponentType<{result: any}>;
  apiEndpoint: string;
}

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  toolResult?: ToolResult;
  createdAt: Date;
}; 
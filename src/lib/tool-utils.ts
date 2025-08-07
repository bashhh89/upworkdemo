import { ToolDefinition, ToolResult } from '@/types/tools';
import { v4 as uuidv4 } from 'uuid';

// Available tools in the system
export const availableTools: ToolDefinition[] = [
  {
    name: 'Website Intelligence Scanner',
    description: 'Analyze a website to extract business intelligence and insights',
    triggerPhrases: ['analyze website', 'scan website', 'website intelligence', 'website analysis'],
    requiredParameters: [
      {
        name: 'url',
        label: 'Website URL',
        type: 'url',
        placeholder: 'https://example.com',
        required: true,
      }
    ],
    apiEndpoint: '/api/tools/website-scanner',
  },
  {
    name: 'Executive Persona',
    description: 'Generate an executive persona based on name, title, and company',
    triggerPhrases: ['executive persona', 'create executive profile', 'analyze executive'],
    requiredParameters: [
      {
        name: 'name',
        label: 'Executive Name',
        type: 'text',
        placeholder: 'John Smith',
        required: true,
      },
      {
        name: 'title',
        label: 'Title',
        type: 'text',
        placeholder: 'CEO',
        required: true,
      },
      {
        name: 'company',
        label: 'Company',
        type: 'text',
        placeholder: 'Acme Inc',
        required: true,
      }
    ],
    apiEndpoint: '/api/tools/executive-persona',
  },
  {
    name: 'ICP Builder',
    description: 'Build ideal customer profiles from successful customer examples',
    triggerPhrases: ['icp builder', 'ideal customer profile', 'customer analysis', 'build icp'],
    requiredParameters: [
      {
        name: 'customers',
        label: 'Customer Examples',
        type: 'textarea',
        placeholder: 'Ahmad Basheer - Assisted.vip\nJohn Smith - TechCorp Inc\nhttps://linkedin.com/in/jane-doe',
        required: true,
      }
    ],
    apiEndpoint: '/api/tools/icp-builder',
  },
];

/**
 * Detect if a message contains a request for a specific tool
 */
export function detectToolRequest(message: string): ToolDefinition | null {
  const normalizedMessage = message.toLowerCase();
  
  for (const tool of availableTools) {
    for (const phrase of tool.triggerPhrases) {
      if (normalizedMessage.includes(phrase.toLowerCase())) {
        return tool;
      }
    }
  }
  
  return null;
}

/**
 * Extract parameter values from a message for a given tool
 */
export function extractParametersFromMessage(message: string, tool: ToolDefinition): Record<string, string> {
  const extractedParams: Record<string, string> = {};
  
  tool.requiredParameters.forEach(param => {
    // Basic pattern matching for URL parameters
    if (param.type === 'url') {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const matches = message.match(urlRegex);
      if (matches && matches.length > 0) {
        extractedParams[param.name] = matches[0];
      }
    }
    
    // Basic pattern matching for other parameters
    const paramRegex = new RegExp(`${param.name}[s]?:\\s*([^,\\n]+)`, 'i');
    const match = message.match(paramRegex);
    if (match && match[1]) {
      extractedParams[param.name] = match[1].trim();
    }
  });
  
  return extractedParams;
}

/**
 * Check if all required parameters are present
 */
export function hasAllRequiredParameters(params: Record<string, string>, tool: ToolDefinition): boolean {
  return tool.requiredParameters
    .filter(param => param.required !== false)
    .every(param => params[param.name] && params[param.name].trim() !== '');
}

/**
 * Save a tool result to localStorage
 */
export function saveToolResult(result: ToolResult): void {
  try {
    // Get existing results
    const savedItems = localStorage.getItem('toolResults');
    let results: ToolResult[] = [];
    
    if (savedItems) {
      results = JSON.parse(savedItems);
    }
    
    // Add new result
    results.unshift(result);
    
    // Save back to localStorage
    localStorage.setItem('toolResults', JSON.stringify(results));
  } catch (error) {
    console.error('Error saving tool result:', error);
  }
}

/**
 * Get all saved tool results
 */
export function getSavedToolResults(): ToolResult[] {
  try {
    const savedItems = localStorage.getItem('toolResults');
    if (savedItems) {
      return JSON.parse(savedItems).map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt)
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading saved tool results:', error);
    return [];
  }
}

/**
 * Create a new tool result
 */
export function createToolResult(toolName: string, content: any, summary: string, parameters?: Record<string, any>, url?: string): ToolResult {
  const id = uuidv4();
  const shareUrl = `/shared/tool-result/${id}`;
  
  return {
    id,
    toolName,
    url,
    content,
    summary,
    parameters,
    createdAt: new Date(),
    shareUrl
  };
}

/**
 * Format a tool result summary for display in chat
 */
export function formatToolResultForChat(result: ToolResult): string {
  const shareLink = `${window.location.origin}/shared/tool-result/${result.id}`;
  
  return `
## ${result.toolName} Results

${result.summary}

[View Full Results](${shareLink})
`;
}

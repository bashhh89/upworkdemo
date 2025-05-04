import { NextResponse } from 'next/server';
import { readAgentsFromFile } from '@/lib/agent-store';

interface RouteParams {
  params: {
    agentId: string;
  };
}

export async function POST(request: Request, { params }: RouteParams) {
  const { agentId } = params;

  try {
    // Parse user query
    const { query } = await request.json();
    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ message: 'Missing or invalid query' }, { status: 400 });
    }

    // Load agent config
    const allAgents = await readAgentsFromFile();
    const agent = allAgents.find(a => a.id === agentId);
    if (!agent) {
      return NextResponse.json({ message: 'Agent not found' }, { status: 404 });
    }

    // Combine all knowledge chunks
    let knowledgeContext = '';
    for (const source of agent.knowledgeSources) {
      if (Array.isArray(source.chunks) && source.chunks.length > 0) {
        knowledgeContext += source.chunks.join('\n---\n') + '\n---\n';
      }
    }

    // Prepare messages for Pollinations (OpenAI-compatible)
    const messages = [
      {
        role: 'system',
        content: `${agent.systemPrompt}\n\nKnowledge Context:\n${knowledgeContext}`,
      },
      {
        role: 'user',
        content: query,
      },
    ];

    // Pollinations endpoint
    const pollinationsUrl = 'https://text.pollinations.ai/openai';
    const payload = {
      model: 'openai', // Or another Pollinations-compatible model
      messages: messages,
      // seed: 42, // Optional
      // private: false // Optional
    };

    const response = await fetch(pollinationsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pollinations API Error (${response.status}):`, errorText);
      throw new Error(`Pollinations API failed with status ${response.status}`);
    }

    const result = await response.json();
    const responseContent = result.choices?.[0]?.message?.content;

    return NextResponse.json({ response: responseContent });
  } catch (error) {
    console.error('Error running agent:', error);
    return NextResponse.json({ message: 'Error running agent', error: error instanceof Error ? error.message : error }, { status: 500 });
  }
} 